import type { Confidence, Finding, Severity } from "./types.js";
/** Version of the exposure model. Bump on any weight / formula change. */
export declare const HNDL_MODEL_VERSION: "1";
/** Canonical `hndl.yml` file name discovered at a scan root. */
export declare const HNDL_FILENAME = "hndl.yml";
/** Data sensitivity classes, least → most sensitive. Vocabulary aligned with the
 * readiness DPE (data-protection) practice. */
export type DataClassification = "public" | "internal" | "confidential" | "regulated";
/**
 * Logical scope a finding belongs to, used for optional scope-bound assets. The
 * two detector scopes ("source" / "config") plus "dependency" (manifest
 * findings, which are not produced by a Detector).
 */
export type HndlScope = "source" | "config" | "dependency";
/** Crypto-vulnerability weight (V) contributed by a finding's severity. */
export declare const SEVERITY_VULNERABILITY: Record<Severity, number>;
/** Crypto-vulnerability weight (V) scaled by detector confidence. */
export declare const CONFIDENCE_WEIGHT: Record<Confidence, number>;
/** Data-sensitivity weight (S) per classification. */
export declare const CLASSIFICATION_SENSITIVITY: Record<DataClassification, number>;
/**
 * Discount applied to V when a finding is NOT harvest-now-decrypt-later exposed
 * (e.g. a pure signature). A forged signature is a future-integrity problem, not
 * a retroactive-confidentiality one, so it barely moves the HNDL needle.
 */
export declare const NON_HNDL_DISCOUNT = 0.15;
/**
 * Default years until a cryptographically-relevant quantum computer is assumed
 * to exist (Z in Mosca's inequality). 15 years is a defensible mid-point of the
 * commonly-cited Mosca / NIST window; override per-org in `hndl.yml`.
 */
export declare const DEFAULT_QUANTUM_THREAT_YEARS = 15;
/**
 * Default years to complete the org's PQC migration (Y in Mosca's inequality).
 * Override per-org in `hndl.yml`.
 */
export declare const DEFAULT_MIGRATION_HORIZON_YEARS = 5;
/** Classification assumed for findings that bind to no declared asset. */
export declare const DEFAULT_UNBOUND_CLASSIFICATION: DataClassification;
/** A single declared data asset from `hndl.yml`. */
export interface HndlDataAsset {
    /** Stable id (referenced by finding exposures + the website's `data_asset.key`). */
    key: string;
    /** Human name. */
    name: string;
    classification: DataClassification;
    /** How long the data is retained, in years. */
    retentionYears: number;
    /** How long the data must remain confidential once captured, in years. */
    secrecyLifetimeYears: number;
    /** Path globs (POSIX, relative to scan root) whose findings bind to this asset. */
    paths: string[];
    /** Optional detector-scope filter: only findings of these scopes bind here. */
    scopes?: HndlScope[];
}
/** The Mosca horizons that gate the exposure model. */
export interface HndlHorizon {
    /** Z: years until a cryptographically-relevant quantum computer is assumed. */
    quantumThreatYears: number;
    /** Y: years to complete the org's PQC migration. */
    migrationHorizonYears: number;
}
/** Defaults applied to findings that bind to no declared asset. */
export interface HndlDefaults {
    classification: DataClassification;
}
/** A fully-parsed, validated `hndl.yml`. */
export interface HndlMap {
    version: number;
    horizon: HndlHorizon;
    defaults: HndlDefaults;
    assets: HndlDataAsset[];
}
/** Thrown when `hndl.yml` is malformed (structure or a bad known value). */
export declare class HndlError extends Error {
    readonly name = "HndlError";
    /** The `hndl.yml` path the error relates to, when known. */
    readonly path: string | undefined;
    constructor(message: string, hndlPath?: string);
}
/** Full, auditable breakdown of one finding's exposure score. */
export interface ExposureRationale {
    /** V - crypto-vulnerability factor (0..1). */
    vulnerability: number;
    /** S - data-sensitivity factor (0..1). */
    sensitivity: number;
    /** M - Mosca factor (0..1): fraction of the protection horizon past the threat. */
    mosca: number;
    classification: DataClassification;
    retentionYears: number;
    secrecyLifetimeYears: number;
    /** X = max(retention, secrecy lifetime): the data's protection requirement. */
    secrecyHorizonYears: number;
    /** Z - quantum-threat horizon (years). */
    quantumThreatYears: number;
    /** Y - migration horizon (years). */
    migrationHorizonYears: number;
    /** (X + Y) - Z; positive means Mosca's inequality is breached. */
    moscaMarginYears: number;
    /** True when (X + Y) > Z (data captured today is exposed while still secret). */
    moscaBreach: boolean;
    /** Whether the finding is HNDL-exposed (drives {@link NON_HNDL_DISCOUNT}). */
    hndl: boolean;
    severity: Severity;
    confidence: Confidence;
    scope: HndlScope;
    /** True when the finding matched a declared asset (false = defaults applied). */
    bound: boolean;
}
/** A finding's computed exposure, keyed by fingerprint for website ingest. */
export interface FindingExposure {
    /** Finding identity: `finding.fingerprint` when present, else the canonical
     * `fingerprintFinding()` hash. This is the join key the website stores. */
    fingerprint: string;
    ruleId: string;
    file: string;
    /** The bound data asset's stable key, or null when unbound. */
    dataAsset: string | null;
    /** 0..100 exposure score. */
    exposureScore: number;
    rationale: ExposureRationale;
}
/** Per-asset rollup for the repo summary. */
export interface AssetExposure {
    key: string;
    name: string;
    classification: DataClassification;
    retentionYears: number;
    secrecyLifetimeYears: number;
    /** Number of findings bound to this asset. */
    findings: number;
    /** Highest exposure among this asset's findings. */
    maxExposure: number;
    /** True when the data's secrecy horizon outlives the quantum threat (X > Z). */
    outlivesThreat: boolean;
}
/** Repo-level HNDL summary. */
export interface HndlSummary {
    findingsScored: number;
    assetsDeclared: number;
    /** Declared assets that bound at least one finding. */
    assetsWithFindings: number;
    /** Declared assets whose secrecy horizon outlives the quantum threat (X > Z). */
    assetsOutlivingHorizon: number;
    /** Findings whose Mosca inequality is breached ((X + Y) > Z). */
    moscaBreaches: number;
    maxExposure: number;
    /** Rounded mean exposure across scored findings. */
    meanExposure: number;
    /** The worst findings, most-exposed first (capped). */
    topExposures: FindingExposure[];
}
/** The complete HNDL analysis of a scan. */
export interface HndlReport {
    modelVersion: string;
    horizon: HndlHorizon;
    /** Per-finding exposures, in input order. */
    exposures: FindingExposure[];
    /** Fingerprint → exposure, for reporters to annotate each finding. */
    byFingerprint: Map<string, FindingExposure>;
    /** Per-asset rollups. */
    assets: AssetExposure[];
    summary: HndlSummary;
}
/**
 * Identity key for a finding's exposure. Prefers a `finding.fingerprint` field
 * when a build supplies one (another workstream is adding it to core's Finding
 * type + reporters); falls back to the canonical `fingerprintFinding()` hash
 * (`sha256(ruleId|file|normalizedSnippet)`) otherwise. INTEGRATION POINT: once
 * `Finding.fingerprint` lands, this transparently switches to it - no caller
 * change needed.
 */
