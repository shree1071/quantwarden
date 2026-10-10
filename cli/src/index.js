import fs from "node:fs";
import path from "node:path";
import { runScan, generateCBOM, generateSARIF } from "./scanner.js";
import { computeFilePatch, applyPatch } from "./remediator.js";
import { renderBanner, renderQuantWardenHugeBanner, renderScore, renderFindingsTable, renderDiff, renderProbeCard, c } from "./formatter.js";
import { explainVulnerability } from "./ai.js";

/**
 * Main CLI Dispatcher
 */
export async function runCli(args = process.argv.slice(2)) {
    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
        printHelp();
        return;
    }

    if (args.includes("--version") || args.includes("-v")) {
        console.log("quantguard 1.0.0 (Sovereign PQC Platform)");
        return;
    }

    const command = args[0];
    const target = args[1] && !args[1].startsWith("-") ? args[1] : ".";

    try {
        switch (command) {
            case "scan":
                await handleScan(target, args);
                break;
            case "remediate":
            case "fix":
                await handleRemediate(target, args);
                break;
            case "cbom":
                await handleCBOM(target, args);
                break;
            case "gate":
            case "ci":
                await handleGate(target, args);
                break;
            case "explain":
            case "ai":
                await handleExplain(target, args);
                break;
            case "proxy":
                await handleProxy(target, args);
                break;
            case "probe":
            case "scan-domain":
                await handleProbe(target, args);
                break;
            case "web":
            case "ui":
                await handleWeb(args);
                break;
            case "init-ci":
            case "ci-setup":
                await handleInitCI(args);
                break;
            default:
                // If the user just ran `quantguard [path]`, treat as scan
                if (!command.startsWith("-")) {
                    await handleScan(command, args);
                } else {
                    console.error(`${c.danger}Unknown command: ${command}${c.reset}`);
                    printHelp();
                    process.exit(1);
                }
        }
    } catch (err) {
        console.error(`\n${c.danger}Error:${c.reset} ${err?.message || err}\n`);
        process.exit(1);
    }
}

/**
 * Command: scan [path]
 */
async function handleScan(target, args) {
    const format = getArg(args, "--format") || "table";
    const outFile = getArg(args, "--out");

    const summary = await runScan(target);

    if (format === "json") {
        const jsonOut = JSON.stringify(summary, null, 2);
        if (outFile) fs.writeFileSync(outFile, jsonOut, "utf8");
        else console.log(jsonOut);
        return;
    }

    if (format === "sarif") {
        const sarif = generateSARIF(summary.rawResult);
        const sarifOut = JSON.stringify(sarif, null, 2);
        if (outFile) fs.writeFileSync(outFile, sarifOut, "utf8");
        else console.log(sarifOut);
        return;
    }

    if (format === "cbom") {
        const cbom = generateCBOM(summary.rawResult);
        const cbomOut = JSON.stringify(cbom, null, 2);
        if (outFile) fs.writeFileSync(outFile, cbomOut, "utf8");
        else console.log(cbomOut);
        return;
    }

    // Default: Framer Table Output
    renderBanner("QUANTGUARD PQC SENTINEL", `Target: ${path.resolve(target)}`);
    renderScore(summary.readinessScore, summary.totalFindings, summary.hndlCount, summary.criticalCount + summary.highCount);
    renderFindingsTable(summary.findings);

    if (outFile) {
        fs.writeFileSync(outFile, JSON.stringify(summary, null, 2), "utf8");
        console.log(`  ${c.muted}Results exported to:${c.reset} ${c.blue}${outFile}${c.reset}\n`);
    }
}

/**
 * Command: remediate [path]
 */
