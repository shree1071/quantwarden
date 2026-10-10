/** Read one DER TLV header starting at `off`. Throws on truncation. */
function readTlv(buf, off) {
    if (off + 2 > buf.length)
        throw new RangeError("truncated DER");
    const tag = buf[off];
    let len = buf[off + 1];
    let contentStart = off + 2;
    if (len & 0x80) {
        const n = len & 0x7f;
        if (n === 0 || n > 4 || contentStart + n > buf.length)
            throw new RangeError("bad DER length");
        len = 0;
        for (let i = 0; i < n; i++)
            len = (len << 8) | buf[contentStart + i];
        contentStart += n;
    }
    const contentEnd = contentStart + len;
    if (contentEnd > buf.length)
        throw new RangeError("DER length overruns buffer");
    return { tag, contentStart, contentEnd, next: contentEnd };
}
/** Decode a DER OID value (the bytes inside the OID TLV) to dotted-decimal. */
export function decodeOid(bytes) {
    if (bytes.length === 0)
        return "";
    const first = bytes[0];
    const arcs = [Math.floor(first / 40), first % 40];
    let value = 0;
    for (let i = 1; i < bytes.length; i++) {
        value = (value << 7) | (bytes[i] & 0x7f);
        if ((bytes[i] & 0x80) === 0) {
            arcs.push(value);
            value = 0;
        }
    }
    return arcs.join(".");
}
/** Map a signature-algorithm OID to a classical family (or undefined). */
export function oidToSignatureFamily(oid) {
    if (oid.startsWith("1.2.840.113549.1.1"))
        return "RSA"; // PKCS#1 *WithRSAEncryption + RSASSA-PSS
    if (oid.startsWith("1.2.840.10045.4"))
        return "ECDSA"; // ecdsa-with-SHA*
    if (oid === "1.3.101.112" || oid === "1.3.101.113")
        return "EdDSA"; // Ed25519 / Ed448
    if (oid.startsWith("1.2.840.10040.4.3"))
        return "DSA"; // dsa-with-sha1
    return undefined;
}
/**
 * Extract the signatureAlgorithm OID (and mapped family) from a DER certificate.
 * Returns undefined if the DER can't be parsed.
 */
export function certSignatureAlgorithm(der) {
    try {
        const cert = readTlv(der, 0); // outer Certificate SEQUENCE
        if (cert.tag !== 0x30)
            return undefined;
        const tbs = readTlv(der, cert.contentStart); // tbsCertificate SEQUENCE (skip)
        const sigAlg = readTlv(der, tbs.next); // signatureAlgorithm SEQUENCE
        if (sigAlg.tag !== 0x30)
            return undefined;
        const oidTlv = readTlv(der, sigAlg.contentStart); // OID
        if (oidTlv.tag !== 0x06)
            return undefined;
        const oid = decodeOid(der.subarray(oidTlv.contentStart, oidTlv.contentEnd));
        return { oid, family: oidToSignatureFamily(oid) };
    }
    catch {
        return undefined;
    }
}
//# sourceMappingURL=x509.js.map