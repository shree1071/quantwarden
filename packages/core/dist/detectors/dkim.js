import { DOC_EXTENSIONS, eachMatch, findingFromRule, hasExtension, maskCommentLines, } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
// DKIM records live in DNS zone files (`.zone`/`.db`), mail-server signer config
// (`.conf`), and captured header/TXT fixtures (`.txt`). Gated further by
// `hasDkimMarker` so the short tag tokens can't fire on unrelated config.
const DKIM_EXTENSIONS = [".zone", ".db", ".conf", ".txt"];
// --- RSA (k=rsa / rsa-sha256 / rsa-sha1) ---
// DNS key-type tag: `k=rsa` in a published DKIM TXT record. Whitespace tolerated
// around `=`; case-insensitive since tags are conventionally lowercase but not
// required to be. `\b` after `rsa` keeps it from matching `rsa-...` substrings.
const RE_RSA_KEYTAG = /\bk\s*=\s*rsa\b/gi;
// DKIM-Signature `a=` tag: `a=rsa-sha256` / `a=rsa-sha1`.
const RE_RSA_ALGTAG = /\ba\s*=\s*rsa-sha(?:256|1)\b/gi;
// OpenDKIM signer directive: `SigningAlgorithm rsa-sha256` / `rsa-sha1`.
const RE_RSA_OPENDKIM = /\bSigningAlgorithm\s+rsa-sha(?:256|1)\b/gi;
// --- EdDSA (k=ed25519 / ed25519-sha256, RFC 8463) ---
const RE_EDDSA_KEYTAG = /\bk\s*=\s*ed25519\b/gi;
const RE_EDDSA_ALGTAG = /\ba\s*=\s*ed25519-sha256\b/gi;
const RE_EDDSA_OPENDKIM = /\bSigningAlgorithm\s+ed25519-sha256\b/gi;
const RULE_DKIM_RSA = {
    id: "dkim-rsa-key",
    title: "DKIM RSA signing key/algorithm",
    description: "DKIM email signing configured with a classical RSA key/algorithm (k=rsa, a=rsa-sha256/rsa-sha1)",
    category: "signature",
    severity: "medium",
    confidence: "high",
    algorithm: "RSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "DKIM email signing uses a classical RSA key/algorithm (k=rsa / rsa-sha256 / rsa-sha1); DKIM-Signature headers become forgeable once a CRQC exists, allowing DKIM/DMARC-passing spoofed mail.",
    remediation: "There is no standardized post-quantum DKIM algorithm yet — track IETF work; note that rotating RSA to Ed25519 (RFC 8463) is good hygiene but NOT a PQC fix, since Ed25519 is still classical and equally forgeable under a CRQC.",
};
const RULE_DKIM_EDDSA = {
    id: "dkim-ed25519-key",
    title: "DKIM Ed25519 signing key/algorithm",
    description: "DKIM email signing configured with a classical Ed25519 key/algorithm (k=ed25519, a=ed25519-sha256, RFC 8463)",
    category: "signature",
    severity: "medium",
    confidence: "high",
    algorithm: "EdDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "DKIM email signing uses an Ed25519 key/algorithm (k=ed25519 / ed25519-sha256, RFC 8463) — modern but still classical; DKIM-Signature headers become forgeable once a CRQC exists.",
    remediation: "There is no standardized post-quantum DKIM algorithm yet — track IETF work. Ed25519 is already the smaller/modern DKIM choice but is NOT post-quantum: it stays forgeable under a CRQC, so no rotation today resolves the quantum exposure.",
};
/**
 * True when `content` carries a DKIM-specific marker. Deliberately does NOT accept
 * a bare `k=rsa` / `k=ed25519` tag as its own marker: that tag is exactly what the
 * RSA/EdDSA rules match, so treating it as the gate would be self-satisfying and
 * fire on unrelated prose ("set `k=rsa` for the legacy importer"). A real DKIM
 * record always also carries `v=DKIM1`, `_domainkey`, a `DKIM-Signature` field, or
 * the OpenDKIM `SigningAlgorithm` directive — one of those must be present.
 */
function hasDkimMarker(content) {
    return (/\bDKIM1\b/i.test(content) ||
        content.includes("_domainkey") ||
        /DKIM-Signature/i.test(content) ||
        /\bSigningAlgorithm\b/i.test(content));
}
const DKIM_RULES = [
    { meta: RULE_DKIM_RSA, res: [RE_RSA_KEYTAG, RE_RSA_ALGTAG, RE_RSA_OPENDKIM] },
    { meta: RULE_DKIM_EDDSA, res: [RE_EDDSA_KEYTAG, RE_EDDSA_ALGTAG, RE_EDDSA_OPENDKIM] },
];
/** Detects classical DKIM signing keys/algorithms in zone files and mail signer config. */
export const dkimDetector = {
    id: "dkim-crypto",
    description: "Classical DKIM email signing keys/algorithms in zone files / mail signer config",
    scope: "config",
    language: "any",
    rules: DKIM_RULES.map((r) => r.meta),
    appliesTo: (f) => hasExtension(f, DKIM_EXTENSIONS) && !hasExtension(f, DOC_EXTENSIONS),
    detect({ file, content }) {
        // Defensive doc guard: even if a broader gate ever let a prose file through,
        // a README mentioning `k=rsa` in a sentence must never be flagged.
        if (hasExtension(file, DOC_EXTENSIONS))
            return [];
        if (!hasDkimMarker(content))
            return [];
        // Mask whole comment lines so a commented-out record can't fire: zone files
        // use `;`, mail/OpenDKIM config uses `#` and `//`. Offsets are preserved so
        // finding line/column/snippet stay exact for the live lines that remain.
        const scan = maskCommentLines(content, [";", "#", "//"]);
        const findings = [];
        for (const { meta, res } of DKIM_RULES) {
            for (const re of res) {
                eachMatch(re, scan, (m) => findings.push(findingFromRule(meta, { file, content, index: m.index, matchLength: m[0].length })));
            }
        }
        return findings;
    },
};
//# sourceMappingURL=dkim.js.map