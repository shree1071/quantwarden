/**
 * Comment-aware false-positive suppression.
 *
 * The detectors are lexical (regex over source text), so a crypto API name
 * written in a COMMENT — `// migrated off createECDH()` — fires a finding just
 * like real code. This module computes the comment spans of a file (respecting
 * string literals, so a `//` inside a string is not a comment) and drops any
 * finding whose match starts inside one.
 *
 * The lexer is deliberately conservative: it only ever ENTERS a comment on a
 * literal line comment, block comment, or `#` in code position (all of which ARE
 * comments), so it never mis-classifies code as a comment and can only reduce
 * false positives, not recall. The one inherent lexical ambiguity — a regex
 * literal that looks like a block-comment open — is rare and guarded by the
 * detection benchmark's recall gate.
 */
import type { Finding } from "./types.js";
type CommentStyle = "c" | "hash";
/**
 * Compute the comment spans (`[start, end)` offsets) of `content`, skipping over
 * string literals so a comment marker inside a string is not treated as a
 * comment. Spans are returned sorted and non-overlapping. `rawBacktick` (Go)
 * makes backtick strings raw (no escapes).
 */
export declare function commentSpans(content: string, style: CommentStyle, rawBacktick?: boolean): Array<[number, number]>;
/** Drop findings on lines suppressed by an inline `qscan-ignore` directive. */
export declare function stripIgnoredFindings(findings: Finding[], content: string): Finding[];
/**
 * Drop findings whose match starts inside a comment. No-op when the file's
 * language has no comment style we handle, or when it has no comments.
 */
export declare function stripCommentFindings(findings: Finding[], content: string, file: string): Finding[];
/**
 * Compute the string-literal spans (`[start, end)`) of `content`, skipping over
 * comments so a quote inside a comment is not treated as a string. Used to
 * suppress findings from IDENTIFIER-only rules (e.g. a Go `SigningMethodRS256`
 * mentioned inside an error-message string) — the mirror of {@link commentSpans}.
 */
export declare function stringSpans(content: string, style: CommentStyle, rawBacktick?: boolean): Array<[number, number]>;
/**
 * Drop findings of "code-only" rules (`ruleIds`) whose match starts inside a
 * string literal. Some rules — an identifier-form JWT signing method, a Go
 * `SigningMethodRS256` — are only meaningful as code; when the same token appears
 * inside a string (a test's `t.Error("SigningMethodPS256 …")`) it is prose, not a
 * usage. Rules that legitimately match inside strings (quoted `"RS256"` alg
 * tokens, cipher-suite strings, ssh-key tokens) are NOT in `ruleIds` and pass
 * through untouched.
 */
export declare function stripStringLiteralFindings(findings: Finding[], content: string, file: string, ruleIds: ReadonlySet<string>): Finding[];
export {};
//# sourceMappingURL=comments.d.ts.map