import { sourceDetectors } from "./detectors/source.js";
import { pythonDetector } from "./detectors/python.js";
import { goDetector } from "./detectors/go.js";
import { javaDetector } from "./detectors/java.js";
import { csharpDetector } from "./detectors/csharp.js";
import { rustDetector } from "./detectors/rust.js";
import { rubyDetector } from "./detectors/ruby.js";
import { phpDetector } from "./detectors/php.js";
import { elixirDetector } from "./detectors/elixir.js";
import { cDetector } from "./detectors/c.js";
import { swiftDetector } from "./detectors/swift.js";
import { objcDetector } from "./detectors/objc.js";
import { dartDetector } from "./detectors/dart.js";
import { solidityDetector } from "./detectors/solidity.js";
import { pemDetector } from "./detectors/pem.js";
import { jwkDetector } from "./detectors/jwk.js";
import { terraformDetector } from "./detectors/terraform.js";
import { cloudKmsDetector } from "./detectors/cloud-kms.js";
import { cicdDetector } from "./detectors/cicd.js";
import { secretsDetector } from "./detectors/secrets.js";
import { joseDetector } from "./detectors/jose.js";
import { k8sDetector } from "./detectors/k8s.js";
import { messagingDetector } from "./detectors/messaging.js";
import { databaseDetector } from "./detectors/database.js";
import { xmldsigDetector } from "./detectors/xmldsig.js";
import { pkcs11Detector } from "./detectors/pkcs11.js";
import { dkimDetector } from "./detectors/dkim.js";
import { sshCaDetector } from "./detectors/ssh-ca.js";
import { spireDetector } from "./detectors/spire.js";
import { proxyDetector } from "./detectors/proxy.js";
import { webauthnDetector } from "./detectors/webauthn.js";
import { codesignDetector } from "./detectors/codesign.js";
import { weakHashDetector } from "./detectors/weak-hash.js";
import { pqcParameterDetector } from "./detectors/pqc-parameter.js";
import { cloudformationDetector } from "./detectors/cloudformation.js";
import { bicepDetector } from "./detectors/bicep.js";
import { pulumiDetector } from "./detectors/pulumi.js";
import { meshDetector } from "./detectors/mesh.js";
import { dnssecDetector } from "./detectors/dnssec.js";
import { vpnDetector } from "./detectors/vpn.js";
import { ansibleDetector } from "./detectors/ansible.js";
import { ageDetector } from "./detectors/age.js";
import { supplyChainDetector } from "./detectors/supply-chain.js";
import { vaultDetector } from "./detectors/vault.js";
import { keystoreDetector } from "./detectors/keystore.js";
import { openpgpDetector } from "./detectors/openpgp.js";
import { statefulHbsDetector } from "./detectors/stateful-hbs.js";
/** Normalised scope of a detector (defaults to "source" when undeclared). */
export function detectorScope(d) {
    return d.scope ?? "source";
}
/**
 * An ordered, id-indexed collection of detectors. Registration order is
 * preserved by {@link all} for deterministic scan output. Ids must be unique.
 */
export class DetectorRegistry {
    byId = new Map();
    order = [];
    /** Construct a registry, optionally seeded with an initial detector set. */
    constructor(initial = []) {
        for (const d of initial)
            this.register(d);
    }
    /** Register a detector. Throws on a duplicate id. Returns `this` for chaining. */
    register(d) {
        if (this.byId.has(d.id)) {
            throw new Error(`duplicate detector id: ${d.id}`);
        }
        this.byId.set(d.id, d);
        this.order.push(d.id);
        return this;
    }
    /** Look up a detector by its id (exact, not prefix). */
    get(id) {
        return this.byId.get(id);
    }
    /** True if a detector with this id is registered. */
    has(id) {
        return this.byId.has(id);
    }
    /** All registered detectors, in registration order. */
    all() {
        return this.order.map((id) => this.byId.get(id));
    }
    /**
     * The flattened rule catalog: every {@link RuleMeta} declared by every
     * registered detector, in detector-registration then in-detector order. This
     * is the single source of truth for rule metadata consumed by SARIF
     * `rules[]`, the MCP `explain_finding` resolver, and per-rule enable/disable.
     * Duplicate rule ids across detectors throw (ids are globally unique).
     */
    ruleCatalog() {
        const out = [];
        const seen = new Set();
        for (const det of this.all()) {
            for (const rule of det.rules ?? []) {
                if (seen.has(rule.id)) {
                    throw new Error(`duplicate rule id in catalog: ${rule.id}`);
                }
                seen.add(rule.id);
                out.push(rule);
            }
        }
        return out;
    }
    /** Resolve a rule id to its {@link RuleMeta} and the detector that emits it. */
    forRule(ruleId) {
        for (const det of this.all()) {
            for (const rule of det.rules ?? []) {
                if (rule.id === ruleId)
                    return { rule, detector: det };
            }
        }
        return undefined;
    }
    /** A shallow copy of this registry (useful to extend the defaults). */
    clone() {
        return new DetectorRegistry(this.all());
    }
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
export const builtinDetectors = [
    ...sourceDetectors,
    pythonDetector,
    goDetector,
    javaDetector,
    csharpDetector,
    rustDetector,
    rubyDetector,
    phpDetector,
    elixirDetector,
    cDetector,
    swiftDetector,
    objcDetector,
    dartDetector,
    solidityDetector,
    pemDetector,
    jwkDetector,
    terraformDetector,
    cloudKmsDetector,
    cicdDetector,
    secretsDetector,
    joseDetector,
    k8sDetector,
    messagingDetector,
    databaseDetector,
    xmldsigDetector,
    pkcs11Detector,
    dkimDetector,
    sshCaDetector,
    spireDetector,
    proxyDetector,
    webauthnDetector,
    codesignDetector,
    weakHashDetector,
    pqcParameterDetector,
    cloudformationDetector,
    bicepDetector,
    pulumiDetector,
    meshDetector,
    dnssecDetector,
    vpnDetector,
    ansibleDetector,
    ageDetector,
    supplyChainDetector,
    vaultDetector,
    keystoreDetector,
    openpgpDetector,
    statefulHbsDetector,
];
/**
 * The default registry, preloaded with {@link builtinDetectors}. Used by
 * `scan()` whenever `options.detectors` is not supplied.
 */
export const defaultRegistry = new DetectorRegistry(builtinDetectors);
//# sourceMappingURL=registry.js.map