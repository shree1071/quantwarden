/** Severity ordering, most → least severe. Index 0 is the most severe. */
export const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];
/**
 * Rank of a severity within {@link SEVERITY_ORDER} (0 = most severe). Lower
 * ranks are more severe; unknown values fall to the end.
 */
export function severityRank(s) {
    const i = SEVERITY_ORDER.indexOf(s);
    return i < 0 ? SEVERITY_ORDER.length : i;
}
/**
 * True when `severity` is at or above `threshold` (i.e. at least as severe).
 * Because lower ranks are more severe, "at or above" is `rank <= threshold`.
 */
export function meetsThreshold(severity, threshold) {
    return severityRank(severity) <= severityRank(threshold);
}
/** Map our severity to a SARIF 2.1.0 result level. */
export function sarifLevel(severity) {
    switch (severity) {
        case "critical":
        case "high":
            return "error";
        case "medium":
            return "warning";
        default:
            return "note";
    }
}
//# sourceMappingURL=severity.js.map