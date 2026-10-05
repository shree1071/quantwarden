/**
 * Framer Minimalist Terminal Formatter
 * Zero emojis, circular geometric indicators, crisp typography, clean boxes.
 */

// 24-bit TrueColor / ANSI codes
export const c = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    white: "\x1b[38;2;255;255;255m",
    muted: "\x1b[38;2;153;153;153m",
    border: "\x1b[38;2;45;45;45m",
    danger: "\x1b[38;2;255;85;119m",       // Coral Red
    warning: "\x1b[38;2;255;122;61m",     // Sunset Orange
    success: "\x1b[38;2;34;197;94m",      // Green
    blue: "\x1b[38;2;0;153;255m",         // Framer Blue
    purple: "\x1b[38;2;168;85;247m",      // Violet
    bgSurface: "\x1b[48;2;20;20;20m",
    bgDark: "\x1b[48;2;9;9;9m",
};

/**
 * Clean circular indicator for risk severity
 */
export function riskCircle(severity) {
    switch (severity?.toLowerCase()) {
        case "critical":
        case "high":
            return `${c.danger}●${c.reset}`;
        case "medium":
            return `${c.warning}●${c.reset}`;
        case "low":
            return `${c.blue}●${c.reset}`;
        default:
            return `${c.muted}○${c.reset}`;
    }
}

/**
 * Render Huge ASCII Art Banner for Quant Warden (Claude-style)
 */
export function renderQuantWardenHugeBanner() {
    const cyan = "\x1b[38;2;6;182;212m";
    const emerald = "\x1b[38;2;16;185;129m";
    const white = "\x1b[38;2;255;255;255m";
    const muted = "\x1b[38;2;120;120;120m";
    const border = "\x1b[38;2;50;50;50m";

    const logo = [
        "  ██████╗  ██╗   ██╗  █████╗  ███╗   ██╗ ████████╗",
        " ██╔═══██╗ ██║   ██║ ██╔══██╗ ████╗  ██║ ╚══██╔══╝",
        " ██║   ██║ ██║   ██║ ███████║ ██╔██╗ ██║    ██║   ",
        " ██║▄▄ ██║ ██║   ██║ ██╔══██║ ██║╚██╗██║    ██║   ",
        " ╚██████╔╝ ╚██████╔╝ ██║  ██║ ██║ ╚████║    ██║   ",
        "  ╚══▀▀═╝   ╚═════╝  ╚═╝  ╚═╝ ╚═╝  ╚═══╝    ╚═╝   ",
        " ██╗    ██╗  █████╗  ██████╗  ██████╗  ███████╗ ███╗   ██╗",
        " ██║    ██║ ██╔══██╗ ██╔══██╗ ██╔══██╗ ██╔════╝ ████╗  ██║",
        " ██║ █╗ ██║ ███████║ ██████╔╝ ██║  ██║ █████╗   ██╔██╗ ██║",
        " ██║███╗██║ ██╔══██║ ██╔══██╗ ██║  ██║ ██╔══╝   ██║╚██╗██║",
        " ╚███╔███╔╝ ██║  ██║ ██║  ██║ ██████╔╝ ███████╗ ██║ ╚████║",
        "  ╚══╝╚══╝  ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═════╝  ╚══════╝ ╚═╝  ╚═══╝"
    ];

    console.log("");
    logo.forEach((line, i) => {
        const col = i < 6 ? cyan : emerald;
        console.log(col + line + c.reset);
    });
    console.log(`  ${white}${c.bold}QUANT WARDEN${c.reset} ${muted}v1.0.0 · Sovereign Post-Quantum Cryptography Platform${c.reset}`);
    console.log(`  ${muted}NIST FIPS 203 (ML-KEM) · FIPS 204 (ML-DSA) · Harvest Now Decrypt Later Defense${c.reset}`);
    console.log(`${border}${"─".repeat(76)}${c.reset}\n`);
}

/**
 * Render Header Banner
 */
export function renderBanner(title = "QUANT WARDEN SENTINEL", subtitle = "NIST FIPS 203/204 Post-Quantum Cryptography Engine") {
    renderQuantWardenHugeBanner();
    if (title) {
        console.log(`  ${c.bold}${c.white}${title}${c.reset} ${c.muted}[${subtitle}]${c.reset}`);
        console.log(`  ${c.border}${"─".repeat(72)}${c.reset}\n`);
    }
}

/**
 * Render Score Gauge & Posture Status
 */
