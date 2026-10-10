/**
 * Create a detached worktree of `repoRoot` at HEAD, run `fn` with its path, and
 * always tear it down. Throws if `repoRoot` is not a git repository.
 */
export declare function withWorktree<T>(repoRoot: string, fn: (dir: string) => Promise<T>): Promise<T>;
//# sourceMappingURL=worktree.d.ts.map