async function handleRemediate(target, args) {
    const mode = getArg(args, "--mode") || (args.includes("--apply") ? "apply" : "diff");
    renderBanner("QUANTGUARD AUTONOMOUS REMEDIATOR", "NIST FIPS 203/204 Codemod Engine");

    const absTarget = path.resolve(target);
    const filesToAudit = [];

    if (fs.statSync(absTarget).isDirectory()) {
        const walk = (dir) => {
            for (const file of fs.readdirSync(dir)) {
                if (file.startsWith(".") || file === "node_modules" || file === "__pycache__") continue;
                const full = path.join(dir, file);
                if (fs.statSync(full).isDirectory()) walk(full);
                else filesToAudit.push(full);
            }
        };
        walk(absTarget);
    } else {
        filesToAudit.push(absTarget);
    }

    let patchedCount = 0;

    for (const f of filesToAudit) {
        const patch = computeFilePatch(f);
        if (patch.modified) {
            patchedCount++;
            console.log(`  ${c.purple}●${c.reset}  ${c.bold}${path.relative(process.cwd(), f)}${c.reset}`);
            renderDiff(path.basename(f), patch.diff);

            if (mode === "apply") {
                applyPatch(f, patch.newContent, true);
                console.log(`     ${c.success}Applied patch successfully (backup saved to ${path.basename(f)}.bak)${c.reset}\n`);
            }
        }
    }

    if (patchedCount === 0) {
        console.log(`  ${c.success}●${c.reset}  No classical cryptographic calls requiring refactoring in ${target}.\n`);
    } else if (mode === "diff") {
        console.log(`  ${c.muted}Summary: ${patchedCount} file(s) eligible for automated PQC migration.${c.reset}`);
        console.log(`  ${c.dim}Run with ${c.white}quantguard remediate ${target} --apply${c.reset}${c.dim} to apply changes.${c.reset}\n`);
    }
}

/**
 * Command: cbom [path]
 */
async function handleCBOM(target, args) {
    const outFile = getArg(args, "--out") || "quantguard-cbom.json";
    renderBanner("CERT-IN CBOM GENERATOR", "CycloneDX 1.6 Cryptographic Bill of Materials");

    const summary = await runScan(target);
    const cbom = generateCBOM(summary.rawResult);

    fs.writeFileSync(outFile, JSON.stringify(cbom, null, 2), "utf8");

    console.log(`  ${c.success}●${c.reset}  ${c.bold}CycloneDX 1.6 CBOM generated successfully!${c.reset}`);
    console.log(`     Format:       ${cbom.bomFormat} ${cbom.specVersion}`);
    console.log(`     Serial:       ${cbom.serialNumber}`);
    console.log(`     Components:   ${cbom.components?.length || 0} cryptographic assets cataloged`);
    console.log(`     Output file:  ${c.blue}${path.resolve(outFile)}${c.reset}\n`);
}

/**
 * Command: gate [path] (CI/CD Pipeline Quality Gate)
 */
async function handleGate(target, args) {
    const minScore = parseInt(getArg(args, "--min-score") || "70", 10);
    const failOn = (getArg(args, "--fail-on") || "high").toLowerCase();
    const sarifPath = getArg(args, "--sarif");

    renderBanner("QUANTGUARD CI/CD QUALITY GATE", "Automated Post-Quantum Gatekeeper");

    const summary = await runScan(target);
    renderScore(summary.readinessScore, summary.totalFindings, summary.hndlCount, summary.criticalCount + summary.highCount);

    if (sarifPath) {
        const sarif = generateSARIF(summary.rawResult);
        fs.writeFileSync(sarifPath, JSON.stringify(sarif, null, 2), "utf8");
        console.log(`  ${c.muted}Exported SARIF report to:${c.reset} ${sarifPath}\n`);
    }

    let failed = false;
    const failureReasons = [];

    if (summary.readinessScore < minScore) {
        failed = true;
        failureReasons.push(`PQC Readiness Score (${summary.readinessScore}) is below minimum threshold (${minScore}).`);
    }

    if (failOn === "critical" && summary.criticalCount > 0) {
        failed = true;
        failureReasons.push(`Found ${summary.criticalCount} critical vulnerabilities.`);
    } else if (failOn === "high" && (summary.criticalCount > 0 || summary.highCount > 0)) {
        failed = true;
        failureReasons.push(`Found ${summary.criticalCount + summary.highCount} critical/high vulnerabilities.`);
    }

    if (failed) {
        console.log(`  ${c.danger}QUALITY GATE FAILED${c.reset}`);
        for (const r of failureReasons) {
            console.log(`  ${c.danger}●${c.reset}  ${r}`);
        }
        console.log(`\n  ${c.muted}Exiting with code 1 for CI pipeline break.${c.reset}\n`);
        process.exit(1);
    } else {
        console.log(`  ${c.success}QUALITY GATE PASSED${c.reset}`);
        console.log(`  ${c.success}●${c.reset}  Code meets post-quantum readiness standards (Score >= ${minScore}).\n`);
        process.exit(0);
    }
}

