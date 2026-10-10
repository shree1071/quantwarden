/**
 * @quantakrypto/core — public API (LOCKED CONTRACT).
 *
 * The exported NAMES and SIGNATURES below are the stable contract that
 * @quantakrypto/qscan, @quantakrypto/mcp and the GitHub Action depend on — do not change
 * them without updating all consumers. The implementations live in focused
 * modules under src/ and are re-exported here; the public surface is identical
 * to the original stub file.
 */
export * from "./types.js";
export { VERSION } from "./version.js";
export type { SarifLog } from "./report.js";
export { scan, detectors, detectFile, compareFindings } from "./scan.js";
export { verifyFix, languageToExtension } from "./verify.js";
export type { VerifyResult } from "./verify.js";
export type { ContextLevel, RedactedContext, TriageVerdict, Patch, FixProposal, } from "./agent-types.js";
export { buildContext, renderPreflight } from "./redact.js";
export { TRIAGE_RUBRIC, TRIAGE_VERDICT_SCHEMA, buildTriageRequest } from "./triage.js";
export type { TriageRequest } from "./triage.js";
export { REMEDIATE_RUBRIC, FIX_REQUEST_SCHEMA, buildRemediateRequest, } from "./remediate-request.js";
export type { RemediateRequest } from "./remediate-request.js";
export { checkPatchPolicy } from "./patch-policy.js";
export type { PolicyContext, PolicyDecision } from "./patch-policy.js";
export { withWorktree } from "./worktree.js";
export { codemodRegistry, codemodFor } from "./codemods/registry.js";
export type { Codemod } from "./codemods/registry.js";
export { configToggleCodemod } from "./codemods/config-toggle.js";
export { remediateFindings } from "./remediate-pipeline.js";
export type { RemediateOptions, RemediationResult, VerifiedPatch, RejectedPatch, } from "./remediate-pipeline.js";
export { AbortError, BudgetExceededError } from "./errors.js";
export { scanParallel } from "./parallel.js";
export type { ScanChunk } from "./parallel.js";
export { DetectorRegistry, defaultRegistry } from "./registry.js";
export { fingerprintFinding, baselineFromFindings, applyBaseline, loadBaseline, saveBaseline, BASELINE_VERSION, } from "./baseline.js";
export type { Baseline } from "./baseline.js";
export { changedFiles } from "./changed.js";
export { loadConfig, ConfigError, CONFIG_FILENAME } from "./config.js";
export type { QuantakryptoFileConfig, LoadConfigResult } from "./config.js";
export { HNDL_MODEL_VERSION, HNDL_FILENAME, SEVERITY_VULNERABILITY, CONFIDENCE_WEIGHT, CLASSIFICATION_SENSITIVITY, NON_HNDL_DISCOUNT, DEFAULT_QUANTUM_THREAT_YEARS, DEFAULT_MIGRATION_HORIZON_YEARS, DEFAULT_UNBOUND_CLASSIFICATION, HndlError, computeHndl, vulnerabilityFactor, moscaFactor, globMatch, findingFingerprint, findingScope, parseHndlMap, loadHndlMap, scaffoldHndlYaml, } from "./hndl.js";
export type { DataClassification, HndlScope, HndlDataAsset, HndlHorizon, HndlDefaults, HndlMap, ExposureRationale, FindingExposure, AssetExposure, HndlSummary, HndlReport, } from "./hndl.js";
export { walkFiles, isBinaryPath, looksMinified } from "./walk.js";
export { isAnalyzableSource, ANALYZABLE_SOURCE_EXTENSIONS, ANALYZABLE_LANGUAGES_LABEL, } from "./detect-utils.js";
export { buildInventory } from "./inventory.js";
export { vulnerableDependencies, DEP_VULNERABLE_RULE, isManifestFile } from "./dependencies.js";
export { scanAdvisories, DEP_ADVISORY_RULE } from "./advisories.js";
export type { ScanAdvisoriesOptions, ExecFn } from "./advisories.js";
export { checkProvenance, normalizeRepoUrl, PROVENANCE_RULES } from "./provenance.js";
export type { ProvenanceOptions, RepoHeadRequester, RepoHeadOutcome } from "./provenance.js";
export { SEVERITY_ORDER, severityRank, meetsThreshold, sarifLevel } from "./severity.js";
export { toSarif, toJson, formatSummary, formatTierGuidance, formatProfileGuidance, } from "./report.js";
export type { ReportOptions } from "./report.js";
export { toCbom } from "./cbom.js";
export type { CycloneDxBom, CbomComponent } from "./cbom.js";
export { mergeCboms } from "./cbom-merge.js";
export { toOpenVex } from "./vex.js";
export type { OpenVexDocument, OpenVexStatement, OpenVexOptions } from "./vex.js";
export { buildCryptoAgilityManifest, validateCryptoAgilityManifest, CRYPTO_AGILITY_MANIFEST_VERSION, CRYPTO_AGILITY_WELL_KNOWN_PATH, } from "./crypto-agility.js";
export type { CryptoAgilityManifest, CryptoAgilityManifestOptions, CryptoAgilityPosture, CryptoAgilityCbomSummary, CryptoAgilityFamily, CryptoAgilityPolicy, ManifestValidation, } from "./crypto-agility.js";
export { buildReadinessReport, signReadinessReport, verifyReadinessReport } from "./evidence.js";
export type { ReadinessReport, EvidenceFinding, ReadinessReportOptions, EvidenceSigner, SignEvidenceOptions, VerifyReadinessResult, } from "./evidence.js";
export { buildPolicyMapping, parseCryptoPolicy } from "./policy.js";
export type { CryptoPolicy, PolicyVerdict, PolicyMapping, PolicyFindingVerdict } from "./policy.js";
export { MANDATES, mandateIds, getMandate, assertKnownMandates, evaluateMandates, mandateGateFails, } from "./mandates.js";
export type { Mandate, MandateRule, MandateRuleTier, MandateStatus, MandateFindingVerdict, MandateEvaluation, MandateGateOptions, } from "./mandates.js";
export { remediationFor, remediationForTier, remediationForProfile, TIER_PARAMS, STATEFUL_HBS_NOTE, PQC_TRANSITION_NOTE, statefulHbsApplies, } from "./remediation.js";
export type { SecurityTier } from "./remediation.js";
export { PQC_STANDARDS } from "./standards.js";
export type { PqcStandards, StandardsCitation, StandardsReviewStatus } from "./standards.js";
export { STANDARDS_PROFILES, DEFAULT_PROFILE_ID, standardsProfileIds, getStandardsProfile, defaultStandardsProfile, } from "./standards-profiles.js";
export type { StandardsProfile, HybridStance } from "./standards-profiles.js";
export { CWE_BROKEN_CRYPTO, CWE_WEAK_STRENGTH, CWE_CERT_VALIDATION, CWE_HARDCODED_KEY, CWE_RISKY_PRIMITIVE, } from "./cwe.js";
//# sourceMappingURL=index.d.ts.map