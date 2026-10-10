import { PQC_STANDARDS } from "./standards.js";
import { verdictForAlgorithm } from "./policy.js";
/**
 * All Shor-broken classical asymmetric families — the mandate's SCOPE. A finding
 * on one of these is adjudicated against the selected mandates; findings on
 * anything else (hashes, RNG, dependency, or TLS-configuration findings) are out
 * of scope for a PQC-asymmetric mandate and are tallied as `notInScope` instead
 * of inflating the conformant count.
 */
const CLASSICAL_PUBLIC_KEY = [
    "RSA",
    "ECDH",
    "ECDSA",
    "EdDSA",
    "DH",
    "DSA",
    "X25519",
    "X448",
    "ECIES",
];
/**
 * The PROHIBITED subset the dated clauses apply to. X25519 and X448 are
 * deliberately excluded: they are the classical half of the recommended hybrid
 * key exchange (X25519MLKEM768 — permitted and recommended under the NIST
 * profile), and a static scan cannot distinguish a standalone exchange from the
 * hybrid's classical leg. Prohibiting them would false-positive exactly the orgs
 * that hybridized correctly, so they stay in scope but read `conformant`.
 */
const PROHIBITED_FAMILIES = CLASSICAL_PUBLIC_KEY.filter((family) => family !== "X25519" && family !== "X448");
/**
 * Effective dates derived from the standards source of truth, so a quarterly
 * standards update moves the mandate deadlines automatically (test/standards.test.ts
 * asserts they agree). Each regime uses its OWN dated timeline: NIST IR 8547
 * disallows after 2035, while CNSA 2.0 sets its general exclusive-use milestone
 * at 2033 (both deprecate after 2030) — so the two mandates carry different
 * disallow years rather than sharing one.
 *
 * Boundary choice: "deprecate AFTER 2030" leaves the whole stated year permitted,
 * so each clause takes effect on the LAST day of its year (`YYYY-12-31`) —
 * conservative by a single day, unlike `YYYY-01-01`, which would bite roughly a
 * year early.
 */
const IR8547 = PQC_STANDARDS.transitionTimeline; // 2030 deprecate / 2035 disallow
const CNSA = PQC_STANDARDS.cnsaTimeline; // 2030 deprecate / 2033 disallow
const NIST_DEPRECATE_EFFECTIVE = `${IR8547.deprecateAfter}-12-31`;
const NIST_DISALLOW_EFFECTIVE = `${IR8547.disallowAfter}-12-31`;
const CNSA_DEPRECATE_EFFECTIVE = `${CNSA.deprecateAfter}-12-31`;
const CNSA_DISALLOW_EFFECTIVE = `${CNSA.disallowAfter}-12-31`;
/** The bundled mandate catalog. Keyed by `--mandate <id>`. */
export const MANDATES = {
    "cnsa-2.0": {
        id: "cnsa-2.0",
        name: "CNSA 2.0",
        authority: "NSA",
        citation: "NSA Commercial National Security Algorithm Suite 2.0 (CNSA 2.0)",
        asOf: "2026-07",
        rules: [
            {
                clause: `CNSA 2.0 — deprecate classical PKC after ${CNSA.deprecateAfter}`,
                tier: "deprecate",
                prohibits: [...PROHIBITED_FAMILIES],
                effective: CNSA_DEPRECATE_EFFECTIVE,
                note: `Classical public-key cryptography deprecated (${CNSA.deprecateAfter}: software/firmware signing exclusive-use); systems should use CNSA 2.0 PQC.`,
            },
            {
                clause: `CNSA 2.0 — disallow classical PKC after ${CNSA.disallowAfter}`,
                tier: "disallow",
                prohibits: [...PROHIBITED_FAMILIES],
                effective: CNSA_DISALLOW_EFFECTIVE,
                note: `Classical public-key cryptography disallowed (${CNSA.disallowAfter}: general NSS exclusive-use milestone); the migration must be complete.`,
            },
        ],
    },
    "nist-ir-8547": {
        id: "nist-ir-8547",
        name: "NIST IR 8547",
        authority: "NIST",
        citation: "NIST IR 8547 (Transition to Post-Quantum Cryptography Standards)",
        asOf: "2026-07",
        rules: [
            {
                clause: `NIST IR 8547 — deprecate classical PKC after ${IR8547.deprecateAfter}`,
                tier: "deprecate",
                prohibits: [...PROHIBITED_FAMILIES],
                effective: NIST_DEPRECATE_EFFECTIVE,
                note: `112-bit-security classical public-key algorithms deprecated after ${IR8547.deprecateAfter}.`,
            },
            {
                clause: `NIST IR 8547 — disallow classical PKC after ${IR8547.disallowAfter}`,
                tier: "disallow",
                prohibits: [...PROHIBITED_FAMILIES],
                effective: NIST_DISALLOW_EFFECTIVE,
                note: `Classical public-key algorithms disallowed after ${IR8547.disallowAfter}.`,
            },
        ],
    },
};
export const mandateIds = () => Object.keys(MANDATES);
export const getMandate = (id) => MANDATES[id];
/**
 * Validate mandate ids loudly, matching `parseCryptoPolicy`'s fail-loud
 * convention: a mistyped id must never silently evaluate to an empty gate.
 * Throws an `Error` naming every unknown id and the known catalog.
 * `evaluateMandates` itself stays lenient (unknown ids are skipped) so callers
 * decide where to fail.
 */
