import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import { scanSingleFile, scanWorkspaceDir, summarizeScan, exportToCBOM, PQCScanSummary, NormalizedFinding } from "./scanner.js";
import { QuantguardQuickFixProvider } from "./quickfix.js";
import { QuantguardDashboardPanel } from "./dashboard.js";
import { QuantguardSidebarProvider } from "./sidebar.js";
import { remediateWorkspaceFiles } from "./remediator.js";
import { explainVulnerability, AiTriageResult } from "./ai.js";

let diagnosticCollection: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;
let latestSummary: PQCScanSummary | null = null;
let outputChannel: vscode.OutputChannel;
let sidebarProvider: QuantguardSidebarProvider;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel("Quantguard PQC Sentinel");
    outputChannel.appendLine("[Quantguard] Initializing Post-Quantum Cryptography Sentinel Extension...");

    // 1. Diagnostics Collection
    diagnosticCollection = vscode.languages.createDiagnosticCollection("quantguard");
    context.subscriptions.push(diagnosticCollection);

    // 2. Status Bar Item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = "quantguard.showPosture";
    statusBarItem.tooltip = "Click to open Quantguard Quantum Readiness Posture Dashboard";
    updateStatusBar(null);
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // 3. Register Sidebar Provider (Activity Bar View)
    sidebarProvider = new QuantguardSidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            QuantguardSidebarProvider.viewType,
            sidebarProvider
        )
    );

    // 4. Register Quick-Fix Code Action Provider
    const quickFixProvider = new QuantguardQuickFixProvider();
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { scheme: "file" },
            quickFixProvider,
            { providedCodeActionKinds: QuantguardQuickFixProvider.providedCodeActionKinds }
        )
    );

    // 5. Command: Scan Active File
    context.subscriptions.push(
        vscode.commands.registerCommand("quantguard.scanActiveFile", async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage("No active document to scan.");
                return;
            }
            await scanDocument(editor.document, true);
        })
    );

    // 6. Command: Scan Entire Workspace
    context.subscriptions.push(
        vscode.commands.registerCommand("quantguard.scanWorkspace", async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showWarningMessage("No workspace folder open to scan.");
                return;
            }

            // Immediately notify webview views of scanning state
            if (QuantguardDashboardPanel.currentPanel) {
                QuantguardDashboardPanel.currentPanel.setScanning(true);
            }
            if (sidebarProvider) {
                sidebarProvider.setScanning(true);
            }

            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: "Quantguard",
                    cancellable: false
                },
                async (progress) => {
                    progress.report({ message: "Auditing workspace for quantum-vulnerable cryptography..." });
                    const rootPath = workspaceFolders[0].uri.fsPath;
                    outputChannel.appendLine(`[Quantguard] Scanning workspace: ${rootPath}`);

                    try {
                        const { result, findings } = await scanWorkspaceDir(rootPath);
                        latestSummary = summarizeScan(result, rootPath);

                        // Clear and populate workspace diagnostics
                        diagnosticCollection.clear();
                        const fileDiagnosticsMap = new Map<string, vscode.Diagnostic[]>();

                        for (const f of findings) {
                            const uri = vscode.Uri.file(f.absolutePath);
                            const range = new vscode.Range(
                                Math.max(0, f.line - 1),
                                0,
                                Math.max(0, f.line - 1),
                                120
                            );

                            const severity = f.severity === "critical" || f.severity === "high"
                                ? vscode.DiagnosticSeverity.Error
                                : vscode.DiagnosticSeverity.Warning;

                            const message = `[Quantguard PQC] ${f.algorithm} is vulnerable to Shor's algorithm (HNDL: ${f.hndl ? "YES" : "NO"}). ${f.message}`;
                            const diag = new vscode.Diagnostic(range, message, severity);
                            diag.source = "Quantguard PQC";
                            diag.code = f.ruleId;

                            if (!fileDiagnosticsMap.has(uri.fsPath)) {
                                fileDiagnosticsMap.set(uri.fsPath, []);
                            }
                            fileDiagnosticsMap.get(uri.fsPath)!.push(diag);
                        }

                        for (const [filePath, diags] of fileDiagnosticsMap) {
                            diagnosticCollection.set(vscode.Uri.file(filePath), diags);
                        }

                        updateStatusBar(latestSummary);

                        if (QuantguardDashboardPanel.currentPanel) {
                            QuantguardDashboardPanel.currentPanel.setScanning(false);
                            QuantguardDashboardPanel.currentPanel.update(latestSummary);
                        }
                        if (sidebarProvider) {
                            sidebarProvider.setScanning(false);
                            sidebarProvider.update(latestSummary);
                        }

                        vscode.window.showInformationMessage(
                            `Quantguard: PQC Readiness Score: ${latestSummary.readinessScore}/100 (${latestSummary.totalFindings} vulnerable calls found).`,
                            "View Dashboard",
                            "Export CBOM"
                        ).then(action => {
                            if (action === "View Dashboard") {
                                vscode.commands.executeCommand("quantguard.showPosture");
                            } else if (action === "Export CBOM") {
                                vscode.commands.executeCommand("quantguard.exportCBOM");
                            }
                        });

                    } catch (err: any) {
                        outputChannel.appendLine(`[Quantguard Error] Scan failed: ${err?.message || err}`);
                        vscode.window.showErrorMessage(`Quantguard scan failed: ${err?.message || err}`);
                        if (QuantguardDashboardPanel.currentPanel) {
                            QuantguardDashboardPanel.currentPanel.setScanning(false);
                        }
                        if (sidebarProvider) {
                            sidebarProvider.setScanning(false);
                        }
                    }
                }
            );
        })
    );

    // 7. Command: Export CERT-In Compliant CBOM (CycloneDX 1.6)
    context.subscriptions.push(
        vscode.commands.registerCommand("quantguard.exportCBOM", async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showWarningMessage("Open a workspace folder to export CBOM.");
                return;
            }

            try {
                const rootPath = workspaceFolders[0].uri.fsPath;
                const { result } = await scanWorkspaceDir(rootPath);
                const cbom = exportToCBOM(result);

                const outputDir = path.join(rootPath, ".quantguard");
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                const targetPath = path.join(outputDir, "cbom.json");
                fs.writeFileSync(targetPath, JSON.stringify(cbom, null, 2), "utf8");

                outputChannel.appendLine(`[Quantguard] Exported CycloneDX 1.6 CBOM to: ${targetPath}`);
                vscode.window.showInformationMessage(
                    `Quantguard: CERT-In compliant CBOM exported to .quantguard/cbom.json!`,
                    "Open File"
                ).then(action => {
                    if (action === "Open File") {
                        vscode.workspace.openTextDocument(targetPath).then(doc => vscode.window.showTextDocument(doc));
                    }
                });
            } catch (err: any) {
                vscode.window.showErrorMessage(`Failed to export CBOM: ${err?.message || err}`);
            }
        })
    );

    // 8. Command: Open Posture Dashboard
    context.subscriptions.push(
        vscode.commands.registerCommand("quantguard.showPosture", async () => {
            if (!latestSummary && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
                try {
                    const { result } = await scanWorkspaceDir(rootPath);
                    latestSummary = summarizeScan(result, rootPath);
                    updateStatusBar(latestSummary);
                    if (sidebarProvider) {
                        sidebarProvider.update(latestSummary);
                    }
                } catch (e) {
                    // proceed to open dashboard even if scan fails
                }
            }
            QuantguardDashboardPanel.createOrShow(context.extensionUri, latestSummary);
        })
    );

    // 9. Command: Autonomously Remediate Entire Workspace
    context.subscriptions.push(
        vscode.commands.registerCommand("quantguard.remediateWorkspace", async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showWarningMessage("Open a workspace folder to remediate.");
                return;
            }

            const rootPath = workspaceFolders[0].uri.fsPath;
            const patched = remediateWorkspaceFiles(rootPath);

            if (patched.length > 0) {
                vscode.window.showInformationMessage(
                    `Quantguard: Autonomously refactored ${patched.length} file(s) to NIST ML-KEM-768 / FIPS 203! (Backups saved to .bak)`
                );
                // Trigger rescan immediately so diagnostics, status bar, and dashboard update
                await vscode.commands.executeCommand("quantguard.scanWorkspace");
            } else {
                vscode.window.showInformationMessage("Quantguard: No classical cryptographic calls found to refactor.");
            }
        })
    );

    // 10. Command: Sovereign AI Threat & Migration Advisor
    context.subscriptions.push(
        vscode.commands.registerCommand("quantguard.aiExplain", async (diagnostic?: vscode.Diagnostic) => {
            const message = diagnostic ? diagnostic.message : "Classical asymmetric cryptography detected.";
            const code = diagnostic?.code?.toString() || "pqc-vulnerability";
            
            const isHndl = message.includes("HNDL: YES");
            const algoMatch = message.match(/\[Quantguard PQC\] ([\w-]+)/);
            const algorithm = algoMatch ? algoMatch[1] : "RSA";

            const aiAnalysis = await explainVulnerability({
                algorithm,
                ruleId: code,
                severity: "high",
                hndl: isHndl
            });

            const panel = vscode.window.createWebviewPanel(
                "quantguardAiReport",
                `Quantguard AI: ${algorithm} Post-Quantum Analysis`,
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );

            panel.webview.html = getAiAnalysisHtml(algorithm, aiAnalysis);
        })
    );

    // 9. Event Listeners for Real-Time File Auditing
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async doc => {
            const config = vscode.workspace.getConfiguration("quantguard");
            if (config.get<boolean>("enableRealtimeScanning", true)) {
                await scanDocument(doc, false);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(async doc => {
            const config = vscode.workspace.getConfiguration("quantguard");
            if (config.get<boolean>("enableRealtimeScanning", true)) {
                await scanDocument(doc, false);
            }
        })
    );

    // Automatically trigger initial workspace audit in background
    setTimeout(() => {
        vscode.commands.executeCommand("quantguard.scanWorkspace");
    }, 1500);

    outputChannel.appendLine("[Quantguard] Sentinel Extension active and monitoring for quantum threats.");
}

