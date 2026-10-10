/**
 * HNDL ("harvest now, decrypt later") data-risk quantifier - roadmap initiative 2.
 *
 * A crypto finding on its own answers "what is broken"; it does not answer "how
 * much does it matter". This module joins the crypto finding to the DATA it
 * protects and makes Mosca's inequality concrete, so a migration backlog can be
 * ranked by real exposure instead of by finding counts.
 *
 * Exposure per finding = crypto-vulnerability (V) x data-sensitivity (S) x
 * Mosca-factor (M), each normalised to 0..1, reported as an integer 0..100:
 *
 *   - V: how breakable + how confidently detected the crypto is, discounted hard
 *        when the finding is not HNDL-exposed (a signature cannot be broken
 *        retroactively to reveal harvested ciphertext).
 *   - S: the declared sensitivity class of the data the finding sits next to.
 *   - M: the fraction of the data's protection horizon (retention / secrecy
 *        lifetime + migration time) that extends BEYOND the quantum-threat
 *        horizon. Mosca: concern exists when X + Y > Z.
 *
 * The data map is a declared `hndl.yml` (assets, classification, retention +
 * secrecy lifetime, path/scope bindings). Parsing is hand-rolled and
 * zero-dependency, consistent with the rest of core (ADR-0001): no YAML library
 * is pulled in. The full model is documented in docs/HNDL.md so the score is
 * contestable rather than magic.
 */
import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { fingerprintFinding } from "./baseline.js";
import { defaultRegistry, detectorScope } from "./registry.js";
/* -------------------------------------------------------------------------- */
/* Model constants (exported so the score is contestable, not magic)          */
/* -------------------------------------------------------------------------- */
/** Version of the exposure model. Bump on any weight / formula change. */
export const HNDL_MODEL_VERSION = "1";
/** Canonical `hndl.yml` file name discovered at a scan root. */
export const HNDL_FILENAME = "hndl.yml";
const CLASSIFICATIONS = [
    "public",
    "internal",
    "confidential",
    "regulated",
];
const HNDL_SCOPES = ["source", "config", "dependency"];
/** Crypto-vulnerability weight (V) contributed by a finding's severity. */
export const SEVERITY_VULNERABILITY = {
    critical: 1.0,
    high: 0.8,
    medium: 0.5,
    low: 0.25,
    info: 0.1,
};
/** Crypto-vulnerability weight (V) scaled by detector confidence. */
export const CONFIDENCE_WEIGHT = {
    high: 1.0,
    medium: 0.85,
    low: 0.6,
};
/** Data-sensitivity weight (S) per classification. */
export const CLASSIFICATION_SENSITIVITY = {
    public: 0.1,
    internal: 0.4,
    confidential: 0.7,
    regulated: 1.0,
};
/**
 * Discount applied to V when a finding is NOT harvest-now-decrypt-later exposed
 * (e.g. a pure signature). A forged signature is a future-integrity problem, not
 * a retroactive-confidentiality one, so it barely moves the HNDL needle.
 */
export const NON_HNDL_DISCOUNT = 0.15;
/**
 * Default years until a cryptographically-relevant quantum computer is assumed
 * to exist (Z in Mosca's inequality). 15 years is a defensible mid-point of the
 * commonly-cited Mosca / NIST window; override per-org in `hndl.yml`.
 */
export const DEFAULT_QUANTUM_THREAT_YEARS = 15;
/**
 * Default years to complete the org's PQC migration (Y in Mosca's inequality).
 * Override per-org in `hndl.yml`.
 */
export const DEFAULT_MIGRATION_HORIZON_YEARS = 5;
/** Classification assumed for findings that bind to no declared asset. */
export const DEFAULT_UNBOUND_CLASSIFICATION = "internal";
/** Thrown when `hndl.yml` is malformed (structure or a bad known value). */
export class HndlError extends Error {
    name = "HndlError";
    /** The `hndl.yml` path the error relates to, when known. */
    path;
    constructor(message, hndlPath) {
        super(message);
        this.path = hndlPath;
    }
}
/** How many findings the summary's `topExposures` lists. */
const TOP_EXPOSURES = 5;
/* -------------------------------------------------------------------------- */
/* Fingerprint + scope resolution                                             */
/* -------------------------------------------------------------------------- */
/**
 * Identity key for a finding's exposure. Prefers a `finding.fingerprint` field
 * when a build supplies one (another workstream is adding it to core's Finding
 * type + reporters); falls back to the canonical `fingerprintFinding()` hash
 * (`sha256(ruleId|file|normalizedSnippet)`) otherwise. INTEGRATION POINT: once
 * `Finding.fingerprint` lands, this transparently switches to it - no caller
 * change needed.
 */
