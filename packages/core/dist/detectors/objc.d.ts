/**
 * Source detector for classical asymmetric cryptography in Objective-C on Apple
 * platforms (iOS / macOS / tvOS / watchOS), via the Security framework's
 * `SecKey*` API (and, underneath it, CommonCrypto). This is the Objective-C
 * sibling of the Swift pack: the same Security-framework surface, reached from
 * `.m` / `.mm` translation units instead of `.swift`. Lexical, same strategy as
 * the other language packs — the Security-framework identifiers
 * (`kSecAttrKeyType*`, `kSecKeyAlgorithm*`) are distinctive enough to keep the
 * false-positive risk low.
 *
 * WHY a dedicated Objective-C pack (and not the C/C++ pack):
 *  - The C/C++ pack (`c.ts`) matches OpenSSL / libsodium / Mbed TLS / wolfSSL
 *    symbols and is gated to `.c/.h/.cc/.cpp/...` (which INCLUDES `.h`). Apple's
 *    Security framework is a different API surface entirely, so a separate pack
 *    is the clean home for it.
 *  - Objective-C headers are `.h` — shared with C/C++. To avoid double-scanning
 *    a header the C pack already owns, this detector is gated to `.m` and `.mm`
 *    ONLY (implementation files). Declarations of `SecKey*` usage live in the
 *    implementation, not the interface, so no real coverage is lost.
 *
 * Security-framework surface mapped here:
 *  - Key generation attributes (`SecKeyCreateRandomKey` / `SecKeyGeneratePair`):
 *      `kSecAttrKeyTypeRSA`                         → RSA keygen (kem, hndl:true)
 *      `kSecAttrKeyTypeEC` / `…ECSECPrimeRandom`    → EC keygen (ECDSA, signature,
 *                                                     hndl:false — EC keys default
 *                                                     to signing; conservative)
 *  - Signing / verifying (`SecKeyCreateSignature` / `SecKeyVerifySignature`):
 *      `kSecKeyAlgorithmRSASignature*`              → RSA signature (hndl:false)
 *      `kSecKeyAlgorithmECDSASignature*`            → ECDSA signature (hndl:false)
 *  - Encryption / key agreement (`SecKeyCreateEncryptedData` / `SecKeyCopyKeyExchangeResult`):
 *      `kSecKeyAlgorithmRSAEncryption*`             → RSA encryption (kem, hndl:true)
 *      `kSecKeyAlgorithmECDHKeyExchange*`           → ECDH key agreement (hndl:true)
 *
 * Comment suppression is handled inline here (Objective-C is a C-style comment
 * language): C-style block comments and `//` line comments are masked before the
 * regexes run, so commented-out crypto never fires.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in Objective-C (Apple Security framework). */
export declare const objcDetector: Detector;
//# sourceMappingURL=objc.d.ts.map