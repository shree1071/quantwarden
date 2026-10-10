import { eachMatch, findingFromRule, hasExtension, maskCommentLines } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
const DNSSEC_EXTENSIONS = [".zone", ".db", ".conf"];
// IANA DNSSEC algorithm numbers, grouped by family.
const NUM_RSA = "5|7|8|10"; // RSASHA1, RSASHA1-NSEC3-SHA1, RSASHA256, RSASHA512
const NUM_ECDSA = "13|14"; // ECDSAP256SHA256, ECDSAP384SHA384
const NUM_EDDSA = "15|16"; // ED25519, ED448
const NUM_DSA = "3|6"; // DSA, DSA-NSEC3-SHA1
// --- NAMED form: mnemonic algorithm names in signer/policy config or CLI args. ---
// Case-insensitive: BIND `dnssec-policy` and Knot config conventionally write the
// mnemonics in lowercase (`algorithm rsasha256;`, `algorithm ed25519;`), so a
// case-sensitive match would miss the primary real-world signer-config syntax. Still
// gated by `hasDnssecMarker` + the DNSSEC extensions, so generic tokens can't fire.
const RE_NAMED_RSA = /\bRSASHA(?:256|512|1(?:-NSEC3-SHA1)?)\b/gi;
const RE_NAMED_ECDSA = /\bECDSAP(?:256SHA256|384SHA384)\b/gi;
const RE_NAMED_EDDSA = /\bED(?:25519|448)\b/gi;
// Bare "DSA" is too generic to key off alone; require it right after an
// `algorithm` keyword (Knot/BIND config / dnssec-policy style), optionally
// quoted or separated by `:`/`=`.
const RE_NAMED_DSA = /\balgorithm\s*[:=]?\s*"?DSA(?:-NSEC3-SHA1)?"?\b/gi;
// --- STRUCTURAL form: `[C]DNSKEY <flags> 3 <algorithm>` presentation RDATA (RFC 4034
// §2). `C?` also matches CDNSKEY (child-zone key with identical RDATA, RFC 7344). ---
const RE_DNSKEY_RSA = new RegExp(`\\bC?DNSKEY\\s+\\d+\\s+3\\s+(?:${NUM_RSA})\\b`, "g");
const RE_DNSKEY_ECDSA = new RegExp(`\\bC?DNSKEY\\s+\\d+\\s+3\\s+(?:${NUM_ECDSA})\\b`, "g");
const RE_DNSKEY_EDDSA = new RegExp(`\\bC?DNSKEY\\s+\\d+\\s+3\\s+(?:${NUM_EDDSA})\\b`, "g");
const RE_DNSKEY_DSA = new RegExp(`\\bC?DNSKEY\\s+\\d+\\s+3\\s+(?:${NUM_DSA})\\b`, "g");
const RULE_DNSSEC_RSA = {
    id: "dnssec-rsa-sig",
    title: "DNSSEC RSA signing algorithm",
    description: "DNSSEC zone signed with a classical RSA algorithm (RSASHA1/256/512)",
    category: "signature",
    severity: "medium",
    confidence: "high",
    algorithm: "RSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "DNSSEC zone is signed with a classical RSA algorithm (RSASHA1/RSASHA1-NSEC3-SHA1/RSASHA256/RSASHA512); DNSKEY/RRSIG signatures become forgeable once a CRQC exists.",
    remediation: "Track IETF dnsop post-quantum DNSSEC signing work (ML-DSA); plan re-signing with a PQC algorithm once assigned an IANA DNSSEC algorithm number.",
};
const RULE_DNSSEC_ECDSA = {
    id: "dnssec-ecdsa-sig",
    title: "DNSSEC ECDSA signing algorithm",
    description: "DNSSEC zone signed with a classical ECDSA algorithm (ECDSAP256SHA256/384SHA384)",
    category: "signature",
    severity: "medium",
    confidence: "high",
    algorithm: "ECDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "DNSSEC zone is signed with a classical ECDSA algorithm (ECDSAP256SHA256/ECDSAP384SHA384); DNSKEY/RRSIG signatures become forgeable once a CRQC exists.",
    remediation: "Track IETF dnsop post-quantum DNSSEC signing work (ML-DSA); plan re-signing with a PQC algorithm once assigned an IANA DNSSEC algorithm number.",
};
const RULE_DNSSEC_EDDSA = {
    id: "dnssec-eddsa-sig",
    title: "DNSSEC EdDSA signing algorithm",
    description: "DNSSEC zone signed with a classical EdDSA algorithm (ED25519/ED448)",
    category: "signature",
    severity: "medium",
    confidence: "high",
    algorithm: "EdDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "DNSSEC zone is signed with a classical EdDSA algorithm (ED25519/ED448); modern but still classical — DNSKEY/RRSIG signatures become forgeable once a CRQC exists.",
    remediation: "Track IETF dnsop post-quantum DNSSEC signing work (ML-DSA); plan re-signing with a PQC algorithm once assigned an IANA DNSSEC algorithm number.",
};
const RULE_DNSSEC_DSA = {
    id: "dnssec-dsa-sig",
    title: "DNSSEC DSA signing algorithm (deprecated)",
    description: "DNSSEC zone signed with the deprecated classical DSA algorithm (DSA/DSA-NSEC3-SHA1)",
    category: "signature",
    severity: "medium",
    confidence: "high",
    algorithm: "DSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "DNSSEC zone is signed with DSA/DSA-NSEC3-SHA1 — deprecated by RFC 8624 (MUST NOT sign) and, independent of that, forgeable once a CRQC exists.",
    remediation: "Re-sign with a non-deprecated algorithm today (RFC 8624); track IETF dnsop post-quantum DNSSEC signing work (ML-DSA) for the eventual PQC migration.",
};
/** True when `content` carries some DNSSEC-specific marker (not just a bare algorithm token). */
function hasDnssecMarker(content) {
    return (content.includes("DNSKEY") ||
        content.includes("RRSIG") ||
        /dnssec/i.test(content) ||
        /ldns-signzone|dnssec-signzone/.test(content));
}
const DNSSEC_RULES = [
    { meta: RULE_DNSSEC_RSA, res: [RE_NAMED_RSA, RE_DNSKEY_RSA] },
    { meta: RULE_DNSSEC_ECDSA, res: [RE_NAMED_ECDSA, RE_DNSKEY_ECDSA] },
    { meta: RULE_DNSSEC_EDDSA, res: [RE_NAMED_EDDSA, RE_DNSKEY_EDDSA] },
    { meta: RULE_DNSSEC_DSA, res: [RE_NAMED_DSA, RE_DNSKEY_DSA] },
];
/** Detects classical DNSSEC signing algorithms in zone files and signer config. */
export const dnssecDetector = {
    id: "dnssec-crypto",
    description: "Classical DNSSEC signing algorithms in zone files / signer config",
    scope: "config",
    language: "any",
    rules: DNSSEC_RULES.map((r) => r.meta),
    appliesTo: (f) => hasExtension(f, DNSSEC_EXTENSIONS),
    detect({ file, content }) {
        if (!hasDnssecMarker(content))
            return [];
        // Mask whole comment lines so a commented-out algorithm can't fire: zone files
        // use `;`, named.conf uses `#` and `//`. These extensions are not centrally
        // stripped; offsets are preserved so finding locations stay exact.
        const scan = maskCommentLines(content, [";", "#", "//"]);
        const findings = [];
        for (const { meta, res } of DNSSEC_RULES) {
            for (const re of res) {
                eachMatch(re, scan, (m) => findings.push(findingFromRule(meta, { file, content, index: m.index, matchLength: m[0].length })));
            }
        }
        return findings;
    },
};
//# sourceMappingURL=dnssec.js.map