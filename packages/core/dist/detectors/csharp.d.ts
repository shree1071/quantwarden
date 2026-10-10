/**
 * Source-code detector for classical asymmetric cryptography in C# / .NET
 * (`System.Security.Cryptography`). Same lexical strategy as the other packs.
 * .NET exposes each algorithm through a factory (`RSA.Create()`,
 * `ECDsa.Create()`, `ECDiffieHellman.Create()`) or a concrete CSP/CNG class
 * (`RSACryptoServiceProvider`, `ECDsaCng`, …), all of which are precise signals.
 *
 * HNDL: RSA (keygen/encryption) and (EC)DH key agreement are harvest-now-
 * decrypt-later exposed (hndl:true); ECDSA/DSA signatures are hndl:false but
 * forgeable by a quantum attacker.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto in C# (System.Security.Cryptography). */
export declare const csharpDetector: Detector;
//# sourceMappingURL=csharp.d.ts.map