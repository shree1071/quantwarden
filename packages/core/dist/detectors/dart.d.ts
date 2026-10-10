/**
 * Source detector for classical asymmetric cryptography in Dart / Flutter.
 *
 * Dart has no asymmetric crypto in its standard library, so real-world code
 * reaches for one of the two dominant pub.dev packages, and both expose their
 * primitives through distinctive class names — which makes a lexical scan (the
 * same zero-dependency strategy as every other language pack here) precise:
 *
 *  - package:pointycastle (a Bouncy Castle port). RSA via `RSAKeyGenerator`,
 *    `RSAEngine`, `RSASigner`, `PSSSigner`; EC via `ECKeyGenerator`,
 *    `ECDSASigner`, `ECDHBasicAgreement`; Edwards via `Ed25519`.
 *  - package:cryptography (Dart-native). RSA via `RsaPss`, `RsaSsaPkcs1v15`;
 *    EC via `Ecdsa`, `Ecdh`; modern curves via `Ed25519`, `X25519`.
 *
 * HNDL (harvest-now-decrypt-later) reasoning — the field that drives urgency:
 *  - RSA encryption (`RSAEngine`) and RSA key generation (`RSAKeyGenerator`,
 *    which yields keys that can decrypt) are confidentiality surfaces → hndl:true.
 *  - (EC)DH key agreement (`ECDHBasicAgreement`, `Ecdh`, `X25519`) is the classic
 *    HNDL target — recorded ciphertext is decryptable once the curve falls → hndl:true.
 *  - Signatures (`RSASigner`/`PSSSigner`/`RsaPss`/`RsaSsaPkcs1v15`, `ECDSASigner`/
 *    `Ecdsa`, `Ed25519`) are forgeable by a quantum attacker but not retroactively
 *    breakable → hndl:false.
 *  - `ECKeyGenerator` is ambiguous (an EC key can feed either ECDSA or ECDH); it is
 *    classified conservatively as an ECDSA signing key (hndl:false), the Dart default.
 *
 * Comment suppression is C-style (`//` line + `/* … *\/` block), matching Dart's
 * lexer, so commented-out crypto is not reported. The regexes are `\b`-anchored on
 * the library-specific identifiers above; none matches a bare `RSA`/`EC` substring,
 * keeping false positives low. A cheap substring fast-reject skips the regex work on
 * the overwhelming majority of `.dart` files that touch no asymmetric crypto.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in Dart / Flutter (pointycastle, cryptography). */
export declare const dartDetector: Detector;
//# sourceMappingURL=dart.d.ts.map