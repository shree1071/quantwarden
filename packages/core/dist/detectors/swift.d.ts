/**
 * Source detector for classical asymmetric cryptography in Swift (Apple platforms) —
 * Apple CryptoKit and the older Security framework (`SecKey*`). Lexical, same strategy
 * as the other language packs; the API names are distinctive enough to keep the
 * false-positive risk low. Comment/string suppression is handled centrally
 * (`.swift` is a C-style comment language).
 *
 * CryptoKit:
 *  - `P256|P384|P521.Signing.PrivateKey`            → ECDSA signature (hndl:false)
 *  - `P256|P384|P521.KeyAgreement.PrivateKey`       → ECDH key agreement (hndl:true)
 *  - `Curve25519.Signing.PrivateKey`                → Ed25519 signature (hndl:false)
 *  - `Curve25519.KeyAgreement.PrivateKey`           → X25519 key agreement (hndl:true)
 * (`SecureEnclave.P256.…` forms are covered by the same P-curve regexes.)
 *
 * Security framework:
 *  - `SecKeyCreateRandomKey` with `kSecAttrKeyTypeRSA`                 → RSA
 *  - … with `kSecAttrKeyTypeEC` / `kSecAttrKeyTypeECSECPrimeRandom`    → EC
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in Swift (CryptoKit + Security framework). */
export declare const swiftDetector: Detector;
//# sourceMappingURL=swift.d.ts.map