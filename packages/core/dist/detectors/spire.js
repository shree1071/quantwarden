import { DOC_EXTENSIONS, eachMatch, findingFromRule, hasExtension, maskCommentLines, } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
// SPIRE config is HCL/conf, but deployments also template it as YAML (Helm
// values / ConfigMaps) or JSON. Prose (`.md`, …) is excluded in `appliesTo`.
const SPIRE_EXTENSIONS = [".conf", ".hcl", ".yaml", ".yml", ".json"];
// The three SPIRE key-type attribute names in one anchor: `ca_key_type`,
// `svid_key_type`, and the bare per-plugin `key_type`.
const KEY_ATTR = "(?:ca_|svid_)?key_type";
// HCL `=`, unquoted YAML `:`, and JSON `"key_type": "..."` assignment forms. The
// attribute-name and value quotes are BOTH optional (`"?`): HCL uses `key_type =
// "rsa-2048"`, Helm/YAML uses the unquoted `key_type: rsa-2048`, and JSON quotes
// the key (`"key_type": "rsa-2048"`) — a required-quote regex missed the latter
// two entirely. Case-insensitive, though SPIRE writes these lowercase.
const RE_SPIRE_RSA = new RegExp(`\\b${KEY_ATTR}"?\\s*[:=]\\s*"?rsa-\\d+`, "gi");
const RE_SPIRE_ECDSA = new RegExp(`\\b${KEY_ATTR}"?\\s*[:=]\\s*"?(?:ec-p\\d+|ecdsa)\\b`, "gi");
const RULE_SPIRE_RSA = {
    id: "spire-rsa-key",
    title: "SPIRE/SPIFFE RSA SVID key type",
    description: 'SPIRE ca_key_type/svid_key_type/key_type = "rsa-*" (classical X.509-SVID key)',
    category: "certificate",
    severity: "medium",
    confidence: "high",
    algorithm: "RSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "SPIRE issues SPIFFE X.509-SVIDs with a classical RSA key; the SVID (and CA) signatures become forgeable once a CRQC exists, letting an attacker mint identities for the trust domain.",
    remediation: "SPIFFE/SPIRE has no PQC SVID key type yet — track the SPIFFE roadmap for PQC signature support. Prioritise the SPIRE server ca_key_type: the classical CA is the identity root, so its forgeability compromises every workload SVID.",
};
const RULE_SPIRE_ECDSA = {
    id: "spire-ec-key",
    title: "SPIRE/SPIFFE ECDSA SVID key type",
    description: 'SPIRE ca_key_type/svid_key_type/key_type = "ec-p256|ec-p384|ecdsa" (classical X.509-SVID key)',
    category: "certificate",
    severity: "medium",
    confidence: "high",
    algorithm: "ECDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "SPIRE issues SPIFFE X.509-SVIDs with a classical ECDSA (P-256/P-384) key; the SVID (and CA) signatures become forgeable once a CRQC exists, letting an attacker mint identities for the trust domain.",
    remediation: "SPIFFE/SPIRE has no PQC SVID key type yet — track the SPIFFE roadmap for PQC signature support. Prioritise the SPIRE server ca_key_type: the classical CA is the identity root, so its forgeability compromises every workload SVID.",
};
/**
 * True when `content` carries a SPIFFE/SPIRE-specific marker. A bare generic
 * `key_type` is intentionally NOT enough — only `spiffe`/`spire` context, the
 * distinctive `ca_key_type`, or an `svid` token qualifies — so an unrelated
 * config that merely sets `key_type = "rsa-2048"` cannot fire.
 */
function hasSpireMarker(content) {
    // Word-anchored so `inspired` / `aspire` / a `svid` substring inside a longer
    // token don't qualify; `ca_key_type` is distinctive enough to match unanchored.
    return /\b(?:spiffe|spire|svid)\b/i.test(content) || content.includes("ca_key_type");
}
/** Detects classical key types configured for SPIFFE X.509 SVIDs in SPIRE config. */
export const spireDetector = {
    id: "spire-crypto",
    description: "Classical key types for SPIFFE X.509 SVIDs in SPIRE server/agent config",
    scope: "config",
    language: "any",
    rules: [RULE_SPIRE_RSA, RULE_SPIRE_ECDSA],
    // Gate to SPIRE's config extensions, and never run on prose (a README that
    // describes `ca_key_type = "rsa-2048"` is documentation, not live config).
    appliesTo: (f) => hasExtension(f, SPIRE_EXTENSIONS) && !hasExtension(f, DOC_EXTENSIONS),
    detect({ file, content }) {
        if (!hasSpireMarker(content))
            return [];
        // Mask whole comment lines (HCL/YAML `#`, HCL/JSON5 `//`) so a commented-out
        // key-type directive can't fire. Offsets are preserved, so finding
        // line/column/snippet for the remaining live config stay exact.
        const scan = maskCommentLines(content, ["#", "//"]);
        const findings = [];
        const add = (re, rule) => eachMatch(re, scan, (m) => findings.push(findingFromRule(rule, { file, content, index: m.index, matchLength: m[0].length })));
        add(RE_SPIRE_RSA, RULE_SPIRE_RSA);
        add(RE_SPIRE_ECDSA, RULE_SPIRE_ECDSA);
        return findings;
    },
};
//# sourceMappingURL=spire.js.map