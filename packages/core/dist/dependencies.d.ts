/**
 * Curated database of packages that primarily expose classical asymmetric
 * cryptography (and are therefore quantum-vulnerable), across multiple
 * ecosystems (npm, PyPI, crates.io, Go modules, Maven, RubyGems, NuGet), plus a
 * manifest scanner that flags any of them found in the corresponding manifest
 * (package.json, requirements.txt, Cargo.toml, go.mod, pom.xml, Gemfile,
 * packages.config / *.csproj, …).
 *
 * The list is intentionally focused on libraries whose *purpose* is classical
 * public-key crypto. General-purpose packages that merely call the language's
 * stdlib crypto are out of scope here (those are caught by the source detectors).
 * Extraction is generous but every finding must match a curated entry, so a new
 * manifest format is cheap to add (see `manifestEcosystem` + `candidateNames`).
 */
import type { DependencyEcosystem, Finding, RuleMeta, VulnerableDependency } from "./types.js";
/**
 * Catalog entry for the `dep-vulnerable` rule. Dependency findings are produced
 * by the manifest scanner rather than a registered {@link Detector}, so this
 * rule is absent from `defaultRegistry.ruleCatalog()`. Reporters (SARIF) merge
 * it in so the rule advertises a GENERIC description — the per-package specifics
 * (title/severity/HNDL/remediation) live on each individual finding/result, not
 * on the shared rule. Without this, SARIF would leak the first dependency's
 * package-specific text into the rule-level `shortDescription` for every dep.
 */
export declare const DEP_VULNERABLE_RULE: RuleMeta;
/** Known quantum-vulnerable npm dependencies. */
export declare const vulnerableDependencies: VulnerableDependency[];
/**
 * The dependency ecosystem a manifest filename belongs to, or null when the file
 * is not a manifest we parse. Drives both {@link isManifestFile} and the scanner
 * dispatch — one place to add a manifest format.
 */
export declare function manifestEcosystem(file: string): DependencyEcosystem | null;
/** True if a file path looks like a manifest we can parse for dependencies. */
export declare function isManifestFile(file: string): boolean;
/**
 * Scan a single manifest file for vulnerable dependencies, dispatching by the
 * file's ecosystem ({@link manifestEcosystem}). npm manifests are parsed as
 * JSON; every other ecosystem uses the generous {@link candidateNames} extractor
 * filtered against the ecosystem-scoped database. Returns one finding per
 * distinct vulnerable package.
 */
export declare function scanManifest(file: string, content: string): Finding[];
//# sourceMappingURL=dependencies.d.ts.map