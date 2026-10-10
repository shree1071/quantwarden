/**
 * Minimal, hand-rolled DER/X.509 parsing to extract a certificate's SIGNATURE
 * algorithm — i.e. the algorithm the issuing CA used to sign it. `node:tls`
 * exposes the leaf's public-key type but not how it was signed, and the signature
 * is the forgeable-at-Q-day part, so we read it from the raw DER.
 *
 *   Certificate ::= SEQUENCE {
 *     tbsCertificate      SEQUENCE,           -- skipped
 *     signatureAlgorithm  AlgorithmIdentifier -- SEQUENCE { OID, params } -- read
 *     signatureValue      BIT STRING }
 *
 * Pure byte work over Buffers; unit-tested with crafted DER. No crypto performed.
 */
import type { AlgorithmFamily } from "@quantakrypto/core";
/** Decode a DER OID value (the bytes inside the OID TLV) to dotted-decimal. */
export declare function decodeOid(bytes: Buffer): string;
/** Map a signature-algorithm OID to a classical family (or undefined). */
export declare function oidToSignatureFamily(oid: string): AlgorithmFamily | undefined;
interface CertSignature {
    oid: string;
    family?: AlgorithmFamily;
}
/**
 * Extract the signatureAlgorithm OID (and mapped family) from a DER certificate.
 * Returns undefined if the DER can't be parsed.
 */
export declare function certSignatureAlgorithm(der: Buffer): CertSignature | undefined;
export {};
//# sourceMappingURL=x509.d.ts.map