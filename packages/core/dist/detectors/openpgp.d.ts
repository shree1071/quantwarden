/**
 * Config detector: BINARY OpenPGP key material and encrypted messages committed to
 * a repository — `secring.gpg` / `pubring.gpg` / `.gpg` / `.pgp` / `.kbx`. Armored
 * blocks (`-----BEGIN PGP …-----`, base64 text) are handled by the PEM/secrets
 * detectors; this covers the BINARY packet form, which the scan pipeline now reads
 * byte-preserving (latin1; see {@link ../walk.ts isKeystorePath}) so we can read
 * packet tags and the public-key algorithm id.
 *
 * A committed OpenPGP SECRET key is the sharp finding: a classical private key
 * (RSA/DSA/ElGamal/ECDSA/EdDSA/ECDH) in version control is exposed and
 * retroactively un-fixable. A binary PGP-encrypted message (PKESK) is
 * harvest-now-decrypt-later exposed. Secret-key matches are sensitive material, so
 * reporters drop the (binary) snippet.
 *
 * Packet framing per RFC 4880/9580. The parser is pure and bounds-checked (fuzzed).
 */
import type { Detector } from "../types.js";
/** Detects binary OpenPGP key material / messages and GnuPG keyboxes. */
export declare const openpgpDetector: Detector;
//# sourceMappingURL=openpgp.d.ts.map