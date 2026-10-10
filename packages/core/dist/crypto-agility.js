/**
 * Crypto-agility manifest: an agent-consumable crypto-posture document.
 *
 * A small, versioned JSON manifest a project publishes at a well-known URL
 * (`/.well-known/crypto-agility.json`, see docs/CRYPTO-AGILITY-MANIFEST.md) so any
 * agent, scanner, or CI bot can read the project's cryptographic posture the way it
 * reads `security.txt` or `robots.txt`. It is a compact, decision-oriented summary
 * DERIVED from a qScan result: the readiness score, the count of quantum-vulnerable
 * findings by severity, the CBOM's algorithm families, an optional attestation URL,
 * and the migration-policy deadlines.
 *
 * This module owns two pure operations and their shared schema:
 *   - {@link buildCryptoAgilityManifest}: derive a manifest from a {@link ScanResult}.
 *   - {@link validateCryptoAgilityManifest}: check an untrusted value against the
 *     schema, returning a list of problems (used by the local validator; a network
 *     fetch-and-validate lives on the website, never in this offline-boundary tool).
 *
 * Zero dependencies; hand-rolled JSON shape and validation so the package stays
 * runtime-dependency-free.
 */
import { toCbom } from "./cbom.js";
import { PQC_STANDARDS } from "./standards.js";
import { SEVERITY_ORDER } from "./severity.js";
import { VERSION } from "./version.js";
/**
 * Schema version of the manifest this module emits and validates. Bumped only on a
 * breaking change to the manifest shape; consumers key their parsing off it.
 */
export const CRYPTO_AGILITY_MANIFEST_VERSION = 1;
/** The conventional path a manifest is served from, relative to the site origin. */
export const CRYPTO_AGILITY_WELL_KNOWN_PATH = "/.well-known/crypto-agility.json";
/**
 * Build a crypto-agility manifest from a scan result. Pure: every runtime input
 * (timestamp, attestation, hybrid-KEX assertion, policy) arrives via `opts`.
 *
 * The posture and CBOM summary are derived straight from the scan's inventory and
 * its CycloneDX CBOM, so the manifest can never disagree with the full `--cbom` /
 * `--format json` outputs of the same scan.
 */