export function renderScore(score, total, hndl, critical) {
    const scoreColor = score >= 90 ? c.success : score >= 60 ? c.warning : c.danger;
    const statusText = score >= 90 ? "QUANTUM READY" : score >= 60 ? "MIGRATION REQUIRED" : "HIGH QUANTUM EXPOSURE";

    // Progress bar visualization
    const barWidth = 36;
    const filledWidth = Math.round((score / 100) * barWidth);
    const emptyWidth = barWidth - filledWidth;
    const bar = `${scoreColor}${"━".repeat(filledWidth)}${c.border}${"─".repeat(emptyWidth)}${c.reset}`;

    console.log(`${c.border}┌─ Cryptographic Posture ───────────────────────────────────────────────────┐${c.reset}`);
    console.log(`${c.border}│${c.reset}                                                                           ${c.border}│${c.reset}`);
    console.log(`${c.border}│${c.reset}   Readiness Score:  ${scoreColor}${c.bold}${score.toString().padStart(3)} / 100${c.reset}  ${bar}  ${scoreColor}${statusText}${c.reset}`);
    console.log(`${c.border}│${c.reset}                                                                           ${c.border}│${c.reset}`);
    console.log(`${c.border}│${c.reset}   Total Vulnerabilities: ${c.white}${c.bold}${total.toString().padEnd(4)}${c.reset}    HNDL Targets: ${c.purple}${c.bold}${hndl.toString().padEnd(4)}${c.reset}    Critical/High: ${c.danger}${c.bold}${critical.toString().padEnd(4)}${c.reset} ${c.border}│${c.reset}`);
    console.log(`${c.border}└───────────────────────────────────────────────────────────────────────────┘${c.reset}\n`);
}

/**
 * Render Findings Table
 */
export function renderFindingsTable(findings) {
    if (!findings || findings.length === 0) {
        console.log(`  ${c.success}●${c.reset}  ${c.muted}No quantum-vulnerable cryptographic primitives detected.${c.reset}\n`);
        return;
    }

    console.log(`  ${c.muted}VULNERABILITY INVENTORY (${findings.length} findings)${c.reset}`);
    console.log(`  ${c.border}${"─".repeat(76)}${c.reset}`);
    console.log(`  ${c.dim}RISK  LOCATION                  ALGORITHM    SEVERITY    HNDL     NIST TARGET${c.reset}`);
    console.log(`  ${c.border}${"─".repeat(76)}${c.reset}`);

    for (const f of findings) {
        const dot = riskCircle(f.severity);
        const loc = `${f.file}:${f.line}`.padEnd(25).slice(0, 25);
        const algo = f.algorithm.padEnd(12).slice(0, 12);
        const sevColor = f.severity === "high" || f.severity === "critical" ? c.danger : f.severity === "medium" ? c.warning : c.blue;
        const sev = `${sevColor}${f.severity.toUpperCase().padEnd(10)}${c.reset}`;
        const hndl = f.hndl ? `${c.purple}EXPOSED${c.reset}  ` : `${c.muted}NONE     ${c.reset}`;
        const target = `${c.success}ML-KEM / ML-DSA${c.reset}`;

        console.log(`   ${dot}   ${c.blue}${loc}${c.reset} ${c.white}${algo}${c.reset} ${sev}  ${hndl} ${target}`);
        if (f.message) {
            console.log(`       ${c.muted}└─ ${f.message.slice(0, 68)}${c.reset}`);
        }
    }
    console.log(`  ${c.border}${"─".repeat(76)}${c.reset}\n`);
}

/**
 * Render Unified Patch Diff
 */
export function renderDiff(filePath, diffLines) {
    console.log(`${c.bold}${c.white}--- a/${filePath}${c.reset}`);
    console.log(`${c.bold}${c.white}+++ b/${filePath} (PQC Refactored)${c.reset}`);
    for (const line of diffLines) {
        if (line.startsWith("+")) {
            console.log(`${c.success}${line}${c.reset}`);
        } else if (line.startsWith("-")) {
            console.log(`${c.danger}${line}${c.reset}`);
        } else if (line.startsWith("@@")) {
            console.log(`${c.blue}${line}${c.reset}`);
        } else {
            console.log(`${c.muted}${line}${c.reset}`);
        }
    }
    console.log("");
}

/**
 * Render Live Domain Probe Results Card
 */
