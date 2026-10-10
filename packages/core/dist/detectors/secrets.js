import { DOC_EXTENSIONS, eachMatch, findingFromRule, hasExtension, maskCommentLines, } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
const SECRET_RULES = [
    {
        // age/SOPS recipient: `age1` + 58 bech32 chars. Distinctive enough for any file.
        re: /\bage1[0-9a-z]{58}\b/g,
        meta: {
            id: "secrets-age-recipient",
            title: "age / SOPS recipient (X25519)",
            description: "An age (SOPS) recipient public key wraps secrets with classical X25519",
            category: "key-exchange",
            severity: "high",
            confidence: "high",
            algorithm: "X25519",
            hndl: true,
            cwe: CWE_BROKEN_CRYPTO,
            message: "Secrets are wrapped to an age/SOPS X25519 recipient (classical key agreement); harvest-now-decrypt-later exposed, and if committed to git the ciphertext is retroactively un-fixable.",
            remediation: "Track a post-quantum age recipient / KMS (ML-KEM) and re-encrypt; rotate any secret whose ciphertext has left your control.",
        },
    },
    {
        re: /\bkind:\s*["']?SealedSecret\b/g,
        meta: {
            id: "secrets-sealed-secret",
            title: "Bitnami Sealed Secret (RSA-OAEP)",
            description: "A SealedSecret is wrapped by the controller's classical RSA-OAEP key",
            category: "kem",
            severity: "high",
            confidence: "high",
            algorithm: "RSA",
            hndl: true,
            cwe: CWE_BROKEN_CRYPTO,
            message: "A Bitnami SealedSecret is wrapped with the controller's classical RSA-OAEP key; harvest-now-decrypt-later exposed, and typically committed to git.",
            remediation: "Plan migration as sealed-secrets adds PQC support; rotate the sealing key and secrets when it does.",
        },
    },
];
/** Detects secrets encrypted at rest with classical asymmetric key wrapping. */
export const secretsDetector = {
    id: "secrets-at-rest",
    description: "Secrets wrapped at rest with classical asymmetric crypto (SOPS/age, PGP, Sealed Secrets)",
    scope: "config",
    language: "any",
    rules: SECRET_RULES.map((r) => r.meta),
    // Skip prose/docs: a tutorial showing an example age recipient is not a secret store.
    appliesTo: (f) => !hasExtension(f, DOC_EXTENSIONS),
    detect({ file, content }) {
        // Fast reject: none of the distinctive markers present.
        if (!content.includes("age1") && !content.includes("SealedSecret")) {
            return [];
        }
        // A commented `# kind: SealedSecret` / `# age1…` is not an active setting.
        const scan = maskCommentLines(content, ["#"]);
        const findings = [];
        for (const rule of SECRET_RULES) {
            eachMatch(rule.re, scan, (m) => {
                findings.push(findingFromRule(rule.meta, { file, content, index: m.index, matchLength: m[0].length }));
            });
        }
        return findings;
    },
};
//# sourceMappingURL=secrets.js.map