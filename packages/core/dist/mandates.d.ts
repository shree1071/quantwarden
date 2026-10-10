/**
 * Policy-as-code compliance mandates → dated, clause-named verdicts for findings.
 *
 * `CryptoPolicy` (policy.ts) classifies findings by algorithm family but is
 * date-blind. A mandate adds the missing dimension: named clauses with an effective
 * DATE ("CNSA 2.0 disallows classical public-key crypto after 2033"). The evaluator
 * compares each finding's algorithm against the selected mandates and today's date,
 * so a finding on a prohibited family reads as `due` (every deadline still ahead),
 * `deprecated` (the DEPRECATE deadline has passed — a warning), or `violation` (the
 * DISALLOW deadline has passed — a failure), always naming the governing clause,
 * deadline, and citation. This is what turns the inventory into an enforceable,
 * mandate-mapped gate rather than a neutral list.
 *
 * Pure and deterministic (the caller supplies `now`), so it is trivially testable.
 * qScan consumes it today for the `--mandate` gate; because it operates on the
 * shared `Finding[]`, qProbe or the GitHub Action can reuse it unchanged.
 *
 * Catalog scope: the two regimes that carry hard algorithm deadlines — CNSA 2.0 and
 * NIST IR 8547. DORA / NIS2 / PCI DSS require approved cryptography but set no
 * independent algorithm date; they inherit these timelines and are cited in docs.
 */
import type { AlgorithmFamily, Finding } from "./types.js";
import type { CryptoPolicy, PolicyVerdict } from "./policy.js";
/** Which enforcement tier a clause encodes: warn (`deprecate`) or fail (`disallow`). */
export type MandateRuleTier = "deprecate" | "disallow";
export interface MandateRule {
    /** The named clause this rule encodes (verbatim in the gate's failure message). */
    clause: string;
    /** Enforcement tier: a passed `deprecate` date warns; a passed `disallow` date fails. */
    tier: MandateRuleTier;
    /** Algorithm families prohibited from the effective date onward. */
    prohibits: AlgorithmFamily[];
    /** ISO date (YYYY-MM-DD) the prohibition takes effect. */
    effective: string;
    /** One-line human description of the clause. */
    note: string;
}
export interface Mandate {
    id: string;
    name: string;
    authority: string;
    citation: string;
    /** When this catalog entry was last reviewed against the source. */
    asOf: string;
    rules: MandateRule[];
}
/** The bundled mandate catalog. Keyed by `--mandate <id>`. */
export declare const MANDATES: Record<string, Mandate>;
export declare const mandateIds: () => string[];
export declare const getMandate: (id: string) => Mandate | undefined;
/**
 * Validate mandate ids loudly, matching `parseCryptoPolicy`'s fail-loud
 * convention: a mistyped id must never silently evaluate to an empty gate.
 * Throws an `Error` naming every unknown id and the known catalog.
 * `evaluateMandates` itself stays lenient (unknown ids are skipped) so callers
 * decide where to fail.
 */
export declare function assertKnownMandates(ids: readonly string[]): void;
/**
 * A finding's status against a mandate, worst last:
 * - `conformant` — in scope (classical asymmetric) but prohibited by no selected
 *   clause (e.g. X25519 as the presumed hybrid leg).
 * - `due` — prohibited, with every deadline still ahead.
 * - `deprecated` — the DEPRECATE deadline has passed; a warning, not a failure.
 * - `violation` — the DISALLOW deadline has passed; fails the default gate.
 */
