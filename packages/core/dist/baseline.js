/**
 * Canonical baseline module — the single source of truth for suppressing known
 * findings across qScan and the GitHub Action (replacing their two divergent,
 * mutually-unintelligible schemes).
 *
 * A baseline is a versioned set of finding fingerprints. A fingerprint is
 * **line-insensitive** (so unrelated edits that shift line numbers don't
 * invalidate it) and snippet-whitespace-normalized (so reformatting doesn't
 * either). Identity = `sha256(ruleId | file | normalizedSnippet)`.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
/** Current on-disk baseline schema version. */
export const BASELINE_VERSION = 1;
/** Collapse all whitespace runs to single spaces and trim (snippet stability). */
function normalizeSnippet(snippet) {
    if (!snippet)
        return "";
    return snippet.replace(/\s+/g, " ").trim();
}
/**
 * Stable, line-INSENSITIVE fingerprint of a finding: the hex SHA-256 of
 * `ruleId|file|normalizedSnippet`. The line number is deliberately excluded so
 * the fingerprint survives line shifts; the snippet's whitespace is normalized
 * so it survives reformatting.
 */
export function fingerprintFinding(f) {
    const snippet = normalizeSnippet(f.location.snippet);
    const input = `${f.ruleId}|${f.location.file}|${snippet}`;
    return createHash("sha256").update(input, "utf8").digest("hex");
}
/** Build a {@link Baseline} from a set of findings (deduped, sorted). */
export function baselineFromFindings(findings) {
    const set = new Set();
    for (const f of findings)
        set.add(fingerprintFinding(f));
    return {
        version: BASELINE_VERSION,
        fingerprints: [...set].sort(),
    };
}
/**
 * Split findings into those NOT in the baseline (`newFindings`) and those that
 * ARE (`suppressed`). Order within each group is preserved from the input.
 */
export function applyBaseline(findings, baseline) {
    const accepted = new Set(baseline.fingerprints);
    const newFindings = [];
    const suppressed = [];
    for (const f of findings) {
        if (accepted.has(fingerprintFinding(f)))
            suppressed.push(f);
        else
            newFindings.push(f);
    }
    return { newFindings, suppressed };
}
/** Normalize an arbitrary parsed object into a valid {@link Baseline}. */
function coerceBaseline(value) {
    if (value === null || typeof value !== "object") {
        return { version: BASELINE_VERSION, fingerprints: [] };
    }
    const obj = value;
    const version = typeof obj.version === "number" ? obj.version : BASELINE_VERSION;
    const fingerprints = Array.isArray(obj.fingerprints)
        ? obj.fingerprints.filter((x) => typeof x === "string")
        : [];
    return { version, fingerprints };
}
/**
 * Load a baseline from disk. Returns an empty baseline (rather than throwing)
 * when the file is missing or unparseable, so callers can treat "no baseline"
 * and "absent baseline" uniformly.
 */
export async function loadBaseline(path) {
    let text;
    try {
        text = await readFile(path, "utf8");
    }
    catch {
        return { version: BASELINE_VERSION, fingerprints: [] };
    }
    try {
        return coerceBaseline(JSON.parse(text));
    }
    catch {
        return { version: BASELINE_VERSION, fingerprints: [] };
    }
}
/**
 * Write a baseline derived from the given findings to disk as pretty JSON
 * (trailing newline). Returns the baseline that was written.
 */
export async function saveBaseline(path, findings) {
    const baseline = baselineFromFindings(findings);
    await writeFile(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
    return baseline;
}
//# sourceMappingURL=baseline.js.map