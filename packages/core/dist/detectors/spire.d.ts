/**
 * Config detector: classical key types configured for SPIFFE X.509 SVIDs in
 * SPIRE server/agent configuration (HCL, and the `.conf`/YAML/JSON variants
 * SPIRE deployments ship).
 *
 * SPIRE is the reference SPIFFE implementation: it issues each workload a
 * short-lived X.509-SVID certificate, signed by the SPIRE server's CA (itself
 * often chained to an UpstreamAuthority). The SVID leaf key and the CA signing
 * key are configured by explicit key-type strings:
 *  - server `ca_key_type = "rsa-2048" | "rsa-4096" | "ec-p256" | "ec-p384"` —
 *    the CA that signs every workload SVID in the trust domain (the identity
 *    ROOT: forge this and you forge the whole trust domain).
 *  - agent/server `svid_key_type = "rsa-2048" | "ec-p256"` — the per-workload
 *    leaf key type.
 *  - per-plugin `key_type = "rsa-2048" | "ec-p256"` on UpstreamAuthority /
 *    KeyManager plugins.
 *
 * These are SIGNING / identity keys, not confidentiality keys: an SVID X.509
 * signature is verified, never used to wrap harvestable ciphertext. So there is
 * nothing to "harvest now, decrypt later" — `hndl: false` — but every SVID
 * signature (and the CA signature over it) becomes FORGEABLE the moment a
 * cryptographically-relevant quantum computer (CRQC) exists, letting an attacker
 * mint certificates for any SPIFFE ID in the trust domain. Findings are
 * therefore `category: "certificate"` (X.509 / PKI material), `severity:
 * "medium"`, `confidence: "high"`.
 *
 * Algorithm mapping (SPIRE key-type value → {@link AlgorithmFamily}):
 *  - `rsa-2048` / `rsa-4096` / any `rsa-*`  → RSA
 *  - `ec-p256` / `ec-p384` / `ecdsa`        → ECDSA
 *
 * Match shape: the key-type attribute name (`ca_key_type`, `svid_key_type`, or
 * the bare per-plugin `key_type`) followed by `=`/`:` and a quoted value, in
 * both HCL (`=`) and YAML/JSON (`:`) forms. The `\b(?:ca_|svid_)?key_type\b`
 * anchor covers all three names in one pattern — the leading `\b` won't fire
 * inside `ca_key_type`/`svid_key_type` for the bare `key_type` alternative
 * because `_` is a word character, so those longer names are matched whole.
 *
 * Fast reject: `detect()` bails unless the file carries a SPIFFE/SPIRE-specific
 * marker (`spiffe`, `spire`, the distinctive `ca_key_type`, or `svid`). A bare
 * `key_type = "rsa-2048"` is deliberately NOT a sufficient marker — `key_type`
 * is a generic attribute (Vault PKI roles, cloud IaC, …), so without a
 * spiffe/spire/svid/ca_key_type anchor an unrelated config must not fire. This
 * keeps the generic per-plugin `key_type` rule precise while still catching a
 * real SPIRE config, which always names its trust domain / server / SVIDs.
 */
import type { Detector } from "../types.js";
/** Detects classical key types configured for SPIFFE X.509 SVIDs in SPIRE config. */
export declare const spireDetector: Detector;
//# sourceMappingURL=spire.d.ts.map