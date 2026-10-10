import { eachMatch, findingFromRule, hasExtension, maskBlockComments, maskCommentLines, DART_EXTENSIONS, } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
// RSA key generation / raw RSA encryption engine (pointycastle). Both are
// confidentiality-capable (a keypair can decrypt; the engine encrypts) → kem.
const RE_DART_RSA_KEYGEN = /\b(?:RSAKeyGenerator|RSAEngine)\b/g;
// RSA signature schemes: pointycastle `RSASigner`/`PSSSigner`, cryptography
// `RsaPss`/`RsaSsaPkcs1v15`. Distinct casing keeps these off the keygen rule.
const RE_DART_RSA_SIGN = /\b(?:RSASigner|PSSSigner|RsaPss|RsaSsaPkcs1v15)\b/g;
// ECDSA SIGNING: pointycastle `ECDSASigner`, cryptography `Ecdsa`. `\bEcdsa\b`
// requires a boundary, so `EcdsaP256`-style concatenations (rare) and the all-caps
// `ECDSASigner` don't double-fire here. (EC keygen is a SEPARATE, HNDL-exposed rule.)
const RE_DART_ECDSA = /\b(?:ECDSASigner|Ecdsa)\b/g;
// EC KEY GENERATION (pointycastle `ECKeyGenerator`) is ambiguous — an EC key can
// feed ECDSA signing OR ECDH agreement — so it is classified key-exchange/ECDH/
// hndl:true (the fleet's HNDL-safe convention), NOT folded into the signing rule.
const RE_DART_EC_KEYGEN = /\bECKeyGenerator\b/g;
// ECDH key agreement: pointycastle `ECDHBasicAgreement`, cryptography `Ecdh`.
// `\bEcdh\b` cannot match inside `Ecdsa` (different letters), so no overlap.
const RE_DART_ECDH = /\b(?:ECDHBasicAgreement|Ecdh)\b/g;
// Ed25519 signer (both packages spell it `Ed25519`).
const RE_DART_ED25519 = /\bEd25519\b/g;
// X25519 key agreement (cryptography `X25519`).
const RE_DART_X25519 = /\bX25519\b/g;
// Cheap fast-reject: distinctive substrings that gate the (precise) regex work.
// If none is present the file cannot contain any of the tracked identifiers.
const DART_FAST_REJECT = [
    "RSA",
    "Rsa",
    "ECDSA",
    "Ecdsa",
    "ECDH",
    "Ecdh",
    "ECKeyGenerator",
    "PSSSigner",
    "Ed25519",
    "X25519",
];
const RULE_DART_RSA_KEYGEN = {
    id: "dart-rsa-keygen",
    title: "Dart RSA key generation / encryption",
    description: "pointycastle RSAKeyGenerator / RSAEngine",
    category: "kem",
    severity: "high",
    confidence: "high",
    algorithm: "RSA",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Classical RSA key generation / encryption (Dart, pointycastle) is not quantum-safe and RSA encryption is harvest-now-decrypt-later exposed.",
    remediation: "Migrate to PQC (ML-KEM-768 for encryption / key transport) as Dart crypto packages add support.",
};
const RULE_DART_RSA_SIGN = {
    id: "dart-rsa-sign",
    title: "Dart RSA signature",
    description: "pointycastle RSASigner/PSSSigner, cryptography RsaPss/RsaSsaPkcs1v15",
    category: "signature",
    // `high`, consistent with every sibling pack's signature severity (go/java/php/
    // objc/elixir RSA-sign) — the same primitive must not flip CI exit codes by language.
    severity: "high",
    confidence: "high",
    algorithm: "RSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Classical RSA signature (Dart) is forgeable by a quantum attacker.",
    remediation: "Migrate to PQC signatures (ML-DSA-65, FIPS 204) as Dart crypto packages add support.",
};
const RULE_DART_ECDSA = {
    id: "dart-ecdsa",
    title: "Dart ECDSA signature",
    description: "pointycastle ECDSASigner, cryptography Ecdsa",
    category: "signature",
    severity: "high",
    confidence: "high",
    algorithm: "ECDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Classical ECDSA signing (Dart) is forgeable by a quantum attacker.",
    remediation: "Migrate to PQC signatures (ML-DSA-65, FIPS 204) as Dart crypto packages add support.",
};
const RULE_DART_EC_KEYGEN = {
    id: "dart-ec-keygen",
    title: "Dart EC key generation",
    description: "pointycastle ECKeyGenerator (ambiguous EC key: ECDSA or ECDH)",
    // Ambiguous EC keygen → key-exchange/ECDH/hndl:true (fleet HNDL-safe convention),
    // since the key may feed ECDH agreement (harvest-now-decrypt-later exposed).
    category: "key-exchange",
    severity: "high",
    confidence: "high",
    algorithm: "ECDH",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "EC key generation (Dart, pointycastle); an EC key can feed ECDH key agreement (harvest-now-decrypt-later exposed) as well as ECDSA signing, and is not quantum-safe.",
    remediation: "For key agreement migrate to hybrid X25519MLKEM768 (ML-KEM-768); for signatures ML-DSA-65 — as Dart crypto packages add support.",
};
const RULE_DART_ECDH = {
    id: "dart-ecdh",
    title: "Dart ECDH key agreement",
    description: "pointycastle ECDHBasicAgreement, cryptography Ecdh",
    category: "key-exchange",
    severity: "high",
    confidence: "high",
    algorithm: "ECDH",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Elliptic-curve Diffie-Hellman key agreement (Dart) is broken by Shor's algorithm (harvest-now-decrypt-later).",
    remediation: "Migrate key agreement to hybrid X25519MLKEM768 (ML-KEM-768) as Dart crypto packages add support.",
};
const RULE_DART_ED25519 = {
    id: "dart-ed25519",
    title: "Dart Ed25519 signature",
    description: "pointycastle / cryptography Ed25519 signer",
    category: "signature",
    // `low`, aligned with Ed25519 across the other source packs (swift/rust/go/…) —
    // the same primitive must not flip CI exit codes based on which language wrote it.
    severity: "low",
    confidence: "high",
    algorithm: "EdDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Ed25519 (Dart) is a modern but still classical signature scheme, forgeable by a quantum attacker.",
    remediation: "Migrate to PQC signatures (ML-DSA-65, FIPS 204) as Dart crypto packages add support.",
};
const RULE_DART_X25519 = {
    id: "dart-x25519",
    title: "Dart X25519 key agreement",
    description: "cryptography X25519 key agreement",
    category: "key-exchange",
    severity: "medium",
    confidence: "high",
    algorithm: "X25519",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "X25519 (Dart) is modern but still classical key agreement — harvest-now-decrypt-later exposed.",
    remediation: "Migrate key agreement to hybrid X25519MLKEM768 (ML-KEM-768) as Dart crypto packages add support.",
};
/** Detects classical asymmetric crypto in Dart / Flutter (pointycastle, cryptography). */
export const dartDetector = {
    id: "dart-crypto",
    description: "Classical asymmetric crypto in Dart / Flutter (pointycastle, cryptography)",
    scope: "source",
    language: "dart",
    rules: [
        RULE_DART_RSA_KEYGEN,
        RULE_DART_RSA_SIGN,
        RULE_DART_ECDSA,
        RULE_DART_EC_KEYGEN,
        RULE_DART_ECDH,
        RULE_DART_ED25519,
        RULE_DART_X25519,
    ],
    appliesTo: (f) => hasExtension(f, DART_EXTENSIONS),
    detect({ file, content }) {
        // Fast-reject: nothing to do unless a distinctive token appears.
        if (!DART_FAST_REJECT.some((t) => content.includes(t)))
            return [];
        // Suppress C-style comments so commented-out crypto isn't reported. Offsets
        // are preserved (chars → spaces), so finding line/column stay exact.
        const masked = maskCommentLines(maskBlockComments(content), ["//"]);
        const findings = [];
        // Scan the masked text, but build the finding (its snippet) from the ORIGINAL
        // `content` so a line with a trailing comment renders live, not blanked.
        const add = (re, rule) => eachMatch(re, masked, (m) => findings.push(findingFromRule(rule, {
            file,
            content,
            index: m.index,
            matchLength: m[0].length,
        })));
        add(RE_DART_RSA_KEYGEN, RULE_DART_RSA_KEYGEN);
        add(RE_DART_RSA_SIGN, RULE_DART_RSA_SIGN);
        add(RE_DART_ECDSA, RULE_DART_ECDSA);
        add(RE_DART_EC_KEYGEN, RULE_DART_EC_KEYGEN);
        add(RE_DART_ECDH, RULE_DART_ECDH);
        add(RE_DART_ED25519, RULE_DART_ED25519);
        add(RE_DART_X25519, RULE_DART_X25519);
        return findings;
    },
};
//# sourceMappingURL=dart.js.map