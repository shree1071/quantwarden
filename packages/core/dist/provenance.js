/**
 * Provenance / declared-source-repository check (wired to `qscan --audit`).
 *
 * A package that declares no source repository, or one whose declared repository
 * does not resolve, cannot have its published artifacts verified against source —
 * a supply-chain gap. This reads the ROOT manifest's repository URL and emits:
 *
 *   - `provenance-repo-missing`   (info)    — the manifest declares no repository.
 *   - `provenance-repo-unresolved`(medium)  — the declared repository 404s / does
 *                                             not resolve (network mode only).
 *
 * OFFLINE BOUNDARY (ADR-0005). `@quantakrypto/core` must stay strictly offline: it
 * may NOT import `node:https` or make outbound calls. So this module does the
 * pure work — parse the manifest, decide what to check — and delegates the actual
 * HEAD request to an INJECTED {@link RepoHeadRequester} that the caller (qScan,
 * which is allowed to be networked) supplies. In the default (static) mode no
 * network hook is used at all, so a scan without `--audit` never reaches for one.
 */
import { readFile } from "node:fs/promises";
import * as path from "node:path";
const DEFAULT_TIMEOUT_MS = 5000;
/** The root manifests we understand, in precedence order. */
const MANIFESTS = ["package.json", "Cargo.toml", "pyproject.toml"];
/**
 * Normalize a declared repository reference to an https(s) URL, or null when it
 * cannot be turned into one we can HEAD. Handles `git+https://…`, `git://…`,
 * `git@github.com:owner/repo(.git)`, the `owner/repo` and `github:owner/repo`
 * shorthands, and strips a trailing `.git`.
 */
export function normalizeRepoUrl(raw) {
    let s = raw.trim();
    if (!s)
        return null;
    s = s.replace(/^git\+/, "");
    // scp-style `git@host:owner/repo`
    const scp = /^[\w.-]+@([\w.-]+):(.+)$/.exec(s);
    if (scp)
        s = `https://${scp[1]}/${scp[2]}`;
    if (s.startsWith("git://"))
        s = `https://${s.slice("git://".length)}`;
    if (s.startsWith("ssh://"))
        s = `https://${s.slice("ssh://".length)}`;
    // `github:owner/repo` / `gitlab:owner/repo` / `bitbucket:owner/repo`
    const hosted = /^(github|gitlab|bitbucket):(.+)$/.exec(s);
    if (hosted) {
        const host = hosted[1] === "github" ? "github.com" : `${hosted[1]}.org`;
        s = `https://${host}/${hosted[2]}`;
    }
    // bare `owner/repo` shorthand → GitHub
    if (/^[\w.-]+\/[\w.-]+$/.test(s))
        s = `https://github.com/${s}`;
    if (!/^https?:\/\//i.test(s))
        return null;
    return s.replace(/\.git$/, "");
}
/** package.json `repository` (string or `{ url }`). */
function repoFromPackageJson(content) {
    let json;
    try {
        json = JSON.parse(content);
    }
    catch {
        return null;
    }
    if (json === null || typeof json !== "object")
        return null;
    const repo = json.repository;
    if (typeof repo === "string")
        return normalizeRepoUrl(repo);
    if (repo !== null && typeof repo === "object") {
        const url = repo.url;
        if (typeof url === "string")
            return normalizeRepoUrl(url);
    }
    return null;
}
/** Cargo.toml `[package] repository = "…"`. */
function repoFromCargoToml(content) {
    const m = /^\s*repository\s*=\s*"([^"]+)"/m.exec(content);
    return m ? normalizeRepoUrl(m[1]) : null;
}
/**
 * pyproject.toml — `[project.urls]` `Repository`/`Source`/`Homepage`, or the
 * legacy `[tool.poetry]` `repository = "…"`. Generous line scan (any of those
 * keys → url), which is enough to know a repository was declared.
 */
