/**
 * Config detector: classical asymmetric keys in native HashiCorp Vault server
 * config / policy (HCL). Terraform-provisioned Vault is caught by the terraform
 * detector (`.tf`); this covers Vault's OWN `.hcl` config — the `transit` and
 * `pki` secrets engines, whose keys sign and wrap real production data.
 *
 * Covered (gated to a `transit`/`pki` marker to avoid firing on unrelated HCL):
 *  - transit key `type = "rsa-2048|3072|4096"` (RSA — key wrapping / signing).
 *  - transit key `type = "ecdsa-p256|p384|p521"` / `"ed25519"` (classical signing).
 *  - pki role `key_type = "rsa" | "ec"`.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric keys in native Vault HCL config. */
export declare const vaultDetector: Detector;
//# sourceMappingURL=vault.d.ts.map