/**
 * Source-code detector for classical asymmetric cryptography in Rust. Covers the
 * common crypto crates: `rsa`, `ring`, the `*-dalek` family (ed25519/x25519),
 * the RustCrypto elliptic-curve crates (`p256`/`p384`/`k256`), and the `openssl`
 * crate bindings. Lexical, same strategy as the other packs; the `::` path
 * syntax makes the signals precise.
 *
 * HNDL: RSA encryption and (EC/X)DH key agreement are harvest-now-decrypt-later
 * exposed (hndl:true); ECDSA / DSA / Ed25519 signatures are hndl:false but
 * forgeable. `openssl::EcKey` keygen is ambiguous (feeds ECDSA + ECDH),
 * classified conservatively as key-exchange-capable (hndl:true). Also flags
 * Rust TLS certificate-validation bypasses (reqwest / rustls) — not quantum but
 * mirrors the JS tlsDetector's cert-validation category.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in Rust (rsa, ring, dalek, p256/k256). */
export declare const rustDetector: Detector;
//# sourceMappingURL=rust.d.ts.map