/**
 * Config detector: classical KEY-MANAGEMENT (JWE) algorithms in JOSE. This is
 * distinct from the JWS signature side (RS256/ES256, handled elsewhere) and from
 * the JWK key-material detector: here we flag the `alg` values that wrap a
 * content-encryption key with classical asymmetric crypto, because the encrypted
 * payload is CONFIDENTIALITY — harvest-now-decrypt-later exposed. A JWE token
 * captured today (from a log, an audit trail, a stored assertion) is decryptable
 * once the wrapping key falls to a CRQC.
 *
 * Covered `alg` (RFC 7518 §4) values:
 *  - `RSA-OAEP`, `RSA-OAEP-256`, `RSA1_5`  → RSA key encryption.
 *  - `ECDH-ES`, `ECDH-ES+A128KW`, …        → classical EC Diffie-Hellman key agreement.
 *
 * These exact strings are JOSE identifiers, so a content-level match is precise;
 * the detector applies to any file (config, JSON, source) after a fast reject.
 */
import type { Detector } from "../types.js";
/** Detects classical JWE key-management (`alg`) values in JOSE tokens/config. */
export declare const joseDetector: Detector;
//# sourceMappingURL=jose.d.ts.map