async function scanDocument(document: vscode.TextDocument, notify: boolean) {
    if (document.uri.scheme !== "file") {
        return;
    }

    try {
        const { findings } = await scanSingleFile(document.uri.fsPath);
        const diags: vscode.Diagnostic[] = [];

        for (const f of findings) {
            const range = new vscode.Range(
                Math.max(0, f.line - 1),
                0,
                Math.max(0, f.line - 1),
                120
            );

            const severity = f.severity === "critical" || f.severity === "high"
                ? vscode.DiagnosticSeverity.Error
                : vscode.DiagnosticSeverity.Warning;

            const message = `[Quantguard PQC] ${f.algorithm} is vulnerable to Shor's algorithm (HNDL: ${f.hndl ? "YES" : "NO"}). ${f.message}`;
            const diag = new vscode.Diagnostic(range, message, severity);
            diag.source = "Quantguard PQC";
            diag.code = f.ruleId;
            diags.push(diag);
        }

        diagnosticCollection.set(document.uri, diags);

        if (notify) {
            vscode.window.showInformationMessage(
                `Quantguard: Scanned ${path.basename(document.fileName)} — ${diags.length} vulnerabilities detected.`
            );
        }
    } catch (e: any) {
        outputChannel.appendLine(`[Quantguard Document Error] ${e?.message || e}`);
    }
}