export function findingFingerprint(f) {
    const declared = f.fingerprint;
    if (typeof declared === "string" && declared.length > 0)
        return declared;
    return fingerprintFinding(f);
}
/** ruleId → detector scope, built once from the default registry. */
let scopeIndex;
function ruleScopeIndex() {
    if (scopeIndex)
        return scopeIndex;
    const index = new Map();
    for (const det of defaultRegistry.all()) {
        const scope = detectorScope(det);
        for (const rule of det.rules ?? [])
            index.set(rule.id, scope);
    }
    scopeIndex = index;
    return index;
}
/**
 * The scope a finding belongs to. Dependency findings (from the manifest
 * scanner, category "dependency") are "dependency"; everything else is looked up
 * by ruleId in the detector registry, defaulting to "source".
 */
export function findingScope(f) {
    if (f.category === "dependency")
        return "dependency";
    return ruleScopeIndex().get(f.ruleId) ?? "source";
}
/* -------------------------------------------------------------------------- */
/* Glob matching (hand-rolled, zero-dependency)                               */
/* -------------------------------------------------------------------------- */
/**
 * Match a POSIX path against a glob supporting `**` (any path segments incl.
 * `/`), `*` (any run of non-`/` chars), and `?` (a single non-`/` char). A
 * trailing `/**` also matches the directory itself. Everything else is literal.
 */
export function globMatch(glob, filePath) {
    return globToRegExp(glob).test(filePath);
}
const globCache = new Map();
function globToRegExp(glob) {
    const cached = globCache.get(glob);
    if (cached)
        return cached;
    let re = "^";
    for (let i = 0; i < glob.length; i++) {
        const ch = glob[i];
        if (ch === "*") {
            if (glob[i + 1] === "*") {
                // `**` - any number of characters including path separators. Consume a
                // following `/` so `a/**/b` matches `a/b` (zero segments) too.
                i++;
                if (glob[i + 1] === "/")
                    i++;
                re += ".*";
            }
            else {
                re += "[^/]*";
            }
        }
        else if (ch === "?") {
            re += "[^/]";
        }
        else if ("\\^$.|+()[]{}".includes(ch)) {
            re += `\\${ch}`;
        }
        else {
            re += ch;
        }
    }
    re += "$";
    const compiled = new RegExp(re);
    globCache.set(glob, compiled);
    return compiled;
}
/* -------------------------------------------------------------------------- */
/* Exposure math                                                              */
/* -------------------------------------------------------------------------- */
function clamp01(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
}
/** V - crypto-vulnerability factor for a finding (0..1). */
export function vulnerabilityFactor(f) {
    const base = SEVERITY_VULNERABILITY[f.severity] * CONFIDENCE_WEIGHT[f.confidence];
    return clamp01(base * (f.hndl ? 1 : NON_HNDL_DISCOUNT));
}
/**
 * M - the Mosca factor (0..1). `X` is the data's protection horizon
 * (max of retention + secrecy lifetime), `Y` the migration horizon, `Z` the
 * quantum-threat horizon. M is the fraction of `X + Y` that falls after `Z`:
 * 0 when the threat is beyond the whole horizon, 1 when the threat is already
 * here. Mosca's inequality (X + Y > Z) is exactly `M > 0`.
 */
