/**
 * Source-code detector for classical asymmetric cryptography in Elixir (the BEAM
 * / Phoenix ecosystem), previously uncovered. Handles the three common surfaces:
 *
 *  - **Erlang `:crypto`** — `:crypto.generate_key(:rsa|:ecdh|:dh|:eddsa, …)`
 *    (the curve atom disambiguates X25519/X448 from a generic ECDH curve) and
 *    `:crypto.sign/:crypto.verify(:rsa|:ecdsa|:eddsa, …)`.
 *  - **`X509`** (the `x509` hex package) — `X509.PrivateKey.new_rsa` / `new_ec`.
 *  - **`JOSE`** (erlang-jose) — `JOSE.JWK.generate_key({:rsa|:ec|:okp, …})`.
 *
 * Lexical, like the other packs; the `:crypto.` atom-module syntax and the
 * `X509.` / `JOSE.` module paths are distinctive, so the false-positive rate is low.
 *
 * HNDL: RSA and (EC/X)DH key agreement are harvest-now-decrypt-later exposed
 * (hndl:true); ECDSA / EdDSA signatures are hndl:false but forgeable.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in Elixir (:crypto, X509, JOSE). */
export declare const elixirDetector: Detector;
//# sourceMappingURL=elixir.d.ts.map