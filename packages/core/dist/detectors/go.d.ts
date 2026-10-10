/**
 * Source-code detector for classical, non-quantum-safe asymmetric cryptography
 * in Go. Same lexical (regex-over-source) strategy as the JS/TS and Python
 * detectors. Go's crypto lives almost entirely in the highly-standardized
 * `crypto/*` standard library, so package-qualified calls (`rsa.GenerateKey`,
 * `ecdsa.SignASN1`, `ecdh.X25519`, …) are precise, low-false-positive signals.
 *
 * Covered:
 *   - crypto/rsa   — GenerateKey, EncryptOAEP/PKCS1v15, SignPKCS1v15/PSS, DecryptOAEP, VerifyPKCS1v15/PSS
 *   - crypto/ecdsa — GenerateKey, Sign/SignASN1, Verify/VerifyASN1
 *   - crypto/ecdh  — P256/P384/P521/X25519 curve construction (key agreement)
 *   - crypto/elliptic — GenerateKey / ScalarMult (classic pre-1.20 ECDH)
 *   - crypto/ed25519 — GenerateKey, Sign, Verify
 *   - crypto/dsa   — GenerateKey, GenerateParameters (deprecated)
 *   - crypto/tls   — InsecureSkipVerify, legacy MinVersion (transport config hygiene)
 *
 * HNDL policy mirrors the other detectors: KEM / key agreement (RSA encryption,
 * ECDH) is harvest-now-decrypt-later exposed (hndl:true); signatures (RSA-sign,
 * ECDSA, Ed25519, DSA) are hndl:false but still forgeable by a quantum attacker.
 * Unlike Node's ambiguous `'ec'` keygen, Go's `ecdsa.GenerateKey` is
 * signature-specific and Go's key agreement lives in the separate `crypto/ecdh`
 * package, so the two are classified precisely rather than conservatively merged.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in Go source (crypto/* standard library). */
export declare const goDetector: Detector;
//# sourceMappingURL=go.d.ts.map