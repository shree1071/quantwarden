/**
 * Config detector: classical SSH **certificate-authority** cryptography — the
 * OpenSSH certificate mechanism, in which a CA key signs host/user certificates
 * (`*-cert-v01@openssh.com`) that servers and clients then trust in place of
 * bare public keys.
 *
 * This is DIFFERENT from the `ssh-kex-classical` rule in `source.ts`, and from
 * the `ssh-public-key` rule there — deliberately non-overlapping:
 *  - `ssh-kex-classical` is about the SSH *key-exchange* (finite-field DH, ECDH,
 *    curve25519): session-key *agreement*, `category: "key-exchange"`,
 *    `hndl: true` — a passively-recorded handshake is decryptable once a CRQC
 *    exists (harvest-now-decrypt-later confidentiality loss).
 *  - `ssh-public-key` flags bare `ssh-rsa AAAA…` / `ecdsa-sha2-* …` key lines.
 *  - THIS detector flags the SSH **certificate / CA signing** surface: the
 *    `*-cert-v01@openssh.com` cert key types, the `@cert-authority` known_hosts
 *    marker, the `TrustedUserCAKeys` / `HostCertificate` sshd directives, and
 *    `ssh-keygen -s` (the command that signs a certificate with a CA key).
 *
 * WHY it matters for PQC: an SSH certificate is a *signature* made by a CA key
 * over a principal's public key + validity constraints. There is no
 * confidentiality to harvest (so `hndl: false`), but every such signature
 * becomes FORGEABLE the moment a cryptographically-relevant quantum computer
 * (CRQC) can recover the classical CA private key from its public key. Forging a
 * CA signature lets an attacker mint host or user certificates that every relying
 * party accepts — a full trust-root compromise. SSH CA keys are also unusually
 * long-lived (they are the anchor an entire fleet trusts and are rotated
 * rarely), so the exposure window is large. Hence `category: "signature"`,
 * `severity: "medium"`, `confidence: "high"`.
 *
 * Two match shapes:
 *  1. The cert key type, which NAMES the signing algorithm → an accurate
 *     {@link AlgorithmFamily}:
 *      - `ssh-rsa-cert-v01@openssh.com`, `rsa-sha2-256/512-cert-v01@openssh.com` → RSA
 *      - `ecdsa-sha2-nistp256/384/521-cert-v01@openssh.com`                      → ECDSA
 *      - `ssh-ed25519-cert-v01@openssh.com`                                      → EdDSA
 *  2. The CA *deployment* directives — `TrustedUserCAKeys` / `HostCertificate`
 *     (sshd_config) and `ssh-keygen -s` (the CA signing command). These are the
 *     MOST COMMON way an SSH CA is configured, but they don't name the algorithm
 *     (that lives in the referenced key file), so they emit the `ssh-ca-config`
 *     rule with `algorithm: "unknown"` and `confidence: "medium"`.
 *
 * Precision:
 *  - Fast reject: `detect()` bails unless the file carries an SSH-CA marker
 *    (`cert-v01@openssh.com`, `@cert-authority`, `TrustedUserCAKeys`,
 *    `HostCertificate`, or `ssh-keygen -s`) — so the algorithm tokens can't be
 *    reached on unrelated config.
 *  - The cert-type tokens are the full `*-cert-v01@openssh.com` strings. The
 *    trailing `-cert-v01@openssh.com` suffix distinguishes a CA certificate type
 *    from the plain `ssh-rsa` / `ssh-ed25519` public-key tokens handled by
 *    `ssh-public-key`, so a non-cert `ssh-ed25519 AAAA…` line NEVER fires a cert
 *    rule here.
 *  - Comment lines (`#`) are masked with {@link maskCommentLines} (offsets
 *    preserved) so a commented-out cert line can't fire. Known_hosts
 *    `@cert-authority` lines start with `@`, not `#`, so masking leaves them
 *    live — exactly what we want.
 *  - Doc/prose files are excluded ({@link DOC_EXTENSIONS}), and so are program
 *    SOURCE files ({@link ANALYZABLE_SOURCE_EXTENSIONS}) — a vendored SSH library
 *    or constants table that spells a cert type as a string literal is not live
 *    CA config. SSH CA config lives in extensionless / `.conf` / `.pub` files.
 *
 * The matched line frequently carries the CA public key's base64 blob (a
 * `@cert-authority` known_hosts entry), so findings are marked `sensitive` and
 * reporters drop the snippet, consistent with `ssh-public-key`.
 */
import type { Detector } from "../types.js";
/**
 * Detects classical SSH certificate-authority signing (OpenSSH cert key types)
 * in SSH config, sshd_config, and known_hosts files. Distinct from SSH
 * key-exchange (`ssh-kex-classical`): this is the certificate SIGNATURE surface.
 */
export declare const sshCaDetector: Detector;
//# sourceMappingURL=ssh-ca.d.ts.map