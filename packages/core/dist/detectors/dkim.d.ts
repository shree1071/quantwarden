/**
 * Config detector: classical DKIM email-signing keys and algorithms in DNS
 * zone files, mail-server signer config (OpenDKIM), and captured
 * `DKIM-Signature:` header fields (RFC 6376 + RFC 8463).
 *
 * DKIM (DomainKeys Identified Mail) authenticates the *origin* of email: the
 * sending MTA signs selected header/body content with a private key, publishes
 * the matching public key as a DNS TXT record at
 * `<selector>._domainkey.<domain>`, and receivers verify the `DKIM-Signature`
 * header against that published key. Like DNSSEC (see `dnssec.ts`), this is a
 * pure *signature* surface: there is no confidentiality to harvest, so a DKIM
 * key is NOT harvest-now-decrypt-later exposed (`hndl: false`). What breaks
 * once a cryptographically-relevant quantum computer (CRQC) exists is
 * unforgeability — an attacker who can derive the private key from the
 * published public key can mint valid `DKIM-Signature` headers and spoof mail
 * that passes DKIM/DMARC. So these findings are `category: "signature"`.
 *
 * Crypto surface, mapped to {@link AlgorithmFamily}:
 *  - `k=rsa` DNS key-type tag / `a=rsa-sha256` / `a=rsa-sha1` (DKIM-Signature
 *    algorithm tag) / OpenDKIM `SigningAlgorithm rsa-sha256|rsa-sha1`   → RSA
 *  - `k=ed25519` DNS key-type tag / `a=ed25519-sha256` / OpenDKIM
 *    `SigningAlgorithm ed25519-sha256` (RFC 8463)                        → EdDSA
 *
 * Ed25519 DKIM (RFC 8463) is MODERN but still CLASSICAL: rotating an RSA DKIM
 * key to Ed25519 shrinks the DNS record and is good hygiene, but it is NOT a
 * post-quantum fix — an Ed25519 signature is just as forgeable under a CRQC.
 * The remediation text says so honestly: there is no standardized PQC DKIM yet;
 * the only real action is to track IETF work.
 *
 * Two match shapes are covered per family, both gated to a small config
 * extension set AND to a file-level DKIM marker (see `hasDkimMarker`) so the
 * short tag tokens (`k=rsa`, `a=rsa-sha256`) can't fire on unrelated config:
 *
 *  1. DNS KEY-TYPE tag — `k=rsa` / `k=ed25519` inside a published DKIM TXT
 *     record (`v=DKIM1; k=rsa; p=MIGf...`). Whitespace around `=` is tolerated.
 *  2. SIGNING-ALGORITHM tag — the `a=` tag of a `DKIM-Signature` header
 *     (`a=rsa-sha256`, `a=ed25519-sha256`) and the OpenDKIM `SigningAlgorithm`
 *     directive (`SigningAlgorithm rsa-sha256`). The RSA variant deliberately
 *     also matches the legacy `rsa-sha1`.
 *
 * Fast reject: `detect()` bails unless the file carries a DKIM-specific marker
 * (`v=DKIM1`, `_domainkey`, a `DKIM-Signature` field, an OpenDKIM
 * `SigningAlgorithm` directive, or a bare `k=rsa`/`k=ed25519` key-type tag).
 * This stops the generic-looking `k=rsa` / `a=rsa-sha256` tokens from firing on
 * an unrelated `.conf` that happens to contain an `a=`/`k=` assignment for its
 * own reasons. Prose is excluded twice over: `appliesTo` restricts to config
 * extensions (README/`.md` never applies), and `detect()` re-guards against
 * {@link DOC_EXTENSIONS} defensively so a docs file that slipped through a
 * broader gate could never be flagged for mentioning `k=rsa` in a sentence.
 */
import type { Detector } from "../types.js";
/** Detects classical DKIM signing keys/algorithms in zone files and mail signer config. */
export declare const dkimDetector: Detector;
//# sourceMappingURL=dkim.d.ts.map