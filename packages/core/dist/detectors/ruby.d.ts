/**
 * Source-code detector for classical asymmetric cryptography in Ruby. Ruby's
 * asymmetric crypto is almost entirely `OpenSSL::PKey::{RSA,EC,DSA,DH}`, which
 * makes the signals precise. Lexical, same strategy as the other packs. Beyond
 * keygen it also covers RSA public-key encryption on a loaded key, DH key
 * agreement, the type-agnostic `OpenSSL::PKey.read` loader, Ed25519 key
 * generation, and disabled TLS peer verification (`VERIFY_NONE`).
 *
 * HNDL: RSA (keygen/encryption) and (EC)DH key agreement are harvest-now-
 * decrypt-later exposed (hndl:true); DSA / Ed25519 signatures are hndl:false but
 * forgeable. `OpenSSL::PKey::EC` is ambiguous (feeds ECDSA + ECDH), so it is
 * classified conservatively as key-exchange-capable (hndl:true), like the other
 * EC keygen rules; `OpenSSL::PKey.read` loads a key of unknown type and is
 * likewise treated conservatively.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in Ruby (OpenSSL::PKey). */
export declare const rubyDetector: Detector;
//# sourceMappingURL=ruby.d.ts.map