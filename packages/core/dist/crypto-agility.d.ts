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
import type { CryptoPolicy } from "./policy.js";
import type { ScanResult, Severity } from "./types.js";
/**
 * Schema version of the manifest this module emits and validates. Bumped only on a
 * breaking change to the manifest shape; consumers key their parsing off it.
 */
export declare const CRYPTO_AGILITY_MANIFEST_VERSION = 1;
/** The conventional path a manifest is served from, relative to the site origin. */
export declare const CRYPTO_AGILITY_WELL_KNOWN_PATH = "/.well-known/crypto-agility.json";
/** A single algorithm family in use, mirroring the CBOM's grouping. */
export interface CryptoAgilityFamily {
    /** The algorithm family (e.g. `RSA`, `ECDH`, `ECDSA`), or `unknown`. */
    family: string;
    /** How many findings referenced this family. */
    count: number;
    /** Always true today: every detected family is classical (Shor-broken). */
    quantumVulnerable: boolean;
}
/** The project's cryptographic posture, distilled from the scan inventory. */
export interface CryptoAgilityPosture {
    /** qScan readiness score, 0–100 (100 = no classical asymmetric crypto found). */
    readinessScore: number;
    /**
     * Whether the project negotiates hybrid post-quantum key exchange. qScan is a
     * static scanner and cannot observe a negotiated TLS group, so this is `null`
     * ("not determined by this generator") unless the operator asserts it
     * (`--hybrid-kex` / `--no-hybrid-kex`). A live probe (qProbe) or the website can
     * fill it authoritatively.
     */
    hybridKexInUse: boolean | null;
    /** Count of quantum-vulnerable findings, total and broken down by severity. */
    quantumVulnerable: {
        total: number;
        bySeverity: Record<Severity, number>;
    };
    /** How many findings are exposed to harvest-now-decrypt-later. */
    hndlExposedCount: number;
}
/** A compact summary of the full CBOM, linking to it by serial number. */
export interface CryptoAgilityCbomSummary {
    /** The CycloneDX `serialNumber` of the full CBOM this summary was derived from. */
    serialNumber: string;
    /** Number of distinct cryptographic-asset components in the full CBOM. */
    assetCount: number;
    /** Algorithm families in use, most-referenced first. */
    algorithmFamilies: CryptoAgilityFamily[];
}
/** The migration policy the project declares it is measured against. */
export interface CryptoAgilityPolicy {
    /** Human label for the policy source (a standard name, or `operator-declared`). */
    source: string;
    /** Year after which classical public-key crypto is deprecated. */
    deprecateClassicalAfter: number;
    /** Year after which classical public-key crypto is disallowed. */
    disallowClassicalAfter: number;
    /** Operator-declared migration deadline (ISO date / year), or `null`. */
    transitionDeadline: string | null;
    /** Citation for the deadlines (spec / publication). */
    citation: string;
}
/** The full crypto-agility manifest. */
export interface CryptoAgilityManifest {
    /** Manifest schema version ({@link CRYPTO_AGILITY_MANIFEST_VERSION}). */
    version: number;
    /** Discriminator so a consumer can tell this document apart from other JSON. */
    manifestType: "crypto-agility";
    /** ISO 8601 timestamp the manifest was generated (caller-supplied). */
    generatedAt: string;
    /** What produced the manifest. */
    generator: {
        name: string;
        version: string;
    };
    /** What the manifest describes. */
    subject: {
        root: string;
        repository: string | null;
        commit: string | null;
    };
    /** The distilled cryptographic posture. */
    posture: CryptoAgilityPosture;
    /** A compact summary of the CBOM. */
    cbomSummary: CryptoAgilityCbomSummary;
    /** Optional link to a quantakrypto (or other) posture credential. */
    attestation?: {
        url: string;
    };
    /** The declared migration policy / deadlines. */
    policy: CryptoAgilityPolicy;
}
/** Inputs the CLI/runtime supplies that are not derivable from the scan. */
export interface CryptoAgilityManifestOptions {
    /**
     * ISO 8601 generation timestamp. The caller supplies it (`Date.now()` is fine in
     * the CLI runtime) so the builder itself stays pure and deterministic.
     */
    generatedAt: string;
    /** Optional URL to a posture credential (recorded verbatim, never fetched here). */
    attestationUrl?: string;
    /**
     * Operator assertion of hybrid-KEX use. `undefined` leaves the manifest's
     * `hybridKexInUse` as `null` (not determined).
     */
    hybridKexInUse?: boolean;
    /** Optional org crypto policy; its `transitionDeadline` overlays the defaults. */
    policy?: CryptoPolicy;
    /** Repository URL (e.g. `GITHUB_REPOSITORY`); omitted → null. */
    repository?: string;
    /** Commit SHA (e.g. `GITHUB_SHA`); omitted → null. */
    commit?: string;
}
/**
 * Build a crypto-agility manifest from a scan result. Pure: every runtime input
 * (timestamp, attestation, hybrid-KEX assertion, policy) arrives via `opts`.
 *
 * The posture and CBOM summary are derived straight from the scan's inventory and
 * its CycloneDX CBOM, so the manifest can never disagree with the full `--cbom` /
 * `--format json` outputs of the same scan.
 */
export declare function buildCryptoAgilityManifest(result: ScanResult, opts: CryptoAgilityManifestOptions): CryptoAgilityManifest;
/** Outcome of {@link validateCryptoAgilityManifest}. */
export interface ManifestValidation {
    /** True when the value satisfies the manifest schema. */
    valid: boolean;
    /** One human-readable message per problem found (empty when `valid`). */
    errors: string[];
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
export declare function validateCryptoAgilityManifest(value: unknown): ManifestValidation;
//# sourceMappingURL=crypto-agility.d.ts.map