export function moscaFactor(secrecyHorizonYears, horizon) {
    const span = secrecyHorizonYears + horizon.migrationHorizonYears;
    if (span <= 0)
        return 0;
    const margin = span - horizon.quantumThreatYears;
    return clamp01(margin / span);
}
function scoreFinding(f, input, horizon) {
    const sensitivity = CLASSIFICATION_SENSITIVITY[input.classification];
    const secrecyHorizonYears = Math.max(input.retentionYears, input.secrecyLifetimeYears);
    const mosca = moscaFactor(secrecyHorizonYears, horizon);
    const exposureScore = Math.round(100 * clamp01(input.vulnerability * sensitivity * mosca));
    const moscaMarginYears = secrecyHorizonYears + horizon.migrationHorizonYears - horizon.quantumThreatYears;
    const rationale = {
        vulnerability: round3(input.vulnerability),
        sensitivity: round3(sensitivity),
        mosca: round3(mosca),
        classification: input.classification,
        retentionYears: input.retentionYears,
        secrecyLifetimeYears: input.secrecyLifetimeYears,
        secrecyHorizonYears,
        quantumThreatYears: horizon.quantumThreatYears,
        migrationHorizonYears: horizon.migrationHorizonYears,
        moscaMarginYears,
        moscaBreach: moscaMarginYears > 0,
        hndl: f.hndl,
        severity: f.severity,
        confidence: f.confidence,
        scope: findingScope(f),
        bound: input.bound,
    };
    return {
        fingerprint: findingFingerprint(f),
        ruleId: f.ruleId,
        file: f.location.file,
        dataAsset: null,
        exposureScore,
        rationale,
    };
}
function round3(x) {
    return Math.round(x * 1000) / 1000;
}
/* -------------------------------------------------------------------------- */
/* Binding + top-level compute                                                */
/* -------------------------------------------------------------------------- */
/** Assets whose path globs + optional scope filter match a finding. */
function matchingAssets(f, map, scope) {
    const out = [];
    for (const asset of map.assets) {
        if (asset.scopes && !asset.scopes.includes(scope))
            continue;
        if (asset.paths.some((g) => globMatch(g, f.location.file)))
            out.push(asset);
    }
    return out;
}
/**
 * Compute HNDL exposure for a set of findings against a declared data map.
 *
 * A finding binds to every declared asset whose path glob (and optional scope
 * filter) matches its file; when several match, the WORST-CASE (highest)
 * exposure is chosen and its asset recorded, since risk ranking should not be
 * diluted by an incidental low-sensitivity overlap. A finding that binds to no
 * asset is still scored, using the map's `defaults.classification` and the
 * global horizons, and flagged `bound: false` so it is visibly a fallback. Its
 * secrecy lifetime is assumed to be the quantum-threat horizon Z (the
 * minimum-concern horizon; see {@link scoreFinding} call below and docs/HNDL.md
 * §4), so the fallback classification produces a real, rankable exposure rather
 * than a dead 0.
 *
 * Purely additive: it never mutates findings and never affects a scan's exit
 * code.
 */
