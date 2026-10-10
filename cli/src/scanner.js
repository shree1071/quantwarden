import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve pqc-tools core engine
const possiblePaths = [
    path.resolve(__dirname, "../../packages/core/dist/index.js"),
    path.resolve(__dirname, "../../pqc-tools/packages/core/dist/index.js"),
    path.resolve(process.env.USERPROFILE || "C:/Users/shree", "pqc-tools/packages/core/dist/index.js")
];

let coreModule = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        coreModule = await import(pathToFileURL(p).href);
        break;
    }
}

if (!coreModule) {
    throw new Error("Unable to locate @quantakrypto/core engine at: " + possiblePaths.join(", "));
}

const { scan, toCbom, toSarif } = coreModule;

export async function runScan(targetPath, options = {}) {
    const resolvedPath = path.resolve(targetPath);
    const rawResult = await scan({
        root: resolvedPath,
        noDefaultIgnores: !!options.noIgnores
    });

    const findings = (rawResult.findings || []).map(f => {
        const relFile = f.location?.file || path.basename(targetPath);
        const absFile = path.resolve(resolvedPath, relFile);
        return {
            file: relFile,
            absolutePath: absFile,
            line: f.location?.line || 1,
            column: f.location?.column || 1,
            algorithm: f.algorithm,
            severity: f.severity,
            hndl: !!f.hndl,
            ruleId: f.ruleId,
            message: f.message,
            snippet: f.location?.snippet || ""
        };
    });

    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let hndlCount = 0;

    for (const f of findings) {
        if (f.hndl) hndlCount++;
        switch (f.severity) {
            case "critical": criticalCount++; break;
            case "high": highCount++; break;
            case "medium": mediumCount++; break;
            case "low": lowCount++; break;
        }
    }

    return {
        target: resolvedPath,
        readinessScore: rawResult.inventory?.readinessScore ?? 100,
        totalFindings: findings.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        hndlCount,
        findings,
        rawResult,
        durationMs: rawResult.durationMs ?? 0
    };
}

export function generateCBOM(rawResult) {
    return toCbom(rawResult);
}

export function generateSARIF(rawResult) {
    return toSarif(rawResult);
}
