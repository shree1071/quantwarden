/**
 * Source-code detector for classical, non-quantum-safe asymmetric cryptography
 * in Python. Same lexical (regex-over-source) strategy as the JS/TS detectors:
 * robust to formatting, dependency-free, and confidence-tagged per pattern.
 *
 * Covers the three libraries that carry ~all real-world Python asymmetric
 * crypto:
 *   - `cryptography` (hazmat): rsa/ec/dh/x25519/x448/ed25519/ed448 + OAEP padding
 *   - PyCryptodome (`Crypto.PublicKey`): RSA/ECC/DSA generate + PKCS1_OAEP
 *   - paramiko (SSH): RSAKey / ECDSAKey / Ed25519Key / DSSKey
 *
 * JWT/JOSE algorithm strings (`algorithm="RS256"`) are NOT handled here — the
 * language-agnostic `jwt-jose` detector now applies to Python too (a quoted
 * `"RS256"` is the same evidence in any language).
 *
 * HNDL policy mirrors the JS detectors: key agreement / KEM (RSA-OAEP, ECDH, DH,
 * X25519/X448) is harvest-now-decrypt-later exposed (hndl:true); signatures
 * (ECDSA, DSA, Ed25519/Ed448) are hndl:false but still high/low severity because
 * a quantum attacker can forge them. EC key generation is ambiguous (an EC key
 * feeds both ECDSA and ECDH), so it is classified conservatively as
 * key-exchange-capable (hndl:true), exactly as the Node `ec` keygen rule is.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in Python source. */
export declare const pythonDetector: Detector;
//# sourceMappingURL=python.d.ts.map