export function computeHndl(findings, map) {
    const exposures = [];
    const byFingerprint = new Map();
    const assetFindings = new Map();
    const assetMax = new Map();
    for (const f of findings) {
        const vulnerability = vulnerabilityFactor(f);
        const scope = findingScope(f);
        const candidates = matchingAssets(f, map, scope);
        let best;
        if (candidates.length === 0) {
            best = scoreFinding(f, {
                vulnerability,
                classification: map.defaults.classification,
                // Unbound: the data's lifetime is unknown, so we cannot read X off a
                // declared asset. Assuming X = 0 would drive M (hence the score) to a
                // dead 0 for EVERY unbound finding under any sane horizon, making the
                // documented `defaults.classification` fallback unrankable. Instead we
                // assume the MINIMUM-CONCERN horizon: data captured today must stay
                // confidential at least until the quantum threat arrives (X = Z). That
                // yields M = Y / (Y + Z) - a small but non-zero, rankable exposure that
                // never exceeds a declared long-lived asset's and self-adjusts to any
                // per-org horizon override. Retention stays 0 (genuinely unknown); the
                // secrecy lifetime carries the assumption. See docs/HNDL.md §4.
                retentionYears: 0,
                secrecyLifetimeYears: map.horizon.quantumThreatYears,
                bound: false,
            }, map.horizon);
        }
        else {
            let bestAsset;
            best = undefined;
            for (const asset of candidates) {
                const scored = scoreFinding(f, {
                    vulnerability,
                    classification: asset.classification,
                    retentionYears: asset.retentionYears,
                    secrecyLifetimeYears: asset.secrecyLifetimeYears,
                    bound: true,
                }, map.horizon);
                if (!bestAsset || scored.exposureScore > best.exposureScore) {
                    best = scored;
                    bestAsset = asset;
                }
            }
            best.dataAsset = bestAsset.key;
            assetFindings.set(bestAsset.key, (assetFindings.get(bestAsset.key) ?? 0) + 1);
            assetMax.set(bestAsset.key, Math.max(assetMax.get(bestAsset.key) ?? 0, best.exposureScore));
        }
        exposures.push(best);
        byFingerprint.set(best.fingerprint, best);
    }
    const assets = map.assets.map((a) => ({
        key: a.key,
        name: a.name,
        classification: a.classification,
        retentionYears: a.retentionYears,
        secrecyLifetimeYears: a.secrecyLifetimeYears,
        findings: assetFindings.get(a.key) ?? 0,
        maxExposure: assetMax.get(a.key) ?? 0,
        outlivesThreat: Math.max(a.retentionYears, a.secrecyLifetimeYears) > map.horizon.quantumThreatYears,
    }));
    const scores = exposures.map((e) => e.exposureScore);
    const maxExposure = scores.reduce((m, s) => Math.max(m, s), 0);
    const meanExposure = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const topExposures = [...exposures]
        .sort((a, b) => b.exposureScore - a.exposureScore || a.fingerprint.localeCompare(b.fingerprint))
        .slice(0, TOP_EXPOSURES);
    const summary = {
        findingsScored: exposures.length,
        assetsDeclared: map.assets.length,
        assetsWithFindings: assets.filter((a) => a.findings > 0).length,
        assetsOutlivingHorizon: assets.filter((a) => a.outlivesThreat).length,
        moscaBreaches: exposures.filter((e) => e.rationale.moscaBreach).length,
        maxExposure,
        meanExposure,
        topExposures,
    };
    return {
        modelVersion: HNDL_MODEL_VERSION,
        horizon: map.horizon,
        exposures,
        byFingerprint,
        assets,
        summary,
    };
}
/** Strip an inline `# comment` that begins after whitespace, outside quotes. */
function stripInlineComment(text) {
    let quote;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quote) {
            if (ch === quote)
                quote = undefined;
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
        }
        if (ch === "#" && (i === 0 || /\s/.test(text[i - 1]))) {
            return text.slice(0, i);
        }
    }
    return text;
}
/** Tokenise text into non-blank, non-comment lines with their indent depth. */
function tokenizeYaml(text, file) {
    const lines = [];
    const raw = text.split(/\r?\n/);
    for (let i = 0; i < raw.length; i++) {
        const line = raw[i];
        if (line.includes("\t")) {
            throw new HndlError(`tabs are not allowed for indentation (line ${i + 1})`, file);
        }
        const stripped = stripInlineComment(line).replace(/\s+$/, "");
        if (stripped.trim() === "")
            continue;
        const indent = stripped.length - stripped.trimStart().length;
        lines.push({ indent, content: stripped.trimStart(), n: i + 1 });
    }
    return lines;
}
/** True when `content` opens a `key:` mapping entry (colon outside quotes). */
function isKeyLine(content) {
    return /^[A-Za-z0-9_.-]+\s*:(\s|$)/.test(content);
}
function splitKey(content, file, n) {
    const idx = content.indexOf(":");
    if (idx < 0)
        throw new HndlError(`expected "key: value" (line ${n})`, file);
    return { key: content.slice(0, idx).trim(), value: content.slice(idx + 1).trim() };
}
/** Coerce a scalar token: quoted string, boolean, number, or bare string. */
function parseScalar(token) {
    if (token.length >= 2) {
        const q = token[0];
        if ((q === '"' || q === "'") && token[token.length - 1] === q) {
            return token.slice(1, -1);
        }
    }
    if (token === "true")
        return true;
    if (token === "false")
        return false;
    if (/^-?\d+(\.\d+)?$/.test(token))
        return Number(token);
    return token;
}
/**
 * Parse a mapping/sequence VALUE token: either an inline-flow list
 * (`[a, "b", c]`, `[]`) or a plain scalar. Only flat flow lists of scalars are
 * supported - enough for `paths: [...]` / `scopes: [...]` without a full YAML
 * flow grammar.
 */
