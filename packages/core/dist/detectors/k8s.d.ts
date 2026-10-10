/**
 * Config detector: classical crypto in Kubernetes manifests — cert-manager key
 * algorithms and service-mesh (Istio) TLS floors. These mint the certificates
 * and secure the pod-to-pod traffic of a cluster, a surface neither the language
 * packs nor the Terraform detector see.
 *
 * Covered (gated by a cert-manager / Istio marker in the document to keep the
 * generic `algorithm:` / `minProtocolVersion:` keys from firing on unrelated YAML):
 *  - cert-manager `Certificate`/`Issuer` `privateKey.algorithm` (or legacy
 *    `keyAlgorithm`): `RSA` | `ECDSA` | `Ed25519`.
 *  - Istio `minProtocolVersion: TLSV1_0 | TLSV1_1` — a legacy TLS floor on mesh
 *    traffic, whose (EC)DHE key exchange is classical and harvestable.
 */
import type { Detector } from "../types.js";
/** Detects classical cert-manager keys and legacy Istio TLS floors in K8s YAML. */
export declare const k8sDetector: Detector;
//# sourceMappingURL=k8s.d.ts.map