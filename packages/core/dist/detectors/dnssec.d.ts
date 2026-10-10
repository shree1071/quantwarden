/**
 * Config detector: classical DNSSEC signing algorithms in zone files and
 * signer/resolver config (BIND, Knot DNS, PowerDNS, `ldns-signzone` /
 * `dnssec-signzone` invocations recorded in ops config).
 *
 * DNSSEC is "communication between things" infrastructure: resolvers verify
 * DNSKEY/RRSIG chains to authenticate zone data. Unlike a KEM or key-exchange
 * finding, a DNSSEC signing key is not harvest-now-decrypt-later exposed —
 * there is no confidentiality to harvest — but every classical signature it
 * produces becomes FORGEABLE the moment a cryptographically-relevant quantum
 * computer (CRQC) exists. A forged DNSKEY/RRSIG chain lets an attacker spoof
 * DNSSEC-validated records (cache poisoning that a validating resolver would
 * otherwise reject). So these findings are `category: "signature"`,
 * `hndl: false`.
 *
 * RFC 8624 / IANA "DNSSEC Algorithm Numbers" families covered, mapped to
 * {@link AlgorithmFamily}:
 *  - RSASHA1 (5), RSASHA1-NSEC3-SHA1 (7), RSASHA256 (8), RSASHA512 (10) → RSA
 *  - ECDSAP256SHA256 (13), ECDSAP384SHA384 (14)                        → ECDSA
 *  - ED25519 (15), ED448 (16)                                          → EdDSA
 *  - DSA (3), DSA-NSEC3-SHA1 (6)                                      → DSA
 *
 * Two independent match shapes per family, both gated to `.zone` / `.db` /
 * `.conf` files AND to a file-level DNSSEC marker (see `hasDnssecMarker`
 * below) so the algorithm tokens can't fire on unrelated config:
 *
 *  1. NAMED form — the algorithm's mnemonic name, as written in signer/policy
 *     config (Knot `algorithm RSASHA256;`, a `dnssec-policy` block, BIND
 *     `algorithm: ecdsap256sha256;`) or on an `ldns-signzone -a ECDSAP256SHA256`
 *     / `dnssec-signzone -a ECDSAP256SHA256` command line. These mnemonics
 *     (`RSASHA256`, `ECDSAP384SHA384`, `ED25519`, …) are distinctive enough to
 *     match bare, EXCEPT plain `DSA`, which is too generic a token on its own
 *     (used well outside DNSSEC); that one is only matched immediately after
 *     an `algorithm` keyword.
 *  2. STRUCTURAL form — the DNSKEY presentation-format RDATA, e.g.
 *     `example.com. IN DNSKEY 257 3 8 AwEAAd...`, where the fields after the
 *     `DNSKEY` keyword are `flags protocol algorithm public-key` (RFC 4034
 *     §2). Anchoring on the literal `DNSKEY` keyword AND the literal
 *     protocol value `3` (always 3 for DNSSEC) before a restricted algorithm
 *     number keeps this precise despite being numeric. Bare algorithm
 *     numbers with no such anchor are deliberately NOT matched anywhere —
 *     `algorithm 8;` alone is far too ambiguous to key off of.
 *
 * Fast reject: `detect()` bails unless the file contains `DNSKEY`, `RRSIG`,
 * a case-insensitive `dnssec` substring (present in `dnssec-policy`,
 * `dnssec-signing: on`, etc. in any real signer config), or an
 * `ldns-signzone` / `dnssec-signzone` invocation. This stops the DSA/EdDSA
 * named-form tokens — which are individually generic outside DNSSEC — from
 * firing on, say, an unrelated SSH or TLS `.conf` file that happens to
 * mention `ED25519` or `DSA` for its own reasons.
 */
import type { Detector } from "../types.js";
/** Detects classical DNSSEC signing algorithms in zone files and signer config. */
export declare const dnssecDetector: Detector;
//# sourceMappingURL=dnssec.d.ts.map