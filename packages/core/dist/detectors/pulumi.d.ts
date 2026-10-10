/**
 * IaC detector: classical asymmetric keys provisioned by Pulumi's `tls` provider
 * (`@pulumi/tls` / `pulumi_tls` / `pulumi-tls`), across the languages Pulumi programs
 * are written in (TS/JS, Python, Go). A `tls.PrivateKey` resource mints real key
 * material at deploy time — the IaC surface, like Terraform's `tls_private_key`, but
 * expressed as SDK calls in a general-purpose source file rather than HCL.
 *
 * Detection is gated to files that actually use the pulumi-tls provider (a
 * `@pulumi/tls` / `pulumi_tls` / `pulumi-tls` import or a `tls.PrivateKey` /
 * `tls.NewPrivateKey` construction), then classifies each `algorithm` value:
 *  - `"RSA"`     → RSA key (kem, HNDL)
 *  - `"ECDSA"`   → EC signing key (signature)
 *  - `"ED25519"` → Ed25519 signing key (signature)
 * Comment/string suppression is handled centrally for the host languages.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric keys provisioned by Pulumi's tls provider. */
export declare const pulumiDetector: Detector;
//# sourceMappingURL=pulumi.d.ts.map