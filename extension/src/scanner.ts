import * as path from "node:path";
import { 
    scan, 
    toCbom, 
    formatSummary, 
    remediationFor,
    type ScanResult, 
    type Finding, 
    type CycloneDxBom 
} from "../../pqc-tools/packages/core/src/index.js";

export interface NormalizedFinding {
    /** Absolute file path (resolved from scan root + relative location.file). */
    absolutePath: string;
    line: number;
    column?: number;
    algorithm: string;
    severity: string;
    hndl: boolean;
    ruleId: string;
    message: string;
    snippet?: string;
}

export interface PQCScanSummary {
    readinessScore: number;
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    hndlCount: number;
    findings: NormalizedFinding[];
    durationMs: number;
}

/**
 * Normalize raw pqc-tools findings into extension-friendly format.
 * Key fix: location.file (relative) → absolutePath (absolute).
 */
function normalizeFindings(findings: Finding[], scanRoot: string): NormalizedFinding[] {
    return findings.map(f => ({
        absolutePath: f.location.file
            ? path.resolve(scanRoot, f.location.file)
            : scanRoot,
        line: f.location.line,
        column: f.location.column,
        algorithm: f.algorithm,
        severity: f.severity,
        hndl: f.hndl,
        ruleId: f.ruleId,
        message: f.message,
        snippet: f.location.snippet,
    }));
}

/**
 * Scan a single source file for quantum-vulnerable cryptography.
 */
export async function scanSingleFile(filePath: string): Promise<{ result: ScanResult; findings: NormalizedFinding[] }> {
    const result = await scan({
        root: filePath,
        noDefaultIgnores: false
    });
    // For single-file scan, resolve relative to the file's directory
    const findings = normalizeFindings(result.findings, path.dirname(filePath));
    return { result, findings };
}

/**
 * Scan an entire workspace folder recursively.
 */
export async function scanWorkspaceDir(workspacePath: string): Promise<{ result: ScanResult; findings: NormalizedFinding[] }> {
    const result = await scan({
        root: workspacePath,
        noDefaultIgnores: false
    });
    const findings = normalizeFindings(result.findings, workspacePath);
    return { result, findings };
}

/**
 * Summarize scan results into clean metrics for VS Code badges and dashboard.
 */
export function summarizeScan(result: ScanResult, scanRoot: string): PQCScanSummary {
    const normalized = normalizeFindings(result.findings, scanRoot);
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let hndlCount = 0;

    for (const f of normalized) {
        if (f.hndl) {
            hndlCount++;
        }
        switch (f.severity) {
            case "critical": criticalCount++; break;
            case "high": highCount++; break;
            case "medium": mediumCount++; break;
            case "low": lowCount++; break;
        }
    }

    return {
        readinessScore: result.inventory.readinessScore,
        totalFindings: normalized.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        hndlCount,
        findings: normalized,
        durationMs: result.durationMs ?? 0
    };
}

/**
 * Export scan findings to standardized CycloneDX 1.6 CBOM format (CERT-In compliant).
 */
export function exportToCBOM(result: ScanResult): CycloneDxBom {
    return toCbom(result);
}

export { remediationFor };