function repoFromPyproject(content) {
    const m = /^\s*(?:repository|source|homepage)\s*=\s*"([^"]+)"/im.exec(content);
    return m ? normalizeRepoUrl(m[1]) : null;
}
const PARSERS = {
    "package.json": repoFromPackageJson,
    "Cargo.toml": repoFromCargoToml,
    "pyproject.toml": repoFromPyproject,
};
/**
 * Read the first present root manifest and extract its declared repository URL.
 * Returns null when NO root manifest exists (there is no package to assess).
 */
async function readManifestRepo(root, read) {
    for (const file of MANIFESTS) {
        let content;
        try {
            content = await read(path.join(root, file));
        }
        catch {
            continue; // manifest absent / unreadable — try the next.
        }
        return { file, url: PARSERS[file](content) };
    }
    return null;
}
/**
 * Check a project's declared-source-repository provenance.
 *
 * Static (always): a present root manifest that declares NO repository yields a
 * `provenance-repo-missing` info finding. Network (`network: true` + a `head`
 * requester): a declared repository that 404s or does not resolve yields a
 * `provenance-repo-unresolved` (medium) finding; transient network errors are
 * skipped silently (recorded as a diagnostic). Never throws.
 */
export async function checkProvenance(root, opts = {}) {
    const read = opts.readManifest ?? ((file) => readFile(file, "utf8"));
    const findings = [];
    const diagnostics = [];
    const manifest = await readManifestRepo(root, read);
    if (manifest === null)
        return { findings, diagnostics }; // no manifest → nothing to assess.
    if (manifest.url === null) {
        findings.push({
            ruleId: "provenance-repo-missing",
            title: "Package declares no source repository",
            category: "dependency",
            severity: "info",
            confidence: "medium",
            hndl: false,
            message: "Package declares no source repository; builds cannot be verified against source.",
            remediation: "Declare a source repository in the manifest (package.json `repository`, Cargo.toml `repository`, or pyproject.toml `[project.urls]`).",
            location: { file: path.posix.basename(manifest.file), line: 1 },
        });
        return { findings, diagnostics };
    }
    // Network verification is opt-in and needs an injected requester.
    if (!opts.network || !opts.head)
        return { findings, diagnostics };
    const timeout = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    let outcome;
    try {
        outcome = await opts.head(manifest.url, timeout);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        diagnostics.push(`provenance: could not verify ${manifest.url} (${message}), skipped`);
        return { findings, diagnostics };
    }
    const unresolved = outcome.kind === "unresolved" ||
        (outcome.kind === "status" && (outcome.status === 404 || outcome.status === 410));
    if (unresolved) {
        findings.push({
            ruleId: "provenance-repo-unresolved",
            title: "Declared source repository does not resolve",
            category: "dependency",
            severity: "medium",
            confidence: "medium",
            hndl: false,
            message: `Declared source repository ${manifest.url} does not resolve.`,
            remediation: "Fix the manifest's repository URL to point at the real, reachable source repository.",
            location: { file: path.posix.basename(manifest.file), line: 1 },
        });
    }
    else if (outcome.kind === "error") {
        diagnostics.push(`provenance: could not verify ${manifest.url} (${outcome.message}), skipped`);
    }
    return { findings, diagnostics };
}
/** The two rule ids this module can emit, for SARIF catalog registration. */
export const PROVENANCE_RULES = [
    {
        id: "provenance-repo-missing",
        title: "Package declares no source repository",
        category: "dependency",
        severity: "info",
        confidence: "medium",
        hndl: false,
        message: "Package declares no source repository; builds cannot be verified against source.",
        description: "The root manifest declares no source repository (opt-in with `qscan --audit`).",
    },
    {
        id: "provenance-repo-unresolved",
        title: "Declared source repository does not resolve",
        category: "dependency",
        severity: "medium",
        confidence: "medium",
        hndl: false,
        message: "The declared source repository does not resolve (404 / DNS failure).",
        description: "The manifest's declared source repository 404s or does not resolve (opt-in with `qscan --audit`).",
    },
];
//# sourceMappingURL=provenance.js.map