export type MandateStatus = "conformant" | "due" | "deprecated" | "violation";
export interface MandateFindingVerdict {
    ruleId: string;
    algorithm: AlgorithmFamily | "unknown";
    file: string;
    line: number;
    /** Mandate id (e.g. "cnsa-2.0"). */
    mandate: string;
    /**
     * The governing clause: the next upcoming clause when `due`, the passed
     * DEPRECATE clause when `deprecated`, the passed DISALLOW clause on `violation`.
     */
    clause: string;
    /** ISO effective date of the governing clause. */
    effective: string;
    status: MandateStatus;
    /** Whole months from `now` to the governing deadline; negative once it has passed. */
    monthsUntil: number;
    /**
     * ISO effective date of this mandate's DISALLOW clause for the family, or null
     * when the mandate carries none. The gate's `leadMonths` measures against this.
     */
    disallowEffective: string | null;
    /** Whole months from `now` to `disallowEffective`; null when there is none. */
    monthsUntilDisallow: number | null;
    citation: string;
    /**
     * The org cryptography policy's verdict on this algorithm family when a policy
     * was composed in via {@link evaluateMandates}' `policy` argument, else null.
     * Purely informational — it records the org's own stance next to the mandate's
     * dated clause so a machine-readable report shows both.
     */
    policyVerdict: PolicyVerdict | null;
    /**
     * True when the org policy EXPLICITLY permits or is transitioning this family —
     * an owned, tracked decision. Acknowledged findings are exempt from the EARLY
     * gates (`failNow` / `leadMonths`); a passed DISALLOW deadline (`violation`)
     * still fails regardless, because an org cannot self-exempt from a dated legal
     * disallow. `false` when no policy was supplied.
     */
    acknowledged: boolean;
}
export interface MandateEvaluation {
    /** The `now` the evaluation was computed against (ISO). */
    now: string;
    /** Mandate ids evaluated. */
    mandates: string[];
    /**
     * Counts of IN-SCOPE findings (classical asymmetric families) by their worst
     * status across the selected mandates. Out-of-scope findings are excluded so
     * the conformant count is an honest statement about asymmetric crypto only.
     */
    summary: Record<MandateStatus, number>;
    /**
     * Findings outside the mandate's scope (hashes, RNG, dependency, TLS-config…),
     * which a PQC-asymmetric mandate does not adjudicate.
     */
    notInScope: number;
    /** One row per (prohibited finding × applicable mandate). */
    findings: MandateFindingVerdict[];
    /** Earliest still-future deadline across non-violation rows, or null. */
    nextDeadline: string | null;
    /** True when at least one DISALLOW deadline has passed (a `violation` exists). */
    hasViolation: boolean;
    /** Name of the org policy composed in via `policy`, or null when none was supplied. */
    policyName: string | null;
    /**
     * How many distinct prohibited FINDINGS the org policy explicitly acknowledged
     * (family listed as `permitted` or `inTransition`) — counted per finding, not
     * per verdict row, so a family prohibited by two mandates counts once, matching
     * the per-finding `summary`. 0 when no policy was supplied.
     */
    acknowledged: number;
}
/**
 * Evaluate findings against the selected mandates as of `now`. Unknown mandate
 * ids are ignored — callers validate up front with {@link assertKnownMandates}.
 * A finding outside the classical-asymmetric scope is counted in `notInScope`;
 * an in-scope finding no selected mandate prohibits is `conformant`. Neither
 * contributes a verdict row.
 *
 * When an org `policy` is supplied (the `--policy` composition), every verdict
 * row is annotated with the org's own `policyVerdict` and an `acknowledged` flag
 * (family explicitly permitted / in-transition). Acknowledgement is purely
 * additive here — it changes no status — but {@link mandateGateFails} honours it
 * to keep the early gates from double-flagging crypto the org is knowingly,
 * traceably managing. A passed DISALLOW deadline is never acknowledgeable away.
 */
export declare function evaluateMandates(findings: readonly Finding[], mandateIdList: readonly string[], now: Date, policy?: CryptoPolicy): MandateEvaluation;
export interface MandateGateOptions {
    /** Fail when a DISALLOW deadline is within this many months (early enforcement). */
    leadMonths?: number;
    /** Fail on any mandate-prohibited finding regardless of the deadlines. */
    failNow?: boolean;
}
/**
 * The gate decision under the "deadline-aware" default: fail only once a DISALLOW
 * deadline has passed (`violation`). A passed DEPRECATE date (`deprecated`) is a
 * warning and does not fail the build. `leadMonths` fails early when a disallow
 * deadline is within the window; `failNow` fails on any prohibited finding
 * immediately.
 *
 * Policy composition: when a finding was `acknowledged` by the org policy
 * (`--policy`), it is exempt from the EARLY gates (`failNow` / `leadMonths`) —
 * the org is knowingly, traceably managing that family, so its own early
 * enforcement should not re-flag it. A passed DISALLOW deadline (`violation`)
 * still fails regardless: a dated legal disallow is not something an org can
 * self-exempt from.
 */
export declare function mandateGateFails(ev: MandateEvaluation, opts?: MandateGateOptions): boolean;
//# sourceMappingURL=mandates.d.ts.map