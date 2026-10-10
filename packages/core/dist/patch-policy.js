/**
 * Paths a patch may NEVER touch, regardless of anything else: version control,
 * CI, dependency lockfiles, and anything that looks like a secret/env file.
 */
const DENY_RE = /(^|\/)(\.github|\.git|node_modules)\/|(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|Cargo\.lock|Gemfile\.lock|poetry\.lock)$|(^|\/)\.env(\.[^/]*)?$|\.(pem|key|p12|pfx)$/i;
/** Decide whether `patch` may be applied under `ctx`. */
export function checkPatchPolicy(patch, ctx) {
    const p = patch.path.replace(/\\/g, "/");
    if (DENY_RE.test(p)) {
        return { allowed: false, reason: `patch touches a protected path (${p})` };
    }
    if (ctx.findingFiles.has(p))
        return { allowed: true };
    if (ctx.manifestFiles.has(p))
        return { allowed: true };
    return {
        allowed: false,
        reason: `patch edits ${p}, which has no finding and is not a dependency manifest`,
    };
}
//# sourceMappingURL=patch-policy.js.map