/**
 * Command: explain [path] (Sovereign AI Architectural Analysis)
 */
async function handleExplain(target, args) {
    renderBanner("QUANTGUARD SOVEREIGN AI ADVISOR", "Deep Cryptographic Risk & Migration Intelligence");

    const summary = await runScan(target);
    if (!summary.findings || summary.findings.length === 0) {
        console.log(`  ${c.success}●${c.reset}  No cryptographic vulnerabilities found in ${target} to analyze.\n`);
        return;
    }

    console.log(`  ${c.muted}Analyzing ${summary.findings.length} cryptographic finding(s) with Google Gemini AI Engine...${c.reset}\n`);

    const analyses = await Promise.all(summary.findings.map(f => explainVulnerability(f)));

    for (let i = 0; i < summary.findings.length; i++) {
        const f = summary.findings[i];
        const aiAnalysis = analyses[i];

        console.log(`${c.border}┌─ [${i + 1}/${summary.findings.length}] ${c.bold}${f.file}:${f.line}${c.reset} ${c.muted}(${f.algorithm})${c.reset} ${c.border}${"─".repeat(Math.max(2, 60 - f.file.length - f.algorithm.length))}┐${c.reset}`);
        console.log(`${c.border}│${c.reset}  ${c.bold}Exposure Score:${c.reset}    ${aiAnalysis.exposureScore >= 90 ? c.danger : c.warning}${aiAnalysis.exposureScore} / 100${c.reset} ${f.hndl ? `(${c.purple}HNDL Intercept Priority${c.reset})` : ""}`);
        console.log(`${c.border}│${c.reset}  ${c.bold}Target Standard:${c.reset}   ${c.success}${aiAnalysis.nistStandard}${c.reset}`);
        console.log(`${c.border}│${c.reset}`);
        console.log(`${c.border}│${c.reset}  ${c.bold}Threat Mechanics:${c.reset}`);
        console.log(`${c.border}│${c.reset}    ${c.muted}${aiAnalysis.threatSummary}${c.reset}`);
        console.log(`${c.border}│${c.reset}`);
        console.log(`${c.border}│${c.reset}  ${c.bold}Shor's Algorithm Analysis:${c.reset}`);
        console.log(`${c.border}│${c.reset}    ${c.danger}${aiAnalysis.shorRisk}${c.reset}`);
        console.log(`${c.border}│${c.reset}`);
        console.log(`${c.border}│${c.reset}  ${c.bold}Recommended Migration Path:${c.reset}`);
        for (const step of aiAnalysis.migrationSteps) {
            console.log(`${c.border}│${c.reset}    ${c.blue}●${c.reset} ${step}`);
        }
        console.log(`${c.border}│${c.reset}`);
        console.log(`${c.border}│${c.reset}  ${c.bold}Suggested PQC Patch:${c.reset}`);
        const codeLines = aiAnalysis.recommendedCode.split("\n");
        for (const cl of codeLines) {
            console.log(`${c.border}│${c.reset}    ${c.success}${cl}${c.reset}`);
        }
        console.log(`${c.border}└───────────────────────────────────────────────────────────────────────────┘${c.reset}\n`);
    }
}