function parseValueToken(token, file, n) {
    if (token.startsWith("[")) {
        if (!token.endsWith("]")) {
            throw new HndlError(`unterminated inline list (line ${n})`, file);
        }
        return parseFlowList(token.slice(1, -1), file, n);
    }
    return parseScalar(token);
}
/** Split a flow-list body on top-level commas (quote-aware) → scalar elements. */
function parseFlowList(body, file, n) {
    const out = [];
    let cur = "";
    let quote;
    for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        if (quote) {
            cur += ch;
            if (ch === quote)
                quote = undefined;
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            cur += ch;
            continue;
        }
        if (ch === ",") {
            out.push(cur.trim());
            cur = "";
            continue;
        }
        cur += ch;
    }
    if (quote)
        throw new HndlError(`unterminated string in inline list (line ${n})`, file);
    const last = cur.trim();
    // A trailing empty segment only when the list itself is empty (`[]`).
    if (last !== "" || out.length > 0)
        out.push(last);
    return out.filter((t) => t !== "").map((t) => parseScalar(t));
}
/** Recursive-descent parse of the tokenised lines into a generic value. */
function parseYaml(text, file) {
    const lines = tokenizeYaml(text, file);
    if (lines.length === 0)
        return {};
    function parseNode(i, indent) {
        const first = lines[i];
        if (first.content === "-" || first.content.startsWith("- ")) {
            return parseSeq(i, indent);
        }
        return parseMap(i, indent);
    }
    function parseSeq(start, indent) {
        const arr = [];
        let i = start;
        while (i < lines.length &&
            lines[i].indent === indent &&
            (lines[i].content === "-" || lines[i].content.startsWith("- "))) {
            const line = lines[i];
            const rest = line.content === "-" ? "" : line.content.slice(2).trim();
            const itemIndent = indent + 2;
            if (rest === "") {
                if (i + 1 < lines.length && lines[i + 1].indent > indent) {
                    const [val, next] = parseNode(i + 1, lines[i + 1].indent);
                    arr.push(val);
                    i = next;
                }
                else {
                    arr.push(null);
                    i++;
                }
            }
            else if (isKeyLine(rest)) {
                // Map item introduced by the dash: rewrite this line as its first key at
                // the deeper indent, then let parseMap consume it + aligned siblings.
                lines[i] = { indent: itemIndent, content: rest, n: line.n };
                const [val, next] = parseMap(i, itemIndent);
                arr.push(val);
                i = next;
            }
            else {
                arr.push(parseValueToken(rest, file, line.n));
                i++;
            }
        }
        return [arr, i];
    }
    function parseMap(start, indent) {
        const obj = {};
        let i = start;
        while (i < lines.length &&
            lines[i].indent === indent &&
            !lines[i].content.startsWith("- ") &&
            lines[i].content !== "-") {
            const line = lines[i];
            const { key, value } = splitKey(line.content, file, line.n);
            if (value !== "") {
                obj[key] = parseValueToken(value, file, line.n);
                i++;
            }
            else if (i + 1 < lines.length && lines[i + 1].indent > indent) {
                const [val, next] = parseNode(i + 1, lines[i + 1].indent);
                obj[key] = val;
                i = next;
            }
            else {
                obj[key] = null;
                i++;
            }
        }
        return [obj, i];
    }
    const [value] = parseNode(0, lines[0].indent);
    return value;
}
/* -------------------------------------------------------------------------- */
/* hndl.yml validation → HndlMap                                              */
/* -------------------------------------------------------------------------- */
function isObject(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
function asString(v, what, file) {
    if (typeof v !== "string" || v.length === 0) {
        throw new HndlError(`${what} must be a non-empty string`, file);
    }
    return v;
}
function asNonNegNumber(v, what, file) {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
        throw new HndlError(`${what} must be a non-negative number`, file);
    }
    return v;
}
function asClassification(v, what, file) {
    if (typeof v !== "string" || !CLASSIFICATIONS.includes(v)) {
        throw new HndlError(`${what} must be one of: ${CLASSIFICATIONS.join(", ")}`, file);
    }
    return v;
}
function asStringList(v, what, file) {
    if (!Array.isArray(v) || v.some((x) => typeof x !== "string" || x.length === 0)) {
        throw new HndlError(`${what} must be a list of non-empty strings`, file);
    }
    return v;
}
/**
 * Validate a parsed `hndl.yml` object into a typed {@link HndlMap}. Applies
 * defaults for `version`, `horizon`, and `defaults`; requires each asset to have
 * a unique `key`, a `name`, a valid `classification`, non-negative retention +
 * secrecy lifetime, and at least one path glob.
 */
