/**
 * Return the list of changed files (relative POSIX paths) under `root`.
 *
 * - With `since` (a ref / range), returns `git diff --name-only --diff-filter=ACMR <since>`
 *   plus currently-modified-but-uncommitted files, deduped.
 * - Without `since`, returns uncommitted changes (`git diff` working+staged) plus
 *   untracked files (`git ls-files --others --exclude-standard`).
 * - When `root` is not a git repository (or git is unavailable), returns `[]`.
 *
 * Deleted files are excluded (ACMR filter / existence is the caller's concern).
 */
export declare function changedFiles(root: string, since?: string): Promise<string[]>;
//# sourceMappingURL=changed.d.ts.map