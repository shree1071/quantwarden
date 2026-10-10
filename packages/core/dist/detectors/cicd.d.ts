/**
 * Config detector: classical signing of build artifacts and code in CI/CD
 * pipelines (GitHub Actions, GitLab CI, Jenkins, Azure Pipelines, CircleCI).
 *
 * Artifact and code signatures are the signature-side analogue of "harvest now,
 * decrypt later": a release signed today with a classical key is *forgeable* once
 * a CRQC exists, and long-lived artifacts (container images, released binaries,
 * SBOM attestations) keep verifying against that classical public key for years.
 * So these are flagged `hndl:false` (a signature is not confidentiality — nothing
 * to harvest) but remain real quantum-migration debt.
 *
 * Covered command invocations (distinctive enough inside a CI file that the
 * false-positive risk is low):
 *  - `cosign sign|attest|generate-key-pair`  → sigstore/cosign uses ECDSA P-256
 *    (both key-based and keyless/Fulcio).
 *  - `gpg --detach-sign|--clearsign|--sign`   → GnuPG, classically RSA.
 *  - `jarsigner`                              → Java JAR signing (RSA/DSA/EC).
 *  - `codesign --sign|-s`                     → Apple code signing (RSA).
 *  - `minisign`                               → Ed25519 signatures.
 *
 * Gated to CI/CD pipeline files so `gpg`/`cosign` mentioned in a shell script or
 * doc does not fire; the surface here is specifically the release pipeline.
 */
import type { Detector } from "../types.js";
/** Detects classical artifact / code signing in CI/CD pipeline definitions. */
export declare const cicdDetector: Detector;
//# sourceMappingURL=cicd.d.ts.map