/**
 * Command: proxy [path]
 */
async function handleProxy(target, args) {
    renderBanner("QUANTGUARD PROXY HARDENER", "Nginx & Caddy PQC Hybrid Integrator");
    await handleRemediate(target, args);
}

/**
 * Command: probe [domain] (Live TLS Post-Quantum Handshake Probe)
 */
async function handleProbe(target, args) {
    const domain = (target && target !== "." && !target.startsWith("-")) ? target : (getArg(args, "--domain") || "cloudflare.com");
    const format = getArg(args, "--format") || "table";
    const outFile = getArg(args, "--out");
    const port = parseInt(getArg(args, "--port") || "443", 10);
    const skipAi = args.includes("--no-ai");

    renderBanner("QUANTGUARD LIVE DOMAIN PROBE", `Target: ${domain}:${port}`);
    console.log(`  ${c.muted}Initiating TLS 1.3 ClientHello (0x11EC X25519MLKEM768) handshake...${c.reset}`);

    const probeModuleUrl = new URL("../../web/src/probe-engine.js", import.meta.url).href;
    const { probeDomain } = await import(probeModuleUrl);
    const result = await probeDomain(domain, { port });

    if (result.status === "error") {
        console.error(`\n  ${c.danger}Probe Failed:${c.reset} ${result.error}\n`);
        process.exit(1);
    }

    if (!skipAi) {
        console.log(`  ${c.muted}Analyzing telemetry with Google Gemini 3.8 Flash AI...${c.reset}\n`);
        const aiModuleUrl = new URL("../../web/src/ai-engine.js", import.meta.url).href;
        const { generateDomainAnalysis } = await import(aiModuleUrl);
        result.ai = await generateDomainAnalysis(result);
    }

    if (format === "json") {
        const jsonOut = JSON.stringify(result, null, 2);
        if (outFile) fs.writeFileSync(outFile, jsonOut, "utf8");
        else console.log(jsonOut);
        return;
    }

    if (format === "cbom") {
        const cbomOut = JSON.stringify(result.cbom, null, 2);
        if (outFile) fs.writeFileSync(outFile, cbomOut, "utf8");
        else console.log(cbomOut);
        return;
    }

    if (format === "sarif") {
        const sarifOut = JSON.stringify(result.sarif, null, 2);
        if (outFile) fs.writeFileSync(outFile, sarifOut, "utf8");
        else console.log(sarifOut);
        return;
    }

    // Default: Terminal Framer Card
    renderProbeCard(result);

    if (outFile) {
        fs.writeFileSync(outFile, JSON.stringify(result, null, 2), "utf8");
        console.log(`  ${c.muted}Results saved to:${c.reset} ${c.blue}${outFile}${c.reset}\n`);
    }
}

/**
 * Command: web [--port 3000] (Domain Scanner Dashboard)
 */
async function handleWeb(args) {
    const port = parseInt(getArg(args, "--port") || "3000", 10);
    renderBanner("QUANTGUARD DOMAIN SENTINEL WEB DASHBOARD", "Framer PQC Sentinel Platform");
    console.log(`  ${c.muted}Booting high-performance Node.js PQC scanning server...${c.reset}`);

    const serverModuleUrl = new URL("../../web/src/server.js", import.meta.url).href;
    const { startServer } = await import(serverModuleUrl);
    await startServer(port);

    console.log(`  ${c.success}●${c.reset} ${c.bold}Web Dashboard running:${c.reset} ${c.blue}http://localhost:${port}${c.reset}`);
    console.log(`  ${c.dim}Press Ctrl+C to terminate server.${c.reset}\n`);
}

/**
 * Command: init-ci (Scaffold GitHub Actions Quality Gate)
 */
