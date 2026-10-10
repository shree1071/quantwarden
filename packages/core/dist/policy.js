/** The complete set of algorithm families a policy may reference. */
const ALGORITHM_FAMILIES = [
    "RSA",
    "ECDH",
    "ECDSA",
    "EdDSA",
    "DH",
    "DSA",
    "X25519",
    "X448",
    "ECIES",
    "unknown",
];
/** Resolve one algorithm family's verdict + a human reason against a policy. */
export function verdictForAlgorithm(algorithm, policy) {
    const algo = algorithm ?? "unknown";
    if (policy.prohibited?.includes(algo)) {
        return { verdict: "violation", reason: `${algo} is prohibited by the policy.` };
    }
    if (policy.inTransition?.includes(algo)) {
        return {
            verdict: "transition-pending",
            reason: `${algo} is being migrated (in the policy's transition set).`,
        };
    }
    if (policy.permitted?.includes(algo)) {
        return { verdict: "conformant", reason: `${algo} is permitted by the policy.` };
    }
    const fallback = policy.defaultVerdict ?? "violation";
    return {
        verdict: fallback,
        reason: `${algo} is not named in the policy (default verdict: ${fallback}).`,
    };
}
/**
 * Map every finding to a policy verdict, with per-verdict counts. Deterministic:
 * the same findings + policy always yield the same mapping (safe to hash in the
 * A.8.24 evidence attestation).
 */
export function buildPolicyMapping(findings, policy) {
    const summary = {
        conformant: 0,
        violation: 0,
        "transition-pending": 0,
    };
    const mapped = findings.map((f) => {
        const { verdict, reason } = verdictForAlgorithm(f.algorithm, policy);
        summary[verdict]++;
        return {
            ruleId: f.ruleId,
            algorithm: f.algorithm ?? "unknown",
            file: f.location.file,
            line: f.location.line,
            verdict,
            reason,
        };
    });
    return {
        policyName: policy.name ?? null,
        transitionDeadline: policy.transitionDeadline ?? null,
        summary,
        findings: mapped,
    };
}
/**
 * Validate + normalize a parsed policy object (from an operator's JSON file).
 * Throws a `TypeError` with a clear message on anything malformed — a bad policy
 * file must fail loudly, never silently degrade the evidence verdict.
 */
export function parseCryptoPolicy(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        throw new TypeError("crypto policy must be a JSON object");
    }
    const obj = raw;
    const validFamilies = new Set(ALGORITHM_FAMILIES);
    const list = (key) => {
        const v = obj[key];
        if (v === undefined)
            return undefined;
        if (!Array.isArray(v))
            throw new TypeError(`policy "${key}" must be an array of algorithm families`);
        for (const item of v) {
            if (typeof item !== "string" || !validFamilies.has(item)) {
                throw new TypeError(`policy "${key}" has an unknown algorithm family ${JSON.stringify(item)}; expected one of ${ALGORITHM_FAMILIES.join(", ")}`);
            }
        }
        return v;
    };
    const verdicts = new Set(["conformant", "violation", "transition-pending"]);
    let defaultVerdict;
    if (obj.defaultVerdict !== undefined) {
        if (typeof obj.defaultVerdict !== "string" ||
            !verdicts.has(obj.defaultVerdict)) {
            throw new TypeError(`policy "defaultVerdict" must be one of ${[...verdicts].join(", ")}`);
        }
        defaultVerdict = obj.defaultVerdict;
    }
    if (obj.name !== undefined && typeof obj.name !== "string") {
        throw new TypeError('policy "name" must be a string');
    }
    if (obj.transitionDeadline !== undefined && typeof obj.transitionDeadline !== "string") {
        throw new TypeError('policy "transitionDeadline" must be a string');
    }
    return {
        ...(obj.name !== undefined ? { name: obj.name } : {}),
        ...(list("permitted") ? { permitted: list("permitted") } : {}),
        ...(list("prohibited") ? { prohibited: list("prohibited") } : {}),
        ...(list("inTransition") ? { inTransition: list("inTransition") } : {}),
        ...(obj.transitionDeadline !== undefined
            ? { transitionDeadline: obj.transitionDeadline }
            : {}),
        ...(defaultVerdict !== undefined ? { defaultVerdict } : {}),
    };
}
//# sourceMappingURL=policy.js.map