export declare const ML_KEM_Q = 3329;
/** Encoded encapsulation-key length: 384·k bytes of ByteEncode₁₂ + 32-byte ρ. */
export declare const ML_KEM_768_EK_BYTES: number;
/** ByteEncode₁₂: pack 256 12-bit coefficients (each in [0, q)) into 384 bytes. */
export declare function byteEncode12(coeffs: readonly number[]): Buffer;
/** ByteDecode₁₂: inverse of {@link byteEncode12} (for tests). */
export declare function byteDecode12(bytes: Buffer): number[];
/**
 * Build a WELL-FORMED ML-KEM-768 encapsulation key (1184 bytes): `ByteEncode₁₂` of
 * a random in-range `t̂` (k=3 polynomials) followed by a 32-byte ρ. Accepted by a
 * FIPS 203 encaps input check; the corresponding secret is not recoverable by us
 * (and is not needed — we only observe which group the server selects).
 */
export declare function wellFormedMlKem768Ek(): Buffer;
//# sourceMappingURL=mlkem768.d.ts.map