export function buildCryptoAgilityManifest(result, opts) {
    const cbom = toCbom(result);
    const inv = result.inventory;
    const algorithmFamilies = Object.entries(inv.byAlgorithm)
        .filter(([, count]) => (count ?? 0) > 0)
        .map(([family, count]) => ({
        family,
        count: count,
        // Every family the detectors surface is classical, hence quantum-vulnerable
        // by construction (mirrors cbom.ts `isQuantumVulnerable`).
        quantumVulnerable: true,
    }))
        .sort((a, b) => b.count - a.count || a.family.localeCompare(b.family));
    const bySeverity = { ...inv.bySeverity };
    // Default policy: the NIST IR 8547 transition timeline. An operator crypto policy
    // (`--policy`) does not override the standards deadlines but layers its own
    // `transitionDeadline` on top and re-labels the source as operator-declared.
    const timeline = PQC_STANDARDS.transitionTimeline;
    const policy = {
        source: opts.policy ? "operator-declared" : timeline.source,
        deprecateClassicalAfter: timeline.deprecateAfter,
        disallowClassicalAfter: timeline.disallowAfter,
        transitionDeadline: opts.policy?.transitionDeadline ?? null,
        citation: timeline.source,
    };
    const manifest = {
        version: CRYPTO_AGILITY_MANIFEST_VERSION,
        manifestType: "crypto-agility",
        generatedAt: opts.generatedAt,
        generator: { name: "qScan", version: result.toolVersion || VERSION },
        subject: {
            root: result.root,
            repository: opts.repository ?? null,
            commit: opts.commit ?? null,
        },
        posture: {
            readinessScore: inv.readinessScore,
            hybridKexInUse: opts.hybridKexInUse ?? null,
            quantumVulnerable: {
                total: result.findings.length,
                bySeverity,
            },
            hndlExposedCount: inv.hndlCount,
        },
        cbomSummary: {
            serialNumber: cbom.serialNumber,
            assetCount: cbom.components.length,
            algorithmFamilies,
        },
        ...(opts.attestationUrl ? { attestation: { url: opts.attestationUrl } } : {}),
        policy,
    };
    return manifest;
}
/** True for a plain (non-array, non-null) object. */
function isObject(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
/**
 * Validate an untrusted value against the crypto-agility manifest schema.
 *
 * Checks structure, required fields, types, and the schema version. Purely local:
 * it parses an already-in-memory value and NEVER performs I/O or network fetches;
 * a fetch-and-validate of a remote manifest is a website-side concern, deliberately
 * kept out of this offline-boundary tool. Returns every problem it finds rather than
 * throwing on the first, so a caller can report them all at once.
 */
export function validateCryptoAgilityManifest(value) {
    const errors = [];
    const err = (m) => void errors.push(m);
    if (!isObject(value)) {
        return { valid: false, errors: ["manifest must be a JSON object"] };
    }
    // version
    if (value.version === undefined) {
        err("missing required field: version");
    }
    else if (typeof value.version !== "number" || !Number.isInteger(value.version)) {
        err("version must be an integer");
    }
    else if (value.version !== CRYPTO_AGILITY_MANIFEST_VERSION) {
        err(`unsupported version ${value.version} (this validator understands version ${CRYPTO_AGILITY_MANIFEST_VERSION})`);
    }
    // manifestType
    if (value.manifestType === undefined) {
        err("missing required field: manifestType");
    }
    else if (value.manifestType !== "crypto-agility") {
        err('manifestType must be the string "crypto-agility"');
    }
    // generatedAt
    if (value.generatedAt === undefined) {
        err("missing required field: generatedAt");
    }
    else if (typeof value.generatedAt !== "string" || value.generatedAt.length === 0) {
        err("generatedAt must be a non-empty ISO 8601 string");
    }
    else if (Number.isNaN(Date.parse(value.generatedAt))) {
        err("generatedAt must be a parseable ISO 8601 timestamp");
    }
    // generator
    if (value.generator === undefined) {
        err("missing required field: generator");
    }
    else if (!isObject(value.generator)) {
        err("generator must be an object");
    }
    else {
        if (typeof value.generator.name !== "string")
            err("generator.name must be a string");
        if (typeof value.generator.version !== "string")
            err("generator.version must be a string");
    }
    // subject
    if (value.subject === undefined) {
        err("missing required field: subject");
    }
    else if (!isObject(value.subject)) {
        err("subject must be an object");
    }
    else {
        if (typeof value.subject.root !== "string")
            err("subject.root must be a string");
        if (value.subject.repository !== null && typeof value.subject.repository !== "string") {
            err("subject.repository must be a string or null");
        }
        if (value.subject.commit !== null && typeof value.subject.commit !== "string") {
            err("subject.commit must be a string or null");
        }
    }
    // posture
    validatePosture(value.posture, err);
    // cbomSummary
    validateCbomSummary(value.cbomSummary, err);
    // attestation (optional)
    if (value.attestation !== undefined) {
        if (!isObject(value.attestation)) {
            err("attestation must be an object when present");
        }
        else if (typeof value.attestation.url !== "string" || value.attestation.url.length === 0) {
            err("attestation.url must be a non-empty string");
        }
    }
    // policy
    validatePolicy(value.policy, err);
    return { valid: errors.length === 0, errors };
}
/** Validate the `posture` block. */
function validatePosture(posture, err) {
    if (posture === undefined) {
        err("missing required field: posture");
        return;
    }
    if (!isObject(posture)) {
        err("posture must be an object");
        return;
    }
    if (typeof posture.readinessScore !== "number" ||
        posture.readinessScore < 0 ||
        posture.readinessScore > 100) {
        err("posture.readinessScore must be a number between 0 and 100");
    }
    if (posture.hybridKexInUse !== null && typeof posture.hybridKexInUse !== "boolean") {
        err("posture.hybridKexInUse must be a boolean or null");
    }
    if (typeof posture.hndlExposedCount !== "number" || posture.hndlExposedCount < 0) {
        err("posture.hndlExposedCount must be a non-negative number");
    }
    const qv = posture.quantumVulnerable;
    if (!isObject(qv)) {
        err("posture.quantumVulnerable must be an object");
        return;
    }
    if (typeof qv.total !== "number" || qv.total < 0) {
        err("posture.quantumVulnerable.total must be a non-negative number");
    }
    if (!isObject(qv.bySeverity)) {
        err("posture.quantumVulnerable.bySeverity must be an object");
    }
    else {
        for (const sev of SEVERITY_ORDER) {
            if (typeof qv.bySeverity[sev] !== "number") {
                err(`posture.quantumVulnerable.bySeverity.${sev} must be a number`);
            }
        }
    }
}
/** Validate the `cbomSummary` block. */
function validateCbomSummary(summary, err) {
    if (summary === undefined) {
        err("missing required field: cbomSummary");
        return;
    }
    if (!isObject(summary)) {
        err("cbomSummary must be an object");
        return;
    }
    if (typeof summary.serialNumber !== "string")
        err("cbomSummary.serialNumber must be a string");
    if (typeof summary.assetCount !== "number" || summary.assetCount < 0) {
        err("cbomSummary.assetCount must be a non-negative number");
    }
    if (!Array.isArray(summary.algorithmFamilies)) {
        err("cbomSummary.algorithmFamilies must be an array");
        return;
    }
    summary.algorithmFamilies.forEach((fam, i) => {
        if (!isObject(fam)) {
            err(`cbomSummary.algorithmFamilies[${i}] must be an object`);
            return;
        }
        if (typeof fam.family !== "string")
            err(`cbomSummary.algorithmFamilies[${i}].family must be a string`);
        if (typeof fam.count !== "number" || fam.count < 0) {
            err(`cbomSummary.algorithmFamilies[${i}].count must be a non-negative number`);
        }
        if (typeof fam.quantumVulnerable !== "boolean") {
            err(`cbomSummary.algorithmFamilies[${i}].quantumVulnerable must be a boolean`);
        }
    });
}
/** Validate the `policy` block. */
function validatePolicy(policy, err) {
    if (policy === undefined) {
        err("missing required field: policy");
        return;
    }
    if (!isObject(policy)) {
        err("policy must be an object");
        return;
    }
    if (typeof policy.source !== "string")
        err("policy.source must be a string");
    if (typeof policy.deprecateClassicalAfter !== "number") {
        err("policy.deprecateClassicalAfter must be a number (year)");
    }
    if (typeof policy.disallowClassicalAfter !== "number") {
        err("policy.disallowClassicalAfter must be a number (year)");
    }
    if (policy.transitionDeadline !== null && typeof policy.transitionDeadline !== "string") {
        err("policy.transitionDeadline must be a string or null");
    }
    if (typeof policy.citation !== "string")
        err("policy.citation must be a string");
}
//# sourceMappingURL=crypto-agility.js.map