/**
 * Single source of truth for the post-quantum standards this tool depends on.
 *
 * The scanner's credibility rests on its recommendations tracking the current
 * NIST / CNSA / IETF state. That tracking used to be ad-hoc — facts were spread
 * across `remediation.ts` with no dates, no citations, and nothing to catch code
 * drifting from the published standards. This module makes the standards facts
 * explicit, dated, and cited, and the companion drift test
 * (`test/standards.test.ts`) fails the build if the runtime constants
 * (`TIER_PARAMS`, `PQC_TRANSITION_NOTE`, `STATEFUL_HBS_NOTE`) fall out of sync
 * with what is recorded here.
 *
 * ## Cadence
 *
 * Re-verify every quarter (see `docs/standards/pqc-standards.md` for the runbook).
 * On each review: check the sources below for changes, update the facts + their
 * `asOf`, and roll `lastReviewed` / `nextReview` forward. `scripts/standards-check.mjs`
 * (advisory, runs in CI) flags when `nextReview` has passed so a review can't be
 * silently skipped. `standardsReviewStatus(now)` is the pure predicate behind it.
 */
/** A single standards fact with its citation and when it was last verified. */
export interface StandardsCitation {
    /** One-line statement of the fact. */
    readonly summary: string;
    /** Spec identifier / publication (and URL where stable). */
    readonly source: string;
    /** `YYYY-MM` — when this fact was last verified against its source. */
    readonly asOf: string;
}
/** The full post-quantum standards snapshot the tool tracks. */
export interface PqcStandards {
    /** `YYYY-MM-DD` — when the whole snapshot was last reviewed. */
    readonly lastReviewed: string;
    /** `YYYY-MM-DD` — when the next review is due. */
    readonly nextReview: string;
    /** Cadence, in months, between reviews. */
    readonly reviewIntervalMonths: number;
    /** NIST's finalized PQC FIPS (the recommendation targets). */
    readonly fips: {
        readonly mlKem: StandardsCitation;
        readonly mlDsa: StandardsCitation;
        readonly slhDsa: StandardsCitation;
    };
    /**
     * CNSA 2.0 security tiers → the KEM / signature parameter sets. These MUST
     * mirror `remediation.TIER_PARAMS`; the drift test asserts they stay identical.
     */
    readonly cnsa: {
        readonly category3: {
            readonly kem: string;
            readonly signature: string;
        };
        readonly category5: {
            readonly kem: string;
            readonly signature: string;
        };
        readonly source: string;
        readonly asOf: string;
    };
    /** Stateful hash-based signatures (firmware / boot signing). */
    readonly statefulHbs: StandardsCitation;
    /** The NIST IR 8547 migration deadline the transition note surfaces. */
    readonly transitionTimeline: {
        /** Year after which classical public-key crypto is deprecated. */
        readonly deprecateAfter: number;
        /** Year after which it is disallowed. */
        readonly disallowAfter: number;
        readonly source: string;
        readonly asOf: string;
    };
    /**
     * CNSA 2.0's OWN migration milestones — distinct from the IR 8547 timeline
     * above. CNSA 2.0 sets exclusive-use dates per system class; the `cnsa-2.0`
     * mandate encodes the earliest hard milestone as `deprecate` and the general
     * exclusive-use milestone as `disallow`. Kept separate so the two mandates
     * ({@link MANDATES}) each derive from their own dated source.
     */
    readonly cnsaTimeline: {
        /** Year after which classical PKC is deprecated (2030: software/firmware signing exclusive). */
        readonly deprecateAfter: number;
        /** Year after which it is disallowed (2033: general NSS exclusive use). */
        readonly disallowAfter: number;
        readonly source: string;
        readonly asOf: string;
    };
    /** Emerging / backup standards worth tracking beyond the current FIPS. */
    readonly emerging: readonly StandardsCitation[];
    /** Recommended hybrid key-exchange groups. */
    readonly hybrids: readonly StandardsCitation[];
}
/**
 * The current snapshot. Update on each quarterly review; the drift test keeps the
 * runtime remediation constants aligned with it.
 */
export declare const PQC_STANDARDS: PqcStandards;
/** Result of {@link standardsReviewStatus}. */
export interface StandardsReviewStatus {
    /** True when `now` is on or after `nextReview` — a review is due. */
    readonly due: boolean;
    /** The `nextReview` date being compared against (`YYYY-MM-DD`). */
    readonly nextReview: string;
    /** Whole days from `now` until `nextReview` (negative when overdue). */
    readonly daysUntil: number;
}
/**
 * Whether a standards review is due as of `now`. Pure (takes `now` explicitly) so
 * it is deterministic in tests; the CI script passes the real clock. Compares on
 * whole UTC days so a same-day run is not spuriously "overdue".
 */
export declare function standardsReviewStatus(now: Date, standards?: PqcStandards): StandardsReviewStatus;
//# sourceMappingURL=standards.d.ts.map