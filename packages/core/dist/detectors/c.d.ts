/**
 * Source-code detector for classical asymmetric cryptography in C / C++ using
 * OpenSSL (the dominant crypto library for the ecosystem), libsodium, and — for
 * the embedded / firmware / IoT niche — Mbed TLS (`mbedtls_*`) and wolfSSL /
 * wolfCrypt (`wc_*`). Lexical, same strategy as the other packs; every library's
 * function names are distinctive enough to keep the false-positive risk low.
 *
 * NOTE: scanning OpenSSL's OWN source/headers will naturally light up (the
 * library declares these symbols) — that is inherent to lexical scanning of a
 * crypto library, not a false positive in application code. Matches the classic
 * `*_generate_key` / `ECDSA_sign` / `ECDH_compute_key` call forms plus the
 * `EVP_RSA_gen` helper.
 *
 * HNDL: RSA encryption and (EC)DH key agreement are harvest-now-decrypt-later
 * exposed (hndl:true); ECDSA / DSA signatures are hndl:false but forgeable.
 * `EC_KEY_generate_key` is ambiguous (feeds ECDSA + ECDH), classified
 * conservatively as key-exchange-capable (hndl:true).
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in C/C++ (OpenSSL). */
export declare const cDetector: Detector;
//# sourceMappingURL=c.d.ts.map