/**
 * Config detector: classical **code-signing CLI** invocations in build scripts —
 * the tools that sign long-lived, distributable artifacts (Windows installers,
 * Android APKs, RPM/deb packages, NuGet packages, macOS apps) with a classical
 * RSA/ECDSA signing identity.
 *
 * Why this is quantum-migration debt: a code signature produced today keeps
 * verifying against its classical public key for the life of the artifact
 * (installers and packages linger on mirrors and machines for years). Once a
 * cryptographically-relevant quantum computer (CRQC) can recover the signing
 * key from that public key, every such signature becomes *forgeable* — an
 * attacker can mint a validly-signed trojaned installer. This is the
 * signature-side analogue of harvest-now-decrypt-later: there is no
 * confidentiality to harvest, so findings are `category:"signature"`,
 * `hndl:false`, but they are real debt to inventory now.
 *
 * How this differs from the two neighbouring signing detectors — kept
 * deliberately non-overlapping:
 *
 *  - `cicd.ts` (cicdDetector) is gated to CI *pipeline* files
 *    (`.github/workflows/*.yml`, `.gitlab-ci.yml`, Jenkinsfile, azure-pipelines,
 *    CircleCI) and matches the release-automation signers there
 *    (cosign / gpg / jarsigner / codesign / minisign). It intentionally does
 *    NOT fire on a plain `build.sh`, `build.ps1`, `build.gradle`, or Makefile.
 *  - `supply-chain.ts` (supplyChainDetector) covers container/artifact signing
 *    (Docker Content Trust, CNCF Notation, in-toto) in CI files, Dockerfiles,
 *    and shell scripts.
 *
 * This detector fills the gap: the *native platform* code-signing CLIs
 * (`signtool`, `osslsigncode`, `Set-AuthenticodeSignature`, `apksigner`, Gradle
 * `signingConfigs`, `rpmsign`/`dpkg-sig`, `nuget sign`, `notarytool`) as they
 * appear in a build script of ANY extension — because that is where developers
 * actually run them. It applies everywhere except documentation
 * (a README showing `signtool sign` is prose, not a build step). One token
 * (`codesign`) can also be matched by `cicd.ts` when it appears inside a CI
 * file; a duplicate finding across the two detectors is acceptable, and keeping
 * `codesign` here means a `codesign --sign` in a hand-written `build.sh` — which
 * `cicd.ts`'s CI-file gate deliberately skips — is still caught.
 *
 * Precision comes from two gates, mirroring `dnssec.ts`: a cheap file-level
 * fast-reject (bail unless some signing-command marker is present) and
 * comment-line masking (`#` for shell/PowerShell/Makefile/Gradle, `//` for
 * Gradle/Groovy) so a commented-out signing step never fires. The rule regexes
 * themselves key on distinctive `<tool> sign` command shapes, so the residual
 * false-positive risk is low and confidence is `high`.
 */
import type { Detector } from "../types.js";
/** Detects classical code-signing CLI invocations in build scripts. */
export declare const codesignDetector: Detector;
//# sourceMappingURL=codesign.d.ts.map