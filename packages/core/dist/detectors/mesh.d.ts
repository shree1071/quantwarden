/**
 * Config detector: classical crypto in SERVICE MESH configuration — the
 * control-plane identity/CA systems and mesh-internal TLS settings of
 * Linkerd, HashiCorp Consul Connect, and Istio. These mint the mTLS identity
 * certificates that secure sidecar-to-sidecar traffic and are configured in
 * their own Helm values / HCL / CRD surfaces, distinct from what `k8s.ts`
 * already covers (cert-manager `Certificate`/`Issuer` keys and Istio's
 * `minProtocolVersion` TLS floor — NOT duplicated here).
 *
 * Covered (gated by a mesh marker in the document to keep generic keys like
 * `scheme:` / `private_key_type` from firing on unrelated YAML/HCL):
 *  - Linkerd control-plane identity issuer: Helm values `identityTrustAnchorsPEM`
 *    and `identity.issuer.scheme` / nested `issuer.scheme: linkerd.io/tls` — the
 *    default self-managed Linkerd identity scheme, which mints workload
 *    certificates from an ECDSA P-256 trust anchor. Flagged as a classical mesh
 *    CA (certificate, ECDSA, hndl:false) since Linkerd's identity issuer signs
 *    forgeable-by-quantum leaf certs, not a confidentiality key.
 *  - HashiCorp Consul Connect: the `connect { ca_config { private_key_type =
 *    "ec" | "rsa" } } }` mesh CA provider setting (also `ca_provider`). Flagged
 *    as a classical mesh CA (certificate; ECDSA for "ec", RSA for "rsa").
 * Istio `tls.cipherSuites:` `ECDHE-RSA-*` / `ECDHE-ECDSA-*` suites are NOT handled
 * here — the language-agnostic `tls-classical-kex` token rule in `source.ts`
 * already flags those cipher strings in any config file, so a rule here would
 * double-count.
 */
import type { Detector } from "../types.js";
/**
 * Detects classical asymmetric crypto in service-mesh configuration: Linkerd's
 * default ECDSA identity issuer and Consul Connect's mesh CA private key type.
 * (Istio ECDHE cipher-suite strings are covered by `source.ts`'s
 * `tls-classical-kex` token rule, so they are not duplicated here.)
 */
export declare const meshDetector: Detector;
//# sourceMappingURL=mesh.d.ts.map