export function assertKnownMandates(ids) {
    const unknown = ids.filter((id) => !MANDATES[id]);
    if (unknown.length > 0) {
        throw new Error(`unknown mandate id(s): ${unknown.join(", ")}; known mandates: ${mandateIds().join(", ")}`);
    }
}
const MONTH_MS = 2_629_800_000; // average month
function monthsBetween(fromMs, toMs) {
    return Math.round((toMs - fromMs) / MONTH_MS);
}
const STATUS_RANK = {
    conformant: 0,
    due: 1,
    deprecated: 2,
    violation: 3,
};
/**
 * True when the org policy EXPLICITLY accepts a family — listed in `permitted`
 * (an owned exception) or `inTransition` (a tracked migration). A `prohibited`
 * family or one covered only by the policy's default fallback is NOT
 * acknowledged: silence is not consent, so an unnamed family never earns a gate
 * exemption.
 *
 * `prohibited` takes precedence, matching {@link verdictForAlgorithm}: a policy
 * that lists a family in BOTH `prohibited` and `permitted` (a plausible merge of
 * two policy fragments) resolves to `violation`, and must not then be silently
 * acknowledged away — that would produce a self-contradictory verdict (verdict
 * `violation`, yet exempt from the gate).
 */
function policyAcknowledges(algo, policy) {
    if (policy.prohibited?.includes(algo))
        return false;
    return Boolean(policy.permitted?.includes(algo) || policy.inTransition?.includes(algo));
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
export function evaluateMandates(findings, mandateIdList, now, policy) {
    // A compliance verdict is as-of a DAY: the clauses take effect on date
    // boundaries (YYYY-MM-DD), so the exact clock time carries no compliance
    // meaning. Pin `now` to UTC midnight of its date before any arithmetic — this
    // makes the whole evaluation (statuses AND the monthsUntil / monthsUntilDisallow
    // counters) identical for any two runs on the same day, which is what keeps the
    // attested evidence hash reproducible per commit per day. Truncating changes no
    // status: every `effective` date is itself UTC-midnight, so `nowMs >= effMs` has
    // the same truth value at midnight as at any other time that day.
    const nowMs = Date.parse(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`);
    const nowIso = new Date(nowMs).toISOString();
    const selected = mandateIdList.map(getMandate).filter((m) => Boolean(m));
    const rows = [];
    const perFindingWorst = [];
    let notInScope = 0;
    let acknowledged = 0;
    let nextDeadlineMs = null;
    for (const f of findings) {
        const algo = f.algorithm ?? "unknown";
        if (!CLASSICAL_PUBLIC_KEY.includes(algo)) {
            notInScope++;
            continue;
        }
        let worst = "conformant";
        // Acknowledgement is a property of the FAMILY (fixed for this finding), so it
        // is computed once here and stamped on every row. The tally counts distinct
        // acknowledged findings (not rows), so one family under two mandates is one
        // acknowledgement, matching the per-finding status counts in `summary`.
        const family = algo;
        const isAcknowledged = policy ? policyAcknowledges(family, policy) : false;
        let producedRow = false;
        for (const mandate of selected) {
            // The applicable clauses for this family, earliest deadline first.
            const applicable = mandate.rules
                .filter((r) => r.prohibits.includes(algo))
                .sort((a, b) => a.effective.localeCompare(b.effective));
            if (applicable.length === 0)
                continue;
            producedRow = true;
            // Tier the clauses so both stay live: a passed DISALLOW clause is a
            // violation; a passed DEPRECATE clause (disallow still ahead) is the
            // deprecated warning tier; otherwise the finding is due against the next
            // upcoming clause.
            const passed = applicable.filter((r) => nowMs >= new Date(r.effective).getTime());
            const passedDisallow = passed.filter((r) => r.tier === "disallow");
            let status;
            let governing;
            if (passedDisallow.length > 0) {
                status = "violation";
                governing = passedDisallow[0];
            }
            else if (passed.length > 0) {
                status = "deprecated";
                governing = passed[passed.length - 1];
            }
            else {
                status = "due";
                governing = applicable[0];
            }
            // The disallow clause (earliest, if several) anchors `leadMonths`.
            const disallowRule = applicable.find((r) => r.tier === "disallow") ?? null;
            const disallowMs = disallowRule ? new Date(disallowRule.effective).getTime() : null;
            if (status !== "violation") {
                for (const r of applicable) {
                    const effMs = new Date(r.effective).getTime();
                    if (effMs > nowMs && (nextDeadlineMs === null || effMs < nextDeadlineMs))
                        nextDeadlineMs = effMs;
                }
            }
            if (STATUS_RANK[status] > STATUS_RANK[worst])
                worst = status;
            rows.push({
                ruleId: f.ruleId,
                algorithm: algo,
                file: f.location.file,
                line: f.location.line,
                mandate: mandate.id,
                clause: governing.clause,
                effective: governing.effective,
                status,
                monthsUntil: monthsBetween(nowMs, new Date(governing.effective).getTime()),
                disallowEffective: disallowRule ? disallowRule.effective : null,
                monthsUntilDisallow: disallowMs !== null ? monthsBetween(nowMs, disallowMs) : null,
                citation: mandate.citation,
                policyVerdict: policy ? verdictForAlgorithm(family, policy).verdict : null,
                acknowledged: isAcknowledged,
            });
        }
        // Count the acknowledged FINDING once (it produced at least one prohibited
        // row and the org policy owns/tracks its family), not once per mandate row.
        if (producedRow && isAcknowledged)
            acknowledged++;
        perFindingWorst.push(worst);
    }
    const summary = {
        conformant: 0,
        due: 0,
        deprecated: 0,
        violation: 0,
    };
    for (const s of perFindingWorst)
        summary[s]++;
    return {
        now: nowIso,
        mandates: selected.map((m) => m.id),
        summary,
        notInScope,
        findings: rows,
        nextDeadline: nextDeadlineMs !== null ? new Date(nextDeadlineMs).toISOString().slice(0, 10) : null,
        hasViolation: summary.violation > 0,
        policyName: policy?.name ?? null,
        acknowledged,
    };
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
export function mandateGateFails(ev, opts = {}) {
    if (ev.hasViolation)
        return true;
    // Early gates skip policy-acknowledged findings; the hard `violation` above did not.
    const gated = ev.findings.filter((v) => !v.acknowledged);
    if (opts.failNow)
        return gated.length > 0;
    if (opts.leadMonths !== undefined) {
        return gated.some((v) => v.monthsUntilDisallow !== null && v.monthsUntilDisallow <= opts.leadMonths);
    }
    return false;
}
//# sourceMappingURL=mandates.js.map