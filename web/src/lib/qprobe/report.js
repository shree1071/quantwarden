import { toSarif, toJson, toCbom } from "@quantakrypto/core";
import { VERSION } from "./version.js";
/**
 * Adapt a {@link RunResult} to a {@link ScanResult}. `filesScanned` is the number
 * of endpoints probed; `root` is the probed target list.
 */
export function toScanResult(run, startedAt, finishedAt) {
    return {
        root: run.reports.map((r) => `${r.target.host}:${r.target.port}`).join(", ") || "(no targets)",
        findings: run.findings,
        filesScanned: run.reports.length,
        inventory: run.inventory,
        startedAt,
        finishedAt,
        toolVersion: `qprobe ${VERSION}`,
    };
}
export function toSarifReport(run, startedAt, finishedAt) {
    return toSarif(toScanResult(run, startedAt, finishedAt));
}
export function toCbomReport(run, startedAt, finishedAt) {
    const bom = toCbom(toScanResult(run, startedAt, finishedAt));
    // core's toCbom labels the producing tool "qScan"; correct it for qProbe so a
    // merged code+endpoints CBOM attributes each plane to the right tool.
    const tools = bom.metadata.tools
        ?.components;
    if (Array.isArray(tools))
        for (const t of tools)
            if (t.name === "qScan")
                t.name = "qProbe";
    return bom;
}
export function toJsonReport(run, startedAt, finishedAt) {
    // Core's structured JSON (findings + inventory), augmented with the per-endpoint
    // probe detail qProbe uniquely carries (negotiated params, hybrid result).
    const base = toJson(toScanResult(run, startedAt, finishedAt));
    return {
        ...base,
        endpoints: run.reports.map((r) => ({
            target: `${r.target.host}:${r.target.port}`,
            mode: r.mode,
            positives: r.positives,
            tls: r.tls,
            hybrid: r.hybrid,
            ssh: r.ssh
                ? { banner: r.ssh.banner, pqKexOffered: r.ssh.pqKexOffered, error: r.ssh.error }
                : undefined,
        })),
    };
}
//# sourceMappingURL=report.js.map