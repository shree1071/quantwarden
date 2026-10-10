/**
 * Config/any-scope detector: post-quantum KEM parameter / size sanity checks.
 *
 * WHY THIS LIVES IN A PQC-READINESS TOOL.
 * The rest of qScan flags *classical* crypto that must migrate to PQC. This
 * detector is the mirror image: it inspects code that has ALREADY reached for a
 * post-quantum KEM and flags two ways that migration can be quietly wrong —
 * using a *pre-standard* Kyber while claiming FIPS 203, and an internally
 * *inconsistent* parameter set (a byte size that names one ML-KEM/Kyber level
 * while the code advertises a different one). Neither is "quantum-broken", but
 * both defeat the point of migrating: a round-3 Kyber is not interoperable with
 * (nor validated as) FIPS 203 ML-KEM, and a size/level mismatch is a latent bug
 * or a mislabelled security claim. Both rules are `category: "kem"`,
 * `hndl: false` (this is about a PQC primitive's correctness, not a classical
 * confidentiality secret exposed to harvest-now-decrypt-later).
 *
 * RULE 1 — `pqc-prestandard-kem` (medium).
 * Curated identifiers for the well-known PRE-FIPS-203, round-3 CRYSTALS-Kyber
 * packages and APIs (the `pqc_kyber` / `pqcrypto-kyber` / `safe_pqc_kyber` /
 * `crystals-kyber` crates & npm packages, the reference `crypto_kem_kyber768_*`
 * / `pqcrystals_kyber*` API, and the round-3 `Kyber512/768/1024` parameter
 * names). These are NOT ML-KEM: FIPS 203 changed the KDF/domain separation and
 * the algorithm names, so a `Kyber768` build is not a `ML-KEM-768` build. The
 * finding names the exact identifier matched. Confidence starts LOW (using a
 * round-3 Kyber may be a deliberate, documented choice) and is RAISED when the
 * same file also makes a FIPS-203 / ML-KEM / NIST claim — the strong signal that
 * pre-standard Kyber is being passed off as the standard.
 *
 * RULE 2 — `pqc-parameter-mismatch` (medium, LOWER confidence, deliberately
 * conservative). A curated table of the distinctive ML-KEM / Kyber byte sizes:
 *   512  → pk 800,  sk 1632            (ct 768 is intentionally omitted: it
 *                                       collides with the level number 768)
 *   768  → pk 1184, sk 2400, ct 1088
 *   1024 → pk 1568, sk 3168            (pk and ct are both 1568)
 * The rule fires ONLY when a file (already in a Kyber / ML-KEM context) contains
 * one of these exact sizes as a standalone integer AND advertises a DIFFERENT
 * parameter level in text (`ML-KEM-1024`, `Kyber-1024`, …) AND does NOT also
 * advertise the size's own level. So `pk = 1184` (an ML-KEM-768 public key) in a
 * file that calls itself `ML-KEM-1024` fires; a file that mentions both 768 and
 * 1024 (a multi-parameter module) stays silent. Otherwise silent.
 */
import type { Detector } from "../types.js";
/**
 * Detector: post-quantum KEM parameter / size checks. Fast-rejects any file that
 * does not mention Kyber or ML-KEM at all, so it never touches ordinary code.
 */
export declare const pqcParameterDetector: Detector;
//# sourceMappingURL=pqc-parameter.d.ts.map