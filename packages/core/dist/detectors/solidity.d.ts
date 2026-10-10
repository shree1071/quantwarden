/**
 * Source detector for classical asymmetric cryptography in smart-contract /
 * blockchain source languages: Solidity (`.sol`), Move (`.move`), and Cairo
 * (`.cairo`). On-chain signature verification is pure classical elliptic-curve
 * cryptography — secp256k1 ECDSA on the EVM, Ed25519 / secp256k1 on Sui & Aptos
 * (Move), and STARK-curve ECDSA on Starknet (Cairo). A cryptographically-relevant
 * quantum computer (CRQC) could forge any of these on-chain authorizations.
 *
 * HNDL: unlike a KEM or key-agreement finding, an on-chain signature check has no
 * confidentiality to harvest — there is nothing to decrypt later — so every rule
 * here is `hndl: false`. The exposure is nonetheless SEVERE: on-chain keys often
 * ARE the custody of the asset (an account's authorization to move funds), so a
 * forged signature is a direct loss, not a downgraded confidentiality guarantee.
 * That is why the findings are `severity: high` despite `hndl: false`.
 *
 * There is no `secp256k1` value in {@link AlgorithmFamily}; secp256k1 usage is
 * mapped to `ECDSA` (the scheme), and the specific curve is named in the message.
 * The STARK-curve check is likewise `ECDSA` (ECDSA over the STARK-friendly curve).
 *
 * Patterns (verified against OpenZeppelin, Solady, Sui/Aptos Move, Starknet docs):
 *  - Solidity / EVM (secp256k1 ECDSA → `sol-ecrecover`):
 *      `ecrecover(` (the secp256k1 precompile), OpenZeppelin/Solady
 *      `ECDSA.recover(` / `ECDSA.tryRecover(`,
 *      `SignatureChecker.isValidSignatureNow(`, and imports of the
 *      `.../cryptography/ECDSA.sol` / `SignatureChecker.sol` (OZ) or Solady
 *      `utils/ECDSA.sol` libraries. Consolidated under one rule; each distinct
 *      token/import is its own finding (evidence), but they cannot double-fire on
 *      the same span.
 *  - Move / Sui & Aptos:
 *      `ed25519::signature_verify_strict(` / `ed25519_verify(` → EdDSA
 *      (`sol-ed25519`); `ecdsa_k1::secp256k1_verify(` /
 *      `ecdsa_k1::secp256k1_ecrecover(` → ECDSA secp256k1
 *      (`sol-secp256k1-verify`).
 *  - Cairo / Starknet:
 *      `check_ecdsa_signature(` (also the `ecdsa::check_ecdsa_signature(`
 *      qualified form) → ECDSA over the STARK curve (`cairo-ecdsa`).
 *
 * Comment suppression is done in-detector (Solidity/Move/Cairo all use C-style
 * `//` line comments and `/* … *\/` block comments), so a commented-out
 * verification call cannot fire. Offsets are preserved by the maskers, so finding
 * line/column stay exact.
 */
import type { Detector } from "../types.js";
/**
 * Detects classical (quantum-vulnerable) on-chain signature verification in
 * smart-contract source: Solidity/EVM secp256k1 ECDSA, Move Ed25519 & secp256k1,
 * and Cairo/Starknet STARK-curve ECDSA.
 */
export declare const solidityDetector: Detector;
//# sourceMappingURL=solidity.d.ts.map