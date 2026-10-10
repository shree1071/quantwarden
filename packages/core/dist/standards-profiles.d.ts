/**
 * Selectable STANDARDS PROFILES — the regime a scan's remediation, deadlines, and
 * hybrid guidance are tailored to. Different national/regional authorities agree on
 * the PQC primitives (ML-KEM / ML-DSA) but diverge on two things this tool must not
 * hardcode: (a) the required PARAMETER SETS (a commercial ML-KEM-768 vs a
 * national-security ML-KEM-1024), and (b) the HYBRID STANCE — whether classical+PQC
 * hybridization is required, recommended, or optional during the transition. Baking
 * in NIST/CNSA's "hybrids optional" is wrong for an ANSSI or BSI audience, where
 * hybrid is required. `--profile <id>` selects the regime; `--policy` composes an
 * org's own exceptions on top.
 *
 * Like {@link PqcStandards}, every profile carries a citation + `asOf` date and is
 * re-verified on the quarterly standards cadence. These are guidance summaries, not
 * legal advice — consult the cited source of record.
 */
/** Whether classical+PQC hybridization is required during the transition, per regime. */
export type HybridStance = "required" | "recommended" | "optional";
/** A regime's PQC guidance profile. */
export interface StandardsProfile {
    /** Stable id used by `--profile` (kebab-case). */
    readonly id: string;
    /** Human-readable name. */
    readonly name: string;
    /** The authority / document of record. */
    readonly authority: string;
    /** The KEM / signature parameter sets this regime calls for. */
    readonly paramSets: {
        readonly kem: string;
        readonly signature: string;
    };
    /** Whether hybridization is required / recommended / optional under this regime. */
    readonly hybridStance: HybridStance;
    /** One-line regime-specific hybrid guidance surfaced in remediation. */
    readonly hybridGuidance: string;
    /** Year after which classical public-key crypto is deprecated under this regime. */
    readonly deprecateAfter: number;
    /** Year after which it is disallowed. */
    readonly disallowAfter: number;
    /** Spec identifier / publication of record. */
    readonly citation: string;
    /** `YYYY-MM` — when this profile was last verified against its source. */
    readonly asOf: string;
}
/** The default profile id when `--profile` is not given. */
export declare const DEFAULT_PROFILE_ID = "nist";
/**
 * Built-in regime profiles. Facts reflect each authority's published PQC-transition
 * position as of the `asOf` date; verify against the cited source before relying on a
 * deadline or a hybrid mandate for a compliance decision.
 */
export declare const STANDARDS_PROFILES: Readonly<Record<string, StandardsProfile>>;
/** All built-in profile ids, in a stable order (default first). */
export declare function standardsProfileIds(): string[];
/** Look up a built-in profile by id, or `undefined` when unknown. */
export declare function getStandardsProfile(id: string): StandardsProfile | undefined;
/** The default profile (NIST). Always defined. */
export declare function defaultStandardsProfile(): StandardsProfile;
//# sourceMappingURL=standards-profiles.d.ts.map