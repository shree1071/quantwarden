/**
 * Config detector: classical key material in JSON Web Keys (JWK / JWKS, RFC 7517
 * / 7518). JWKs appear in `.json` / `.jwks` files, OIDC discovery documents, and
 * config — a real key-material surface the source packs (which look at *code*)
 * and the PEM detector (which looks at PEM markers) both miss.
 *
 * Detection keys off the JWK's distinctive JSON fields:
 *  - `"kty":"RSA"`                          → classical RSA key.
 *  - `"crv":"P-256"|"P-384"|"P-521"|…`      → classical EC key (ECDSA + ECDH).
 *  - `"crv":"Ed25519"|"Ed448"`              → EdDSA signing key.
 *  - `"crv":"X25519"|"X448"`                → classical Montgomery-curve key agreement.
 *
 * Usage-aware classification: when a key's surrounding `"use"` / `"alg"` marks it
 * as a SIGNING key (`use:"sig"`, or an `RS`/`PS`/`ES` signature alg), the finding
 * is a `signature` (`hndl:false`) — a signing key is forgeable at a CRQC but not
 * harvest-now exposed. An encryption/unspecified key stays `hndl:true`.
 *
 * Deferrals to avoid double-counting: skipped on doc extensions (a README JWK
 * example is not live) and inside CloudFormation/ARM templates, where the
 * cloudformation detector owns the `kty` of a `Microsoft.KeyVault` key resource.
 */
import type { Detector } from "../types.js";
/** Detects classical JSON Web Key (JWK/JWKS) material in any JSON/text file. */
export declare const jwkDetector: Detector;
//# sourceMappingURL=jwk.d.ts.map