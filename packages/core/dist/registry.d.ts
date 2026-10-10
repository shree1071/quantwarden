/**
 * Detector registry — the plugin point for source/config detectors.
 *
 * Instead of `scan()` closing over a hardcoded array and inferring scope from
 * ruleId prefixes, detectors are registered with a declared `scope` and
 * `language` (see {@link Detector}). `scan()` consults a registry (the
 * {@link defaultRegistry} by default, or an explicit `detectors` override) and
 * honours the source/config toggles by each detector's declared scope.
 *
 * To add a language or detector, see the "Adding a detector / language" section
 * of the package README.
 */
import type { Detector, DetectorScope, RuleMeta } from "./types.js";
/** Normalised scope of a detector (defaults to "source" when undeclared). */
export declare function detectorScope(d: Detector): DetectorScope;
/** A rule plus the detector that emits it — the result of {@link DetectorRegistry.forRule}. */
export interface RuleCatalogEntry {
    rule: RuleMeta;
    detector: Detector;
}
/**
 * An ordered, id-indexed collection of detectors. Registration order is
 * preserved by {@link all} for deterministic scan output. Ids must be unique.
 */
export declare class DetectorRegistry {
    private readonly byId;
    private readonly order;
    /** Construct a registry, optionally seeded with an initial detector set. */
    constructor(initial?: readonly Detector[]);
    /** Register a detector. Throws on a duplicate id. Returns `this` for chaining. */
    register(d: Detector): this;
    /** Look up a detector by its id (exact, not prefix). */
    get(id: string): Detector | undefined;
    /** True if a detector with this id is registered. */
    has(id: string): boolean;
    /** All registered detectors, in registration order. */
    all(): Detector[];
    /**
     * The flattened rule catalog: every {@link RuleMeta} declared by every
     * registered detector, in detector-registration then in-detector order. This
     * is the single source of truth for rule metadata consumed by SARIF
     * `rules[]`, the MCP `explain_finding` resolver, and per-rule enable/disable.
     * Duplicate rule ids across detectors throw (ids are globally unique).
     */
    ruleCatalog(): RuleMeta[];
    /** Resolve a rule id to its {@link RuleMeta} and the detector that emits it. */
    forRule(ruleId: string): RuleCatalogEntry | undefined;
    /** A shallow copy of this registry (useful to extend the defaults). */
    clone(): DetectorRegistry;
}
/**
 * The built-in detectors, in run order: the JS/TS source + language-agnostic config
 * detectors, the per-language source packs (Python, Go, Java/Kotlin/Scala, C#, Rust,
 * Ruby, PHP, Elixir, C/C++, Swift, Objective-C, Dart, Solidity/Move/Cairo), the
 * infrastructure/config detectors (Terraform, Bicep, Pulumi, CloudFormation, cloud-KMS,
 * k8s, mesh, DNSSEC, Vault, database/TDE, messaging, VPN, Ansible, supply-chain, CI/CD,
 * secrets, age, keystore, OpenPGP, JWK, XML-DSig/SAML, PKCS#11/HSM, DKIM, SSH-CA,
 * SPIFFE/SPIRE, reverse-proxy/gRPC TLS, WebAuthn/FIDO2, code-signing, weak-hash-in-
 * signature), and the stateful-HBS (SP 800-208) detector. The manifest (dependency)
 * scanner is handled separately by `scan()`.
 *
 * This is the single source of truth for the default detector set: both
 * {@link defaultRegistry} and the public `detectors` export (re-exported from
 * `scan.ts`) are built from it, so the two can never drift out of sync.
 */
export declare const builtinDetectors: Detector[];
/**
 * The default registry, preloaded with {@link builtinDetectors}. Used by
 * `scan()` whenever `options.detectors` is not supplied.
 */
export declare const defaultRegistry: DetectorRegistry;
//# sourceMappingURL=registry.d.ts.map