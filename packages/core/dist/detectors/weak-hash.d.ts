/**
 * Config/source detector: weak hash functions (SHA-1, MD5) used specifically in
 * a DIGITAL-SIGNATURE or X.509 CERTIFICATE algorithm — NOT generic hashing and
 * NOT password hashing.
 *
 * WHY THIS LIVES IN A PQC-READINESS TOOL (quantum-adjacent, not quantum-broken).
 * SHA-1/MD5 are not "quantum-broken" — Grover only halves preimage strength and
 * a CRQC does not conjure signature-hash collisions. We flag them anyway, and
 * frame them as *quantum-adjacent: same migration window*:
 *   - NIST SP 800-131A Rev 3 disallows SHA-1 for generating digital signatures
 *     and retires SHA-1 entirely by 2030 — the SAME transition window the same
 *     document sets for the classical→PQC migration. One standard, one deadline.
 *   - CNSA 2.0 pairs its PQC mandate (ML-KEM / ML-DSA) with SHA-384/512; a
 *     CNSA-2.0 target that re-keys to PQC must also drop SHA-1 from its
 *     signature/certificate chain in the same effort.
 *   - A quantum-readiness migration RE-KEYS and RE-SIGNS every certificate and
 *     signature anyway. Surfacing weak signature hashes in that same pass costs
 *     nothing extra and closes a today-exploitable gap (SHA-1/MD5 signature
 *     forgery via chosen-prefix collisions) alongside the future one.
 * We deliberately do NOT claim these hashes are broken by quantum computers.
 *
 * WHY THE SCOPE IS NARROW (signature/certificate ONLY).
 * A bare `sha1(x)` or `sha1sum file` is often a perfectly acceptable
 * non-security checksum (ETags, cache keys, content addressing, Git object ids).
 * PASSWORD hashing with a weak/fast hash is a real weakness too, but it is a
 * DIFFERENT weakness (CWE-916, needs a slow KDF like Argon2/bcrypt/scrypt), a
 * different remediation, and — crucially — is NOT on the PQC migration path, so
 * it does not belong in this detector. We only fire when the weak hash is bound
 * to a signature/certificate algorithm, where "move to SHA-256+ while you re-key
 * for PQC" is exactly the right, single remediation. That binding is enforced by
 * a file-level fast-reject marker (see `hasSignatureMarker`) plus regexes that
 * only match signature/cert *algorithm identifiers*, never a lone hash call.
 *
 * SURFACES COVERED (all verified signature/certificate contexts):
 *  1. Java JCA standard names — `Signature.getInstance("SHA1withRSA")`,
 *     `"MD5withRSA"`, `"SHA1withDSA"`, `"SHA1withECDSA"` (JDK Standard Algorithm
 *     Names). Regex anchors on the `…with(RSA|DSA|ECDSA)` shape, so the token is
 *     unambiguously a signature algorithm, never a bare digest.
 *  2. .NET signing calls — a weak hash passed to `.SignData(…)` / `.SignHash(…)`
 *     as `HashAlgorithmName.SHA1` or the legacy string `"SHA1"` (e.g.
 *     `RSACryptoServiceProvider.SignData(data, "SHA1")`). Matched only INSIDE the
 *     sign call, so an unrelated `HashAlgorithmName.SHA1` used for a checksum is
 *     not flagged.
 *  3. X.509 / ASN.1 signature-algorithm identifiers — the OID *names*
 *     (`sha1WithRSAEncryption`, `md5WithRSAEncryption`, `ecdsa-with-SHA1`,
 *     `dsaWithSHA1`) and their dotted OIDs (`1.2.840.113549.1.1.5` =
 *     sha1WithRSAEncryption, `1.2.840.113549.1.1.4` = md5WithRSAEncryption,
 *     `1.2.840.10045.4.1` = ecdsa-with-SHA1). These are certificate
 *     signatureAlgorithm values by definition.
 *  4. OpenSSL CLI in a signing/cert context — `-sha1` / `-md5` on the same line
 *     as `openssl` AND a certificate/signing subcommand or flag
 *     (`req` / `x509` / `ca` / `-sign` / `-signkey`). A bare `openssl dgst -sha1
 *     file` (a checksum, no `-sign`) is intentionally NOT matched.
 *
 * NOT DUPLICATED: XML-DSig `rsa-sha1` (see `xmldsig.ts`) and DKIM `rsa-sha1`
 * (see `dkim.ts`) already emit SIGNATURE findings on their own surfaces; this
 * detector deliberately does not touch those and focuses on the Java / .NET /
 * X.509 / OpenSSL surfaces above.
 *
 * Category is `hash` (weak/pre-quantum hash usage — the previously-unused
 * category). `hndl: false` — a signature has no confidentiality to harvest.
 * `algorithm: "unknown"` — the weak *hash* is not itself an asymmetric family;
 * the signature it weakens is (RSA/ECDSA/DSA), but the finding is about the hash.
 */
import type { Detector } from "../types.js";
/**
 * Detects SHA-1 / MD5 used specifically in signature or certificate algorithms
 * (Java JCA, .NET signing calls, X.509 OID names/OIDs, OpenSSL cert/signing CLI).
 */
export declare const weakHashDetector: Detector;
//# sourceMappingURL=weak-hash.d.ts.map