async function handleInitCI(args) {
    renderBanner("QUANTGUARD CI/CD WORKFLOW GENERATOR", "GitHub Actions PQC Quality Gate");

    const workflowDir = path.join(process.cwd(), ".github", "workflows");
    const workflowPath = path.join(workflowDir, "quantguard-gate.yml");

    if (!fs.existsSync(workflowDir)) {
        fs.mkdirSync(workflowDir, { recursive: true });
    }

    const templatePath = "C:\\Users\\shree\\quantguard-cli\\.github\\workflows\\quantguard-gate.yml";
    const templateContent = fs.readFileSync(templatePath, "utf8");

    fs.writeFileSync(workflowPath, templateContent, "utf8");

    console.log(`  ${c.success}●${c.reset} ${c.bold}GitHub Actions CI workflow installed successfully!${c.reset}`);
    console.log(`     Target:   ${c.blue}${workflowPath}${c.reset}`);
    console.log(`     Features: Automated NIST FIPS 203/204 Quality Gate`);
    console.log(`               CycloneDX 1.6 CBOM Artifact Generation`);
    console.log(`               SARIF 2.1.0 Ingestion to GitHub Security Tab\n`);
}

function getArg(args, flag) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && idx + 1 < args.length) {
        return args[idx + 1];
    }
    return null;
}

function printHelp() {
    renderQuantWardenHugeBanner();
    console.log(`
${c.bold}Quant Warden CLI${c.reset} — Autonomous Post-Quantum Cryptography Platform
NIST FIPS 203/204 Readiness Audits, Live Domain Scanner & Automated Code Migration

${c.bold}USAGE:${c.reset}
  quantguard <command> [target] [options]

${c.bold}COMMANDS:${c.reset}
  ${c.blue}scan${c.reset} [path]         Audit source code & configs for quantum vulnerabilities
  ${c.blue}probe${c.reset} <domain>      Live TLS/SSH probe for X25519MLKEM768 & HNDL posture
  ${c.blue}web${c.reset}                 Launch Framer-designed Live Domain Scanner web dashboard
  ${c.blue}explain${c.reset} [path]      AI architectural risk assessment & quantum threat analysis
  ${c.blue}remediate${c.reset} [path]    Compute and apply deterministic PQC refactoring patches
  ${c.blue}cbom${c.reset} [path]         Generate CERT-In compliant CycloneDX 1.6 CBOM
  ${c.blue}gate${c.reset} [path]         CI/CD Quality Gate (exits 1 on vulnerable crypto)
  ${c.blue}init-ci${c.reset}             Scaffold GitHub Actions CI/CD Quality Gate into current repo
  ${c.blue}proxy${c.reset} [path]        Auto-patch Nginx & Caddy with X25519Kyber768 hybrid groups

${c.bold}OPTIONS:${c.reset}
  --format <type>     Output format: table (default), json, sarif, cbom
  --out <file>        Save output report to specified file
  --mode <type>       Remediation mode: diff (default) or apply
  --apply             Directly apply code patches in-place (saves .bak)
  --min-score <num>   Minimum readiness score for CI gate (default: 70)
  --fail-on <sev>     Gate failure severity: low, medium, high (default), critical
  --sarif <file>      Export SARIF 2.1.0 report for Jenkins / GitHub Security
  --port <number>     Port for web dashboard (default: 3000)
  --no-ai             Disable Gemini AI analysis in terminal output
  -h, --help          Show help information
  -v, --version       Show version number

${c.bold}EXAMPLES:${c.reset}
  quantguard scan ./src
  quantguard probe cloudflare.com
  quantguard probe bankofamerica.com --format json
  quantguard web --port 3000
  quantguard remediate ./src --apply
  quantguard cbom ./src --out cbom.json
  quantguard gate ./src --min-score 75 --sarif results.sarif
  quantguard init-ci
`);
}

