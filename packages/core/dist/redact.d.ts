/**
 * Context redactor: turn a finding + its file into the payload the LLM sees,
 * bounded to a chosen {@link ContextLevel} and with secrets ALWAYS stripped.
 *
 * This is a hard privacy boundary and lives in `@quantakrypto/core` (offline) so
 * the deterministic MCP plane redacts identically to the networked CLI. A
 * `sensitive` finding (the match IS key material) never emits code at any level.
 */
import type { Finding } from "./types.js";
import type { ContextLevel, RedactedContext } from "./agent-types.js";
/**
 * Build the redacted context for `finding` at `level`. `fileContent` is the full
 * text of the file the finding lives in (unused at `metadata` level). Secrets
 * are always removed; a `sensitive` finding yields `code: null`.
 */
export declare function buildContext(finding: Finding, level: ContextLevel, fileContent: string): RedactedContext;
/** Render the exact payload text a `--dry-run` preflight would send. */
export declare function renderPreflight(contexts: RedactedContext[]): string;
//# sourceMappingURL=redact.d.ts.map