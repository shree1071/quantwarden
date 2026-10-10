import { DOC_EXTENSIONS, eachMatch, findingFromRule, hasExtension } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
// `pkcs11-tool --keypairgen --key-type rsa:2048` / `EC:secp256r1` (OpenSC).
const RE_PKCS11_TOOL_RSA = /--key-type\s+rsa:\d+/gi;
const RE_PKCS11_TOOL_EC = /--key-type\s+EC:[A-Za-z0-9]+/gi;
// PKCS#11 mechanism constants (CKM_*), which name the algorithm exactly.
const RE_CKM_RSA = /\bCKM_RSA_(?:PKCS(?:_KEY_PAIR_GEN|_OAEP|_PSS)?|X_509|9796)\b/g;
const RE_CKM_EC = /\bCKM_EC(?:DSA(?:_SHA\d+)?|DH1?_DERIVE|_KEY_PAIR_GEN)\b/g;
const RE_CKM_DSA = /\bCKM_DSA(?:_SHA\d+|_KEY_PAIR_GEN)?\b/g;
const RE_CKM_DH = /\bCKM_DH_PKCS_(?:KEY_PAIR_GEN|DERIVE)\b/g;
const RULE_PKCS11_RSA = {
    id: "pkcs11-rsa",
    title: "PKCS#11 (HSM) RSA key",
    description: "PKCS#11 RSA key generation / mechanism (pkcs11-tool, CKM_RSA_*)",
    category: "kem",
    severity: "high",
    confidence: "high",
    algorithm: "RSA",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "A classical RSA key in a PKCS#11 HSM / token — likely a long-lived root (CA / code-signing), and not quantum-safe.",
    remediation: "Inventory HSM-held RSA keys first (longest-lived); plan re-keying to PQC (ML-KEM-768 / ML-DSA-65) as HSM firmware adds support.",
};
const RULE_PKCS11_EC = {
    id: "pkcs11-ec",
    title: "PKCS#11 (HSM) EC key",
    description: "PKCS#11 EC key generation / mechanism (CKM_EC*, --key-type EC)",
    category: "key-exchange",
    severity: "high",
    confidence: "high",
    algorithm: "ECDH",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "A classical EC key in a PKCS#11 HSM / token; EC keys feed ECDSA signatures and ECDH key agreement (the ECDH path is harvest-now-decrypt-later exposed).",
    remediation: "For key agreement: hybrid X25519MLKEM768 (ML-KEM-768). For signatures: ML-DSA-65 (FIPS 204). Prioritise HSM-held keys.",
};
const RULE_PKCS11_DSA = {
    id: "pkcs11-dsa",
    title: "PKCS#11 (HSM) DSA key",
    description: "PKCS#11 DSA key generation / mechanism (CKM_DSA*)",
    category: "signature",
    severity: "medium",
    confidence: "high",
    algorithm: "DSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "A classical DSA key in a PKCS#11 HSM / token — deprecated and quantum-forgeable.",
    remediation: "Rotate off DSA; migrate to ML-DSA-65 (FIPS 204).",
};
const RULE_PKCS11_DH = {
    id: "pkcs11-dh",
    title: "PKCS#11 (HSM) Diffie-Hellman",
    description: "PKCS#11 finite-field DH key generation / derive (CKM_DH_PKCS_*)",
    category: "key-exchange",
    severity: "medium",
    confidence: "high",
    algorithm: "DH",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Finite-field Diffie-Hellman in a PKCS#11 HSM / token; classical key agreement, harvest-now-decrypt-later exposed.",
    remediation: "Migrate key agreement to hybrid X25519MLKEM768 (ML-KEM-768).",
};
/** Detects classical asymmetric keys behind a PKCS#11 HSM / token. */
export const pkcs11Detector = {
    id: "pkcs11-crypto",
    description: "Classical asymmetric keys in a PKCS#11 HSM / token",
    scope: "config",
    language: "any",
    appliesTo: (f) => !hasExtension(f, DOC_EXTENSIONS),
    rules: [RULE_PKCS11_RSA, RULE_PKCS11_EC, RULE_PKCS11_DSA, RULE_PKCS11_DH],
    detect({ file, content }) {
        // Fast reject: only proceed on a distinctive PKCS#11 marker.
        if (!content.includes("CKM_") && !content.includes("--key-type")) {
            return [];
        }
        const findings = [];
        const add = (re, rule) => eachMatch(re, content, (m) => findings.push(findingFromRule(rule, { file, content, index: m.index, matchLength: m[0].length })));
        add(RE_PKCS11_TOOL_RSA, RULE_PKCS11_RSA);
        add(RE_PKCS11_TOOL_EC, RULE_PKCS11_EC);
        add(RE_CKM_RSA, RULE_PKCS11_RSA);
        add(RE_CKM_EC, RULE_PKCS11_EC);
        add(RE_CKM_DSA, RULE_PKCS11_DSA);
        add(RE_CKM_DH, RULE_PKCS11_DH);
        return findings;
    },
};
//# sourceMappingURL=pkcs11.js.map