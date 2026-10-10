/**
 * IaC detector: classical asymmetric cryptography (and legacy TLS config)
 * declared in AWS CloudFormation / Azure ARM (incl. Bicep-compiled JSON)
 * templates — plus CDK `cdk synth` output, which is plain CloudFormation
 * JSON. This is a distinct surface from `terraform.ts`: CloudFormation/ARM
 * use PascalCase JSON/YAML property names, never Terraform's snake_case HCL
 * attributes, so the two detectors never collide on the same file.
 *
 * Covered:
 *  - AWS::KMS::Key `KeySpec`:                    `"RSA_…"` (kem) / `"ECC_…"` (key-exchange)
 *  - AWS::CertificateManager::Certificate
 *    `KeyAlgorithm`:                             `"RSA_…"` / `"EC_…"` (certificate)
 *  - CloudFront distribution `MinimumProtocolVersion`: legacy `TLSv1` / `TLSv1.1` (tls)
 *  - ELB/ALB listener `SslPolicy`:                legacy `ELBSecurityPolicy-2016-08` /
 *                                                 `-TLS-1-0-…` / `-TLS-1-1-…` (tls)
 *  - Azure ARM `Microsoft.KeyVault` key `kty`:    `"RSA"` (kem) / `"EC"` (key-exchange)
 *
 * `KeySpec` is PascalCase and case-sensitive, so it never matches Terraform's
 * snake_case `customer_master_key_spec` (same underlying AWS API, different
 * authoring surface). A fast-reject on a CFN/ARM marker keeps this detector
 * from ever firing on arbitrary JSON/YAML that happens to contain one of
 * these property names in an unrelated context.
 */
import type { Detector } from "../types.js";
/**
 * True when a file is one THIS detector actually scans (a `.json`/`.yaml`/`.yml`
 * template). The `cloud-kms` and `jwk` detectors defer to this detector ONLY on
 * such files — deferring on any extension that merely contains a marker string
 * (e.g. a `.ts` with an `AWS::KMS` comment) would drop a real finding, since this
 * detector never runs there.
 */
export declare function isCloudTemplateFile(file: string, content: string): boolean;
/**
 * Detects classical asymmetric crypto and legacy TLS config declared in
 * AWS CloudFormation / Azure ARM (incl. Bicep-compiled JSON) templates.
 */
export declare const cloudformationDetector: Detector;
//# sourceMappingURL=cloudformation.d.ts.map