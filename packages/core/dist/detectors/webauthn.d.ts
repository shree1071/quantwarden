/**
 * Config detector: classical asymmetric signature algorithms pinned by
 * WebAuthn / FIDO2 / passkey attestation & assertion, expressed as COSE
 * algorithm identifiers in relying-party code and config
 * (@simplewebauthn/server, py_webauthn, go-webauthn, webauthn4j).
 *
 * WHY WebAuthn is PQC-relevant: a WebAuthn credential is an asymmetric key
 * pair whose PUBLIC key the authenticator returns (COSE-encoded) at
 * registration; every subsequent assertion is a classical signature over the
 * authentication challenge, and attestation statements are classical
 * signatures over the credential. These are AUTHENTICATION signatures, not
 * confidentiality — there is nothing to "harvest now" — but the moment a
 * cryptographically-relevant quantum computer (CRQC) exists, an attacker who
 * has a user's registered public key (or an attestation CA's key) can FORGE
 * assertions/attestations and impersonate the user or a genuine authenticator.
 * So every finding here is `category: "signature"`, `hndl: false`.
 *
 * The relying party pins which algorithms it will accept: `pubKeyCredParams`
 * (registration) and `supportedAlgorithmIDs` (verification) enumerate COSE
 * `alg` values, and the classical ones — ES256 (COSE -7, ECDSA P-256),
 * RS256 (-257, RSA), EdDSA (-8) and their P-384/P-521/RSA-2048+ siblings — are
 * exactly the ones a PQC migration must inventory and replace once FIDO/COSE
 * standardise post-quantum algorithm identifiers.
 *
 * WHY numeric COSE ids need their own detector: the existing JWT/JOSE rule
 * only matches QUOTED alg strings (`"ES256"`, `"RS256"`). WebAuthn libraries
 * almost never write those strings — they use the NUMERIC COSE ids
 * (`alg: -7`, `supportedAlgorithmIDs: [-7, -257]`) and language-level enum
 * identifiers (`COSEAlgorithmIdentifier.ES256`, `webauthncose.AlgES256`,
 * `COSEAlgorithmIdentifier.EDDSA`). None of those carry the quote characters
 * the JWT rule keys off, so the entire WebAuthn surface is invisible today.
 *
 * Two independent match shapes per family, both gated by a file-level WebAuthn
 * marker (see `hasWebauthnMarker`) so the generic numeric `alg: -7` form can't
 * fire on unrelated code that happens to assign a small negative number:
 *
 *  1. NUMERIC form — the COSE `alg` value as an integer, either as an object
 *     member (`alg: -7`, `alg = -257`) or inside a `supportedAlgorithmIDs`
 *     array (`supportedAlgorithmIDs: [-7, -257]`). Restricted to the classical
 *     COSE numbers only; symmetric / KDF / "direct" ids (e.g. -6, HS*) are
 *     never in the alternation, so they cannot match.
 *  2. ENUM form — the COSE algorithm's identifier as written in each library:
 *     `COSEAlgorithmIdentifier.ES256|RS256|EdDSA|ECDSA_SHA_256` (webauthn4j,
 *     py_webauthn) and Go's `webauthncose.AlgES256` / `AlgRS256` / `AlgEdDSA`
 *     constants.
 *
 * COSE algorithm numbers → {@link AlgorithmFamily} (per the COSE registry, using
 * the mapping this detector is specified against):
 *  - ES256 (-7), ES384 (-35), ES512 (-36)      → ECDSA
 *  - RS256 (-257), RS384 (-258), RS512 (-259)  → RSA
 *  - EdDSA (-8)                                 → EdDSA
 *
 * Fast reject: `detect()` bails unless the file carries a distinctive WebAuthn
 * API token (`pubKeyCredParams`, `PublicKeyCredential`, `webauthn`,
 * `COSEAlgorithm`, `supportedAlgorithmIDs`, `navigator.credentials`). Those
 * tokens are the marker gate ONLY — they never produce a standalone finding.
 */
import type { Detector } from "../types.js";
/** Detects classical COSE signature algorithms pinned by WebAuthn/FIDO2 relying parties. */
export declare const webauthnDetector: Detector;
//# sourceMappingURL=webauthn.d.ts.map