export function parseHndlMap(text, file = HNDL_FILENAME) {
    const root = parseYaml(text, file);
    if (!isObject(root)) {
        throw new HndlError(`hndl.yml must be a mapping at the top level`, file);
    }
    let version = 1;
    if ("version" in root) {
        const v = root["version"];
        if (typeof v !== "number" || !Number.isInteger(v)) {
            throw new HndlError(`"version" must be an integer`, file);
        }
        version = v;
    }
    const horizon = {
        quantumThreatYears: DEFAULT_QUANTUM_THREAT_YEARS,
        migrationHorizonYears: DEFAULT_MIGRATION_HORIZON_YEARS,
    };
    if ("horizon" in root && root["horizon"] !== null) {
        const h = root["horizon"];
        if (!isObject(h))
            throw new HndlError(`"horizon" must be a mapping`, file);
        if ("quantum_threat_years" in h) {
            horizon.quantumThreatYears = asNonNegNumber(h["quantum_threat_years"], `"horizon.quantum_threat_years"`, file);
        }
        if ("migration_horizon_years" in h) {
            horizon.migrationHorizonYears = asNonNegNumber(h["migration_horizon_years"], `"horizon.migration_horizon_years"`, file);
        }
    }
    const defaults = { classification: DEFAULT_UNBOUND_CLASSIFICATION };
    if ("defaults" in root && root["defaults"] !== null) {
        const d = root["defaults"];
        if (!isObject(d))
            throw new HndlError(`"defaults" must be a mapping`, file);
        if ("classification" in d) {
            defaults.classification = asClassification(d["classification"], `"defaults.classification"`, file);
        }
    }
    const rawAssets = "assets" in root ? root["assets"] : [];
    if (!Array.isArray(rawAssets)) {
        throw new HndlError(`"assets" must be a list`, file);
    }
    const assets = [];
    const seenKeys = new Set();
    for (let idx = 0; idx < rawAssets.length; idx++) {
        const a = rawAssets[idx];
        if (!isObject(a))
            throw new HndlError(`assets[${idx}] must be a mapping`, file);
        const key = asString(a["key"], `assets[${idx}].key`, file);
        if (seenKeys.has(key))
            throw new HndlError(`duplicate asset key "${key}"`, file);
        seenKeys.add(key);
        const asset = {
            key,
            name: asString(a["name"], `assets[${idx}].name`, file),
            classification: asClassification(a["classification"], `assets[${idx}].classification`, file),
            retentionYears: asNonNegNumber(a["retention_years"], `assets[${idx}].retention_years`, file),
            secrecyLifetimeYears: asNonNegNumber(a["secrecy_lifetime_years"], `assets[${idx}].secrecy_lifetime_years`, file),
            paths: asStringList(a["paths"], `assets[${idx}].paths`, file),
        };
        if (asset.paths.length === 0) {
            throw new HndlError(`assets[${idx}].paths must list at least one glob`, file);
        }
        if ("scopes" in a && a["scopes"] !== null) {
            const scopes = asStringList(a["scopes"], `assets[${idx}].scopes`, file);
            for (const s of scopes) {
                if (!HNDL_SCOPES.includes(s)) {
                    throw new HndlError(`assets[${idx}].scopes: "${s}" must be one of: ${HNDL_SCOPES.join(", ")}`, file);
                }
            }
            asset.scopes = scopes;
        }
        assets.push(asset);
    }
    return { version, horizon, defaults, assets };
}
/**
 * Load and validate the `hndl.yml` for a scan. By default reads
 * `<root>/hndl.yml`; pass an explicit `*.yml` path to read a named file. A
 * missing file is always an error here (the caller opted into `--hndl`).
 *
 * @throws {HndlError} On a missing file, unreadable file, or malformed content.
 */
