/**
 * Config detector: classical crypto in XML Digital Signature / XML Encryption
 * (W3C XML-DSig / XML-Enc), the algorithm layer under SAML SSO, WS-Security /
 * SOAP, and signed XML documents. Enterprise identity is ubiquitous and its IdP
 * signing keys are long-lived, so a forged SAML assertion is a prime quantum
 * forgery surface; an encrypted SAML assertion (RSA key transport) is
 * harvest-now-decrypt-later exposed.
 *
 * Detection keys off the W3C algorithm URIs, which are globally-unique constant
 * strings (RFC-precise, so a lexical match is exact):
 *  - `…xmldsig#rsa-sha1` / `…xmldsig-more#rsa-sha256` …  → RSA signature (forgeable)
 *  - `…xmldsig11#dsa-sha256` / `…xmldsig#dsa-sha1`       → DSA signature
 *  - `…xmldsig-more#ecdsa-sha256` …                      → ECDSA signature
 *  - `…xmlenc#rsa-oaep(-mgf1p)` / `…xmlenc#rsa-1_5`      → RSA key transport (HNDL)
 *
 * These URIs appear both in XML config (`.xml`) and as string constants in SAML
 * library code (python3-saml, xml-crypto, OpenSAML), so the detector runs on any
 * non-doc file.
 */
import type { Detector } from "../types.js";
/** Detects classical XML-DSig / XML-Enc algorithms (SAML, WS-Security, signed XML). */
export declare const xmldsigDetector: Detector;
//# sourceMappingURL=xmldsig.d.ts.map