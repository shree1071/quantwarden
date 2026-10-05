import * as vscode from "vscode";
import { PQCScanSummary, NormalizedFinding } from "./scanner.js";

export class QuantguardDashboardPanel {
    public static currentPanel: QuantguardDashboardPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, summary: PQCScanSummary | null) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (QuantguardDashboardPanel.currentPanel) {
            QuantguardDashboardPanel.currentPanel._panel.reveal(column);
            if (summary) {
                QuantguardDashboardPanel.currentPanel.update(summary);
            }
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            "quantguardDashboard",
            "Quantguard Posture",
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        QuantguardDashboardPanel.currentPanel = new QuantguardDashboardPanel(panel, extensionUri, summary);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, summary: PQCScanSummary | null) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case "scan":
                        vscode.commands.executeCommand("quantguard.scanWorkspace");
                        return;
                    case "remediate":
                        vscode.commands.executeCommand("quantguard.remediateWorkspace");
                        return;
                    case "exportCBOM":
                        vscode.commands.executeCommand("quantguard.exportCBOM");
                        return;
                    case "openFile":
                        vscode.workspace.openTextDocument(message.file).then(doc => {
                            vscode.window.showTextDocument(doc, {
                                selection: new vscode.Range(message.line - 1, 0, message.line - 1, 0)
                            });
                        });
                        return;
                }
            },
            null,
            this._disposables
        );

        this.update(summary);
    }

    public update(summary: PQCScanSummary | null) {
        this._panel.webview.html = this._getHtmlForWebview(summary);
    }

    public setScanning(isScanning: boolean) {
        this._panel.webview.postMessage({ command: isScanning ? "scanStarted" : "scanFinished" });
    }

    public dispose() {
        QuantguardDashboardPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(summary: PQCScanSummary | null): string {
        const score = summary ? summary.readinessScore : 0;
        const total = summary ? summary.totalFindings : 0;
        const hndl = summary ? summary.hndlCount : 0;
        const critical = summary ? summary.criticalCount : 0;
        const high = summary ? summary.highCount : 0;
        const med = summary ? summary.mediumCount : 0;
        const low = summary ? summary.lowCount : 0;

        const scoreColor = score >= 90 ? "#22c55e" : score >= 60 ? "#ff7a3d" : "#ff5577";
        const scoreLabel = score >= 90 ? "Quantum Ready" : score >= 60 ? "Migration Required" : "High Quantum Exposure";

        // SVG circle gauge calculations (r = 44, C = 2 * PI * 44 ≈ 276.46)
        const radius = 44;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (score / 100) * circumference;

        const findingsRows = summary?.findings.map(f => {
            const fileName = f.absolutePath.split(/[/\\]/).pop() || f.absolutePath;
            const isHighOrCrit = f.severity === "critical" || f.severity === "high";
            const riskClass = isHighOrCrit ? "critical" : f.severity === "medium" ? "medium" : "low";

            return `
            <tr>
                <td>
                    <div class="risk-indicator ${riskClass}">
                        <div class="indicator-inner"></div>
                    </div>
                </td>
                <td>
                    <span class="file-link" onclick="openLocation('${f.absolutePath.replace(/\\/g, '\\\\')}', ${f.line})">
                        ${fileName}<span class="line-tag">:${f.line}</span>
                    </span>
                </td>
                <td><span class="algo-name">${f.algorithm}</span></td>
                <td><span class="pill-badge ${riskClass}">${f.severity.toUpperCase()}</span></td>
                <td>
                    ${f.hndl 
                        ? '<span class="hndl-tag"><span class="hndl-dot"></span>HNDL Target</span>' 
                        : '<span class="neutral-tag">Standard</span>'}
                </td>
                <td><span class="target-std">NIST ML-KEM / ML-DSA</span></td>
            </tr>
            `;
        }).join("") || `
            <tr>
                <td colspan="6" class="empty-state">
                    No quantum vulnerabilities found in the current workspace. Click Rescan to audit.
                </td>
            </tr>
        `;

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quantguard Posture</title>
            <style>
                :root {
                    --canvas: #090909;
                    --surface-1: #141414;
                    --surface-2: #1c1c1c;
                    --hairline: #262626;
                    --hairline-soft: #1a1a1a;
                    --ink: #ffffff;
                    --ink-muted: #999999;
                    --accent-blue: #0099ff;
                    --danger: #ff5577;
                    --warning: #ff7a3d;
                    --success: #22c55e;
                    --purple: #a855f7;
                }

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
                    background-color: var(--canvas);
                    color: var(--ink);
                    padding: 32px 40px;
                    line-height: 1.4;
                    letter-spacing: -0.015em;
                }

                /* Shimmer progress bar */
                .scan-shimmer {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, var(--accent-blue), #d44df0, transparent);
                    background-size: 200% 100%;
                    animation: shimmer 1.2s infinite linear;
                    z-index: 1000;
                }

                .is-scanning .scan-shimmer {
                    display: block;
                }

                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                /* Header */
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 24px;
                    border-bottom: 1px solid var(--hairline);
                    margin-bottom: 32px;
                }

                .brand-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .brand-symbol {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    background: var(--surface-2);
                    border: 1px solid var(--hairline);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .brand-symbol svg {
                    width: 16px;
                    height: 16px;
                    stroke: var(--ink);
                }

                .title-text {
                    font-size: 18px;
                    font-weight: 600;
                    letter-spacing: -0.025em;
                    color: var(--ink);
                }

                .title-sub {
                    font-size: 12px;
                    color: var(--ink-muted);
                    font-weight: 400;
                    margin-left: 6px;
                }

                .actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                /* Framer pill buttons */
                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 18px;
                    font-size: 13px;
                    font-weight: 500;
                    border-radius: 9999px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    text-decoration: none;
                    border: 1px solid transparent;
                }

                .btn-primary {
                    background: var(--ink);
                    color: #000000;
                    font-weight: 600;
                }

                .btn-primary:hover {
                    opacity: 0.9;
                    transform: scale(0.98);
                }

                .btn-secondary {
                    background: var(--surface-1);
                    color: var(--ink);
                    border-color: var(--hairline);
                }

                .btn-secondary:hover {
                    background: var(--surface-2);
                    border-color: #333333;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Spinner */
                .spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-top-color: var(--ink);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    display: none;
                }

                .is-scanning .spinner {
                    display: inline-block;
                }

                .is-scanning .scan-btn-text {
                    opacity: 0.8;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Alert Banner */
                .scan-banner {
                    display: none;
                    background: rgba(0, 153, 255, 0.08);
                    border: 1px solid rgba(0, 153, 255, 0.25);
                    border-radius: 12px;
                    padding: 12px 18px;
                    margin-bottom: 24px;
                    align-items: center;
                    gap: 12px;
                    font-size: 13px;
                    color: var(--accent-blue);
                }

                .is-scanning .scan-banner {
                    display: flex;
                }

                /* Spotlight Hero Grid */
                .hero-grid {
                    display: grid;
                    grid-template-columns: 340px 1fr;
                    gap: 20px;
                    margin-bottom: 28px;
                }

                /* Score Card */
                .score-hero-card {
                    background: radial-gradient(ellipse at 50% 0%, rgba(106, 76, 245, 0.12) 0%, var(--surface-1) 80%);
                    border: 1px solid var(--hairline);
                    border-radius: 18px;
                    padding: 28px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .gauge-wrapper {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 10px 0 16px;
                }

                .gauge-svg {
                    transform: rotate(-90deg);
                    width: 120px;
                    height: 120px;
                }

                .gauge-bg {
                    fill: none;
                    stroke: var(--surface-2);
                    stroke-width: 8;
                }

                .gauge-progress {
                    fill: none;
                    stroke: ${scoreColor};
                    stroke-width: 8;
                    stroke-linecap: round;
                    transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .gauge-center {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .gauge-score {
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: -0.04em;
                    color: var(--ink);
                    line-height: 1;
                }

                .gauge-sub {
                    font-size: 11px;
                    color: var(--ink-muted);
                    font-weight: 500;
                    margin-top: 2px;
                }

                .score-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: ${scoreColor};
                    margin-top: 4px;
                }

                .score-caption {
                    font-size: 11px;
                    color: var(--ink-muted);
                    margin-top: 6px;
                }

                /* Metric Cards Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }

                .stat-card {
                    background: var(--surface-1);
                    border: 1px solid var(--hairline);
                    border-radius: 16px;
                    padding: 22px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transition: border-color 0.15s;
                }

                .stat-card:hover {
                    border-color: #333333;
                }

                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .stat-title {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    font-weight: 600;
                    color: var(--ink-muted);
                }

                /* Circular indicator dots */
                .circle-badge {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .circle-badge.red { background: var(--danger); box-shadow: 0 0 8px rgba(255, 85, 119, 0.4); }
                .circle-badge.purple { background: var(--purple); box-shadow: 0 0 8px rgba(168, 85, 247, 0.4); }
                .circle-badge.orange { background: var(--warning); box-shadow: 0 0 8px rgba(255, 122, 61, 0.4); }
                .circle-badge.blue { background: var(--accent-blue); box-shadow: 0 0 8px rgba(0, 153, 255, 0.4); }

                .stat-val {
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: -0.03em;
                    color: var(--ink);
                    line-height: 1;
                }

                .stat-desc {
                    font-size: 12px;
                    color: var(--ink-muted);
                    margin-top: 8px;
                }

                /* Table Section */
                .inventory-card {
                    background: var(--surface-1);
                    border: 1px solid var(--hairline);
                    border-radius: 18px;
                    padding: 24px;
                }

                .inventory-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .section-heading {
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: -0.02em;
                    color: var(--ink);
                }

                .finding-count {
                    font-size: 12px;
                    color: var(--ink-muted);
                    background: var(--surface-2);
                    padding: 3px 10px;
                    border-radius: 9999px;
                    border: 1px solid var(--hairline);
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th {
                    text-align: left;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--ink-muted);
                    padding: 12px 14px;
                    border-bottom: 1px solid var(--hairline);
                    font-weight: 600;
                }

                td {
                    padding: 14px;
                    font-size: 13px;
                    border-bottom: 1px solid var(--hairline-soft);
                    vertical-align: middle;
                }

                tr:last-child td {
                    border-bottom: none;
                }

                tr:hover td {
                    background: rgba(255, 255, 255, 0.015);
                }

                /* Concentric circle indicators */
                .risk-indicator {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .risk-indicator.critical {
                    background: rgba(255, 85, 119, 0.15);
                    border: 1px solid rgba(255, 85, 119, 0.4);
                }
                .risk-indicator.critical .indicator-inner {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--danger);
                }

                .risk-indicator.medium {
                    background: rgba(255, 122, 61, 0.15);
                    border: 1px solid rgba(255, 122, 61, 0.4);
                }
                .risk-indicator.medium .indicator-inner {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--warning);
                }

                .risk-indicator.low {
                    background: rgba(0, 153, 255, 0.15);
                    border: 1px solid rgba(0, 153, 255, 0.4);
                }
                .risk-indicator.low .indicator-inner {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--accent-blue);
                }

                .file-link {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    font-size: 12px;
                    color: var(--accent-blue);
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                }

                .file-link:hover {
                    text-decoration: underline;
                }

                .line-tag {
                    color: var(--ink-muted);
                }

                .algo-name {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    font-weight: 600;
                    color: var(--ink);
                }

                .pill-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 9999px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                }

                .pill-badge.critical {
                    background: rgba(255, 85, 119, 0.12);
                    color: var(--danger);
                    border: 1px solid rgba(255, 85, 119, 0.25);
                }

                .pill-badge.medium {
                    background: rgba(255, 122, 61, 0.12);
                    color: var(--warning);
                    border: 1px solid rgba(255, 122, 61, 0.25);
                }

                .pill-badge.low {
                    background: rgba(0, 153, 255, 0.12);
                    color: var(--accent-blue);
                    border: 1px solid rgba(0, 153, 255, 0.25);
                }

                .hndl-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: #d8b4fe;
                    font-weight: 600;
                }

                .hndl-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--purple);
                }

                .neutral-tag {
                    font-size: 11px;
                    color: var(--ink-muted);
                }

                .target-std {
                    color: var(--success);
                    font-size: 12px;
                    font-weight: 500;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--ink-muted);
                    font-size: 13px;
                }
            </style>
        </head>
        <body id="bodyRoot">
            <div class="scan-shimmer"></div>

            <div class="header">
                <div class="brand-title">
                    <div class="brand-symbol">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <div>
                        <span class="title-text">Quantguard Posture</span>
                        <span class="title-sub">NIST FIPS 203 / 204 Readiness</span>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn btn-secondary" onclick="exportCBOM()">
                        Export CycloneDX CBOM
                    </button>
                    <button class="btn btn-secondary" onclick="remediateWorkspace()" style="border-color: rgba(168, 85, 247, 0.4); color: #d8b4fe;">
                        Auto-Remediate (ML-KEM)
                    </button>
                    <button class="btn btn-primary" id="rescanBtn" onclick="triggerScan()">
                        <div class="spinner"></div>
                        <span class="scan-btn-text">Rescan Workspace</span>
                    </button>
                </div>
            </div>

            <div class="scan-banner" id="scanBanner">
                <div class="spinner" style="display: inline-block;"></div>
                <span>Auditing workspace AST and cryptographic primitives against post-quantum standards...</span>
            </div>

            <div class="hero-grid">
                <div class="score-hero-card">
                    <div class="gauge-wrapper">
                        <svg class="gauge-svg" viewBox="0 0 100 100">
                            <circle class="gauge-bg" cx="50" cy="50" r="${radius}" />
                            <circle 
                                class="gauge-progress" 
                                cx="50" 
                                cy="50" 
                                r="${radius}" 
                                stroke-dasharray="${circumference}" 
                                stroke-dashoffset="${strokeDashoffset}" 
                            />
                        </svg>
                        <div class="gauge-center">
                            <div class="gauge-score">${score}</div>
                            <div class="gauge-sub">/ 100</div>
                        </div>
                    </div>
                    <div class="score-label">${scoreLabel}</div>
                    <div class="score-caption">Composite Cryptographic Posture</div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Total Vulnerabilities</span>
                            <span class="circle-badge red"></span>
                        </div>
                        <div class="stat-val">${total}</div>
                        <div class="stat-desc">Classical asymmetric primitives</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">HNDL Targets</span>
                            <span class="circle-badge purple"></span>
                        </div>
                        <div class="stat-val">${hndl}</div>
                        <div class="stat-desc">Harvest Now, Decrypt Later risk</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Immediate Action</span>
                            <span class="circle-badge orange"></span>
                        </div>
                        <div class="stat-val">${critical + high}</div>
                        <div class="stat-desc">Critical & high severity calls</div>
                    </div>
                </div>
            </div>

            <div class="inventory-card">
                <div class="inventory-header">
                    <span class="section-heading">Cryptographic Vulnerability Inventory</span>
                    <span class="finding-count">${total} Findings</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 32px;"></th>
                            <th>File Location</th>
                            <th>Algorithm</th>
                            <th>Severity</th>
                            <th>Threat Vector</th>
                            <th>NIST Target Migration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${findingsRows}
                    </tbody>
                </table>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                const bodyRoot = document.getElementById('bodyRoot');
                const rescanBtn = document.getElementById('rescanBtn');

                function triggerScan() {
                    setLoading(true);
                    vscode.postMessage({ command: 'scan' });
                }

                function exportCBOM() {
                    vscode.postMessage({ command: 'exportCBOM' });
                }

                function remediateWorkspace() {
                    vscode.postMessage({ command: 'remediate' });
                }

                function openLocation(file, line) {
                    vscode.postMessage({ command: 'openFile', file, line });
                }

                function setLoading(loading) {
                    if (loading) {
                        bodyRoot.classList.add('is-scanning');
                        rescanBtn.disabled = true;
                        rescanBtn.querySelector('.scan-btn-text').textContent = 'Scanning...';
                    } else {
                        bodyRoot.classList.remove('is-scanning');
                        rescanBtn.disabled = false;
                        rescanBtn.querySelector('.scan-btn-text').textContent = 'Rescan Workspace';
                    }
                }

                window.addEventListener('message', event => {
                    const msg = event.data;
                    if (msg.command === 'scanStarted') {
                        setLoading(true);
                    } else if (msg.command === 'scanFinished') {
                        setLoading(false);
                    }
                });
            </script>
        </body>
        </html>`;
    }
}