export async function loadHndlMap(root) {
    const base = path.basename(root);
    const file = base === HNDL_FILENAME || base.endsWith(".yml") || base.endsWith(".yaml")
        ? path.resolve(root)
        : path.resolve(root, HNDL_FILENAME);
    let text;
    try {
        text = await readFile(file, "utf8");
    }
    catch {
        throw new HndlError(`hndl.yml not found: ${file} (run "qscan hndl init" to scaffold one)`, file);
    }
    return { map: parseHndlMap(text, file), path: file };
}
/* -------------------------------------------------------------------------- */
/* hndl.yml scaffolding (`qscan hndl init`)                                   */
/* -------------------------------------------------------------------------- */
/** First path segment of a POSIX file path, or "." for a root-level file. */
function topDir(file) {
    const slash = file.indexOf("/");
    return slash < 0 ? "." : file.slice(0, slash);
}
/** A URL/key-safe slug for a directory name. */
function slugify(dir) {
    const slug = dir
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug.length > 0 ? slug : "root";
}
/**
 * Scaffold an `hndl.yml` document seeded from a scan's findings. Config-scope,
 * HNDL-exposed findings are the crypto-to-data join points (KMS, secrets-at-rest,
 * database TDE, brokers, JOSE/JWE), so each directory that contains one becomes a
 * proposed asset stub the user fills in. The returned string is valid `hndl.yml`
 * (it round-trips through {@link parseHndlMap}); the classification / retention /
 * secrecy values are conservative placeholders the user is expected to correct.
 */
export function scaffoldHndlYaml(findings) {
    // Group data-adjacent findings by their top-level directory.
    const byDir = new Map();
    for (const f of findings) {
        if (findingScope(f) !== "config" || !f.hndl)
            continue;
        const dir = topDir(f.location.file);
        let rules = byDir.get(dir);
        if (!rules) {
            rules = new Set();
            byDir.set(dir, rules);
        }
        rules.add(f.ruleId);
    }
    const lines = [
        "# hndl.yml - HNDL (harvest-now-decrypt-later) data map for this repo.",
        "#",
        "# qScan joins each crypto finding to the data it protects and scores exposure as",
        "#   crypto-vulnerability x data-sensitivity x Mosca-factor (retention + secrecy",
        "#   lifetime vs the quantum-threat horizon). See docs/HNDL.md for the model.",
        "#",
        "# Fill in the assets below: correct the classification, the retention_years and",
        "# secrecy_lifetime_years, and the path globs. Delete stubs that do not apply.",
        "version: 1",
        "",
        "horizon:",
        `  quantum_threat_years: ${DEFAULT_QUANTUM_THREAT_YEARS}   # Z: years until a CRQC is assumed`,
        `  migration_horizon_years: ${DEFAULT_MIGRATION_HORIZON_YEARS}    # Y: years to finish your PQC migration`,
        "",
        "defaults:",
        `  classification: ${DEFAULT_UNBOUND_CLASSIFICATION}   # applied to findings that match no asset below`,
        "",
        "assets:",
    ];
    if (byDir.size === 0) {
        lines.push("  # No data-adjacent (config-scope, HNDL) findings were detected to seed from.", "  # Declare your data assets manually, for example:", "  - key: customer-pii", "    name: Customer PII", "    classification: regulated", "    retention_years: 7", "    secrecy_lifetime_years: 25", "    paths:", '      - "src/**"');
    }
    else {
        const dirs = [...byDir.keys()].sort();
        for (const dir of dirs) {
            const rules = [...byDir.get(dir)].sort();
            const glob = dir === "." ? "*" : `${dir}/**`;
            lines.push(`  # detected data-adjacent crypto here: ${rules.join(", ")}`, `  - key: ${slugify(dir)}`, `    name: ${dir === "." ? "Repository root" : dir}`, "    classification: confidential   # TODO: public | internal | confidential | regulated", "    retention_years: 7             # TODO: how long the data is kept", "    secrecy_lifetime_years: 10     # TODO: how long it must stay confidential", "    paths:", `      - "${glob}"`);
        }
    }
    return `${lines.join("\n")}\n`;
}
//# sourceMappingURL=hndl.js.map