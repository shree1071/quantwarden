import { eachMatch, findingFromRule, hasExtension, maskCommentLines } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
const HCL_EXTENSIONS = [".hcl"];
const RE_TRANSIT_RSA = /\btype\s*=\s*"rsa-\d+"/g;
const RE_TRANSIT_ECDSA = /\btype\s*=\s*"ecdsa-p\d+"/g;
const RE_TRANSIT_ED25519 = /\btype\s*=\s*"ed25519"/g;
const RE_PKI_RSA = /\bkey_type\s*=\s*"rsa"/g;
const RE_PKI_EC = /\bkey_type\s*=\s*"ec"/g;
const RULE_TRANSIT_RSA = {
    id: "vault-transit-rsa",
    title: "Vault transit RSA key",
    description: 'Vault transit secrets engine key type = "rsa-*"',
    category: "kem",
    severity: "high",
    confidence: "high",
    algorithm: "RSA",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Vault transit provisions a classical RSA key (signing / key wrapping), not quantum-safe.",
    remediation: "Plan migration to PQC (ML-KEM-768 for wrapping, ML-DSA-65 for signing) as Vault adds support.",
};
const RULE_TRANSIT_ECDSA = {
    id: "vault-transit-ecdsa",
    title: "Vault transit ECDSA key",
    description: 'Vault transit secrets engine key type = "ecdsa-p*"',
    category: "signature",
    severity: "medium",
    confidence: "high",
    algorithm: "ECDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Vault transit provisions a classical ECDSA signing key, forgeable by a quantum attacker.",
    remediation: "ML-DSA-65 (FIPS 204) or SLH-DSA (FIPS 205).",
};
const RULE_TRANSIT_ED25519 = {
    id: "vault-transit-ed25519",
    title: "Vault transit Ed25519 key",
    description: 'Vault transit secrets engine key type = "ed25519"',
    category: "signature",
    severity: "low",
    confidence: "high",
    algorithm: "EdDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Vault transit provisions a classical Ed25519 signing key, forgeable by a quantum attacker.",
    remediation: "ML-DSA-65 (FIPS 204) or SLH-DSA (FIPS 205).",
};
const RULE_PKI_RSA = {
    id: "vault-pki-rsa",
    title: "Vault PKI RSA role",
    description: 'Vault pki secrets engine role key_type = "rsa"',
    category: "certificate",
    severity: "medium",
    confidence: "high",
    algorithm: "RSA",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Vault PKI mints certificates with a classical RSA key, not quantum-safe.",
    remediation: "Plan migration to PQC certificate keys (ML-DSA-65) as the CA chain adds support.",
};
const RULE_PKI_EC = {
    id: "vault-pki-ec",
    title: "Vault PKI EC role",
    description: 'Vault pki secrets engine role key_type = "ec"',
    category: "certificate",
    severity: "medium",
    confidence: "high",
    algorithm: "ECDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Vault PKI mints certificates with a classical EC key, forgeable by a quantum attacker.",
    remediation: "Plan migration to ML-DSA-65 (FIPS 204) certificate keys.",
};
/** Detects classical asymmetric keys in native Vault HCL config. */
export const vaultDetector = {
    id: "vault-crypto",
    description: "Classical asymmetric keys in native HashiCorp Vault config (transit, pki)",
    scope: "config",
    language: "any",
    rules: [RULE_TRANSIT_RSA, RULE_TRANSIT_ECDSA, RULE_TRANSIT_ED25519, RULE_PKI_RSA, RULE_PKI_EC],
    appliesTo: (f) => hasExtension(f, HCL_EXTENSIONS),
    detect({ file, content }) {
        // Gate: only inside a Vault transit / pki context.
        if (!content.includes("transit") && !content.includes("pki"))
            return [];
        const scan = maskCommentLines(content, ["#", "//"]);
        const findings = [];
        const add = (re, rule) => eachMatch(re, scan, (m) => findings.push(findingFromRule(rule, { file, content, index: m.index, matchLength: m[0].length })));
        add(RE_TRANSIT_RSA, RULE_TRANSIT_RSA);
        add(RE_TRANSIT_ECDSA, RULE_TRANSIT_ECDSA);
        add(RE_TRANSIT_ED25519, RULE_TRANSIT_ED25519);
        add(RE_PKI_RSA, RULE_PKI_RSA);
        add(RE_PKI_EC, RULE_PKI_EC);
        return findings;
    },
};
//# sourceMappingURL=vault.js.map