function updateStatusBar(summary: PQCScanSummary | null) {
    if (!summary) {
        statusBarItem.text = `$(shield) PQC: Ready`;
        statusBarItem.tooltip = "Quantguard: Click to scan workspace and open Posture Dashboard";
        statusBarItem.backgroundColor = undefined;
        return;
    }

    const score = summary.readinessScore;
    const count = summary.totalFindings;

    statusBarItem.text = `$(shield) PQC: ${score}/100 (${count} Vulns) — Dashboard`;
    statusBarItem.tooltip = `Quantguard Post-Quantum Readiness Score: ${score}/100. Click to open Quantum Readiness Posture Dashboard.`;
    if (score < 60) {
        statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
    } else if (score < 90) {
        statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
    } else {
        statusBarItem.backgroundColor = undefined;
    }
}

export function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.clear();
        diagnosticCollection.dispose();
    }
}

function getAiAnalysisHtml(algo: string, ai: AiTriageResult): string {
    const steps = ai.migrationSteps.map(s => `<li>${s}</li>`).join("");
    const scoreColor = ai.exposureScore >= 90 ? "#ff5577" : "#ff7a3d";

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            :root {
                --canvas: #090909;
                --surface-1: #141414;
                --surface-2: #1c1c1c;
                --hairline: #262626;
                --ink: #ffffff;
                --ink-muted: #999999;
                --accent-blue: #0099ff;
                --danger: #ff5577;
                --success: #22c55e;
            }
            body {
                background: var(--canvas);
                color: var(--ink);
                font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
                padding: 24px;
                line-height: 1.5;
                letter-spacing: -0.015em;
            }
            .card {
                background: var(--surface-1);
                border: 1px solid var(--hairline);
                border-radius: 14px;
                padding: 20px;
                margin-bottom: 16px;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 1px solid var(--hairline);
                padding-bottom: 14px;
            }
            .title {
                font-size: 18px;
                font-weight: 700;
                color: var(--ink);
            }
            .exposure-badge {
                font-size: 12px;
                font-weight: 700;
                padding: 4px 10px;
                border-radius: 9999px;
                background: rgba(255, 85, 119, 0.15);
                color: ${scoreColor};
                border: 1px solid rgba(255, 85, 119, 0.3);
            }
            .label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                color: var(--ink-muted);
                font-weight: 600;
                margin-bottom: 6px;
            }
            .val-text {
                font-size: 14px;
                color: var(--ink);
            }
            .risk-box {
                background: rgba(255, 85, 119, 0.08);
                border: 1px solid rgba(255, 85, 119, 0.25);
                border-radius: 10px;
                padding: 14px;
                font-size: 13px;
                color: var(--danger);
                margin-top: 8px;
            }
            ul {
                margin: 0;
                padding-left: 20px;
                font-size: 13px;
                color: var(--ink);
            }
            li {
                margin-bottom: 6px;
            }
            pre {
                background: #000000;
                border: 1px solid var(--hairline);
                border-radius: 8px;
                padding: 12px;
                font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
                font-size: 12px;
                color: var(--success);
                overflow-x: auto;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <div class="title">Sovereign AI Architectural Analysis</div>
                <div style="font-size: 12px; color: var(--ink-muted); margin-top: 2px;">Algorithm: ${algo} • Standard: ${ai.nistStandard}</div>
            </div>
            <div class="exposure-badge">Quantum Exposure: ${ai.exposureScore}/100</div>
        </div>

        <div class="card">
            <div class="label">Threat Mechanics & Vulnerability Rationale</div>
            <div class="val-text">${ai.threatSummary}</div>
            <div class="risk-box">
                <strong>Shor's Algorithm Mechanics:</strong><br/>
                ${ai.shorRisk}
            </div>
        </div>

        <div class="card">
            <div class="label">NIST FIPS 203/204 Migration Blueprint</div>
            <ul>${steps}</ul>
        </div>

        <div class="card">
            <div class="label">Recommended Post-Quantum Code Replacement</div>
            <pre><code>${ai.recommendedCode}</code></pre>
        </div>
    </body>
    </html>`;
}
