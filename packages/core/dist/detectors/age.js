import { eachMatch, findingFromRule } from "../detect-utils.js";
import { CWE_HARDCODED_KEY } from "../cwe.js";
// age secret keys are Bech32 in uppercase: `AGE-SECRET-KEY-1` + data part.
const RE_AGE_SECRET = /\bAGE-SECRET-KEY-1[0-9A-Z]{50,}\b/g;
const RULE_AGE_SECRET = {
    id: "age-secret-key",
    title: "age identity (X25519 private key)",
    description: "An age AGE-SECRET-KEY-1 private identity key committed to disk",
    category: "key-exchange",
    severity: "high",
    confidence: "high",
    algorithm: "X25519",
    hndl: true,
    cwe: CWE_HARDCODED_KEY,
    sensitive: true,
    message: "An age identity (X25519 private key) is committed to disk; every age-wrapped payload addressed to it is decryptable by anyone with this key, and the exposure is retroactive if the ciphertext is already in git history.",
    remediation: "Rotate the age identity and re-encrypt affected data; move the private key to a secret manager. Plan for a post-quantum KEM (ML-KEM) recipient when available.",
};
/** Detects committed age identity (private) keys. */
export const ageDetector = {
    id: "age-identity",
    description: "Committed age identity (X25519 private) keys",
    scope: "config",
    language: "any",
    rules: [RULE_AGE_SECRET],
    appliesTo: () => true,
    detect({ file, content }) {
        if (!content.includes("AGE-SECRET-KEY-1"))
            return [];
        const findings = [];
        eachMatch(RE_AGE_SECRET, content, (m) => findings.push(findingFromRule(RULE_AGE_SECRET, {
            file,
            content,
            index: m.index,
            matchLength: m[0].length,
        })));
        return findings;
    },
};
//# sourceMappingURL=age.js.map