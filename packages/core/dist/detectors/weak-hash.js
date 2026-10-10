import { DOC_EXTENSIONS, eachMatch, findingFromRule, hasExtension, maskBlockComments, maskCommentLines, } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
// --- SHA-1 in a signature/certificate algorithm identifier ---------------------
// Java JCA standard names: `SHA1withRSA`, `SHA1withDSA`, `SHA1withECDSA`. The
// `…with(RSA|DSA|ECDSA)` shape makes the token unambiguously a signature alg.
// `-?` tolerates the `SHA-1` spelling; `i` covers case variation in real code.
const RE_SHA1_JAVA = /\bSHA-?1with(?:RSA|DSA|ECDSA)\b/gi;
// X.509 / ASN.1 signature-algorithm OID *names*.
const RE_SHA1_X509 = /\b(?:sha-?1WithRSAEncryption|ecdsa-with-SHA-?1|dsaWithSHA-?1)\b/gi;
// X.509 signature-algorithm dotted OIDs (sha1WithRSAEncryption, ecdsa-with-SHA1).
// Lookarounds keep the id from matching inside a longer OID.
const RE_SHA1_OID = /(?<![\d.])(?:1\.2\.840\.113549\.1\.1\.5|1\.2\.840\.10045\.4\.1)(?![\d.])/g;
// OpenSSL CLI: `-sha1` on the same line as `openssl` AND an actual SIGNING marker
// (`req` / `ca` subcommand, or `-sign`/`-signkey`/`-CA`/`-CAkey`), in either order.
// A bare `x509` subcommand is NOT a signing marker — `openssl x509 -fingerprint
// -sha1` / `-subject_hash` are read-only thumbprint/identifier ops, not signature
// generation (audit M1). `openssl dgst -sha1 file` (checksum) is likewise unmatched.
const OPENSSL_SIGN = String.raw `(?:\breq\b|\bca\b|-sign(?:key)?\b|-CA(?:key)?\b)`;
const RE_SHA1_OPENSSL = new RegExp(`openssl\\b[^\\n]*?${OPENSSL_SIGN}[^\\n]*?-sha1\\b|openssl\\b[^\\n]*?-sha1\\b[^\\n]*?${OPENSSL_SIGN}`, "gi");
// .NET: a weak hash bound to a signing call (`.SignData(…)` / `.SignHash(…)`), as
// `HashAlgorithmName.SHA1` or the legacy `"SHA1"` string arg. Bounded by `;` (the
// statement), NOT `)` — the first argument is often itself a call
// (`.SignData(Encoding.UTF8.GetBytes(m), HashAlgorithmName.SHA1, …)`), so a
// `[^)]` span would stop at the inner `)` and miss it (audit H3).
const RE_SHA1_DOTNET = /\.Sign(?:Data|Hash)\s*\([^;]*?(?:HashAlgorithmName\.SHA-?1|["']SHA-?1["'])/gi;
// --- MD5 in a signature/certificate algorithm identifier -----------------------
const RE_MD5_JAVA = /\bMD5with(?:RSA|DSA|ECDSA)\b/gi;
const RE_MD5_X509 = /\bmd5WithRSAEncryption\b/gi;
const RE_MD5_OID = /(?<![\d.])1\.2\.840\.113549\.1\.1\.4(?![\d.])/g;
const RE_MD5_OPENSSL = new RegExp(`openssl\\b[^\\n]*?${OPENSSL_SIGN}[^\\n]*?-md5\\b|openssl\\b[^\\n]*?-md5\\b[^\\n]*?${OPENSSL_SIGN}`, "gi");
const RE_MD5_DOTNET = /\.Sign(?:Data|Hash)\s*\([^;]*?(?:HashAlgorithmName\.MD5|["']MD5["'])/gi;
const RULE_SHA1 = {
    id: "weak-hash-sha1-signature",
    title: "SHA-1 in a signature / certificate algorithm",
    description: "SHA-1 used in a digital-signature or X.509 certificate algorithm (Java/.NET/X.509/OpenSSL)",
    category: "hash",
    severity: "medium",
    confidence: "high",
    algorithm: "unknown",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "SHA-1 used in a digital-signature/certificate algorithm; SHA-1 is disallowed for signatures (NIST SP 800-131A Rev 3, fully retired 2030 — the same window as the PQC migration) and enables collision-based signature forgery. Quantum-adjacent: migrate the hash alongside the signature algorithm.",
    remediation: "Move signature/certificate hashes to SHA-256 or stronger (SHA-384/512 for CNSA 2.0 targets) and re-issue affected certificates; fold the PQC signature migration (ML-DSA) into the same re-key/re-sign effort.",
};
const RULE_MD5 = {
    id: "weak-hash-md5-signature",
    title: "MD5 in a signature / certificate algorithm",
    description: "MD5 used in a digital-signature or X.509 certificate algorithm (Java/.NET/X.509/OpenSSL)",
    category: "hash",
    severity: "high",
    confidence: "high",
    algorithm: "unknown",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "MD5 used in a digital-signature/certificate algorithm; MD5 signatures are catastrophically broken today (practical chosen-prefix collisions have forged CA certificates) and must be replaced immediately. Quantum-adjacent: migrate the hash alongside the signature algorithm in the PQC re-sign pass.",
    remediation: "Replace MD5 signature/certificate hashes with SHA-256 or stronger (SHA-384/512 for CNSA 2.0 targets) and re-issue affected certificates immediately; fold the PQC signature migration (ML-DSA) into the same re-key/re-sign effort.",
};
const WEAK_HASH_RULES = [
    {
        meta: RULE_SHA1,
        res: [RE_SHA1_JAVA, RE_SHA1_X509, RE_SHA1_OID, RE_SHA1_OPENSSL, RE_SHA1_DOTNET],
    },
    { meta: RULE_MD5, res: [RE_MD5_JAVA, RE_MD5_X509, RE_MD5_OID, RE_MD5_OPENSSL, RE_MD5_DOTNET] },
];
/**
 * True when `content` carries a signature/certificate marker — a signal that any
 * weak hash present is bound to a signature or cert, not a bare checksum. This is
 * the guard that keeps `sha1(x)` / `sha1sum` / a password hash from ever firing:
 * without one of these markers the file is not scanned at all.
 */
function hasSignatureMarker(content) {
    if (/with\s?RSA|with\s?DSA|with\s?ECDSA|WithRSAEncryption|ecdsa-with-SHA-?1|dsaWithSHA-?1/i.test(content)) {
        return true;
    }
    if (/1\.2\.840\.113549\.1\.1\.[45]|1\.2\.840\.10045\.4\.1/.test(content))
        return true;
    if (/Signature\.getInstance|\.Sign(?:Data|Hash)\s*\(/.test(content))
        return true;
    // OpenSSL only counts as a marker with a cert/signing subcommand or flag.
    if (/openssl/i.test(content) && /\b(?:req|x509|ca|-signkey|-sign|dgst)\b/i.test(content)) {
        return true;
    }
    return false;
}
/**
 * Detects SHA-1 / MD5 used specifically in signature or certificate algorithms
 * (Java JCA, .NET signing calls, X.509 OID names/OIDs, OpenSSL cert/signing CLI).
 */
export const weakHashDetector = {
    id: "weak-hash-signature",
    description: "Weak hash (SHA-1/MD5) in a digital-signature or X.509 certificate algorithm",
    scope: "config",
    language: "any",
    rules: WEAK_HASH_RULES.map((r) => r.meta),
    // Skip prose/docs: a page explaining `SHA1withRSA` is not live config/code.
    appliesTo: (f) => !hasExtension(f, DOC_EXTENSIONS),
    detect({ file, content }) {
        // Fast reject on the ORIGINAL content: only scan files whose weak hash is
        // bound to a signature/cert context. A lone `sha1(...)` checksum or a
        // password hash has no such marker and is skipped wholesale.
        if (!hasSignatureMarker(content))
            return [];
        // Mask C-style block comments and `//` / `#` / `;` line comments so a
        // commented-out algorithm can't fire. Offsets are preserved, so finding
        // line/column/snippet for the live lines stay exact.
        const scan = maskCommentLines(maskBlockComments(content), ["//", "#", ";"]);
        const findings = [];
        for (const { meta, res } of WEAK_HASH_RULES) {
            for (const re of res) {
                eachMatch(re, scan, (m) => findings.push(findingFromRule(meta, { file, content, index: m.index, matchLength: m[0].length })));
            }
        }
        return findings;
    },
};
//# sourceMappingURL=weak-hash.js.map