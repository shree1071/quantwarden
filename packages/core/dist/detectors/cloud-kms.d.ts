/**
 * Cloud-KMS SDK detector: classical asymmetric keys minted at RUNTIME through a
 * cloud KMS SDK call — the application-code counterpart to the Terraform detector
 * (which covers the infrastructure-as-code path). AWS KMS `CreateKey` /
 * `GenerateDataKeyPair` select the key type with a `KeySpec` / `KeyPairSpec`
 * (legacy `CustomerMasterKeySpec`) field whose value is `RSA_*` or `ECC_*`.
 *
 * These field names + `RSA_2048` / `ECC_NIST_P256` values are specific to the AWS
 * KMS/ACM API across every SDK language (JS/TS, Python/boto3, Java, Go, the CLI, JSON
 * policies), so a single lexical rule catches them at very low false-positive rate.
 * Covered forms: the quoted-value SDK/JSON form (`KeySpec: "RSA_2048"`), the camelCase
 * CDK/Pulumi prop form (`customerMasterKeySpec: "RSA_2048"`), and the AWS CDK ENUM
 * form (`kms.KeySpec.RSA_2048`, `KeyAlgorithm.EC_prime256v1`). Terraform uses the
 * snake_case `customer_master_key_spec`, so this never double-counts with the IaC
 * detector.
 *
 * HNDL: an RSA KMS key (encryption/KEM) and an EC KMS key (which AWS KMS can use
 * for ECDH key agreement as well as ECDSA signing) are both harvest-now-decrypt-
 * later exposed → hndl:true.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric keys provisioned via a cloud KMS SDK call. */
export declare const cloudKmsDetector: Detector;
//# sourceMappingURL=cloud-kms.d.ts.map