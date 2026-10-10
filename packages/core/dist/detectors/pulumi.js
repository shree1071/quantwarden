import { eachMatch, findingFromRule, hasExtension } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
const PULUMI_EXTENSIONS = [".ts", ".js", ".mjs", ".cjs", ".py", ".go"];
// The `algorithm` value of a pulumi-tls PrivateKey, in the TS/Python (`algorithm:
// "RSA"` / `algorithm="RSA"`) and Go (`Algorithm: pulumi.String("RSA")`) spellings.
const RE_PULUMI_TLS_ALG = /\b[Aa]lgorithm\s*[:=]\s*(?:pulumi\.String\(\s*)?["'](RSA|ECDSA|ED25519)["']/g;
/** True when the file actually uses the pulumi-tls provider (gate against FPs). */
function usesPulumiTls(content) {
    return (content.includes("@pulumi/tls") ||
        content.includes("pulumi_tls") ||
        content.includes("pulumi-tls") ||
        content.includes("tls.PrivateKey") ||
        content.includes("tls.NewPrivateKey"));
}
const RULE_PULUMI_RSA = {
    id: "pulumi-tls-rsa",
    title: "Pulumi tls.PrivateKey RSA key",
    description: 'Pulumi tls.PrivateKey with algorithm "RSA"',
    category: "kem",
    severity: "high",
    confidence: "high",
    algorithm: "RSA",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Pulumi provisions a classical RSA key (tls.PrivateKey), which is not quantum-safe.",
    remediation: "Plan migration to PQC (ML-KEM-768 for encryption, ML-DSA-65 for signatures).",
};
const RULE_PULUMI_ECDSA = {
    id: "pulumi-tls-ecdsa",
    title: "Pulumi tls.PrivateKey ECDSA key",
    description: 'Pulumi tls.PrivateKey with algorithm "ECDSA"',
    category: "signature",
    severity: "high",
    confidence: "high",
    algorithm: "ECDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Pulumi provisions a classical ECDSA key (tls.PrivateKey), forgeable by a quantum attacker.",
    remediation: "ML-DSA-65 (FIPS 204) or SLH-DSA (FIPS 205).",
};
const RULE_PULUMI_ED25519 = {
    id: "pulumi-tls-ed25519",
    title: "Pulumi tls.PrivateKey Ed25519 key",
    description: 'Pulumi tls.PrivateKey with algorithm "ED25519"',
    category: "signature",
    severity: "medium",
    confidence: "high",
    algorithm: "EdDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Pulumi provisions a classical Ed25519 key (tls.PrivateKey), forgeable by a quantum attacker.",
    remediation: "ML-DSA-65 (FIPS 204) or SLH-DSA (FIPS 205).",
};
const RULE_BY_ALG = {
    RSA: RULE_PULUMI_RSA,
    ECDSA: RULE_PULUMI_ECDSA,
    ED25519: RULE_PULUMI_ED25519,
};
/** Detects classical asymmetric keys provisioned by Pulumi's tls provider. */
export const pulumiDetector = {
    id: "pulumi-crypto",
    description: "Classical asymmetric keys provisioned by Pulumi's tls provider (IaC)",
    scope: "config",
    language: "any",
    rules: [RULE_PULUMI_RSA, RULE_PULUMI_ECDSA, RULE_PULUMI_ED25519],
    appliesTo: (f) => hasExtension(f, PULUMI_EXTENSIONS),
    detect({ file, content }) {
        if (!usesPulumiTls(content))
            return [];
        const findings = [];
        eachMatch(RE_PULUMI_TLS_ALG, content, (m) => {
            const rule = RULE_BY_ALG[m[1]];
            if (!rule)
                return;
            findings.push(findingFromRule(rule, { file, content, index: m.index, matchLength: m[0].length }));
        });
        return findings;
    },
};
//# sourceMappingURL=pulumi.js.map