export function renderProbeCard(data) {
    const isPqc = data.hybridSelected;
    const scoreColor = isPqc ? c.success : data.readinessScore >= 80 ? c.warning : c.danger;
    const statusDot = isPqc ? `${c.success}●${c.reset}` : `${c.danger}●${c.reset}`;
    const statusText = isPqc ? `${c.success}PQC HYBRID ACTIVE (X25519MLKEM768)${c.reset}` : `${c.danger}CLASSICAL ONLY (HNDL AT RISK)${c.reset}`;

    console.log(`${c.border}┌─ Endpoint Post-Quantum Posture ───────────────────────────────────────────┐${c.reset}`);
    console.log(`${c.border}│${c.reset}  Target:     ${c.bold}${c.white}${data.host}:${data.port}${c.reset}  ${c.muted}(${data.latencyMs || 45}ms latency)${c.reset}`);
    console.log(`${c.border}│${c.reset}  Status:     ${statusDot} ${statusText}`);
    console.log(`${c.border}│${c.reset}  Readiness:  ${scoreColor}${c.bold}${data.readinessScore} / 100${c.reset}`);
    console.log(`${c.border}├───────────────────────────────────────────────────────────────────────────┤${c.reset}`);
    console.log(`${c.border}│${c.reset}  ${c.bold}Key Exchange (KEX):${c.reset}    ${isPqc ? c.success : c.white}${data.selectedGroupName || data.kexGroup}${c.reset}`);
    console.log(`${c.border}│${c.reset}  ${c.bold}Cipher Suite:${c.reset}          ${c.muted}${data.cipher} (${data.protocol})${c.reset}`);
    console.log(`${c.border}│${c.reset}  ${c.bold}Leaf Certificate:${c.reset}      ${c.muted}${data.certKeyType} ${data.certKeyBits}b · Sig: ${data.certSigFamily}${c.reset}`);
    console.log(`${c.border}└───────────────────────────────────────────────────────────────────────────┘${c.reset}\n`);

    if (data.leafEndpoints && data.leafEndpoints.length > 0) {
        const reachable = data.leafEndpoints.filter(l => l.reachable);
        if (reachable.length > 0) {
            const wrongCount = reachable.filter(l => !l.hybridSelected).length;
            const correctCount = reachable.filter(l => l.hybridSelected).length;

            console.log(`  ${c.blue}●${c.reset} ${c.bold}Discovered Leaf Endpoints (${reachable.length} perimeter services):${c.reset}`);
            console.log(`    ${c.muted}Compliance Summary:${c.reset} ${correctCount > 0 ? `${c.success}${correctCount} CORRECT${c.reset}` : `${c.muted}0 CORRECT${c.reset}`} · ${wrongCount > 0 ? `${c.danger}${c.bold}${wrongCount} WRONG / VULNERABLE${c.reset}` : `${c.success}0 WRONG${c.reset}`}\n`);

            reachable.forEach((l, i) => {
                const isLast = i === reachable.length - 1;
                const branch = isLast ? "└──" : "├──";
                const isPqcLeaf = l.hybridSelected;
                const badge = isPqcLeaf 
                    ? `${c.success}${c.bold}[ ✓ CORRECT ]${c.reset} ${c.success}PQC Hybrid${c.reset}` 
                    : `${c.danger}${c.bold}[ ✕ WRONG ]  ${c.reset} ${c.danger}Classical ECDHE${c.reset}`;
                const endpointTarget = l.url || (l.path ? `${l.host}${l.path}` : `${l.host}:${l.port}`);
                console.log(`    ${c.muted}${branch}${c.reset} ${badge}  ${c.white}${l.name.padEnd(24)}${c.reset} ${c.dim}${endpointTarget.padEnd(46)}${c.reset} ${c.muted}(${l.latencyMs}ms)${c.reset}`);
            });
            console.log("");
        }
    }

    if (data.ai) {
        console.log(`  ${c.purple}●${c.reset} ${c.bold}Sovereign AI Architectural Analysis (${data.ai.provider || "Gemini 3.8 Flash"}):${c.reset}`);
        if (data.ai.executiveSummary) {
            console.log(`    ${c.muted}${data.ai.executiveSummary}${c.reset}\n`);
        }
        if (data.ai.migrationSteps && data.ai.migrationSteps.length > 0) {
            console.log(`    ${c.bold}Migration Directives:${c.reset}`);
            data.ai.migrationSteps.forEach((s, idx) => {
                console.log(`    ${c.dim}${idx + 1}.${c.reset} ${s}`);
            });
            console.log("");
        }
    }
}

