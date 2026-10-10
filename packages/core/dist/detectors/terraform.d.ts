/**
 * IaC detector: classical asymmetric cryptography provisioned by Terraform /
 * OpenTofu (`.tf`, `.tf.json`). Infrastructure-as-code mints real keys and CMKs
 * that never appear in application source, so this is a distinct surface from the
 * language packs.
 *
 * Covered:
 *  - hashicorp/tls `tls_private_key`:      `algorithm = "RSA" | "ECDSA"`
 *  - Google Cloud KMS `version_template`:  `algorithm = "RSA_SIGN_…" | "EC_SIGN_…"`
 *  - AWS KMS `aws_kms_key`:                `customer_master_key_spec = "RSA_…" | "ECC_…"`
 *  - Azure `azurerm_key_vault_key`:        `key_type = "RSA" | "EC"` (+ HSM variants)
 *
 * The HCL assignment forms (`algorithm = "…"`, `customer_master_key_spec = "…"`,
 * `key_type = "…"`) are specific enough inside `.tf` files that the false-positive
 * risk is low. EC keys are classified conservatively as key-agreement-capable
 * (hndl:true) since a provisioned EC key can feed ECDH.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto provisioned in Terraform / OpenTofu. */
export declare const terraformDetector: Detector;
//# sourceMappingURL=terraform.d.ts.map