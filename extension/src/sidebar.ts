import * as vscode from "vscode";
import { PQCScanSummary } from "./scanner.js";

export class QuantguardSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "quantguard.sidebarView";
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case "openDashboard":
                    vscode.commands.executeCommand("quantguard.showPosture");
                    break;
                case "scan":
                    vscode.commands.executeCommand("quantguard.scanWorkspace");
                    break;
                case "remediate":
                    vscode.commands.executeCommand("quantguard.remediateWorkspace");
                    break;
                case "exportCBOM":
                    vscode.commands.executeCommand("quantguard.exportCBOM");
                    break;
                case "openFile":
                    vscode.workspace.openTextDocument(message.file).then(doc => {
                        vscode.window.showTextDocument(doc, {
                            selection: new vscode.Range(message.line - 1, 0, message.line - 1, 0)
                        });
                    });
                    break;
            }
        });

        this.update(null);
    }

    public update(summary: PQCScanSummary | null) {
        if (this._view) {
            this._view.webview.html = this._getHtmlForWebview(summary);
        }
    }

    public setScanning(isScanning: boolean) {
        if (this._view) {
            this._view.webview.postMessage({ command: isScanning ? "scanStarted" : "scanFinished" });
        }
    }

    private _getHtmlForWebview(summary: PQCScanSummary | null): string {
        const score = summary ? summary.readinessScore : 0;
        const total = summary ? summary.totalFindings : 0;
        const hndl = summary ? summary.hndlCount : 0;
        const critical = summary ? summary.criticalCount + summary.highCount : 0;

        const scoreColor = score >= 90 ? "#22c55e" : score >= 60 ? "#ff7a3d" : "#ff5577";
        const scoreLabel = summary 
            ? (score >= 90 ? "Quantum Ready" : score >= 60 ? "Migration Needed" : "High Exposure")
            : "No scan data";

        // Circular gauge calculations (r = 38, C = 2 * PI * 38 ≈ 238.76)
        const radius = 38;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = summary 
            ? circumference - (score / 100) * circumference
            : circumference;

        const findingsList = summary?.findings.map(f => {
            const fileName = f.absolutePath.split(/[/\\]/).pop() || f.absolutePath;
            const isHighOrCrit = f.severity === "critical" || f.severity === "high";
            const riskClass = isHighOrCrit ? "critical" : f.severity === "medium" ? "medium" : "low";

            return `
            <div class="finding-card" onclick="openLocation('${f.absolutePath.replace(/\\/g, '\\\\')}', ${f.line})">
                <div class="finding-top">
                    <div class="finding-left">
                        <div class="risk-circle ${riskClass}">
                            <div class="risk-inner"></div>
                        </div>
                        <span class="algo-name">${f.algorithm}</span>
                    </div>
                    <span class="badge ${riskClass}">${f.severity.toUpperCase()}</span>
                </div>
                <div class="finding-loc">
                    <span>${fileName}:${f.line}</span>
                    ${f.hndl ? '<span class="hndl-indicator"><span class="hndl-dot"></span>HNDL</span>' : ''}
                </div>
            </div>`;
        }).join("") || `
            <div class="empty-state">
                <span>No scan results available. Click "Rescan" below to audit.</span>
            </div>
        `;

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                    padding: 14px;
                    color: var(--ink);
                    background-color: var(--canvas);
                    letter-spacing: -0.015em;
                }

                /* Shimmer progress bar */
                .scan-shimmer {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, var(--accent-blue), #d44df0, transparent);
                    background-size: 200% 100%;
                    animation: shimmer 1.2s infinite linear;
                    z-index: 100;
                }

                .is-scanning .scan-shimmer {
                    display: block;
                }

                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                /* Score Panel */
                .hero-card {
                    background: radial-gradient(ellipse at 50% 0%, rgba(106, 76, 245, 0.12) 0%, var(--surface-1) 85%);
                    border: 1px solid var(--hairline);
                    border-radius: 14px;
                    padding: 18px 14px;
                    text-align: center;
                    margin-bottom: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .gauge-wrapper {
                    position: relative;
                    width: 96px;
                    height: 96px;
                    margin: 4px 0 10px;
                }

                .gauge-svg {
                    transform: rotate(-90deg);
                    width: 96px;
                    height: 96px;
                }

                .gauge-bg {
                    fill: none;
                    stroke: var(--surface-2);
                    stroke-width: 6;
                }

                .gauge-progress {
                    fill: none;
                    stroke: ${scoreColor};
                    stroke-width: 6;
                    stroke-linecap: round;
                    transition: stroke-dashoffset 0.8s ease;
                }

                .gauge-center {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .score-num {
                    font-size: 26px;
                    font-weight: 700;
                    color: var(--ink);
                    line-height: 1;
                }

                .score-max {
                    font-size: 10px;
                    color: var(--ink-muted);
                    font-weight: 500;
                }

                .score-status {
                    font-size: 11px;
                    font-weight: 600;
                    color: ${scoreColor};
                }

                /* Metric Pills Grid */
                .stats-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 14px;
                }

                .stat-box {
                    background: var(--surface-1);
                    border: 1px solid var(--hairline);
                    border-radius: 10px;
                    padding: 10px;
                    text-align: center;
                }

                .stat-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    margin-bottom: 2px;
                }

                .stat-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }

                .stat-dot.red { background: var(--danger); }
                .stat-dot.purple { background: var(--purple); }

                .stat-num {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--ink);
                }

                .stat-lbl {
                    font-size: 10px;
                    color: var(--ink-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    font-weight: 500;
                }

                /* Buttons */
                .btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    width: 100%;
                    padding: 8px 12px;
                    margin-bottom: 8px;
                    border-radius: 9999px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    border: 1px solid transparent;
                }

                .btn-primary {
                    background: var(--ink);
                    color: #000000;
                    font-weight: 600;
                }

                .btn-primary:hover {
                    opacity: 0.9;
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
                    width: 12px;
                    height: 12px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-top-color: var(--ink);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    display: none;
                }

                .is-scanning .spinner {
                    display: inline-block;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Findings Section */
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 14px 0 8px;
                    padding: 0 2px;
                }

                .section-title {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--ink-muted);
                    font-weight: 600;
                }

                .findings-count {
                    font-size: 10px;
                    color: var(--ink-muted);
                    background: var(--surface-2);
                    padding: 1px 6px;
                    border-radius: 9999px;
                    border: 1px solid var(--hairline);
                }

                .finding-card {
                    background: var(--surface-1);
                    border: 1px solid var(--hairline);
                    border-radius: 8px;
                    padding: 10px;
                    margin-bottom: 6px;
                    cursor: pointer;
                    transition: border-color 0.15s, background 0.15s;
                }

                .finding-card:hover {
                    background: var(--surface-2);
                    border-color: #383838;
                }

                .finding-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .finding-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                /* Risk circle */
                .risk-circle {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .risk-circle.critical {
                    background: rgba(255, 85, 119, 0.15);
                    border: 1px solid rgba(255, 85, 119, 0.4);
                }
                .risk-circle.critical .risk-inner {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: var(--danger);
                }

                .risk-circle.medium {
                    background: rgba(255, 122, 61, 0.15);
                    border: 1px solid rgba(255, 122, 61, 0.4);
                }
                .risk-circle.medium .risk-inner {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: var(--warning);
                }

                .risk-circle.low {
                    background: rgba(0, 153, 255, 0.15);
                    border: 1px solid rgba(0, 153, 255, 0.4);
                }
                .risk-circle.low .risk-inner {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: var(--accent-blue);
                }

                .algo-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--ink);
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                }

                .badge {
                    font-size: 9px;
                    font-weight: 700;
                    padding: 1px 6px;
                    border-radius: 9999px;
                    letter-spacing: 0.03em;
                }

                .badge.critical {
                    background: rgba(255, 85, 119, 0.12);
                    color: var(--danger);
                    border: 1px solid rgba(255, 85, 119, 0.3);
                }

                .badge.medium {
                    background: rgba(255, 122, 61, 0.12);
                    color: var(--warning);
                    border: 1px solid rgba(255, 122, 61, 0.3);
                }

                .badge.low {
                    background: rgba(0, 153, 255, 0.12);
                    color: var(--accent-blue);
                    border: 1px solid rgba(0, 153, 255, 0.3);
                }

                .finding-loc {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 11px;
                    color: var(--ink-muted);
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                }

                .hndl-indicator {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    color: #d8b4fe;
                    font-size: 10px;
                    font-weight: 600;
                }

                .hndl-dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: var(--purple);
                }

                .empty-state {
                    text-align: center;
                    padding: 24px 10px;
                    color: var(--ink-muted);
                    font-size: 11px;
                    border: 1px dashed var(--hairline);
                    border-radius: 8px;
                }
            </style>
        </head>
        <body id="bodyRoot">
            <div class="scan-shimmer"></div>

            <div class="hero-card">
                <div class="gauge-wrapper">
                    <svg class="gauge-svg" viewBox="0 0 88 88">
                        <circle class="gauge-bg" cx="44" cy="44" r="${radius}" />
                        <circle 
                            class="gauge-progress" 
                            cx="44" 
                            cy="44" 
                            r="${radius}" 
                            stroke-dasharray="${circumference}" 
                            stroke-dashoffset="${strokeDashoffset}" 
                        />
                    </svg>
                    <div class="gauge-center">
                        <div class="score-num">${summary ? score : "--"}</div>
                        <div class="score-max">/ 100</div>
                    </div>
                </div>
                <div class="score-status">${scoreLabel}</div>
            </div>

            <div class="stats-row">
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-dot red"></span>
                        <div class="stat-num">${critical}</div>
                    </div>
                    <div class="stat-lbl">Action Req</div>
                </div>
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-dot purple"></span>
                        <div class="stat-num">${hndl}</div>
                    </div>
                    <div class="stat-lbl">HNDL Risk</div>
                </div>
            </div>

            <button class="btn btn-primary" onclick="openDashboard()">
                Open Posture Dashboard
            </button>
            <button class="btn btn-secondary" id="rescanBtn" onclick="triggerScan()">
                <div class="spinner"></div>
                <span class="scan-text">Rescan Workspace</span>
            </button>
            <button class="btn btn-secondary" onclick="remediateWorkspace()" style="border-color: rgba(168, 85, 247, 0.4); color: #d8b4fe;">
                Auto-Remediate (ML-KEM)
            </button>
            <button class="btn btn-secondary" onclick="exportCBOM()">
                Export CycloneDX CBOM
            </button>

            <div class="section-header">
                <span class="section-title">Findings</span>
                <span class="findings-count">${total}</span>
            </div>
            <div class="findings-container">
                ${findingsList}
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                const bodyRoot = document.getElementById('bodyRoot');
                const rescanBtn = document.getElementById('rescanBtn');

                function openDashboard() {
                    vscode.postMessage({ command: 'openDashboard' });
                }

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
                        rescanBtn.querySelector('.scan-text').textContent = 'Scanning...';
                    } else {
                        bodyRoot.classList.remove('is-scanning');
                        rescanBtn.disabled = false;
                        rescanBtn.querySelector('.scan-text').textContent = 'Rescan Workspace';
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