export declare function findingFingerprint(f: Finding): string;
/**
 * The scope a finding belongs to. Dependency findings (from the manifest
 * scanner, category "dependency") are "dependency"; everything else is looked up
 * by ruleId in the detector registry, defaulting to "source".
 */
export declare function findingScope(f: Finding): HndlScope;
/**
 * Match a POSIX path against a glob supporting `**` (any path segments incl.
 * `/`), `*` (any run of non-`/` chars), and `?` (a single non-`/` char). A
 * trailing `/**` also matches the directory itself. Everything else is literal.
 */
export declare function globMatch(glob: string, filePath: string): boolean;
/** V - crypto-vulnerability factor for a finding (0..1). */
export declare function vulnerabilityFactor(f: Finding): number;
/**
 * M - the Mosca factor (0..1). `X` is the data's protection horizon
 * (max of retention + secrecy lifetime), `Y` the migration horizon, `Z` the
 * quantum-threat horizon. M is the fraction of `X + Y` that falls after `Z`:
 * 0 when the threat is beyond the whole horizon, 1 when the threat is already
 * here. Mosca's inequality (X + Y > Z) is exactly `M > 0`.
 */
export declare function moscaFactor(secrecyHorizonYears: number, horizon: HndlHorizon): number;
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
export declare function computeHndl(findings: readonly Finding[], map: HndlMap): HndlReport;
/**
 * Validate a parsed `hndl.yml` object into a typed {@link HndlMap}. Applies
 * defaults for `version`, `horizon`, and `defaults`; requires each asset to have
 * a unique `key`, a `name`, a valid `classification`, non-negative retention +
 * secrecy lifetime, and at least one path glob.
 */
export declare function parseHndlMap(text: string, file?: string): HndlMap;
/**
 * Load and validate the `hndl.yml` for a scan. By default reads
 * `<root>/hndl.yml`; pass an explicit `*.yml` path to read a named file. A
 * missing file is always an error here (the caller opted into `--hndl`).
 *
 * @throws {HndlError} On a missing file, unreadable file, or malformed content.
 */
export declare function loadHndlMap(root: string): Promise<{
    map: HndlMap;
    path: string;
}>;
/**
 * Scaffold an `hndl.yml` document seeded from a scan's findings. Config-scope,
 * HNDL-exposed findings are the crypto-to-data join points (KMS, secrets-at-rest,
 * database TDE, brokers, JOSE/JWE), so each directory that contains one becomes a
 * proposed asset stub the user fills in. The returned string is valid `hndl.yml`
 * (it round-trips through {@link parseHndlMap}); the classification / retention /
 * secrecy values are conservative placeholders the user is expected to correct.
 */
export declare function scaffoldHndlYaml(findings: readonly Finding[]): string;
//# sourceMappingURL=hndl.d.ts.map