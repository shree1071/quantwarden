/**
 * Source-code detector for classical asymmetric cryptography in PHP — one of the
 * most-deployed backend languages, previously uncovered. Handles the three
 * dominant crypto surfaces:
 *
 *  - **ext/openssl** — `openssl_pkey_new()` (classified by its
 *    `OPENSSL_KEYTYPE_*` config, defaulting to RSA), `openssl_public_encrypt` /
 *    `openssl_private_decrypt` / `openssl_seal` / `openssl_open` (RSA), and
 *    `openssl_sign` / `openssl_verify`.
 *  - **phpseclib3** — `RSA::createKey()` / `EC::createKey()` / `DSA::createKey()`.
 *  - **libsodium** — `sodium_crypto_box`/`kx` keypairs (X25519) and
 *    `sodium_crypto_sign` keypairs (Ed25519).
 *
 * Lexical, like the other packs; the `openssl_*` / `sodium_crypto_*` prefixes and
 * `OPENSSL_KEYTYPE_*` constants are distinctive, so the false-positive rate is low.
 *
 * HNDL: RSA encryption and (EC/X)DH key agreement are harvest-now-decrypt-later
 * exposed (hndl:true); ECDSA / DSA / Ed25519 signatures are hndl:false but
 * forgeable. `openssl_pkey_new` EC and `EC::createKey` are ambiguous (feed BOTH
 * ECDSA and ECDH), classified conservatively as key-exchange-capable (hndl:true).
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in PHP (openssl, phpseclib, libsodium). */
export declare const phpDetector: Detector;
//# sourceMappingURL=php.d.ts.map