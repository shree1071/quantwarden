/**
 * Source-code detector for classical, non-quantum-safe asymmetric cryptography
 * in Java / Kotlin (the JCA — Java Cryptography Architecture). Same lexical
 * strategy as the other language packs.
 *
 * The JCA funnels almost everything through a handful of factory methods keyed
 * by an ALGORITHM STRING: `KeyPairGenerator.getInstance("RSA")`,
 * `Signature.getInstance("SHA256withECDSA")`, `Cipher.getInstance("RSA/ECB/…")`,
 * `KeyAgreement.getInstance("ECDH")`. So detection here is two steps: match the
 * `<Factory>.getInstance("<alg>")` call, then classify the (factory, alg) pair
 * into a rule. Symmetric / hashing algorithms ("AES", "HmacSHA256", …) classify
 * to nothing and are ignored. A small set of BouncyCastle lightweight-API class
 * names (`new ECDSASigner()`, `new X25519Agreement()`, …) is matched directly.
 *
 * HNDL policy mirrors the other detectors: KEM / key agreement (RSA encryption,
 * (EC)DH, X25519/X448) is harvest-now-decrypt-later exposed (hndl:true);
 * signatures (RSA/ECDSA/DSA/EdDSA) are hndl:false but forgeable by a quantum
 * attacker. `KeyPairGenerator.getInstance("EC")` is ambiguous (an EC key feeds
 * both ECDSA and ECDH), so it is classified conservatively as
 * key-exchange-capable (hndl:true), exactly as the Node/Python EC keygen rules.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in Java / Kotlin (JCA + BouncyCastle). */
export declare const javaDetector: Detector;
//# sourceMappingURL=java.d.ts.map