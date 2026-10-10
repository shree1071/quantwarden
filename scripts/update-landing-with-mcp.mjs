import fs from 'node:fs';
import path from 'node:path';

const currentFile = 'C:/Users/shree/quantwarden/scripts/build-landing-page.mjs';
let content = fs.readFileSync(currentFile, 'utf8');

// 1. Add MCP Connector link in navbar
if (!content.includes('href="#mcp-connect"')) {
    content = content.replace(
        '<li><a href="#pillars" class="nav-link">Pillars</a></li>',
        '<li><a href="#pillars" class="nav-link">Pillars</a></li>\n            <li><a href="#mcp-connect" class="nav-link">MCP Connector</a></li>'
    );
}

// 2. Add MCP CSS styles before </style>
const mcpStyles = `
        /* -------------------------------------------------------------
           MCP WORKSPACE & APP CONNECTORS (ComposioConnectSection.tsx)
           ------------------------------------------------------------- */
        .mcp-section {
            max-width: 1200px;
            margin: 0 auto;
            padding: 100px 24px;
            border-top: 1px solid var(--border-subtle);
        }

        .mcp-process-box {
            margin-bottom: 48px;
            padding: 24px 28px;
            border-radius: var(--radius-card);
            background: var(--surface);
            border: 1px solid var(--border);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
        }

        .mcp-process-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
        }

        @media (max-width: 820px) {
            .mcp-process-grid { grid-template-columns: 1fr; }
        }

        .mcp-process-step {
            display: flex;
            align-items: flex-start;
            gap: 16px;
        }

        .mcp-step-num {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-mono);
            font-size: 13px;
            font-weight: 700;
            flex-shrink: 0;
        }

        .mcp-step-num.s1 { background: rgba(255, 99, 99, 0.15); border: 1px solid rgba(255, 99, 99, 0.4); color: var(--coral); }
        .mcp-step-num.s2 { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: var(--emerald); }
        .mcp-step-num.s3 { background: rgba(0, 153, 255, 0.15); border: 1px solid rgba(0, 153, 255, 0.4); color: var(--electric-blue); }

        .mcp-step-title {
            font-size: 15px;
            font-weight: 600;
            color: var(--text-white);
            margin-bottom: 4px;
        }

        .mcp-step-desc {
            font-size: 13px;
            color: var(--text-ash);
            line-height: 1.45;
        }

        .mcp-filter-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 28px;
            flex-wrap: wrap;
            gap: 16px;
        }

        .mcp-filter-group {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px;
            border-radius: 10px;
            background: #0c0d10;
            border: 1px solid var(--border);
        }

        .mcp-filter-btn {
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            background: transparent;
            color: var(--text-ash);
            border: 1px solid transparent;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .mcp-filter-btn:hover { color: #ffffff; }
        .mcp-filter-btn.active {
            background: #1b1c1e;
            color: #ffffff;
            border-color: #363739;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }

        .mcp-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        @media (max-width: 1024px) {
            .mcp-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 680px) {
            .mcp-grid { grid-template-columns: 1fr; }
        }

        .mcp-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 22px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: all 0.2s ease;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .mcp-card:hover {
            border-color: rgba(255, 99, 99, 0.35);
            transform: translateY(-2px);
        }

        .mcp-card.connected {
            border-color: rgba(16, 185, 129, 0.35);
            box-shadow: 0 4px 24px rgba(16, 185, 129, 0.08);
        }

        .mcp-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .mcp-logo-wrap {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            background: #111214;
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .mcp-logo-wrap svg {
            width: 22px;
            height: 22px;
        }

        .mcp-status-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 3px 10px;
            border-radius: var(--radius-pill);
            font-family: var(--font-mono);
            font-size: 11px;
        }

        .mcp-status-pill.connected {
            background: rgba(16, 185, 129, 0.12);
            color: var(--emerald);
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .mcp-status-pill.idle {
            background: #1b1c1e;
            color: var(--text-ash);
            border: 1px solid var(--border);
        }

        .mcp-card-title {
            font-size: 17px;
            font-weight: 600;
            color: var(--text-white);
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .mcp-card-desc {
            font-size: 13px;
            color: var(--text-ash);
            line-height: 1.45;
            margin-bottom: 14px;
        }

        .mcp-link-box {
            margin: 12px 0;
            padding: 10px 12px;
            border-radius: 8px;
            background: #0c0d10;
            border: 1px solid #1f2023;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .mcp-link-label {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--text-smoke);
        }

        .mcp-link-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            background: #07080a;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid var(--border-subtle);
        }

        .mcp-link-text {
            font-family: var(--font-mono);
            font-size: 11px;
            color: #cccccc;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .mcp-card-actions {
            padding-top: 14px;
            border-top: 1px solid #1b1c1e;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .mcp-btn-secondary {
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-ash);
            background: #111214;
            border: 1px solid var(--border);
            cursor: pointer;
            transition: all 0.15s;
        }

        .mcp-btn-secondary:hover { color: #ffffff; background: #1a1b1e; }

        .mcp-btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            background: var(--coral);
            color: #040506;
            border: none;
            cursor: pointer;
            transition: all 0.15s;
            box-shadow: 0 2px 10px rgba(255, 99, 99, 0.3);
        }

        .mcp-btn-primary:hover {
            background: #ff7a7a;
            transform: translateY(-1px);
        }

        .mcp-btn-report {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            background: rgba(16, 185, 129, 0.15);
            color: var(--emerald);
            border: 1px solid rgba(16, 185, 129, 0.35);
            cursor: pointer;
            transition: all 0.15s;
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.12);
        }

        .mcp-btn-report:hover {
            background: rgba(16, 185, 129, 0.25);
            border-color: rgba(16, 185, 129, 0.6);
        }

        .mcp-footer-banner {
            margin-top: 36px;
            padding: 14px 20px;
            border-radius: 10px;
            background: rgba(17, 18, 20, 0.6);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            font-family: var(--font-mono);
            font-size: 12px;
            color: var(--text-ash);
        }

        /* -------------------------------------------------------------
           AUTOMATED REPORT MODAL (Teams & Notion Dispatcher)
           ------------------------------------------------------------- */
        .report-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            z-index: 2500;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .report-modal {
            width: 100%;
            max-width: 820px;
            background: #08090b;
            border: 1px solid var(--border);
            border-radius: 18px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
            overflow: hidden;
            animation: modalPop 0.18s ease;
        }

        .report-modal-header {
            padding: 18px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .report-modal-tabs {
            display: flex;
            gap: 8px;
            padding: 12px 24px;
            background: #0c0d10;
            border-bottom: 1px solid var(--border);
        }

        .report-tab-btn {
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            background: transparent;
            color: var(--text-ash);
            border: 1px solid transparent;
            cursor: pointer;
        }

        .report-tab-btn.active {
            background: #1b1c1e;
            color: #ffffff;
            border-color: #363739;
        }

        .report-modal-body {
            padding: 24px;
            max-height: 480px;
            overflow-y: auto;
        }
`;

if (!content.includes('.mcp-section')) {
    content = content.replace('    </style>', mcpStyles + '\n    </style>');
}

// 3. Add MCP HTML section between #pillars and #terminal
const mcpHtml = `
    <!-- MCP Workspace & App Connectors (ComposioConnectSection.tsx) -->
    <section id="mcp-connect" class="mcp-section">
        <div class="section-header-center">
            <div class="eyebrow-pill">
                <svg width="14" height="14" viewBox="0 0 32 32" fill="none" style="margin-right: 4px;">
                    <rect width="32" height="32" rx="8" fill="#1b1c1e"/>
                    <path d="M16 6L24.66 11V21L16 26L7.34 21V11L16 6Z" stroke="#ff6363" stroke-width="2.5" stroke-linejoin="round"/>
                    <circle cx="16" cy="16" r="3.5" fill="#ff6363"/>
                </svg>
                <span>POWERED BY MODEL CONTEXT PROTOCOL (MCP) & COMPOSIO</span>
            </div>
            <h2 class="section-title">Connect to Notion, Teams, & Dev Toolkits to Dispatch Automated Reports.</h2>
            <p class="section-desc">QuantWarden links directly with Microsoft Teams, Notion, Slack, and GitHub. Ingest real-time cryptographic posture alerts, auto-generate NIST FIPS 203/204 compliance digests, and dispatch automated executive reports without manual toil.</p>
        </div>

        <!-- 3-Step Visual Process Strip -->
        <div class="mcp-process-box">
            <div class="mcp-process-grid">
                <div class="mcp-process-step">
                    <div class="mcp-step-num s1">1</div>
                    <div>
                        <div class="mcp-step-title">Connect Once via MCP Connector</div>
                        <div class="mcp-step-desc">Authorize your Microsoft Teams war room, Notion workspace, or Slack channel in 10 seconds via unified Model Context Protocol authentication.</div>
                    </div>
                </div>
                <div class="mcp-process-step">
                    <div class="mcp-step-num s2">2</div>
                    <div>
                        <div class="mcp-step-title">Autonomous Cryptographic Telemetry</div>
                        <div class="mcp-step-desc">QuantWarden Sentinel listens to TLS handshakes, cipher changes, legacy certificates, and git commits in the background.</div>
                    </div>
                </div>
                <div class="mcp-process-step">
                    <div class="mcp-step-num s3">3</div>
                    <div>
                        <div class="mcp-step-title">Instant Automated Reports & Sync</div>
                        <div class="mcp-step-desc">When HNDL exposure or legacy crypto is detected, Gemini AI formats an executive compliance brief and auto-pushes audit logs into Notion and war-room cards into Teams.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Platform Toolkits Filter Bar -->
        <div class="mcp-filter-bar">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 14px; font-weight: 600; color: #ffffff;">Platform Toolkits</span>
                <span id="mcpCountBadge" style="font-size: 11px; font-family: var(--font-mono); color: var(--text-ash); background: #111214; padding: 2px 8px; border-radius: 9999px; border: 1px solid var(--border);">6 Available</span>
            </div>

            <div class="mcp-filter-group">
                <button class="mcp-filter-btn active" onclick="filterMcp('all', this)">All Tools</button>
                <button class="mcp-filter-btn" onclick="filterMcp('chat', this)">Chat & War Rooms</button>
                <button class="mcp-filter-btn" onclick="filterMcp('wiki', this)">Wikis & Specs</button>
                <button class="mcp-filter-btn" onclick="filterMcp('dev', this)">Developer & Cloud</button>
            </div>
        </div>

        <!-- Grid of MCP-Connected Platforms -->
        <div class="mcp-grid" id="mcpGrid">
            <!-- Microsoft Teams -->
            <div class="mcp-card connected" data-cat="chat">
                <div>
                    <div class="mcp-card-top">
                        <div class="mcp-logo-wrap">
                            <svg viewBox="0 0 24 24" fill="#505AC9"><path d="M19.5 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-3 1.5h6a1.5 1.5 0 0 1 1.5 1.5v4.5a3 3 0 0 1-3 3h-1.5v4.5a1.5 1.5 0 0 1-1.5 1.5h-1a1 1 0 0 1-1-1v-14zm-9-1.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-4.5 2h9a2 2 0 0 1 2 2v6a4 4 0 0 1-4 4h-5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/></svg>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="mcp-status-pill connected">
                                <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--emerald);"></span>
                                <span>Connected</span>
                            </span>
                            <span style="font-family: var(--font-mono); font-size: 10px; background: rgba(16, 185, 129, 0.1); color: var(--emerald); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.2);">38 Alerts Synced</span>
                        </div>
                    </div>
                    <h3 class="mcp-card-title">
                        <span>Microsoft Teams</span>
                        <span style="font-size: 10px; font-family: var(--font-mono); color: var(--emerald); background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.2);">WAR ROOM SYNC</span>
                    </h3>
                    <p class="mcp-card-desc">Ingest team chats & war rooms. Post automated P0 PQC outage & migration breach alerts directly into Microsoft Teams channels.</p>
                    
                    <div class="mcp-link-box">
                        <div class="mcp-link-label">
                            <span style="color: var(--coral);">🔒 MCP OAuth Connector</span>
                            <span>Direct Access</span>
                        </div>
                        <div class="mcp-link-row">
                            <span class="mcp-link-text">https://dashboard.composio.dev/~/org/connect/apps/microsoft_teams?source=mcp</span>
                            <button class="mcp-btn-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="copySnippet('https://dashboard.composio.dev/~/org/connect/apps/microsoft_teams?source=mcp')">Copy</button>
                        </div>
                    </div>
                </div>
                <div class="mcp-card-actions">
                    <button class="mcp-btn-secondary" onclick="toggleMcpCard(this, 'Microsoft Teams')">Connected</button>
                    <button class="mcp-btn-report" onclick="openReportModal('teams')">
                        <span>Dispatch Report to Teams</span>
                        <span>→</span>
                    </button>
                </div>
            </div>

            <!-- Notion Workspace -->
            <div class="mcp-card connected" data-cat="wiki">
                <div>
                    <div class="mcp-card-top">
                        <div class="mcp-logo-wrap">
                            <svg viewBox="0 0 24 24" fill="#ffffff"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.093-.373L17.85 1.547c-.56-.42-1.353-.84-2.52-.747L3.06 1.873c-.42.047-.56.327-.373.513zm.56 3.685v14.129c0 .746.373 1.026 1.213.98l14.475-.84c.84-.047 1.073-.513 1.073-1.166V6.821c0-.653-.28-.98-.84-.933l-15.08.886c-.606.047-.84.373-.84.933zm13.12 1.492c.093.42 0 .84-.42.887l-.746.14c-.42.047-.606-.14-.653-.513l-.56-3.078c-.047-.327-.233-.42-.513-.373l-4.57 2.705c-.28.187-.373.467-.373.84v6.295c0 .513.233.793.746.746l2.1-.14c.42-.047.56.233.56.56v.373c0 .327-.233.467-.56.513l-4.71.28c-.373.047-.56-.186-.56-.513v-.373c0-.327.187-.467.56-.513l1.866-.14c.513-.047.606-.327.606-.793V9.67c0-.467-.187-.7-.56-.653l-1.913.14c-.373.047-.56-.187-.56-.513v-.373c0-.327.187-.467.56-.513l4.385-.28c.513-.047.793.14.98.42l4.292 6.575v-6.06c0-.42-.233-.7-.653-.653l-.746.047c-.42.047-.56-.233-.56-.56v-.373c0-.327.233-.467.653-.513l3.5-.233c.373-.047.56.187.56.513z"/></svg>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="mcp-status-pill connected">
                                <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--emerald);"></span>
                                <span>Connected</span>
                            </span>
                            <span style="font-family: var(--font-mono); font-size: 10px; background: rgba(16, 185, 129, 0.1); color: var(--emerald); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.2);">Live Database Sync</span>
                        </div>
                    </div>
                    <h3 class="mcp-card-title">
                        <span>Notion Workspace</span>
                        <span style="font-size: 10px; font-family: var(--font-mono); color: var(--emerald); background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.2);">CBOM SPEC SYNC</span>
                    </h3>
                    <p class="mcp-card-desc">Auto-push synthesized Post-Quantum Cryptography audit reports, CBOM inventories, and remediation action items into your Notion database.</p>
                    
                    <div class="mcp-link-box">
                        <div class="mcp-link-label">
                            <span style="color: var(--coral);">🔒 MCP OAuth Connector</span>
                            <span>Direct Access</span>
                        </div>
                        <div class="mcp-link-row">
                            <span class="mcp-link-text">https://dashboard.composio.dev/~/org/connect/apps/notion?source=mcp</span>
                            <button class="mcp-btn-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="copySnippet('https://dashboard.composio.dev/~/org/connect/apps/notion?source=mcp')">Copy</button>
                        </div>
                    </div>
                </div>
                <div class="mcp-card-actions">
                    <button class="mcp-btn-secondary" onclick="toggleMcpCard(this, 'Notion')">Connected</button>
                    <button class="mcp-btn-report" onclick="openReportModal('notion')">
                        <span>Push Audit Spec to Notion</span>
                        <span>→</span>
                    </button>
                </div>
            </div>

            <!-- Slack -->
            <div class="mcp-card" data-cat="chat">
                <div>
                    <div class="mcp-card-top">
                        <div class="mcp-logo-wrap">
                            <svg viewBox="0 0 24 24" fill="#E01E5A"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="mcp-status-pill idle">
                                <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-smoke);"></span>
                                <span>OAuth Ready</span>
                            </span>
                            <span style="font-family: var(--font-mono); font-size: 10px; background: #1b1c1e; color: var(--text-ash); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border);">19 Unread</span>
                        </div>
                    </div>
                    <h3 class="mcp-card-title">Slack Incident Radar</h3>
                    <p class="mcp-card-desc">Filter missed @mentions, incident alerts, and quantum security regressions directly to your security engineering channels.</p>
                    
                    <div class="mcp-link-box">
                        <div class="mcp-link-label">
                            <span style="color: var(--coral);">🔒 MCP OAuth Connector</span>
                            <span>Direct Access</span>
                        </div>
                        <div class="mcp-link-row">
                            <span class="mcp-link-text">https://dashboard.composio.dev/~/org/connect/apps/slack?source=mcp</span>
                            <button class="mcp-btn-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="copySnippet('https://dashboard.composio.dev/~/org/connect/apps/slack?source=mcp')">Copy</button>
                        </div>
                    </div>
                </div>
                <div class="mcp-card-actions">
                    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-smoke);">Decision & Mention Radar</span>
                    <button class="mcp-btn-primary" onclick="connectMcpPlatform('slack', 'Slack', this)">
                        <span>Connect with OAuth</span>
                    </button>
                </div>
            </div>

            <!-- GitHub -->
            <div class="mcp-card" data-cat="dev">
                <div>
                    <div class="mcp-card-top">
                        <div class="mcp-logo-wrap">
                            <svg viewBox="0 0 24 24" fill="#ffffff"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="mcp-status-pill idle">
                                <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-smoke);"></span>
                                <span>OAuth Ready</span>
                            </span>
                            <span style="font-family: var(--font-mono); font-size: 10px; background: #1b1c1e; color: var(--text-ash); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border);">CI Blocker</span>
                        </div>
                    </div>
                    <h3 class="mcp-card-title">GitHub Workspaces</h3>
                    <p class="mcp-card-desc">Cross-reference live TLS probe findings with code repositories. Enforce pull-request quantum gating and automated ML-KEM patch PRs.</p>
                    
                    <div class="mcp-link-box">
                        <div class="mcp-link-label">
                            <span style="color: var(--coral);">🔒 MCP OAuth Connector</span>
                            <span>Direct Access</span>
                        </div>
                        <div class="mcp-link-row">
                            <span class="mcp-link-text">https://dashboard.composio.dev/~/org/connect/apps/github?source=mcp</span>
                            <button class="mcp-btn-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="copySnippet('https://dashboard.composio.dev/~/org/connect/apps/github?source=mcp')">Copy</button>
                        </div>
                    </div>
                </div>
                <div class="mcp-card-actions">
                    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-smoke);">Automated PR Remediation</span>
                    <button class="mcp-btn-primary" onclick="connectMcpPlatform('github', 'GitHub', this)">
                        <span>Connect with OAuth</span>
                    </button>
                </div>
            </div>

            <!-- Discord -->
            <div class="mcp-card" data-cat="chat">
                <div>
                    <div class="mcp-card-top">
                        <div class="mcp-logo-wrap">
                            <svg viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="mcp-status-pill idle">
                                <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-smoke);"></span>
                                <span>OAuth Ready</span>
                            </span>
                            <span style="font-family: var(--font-mono); font-size: 10px; background: #1b1c1e; color: var(--text-ash); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border);">Active</span>
                        </div>
                    </div>
                    <h3 class="mcp-card-title">Discord Communities</h3>
                    <p class="mcp-card-desc">Bridge high-velocity Discord developer channels into local-first executive digests and cryptographic vulnerability warnings.</p>
                    
                    <div class="mcp-link-box">
                        <div class="mcp-link-label">
                            <span style="color: var(--coral);">🔒 MCP OAuth Connector</span>
                            <span>Direct Access</span>
                        </div>
                        <div class="mcp-link-row">
                            <span class="mcp-link-text">https://dashboard.composio.dev/~/org/connect/apps/discord?source=mcp</span>
                            <button class="mcp-btn-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="copySnippet('https://dashboard.composio.dev/~/org/connect/apps/discord?source=mcp')">Copy</button>
                        </div>
                    </div>
                </div>
                <div class="mcp-card-actions">
                    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-smoke);">Community Sync</span>
                    <button class="mcp-btn-primary" onclick="connectMcpPlatform('discord', 'Discord', this)">
                        <span>Connect with OAuth</span>
                    </button>
                </div>
            </div>

            <!-- Google Workspace -->
            <div class="mcp-card" data-cat="dev">
                <div>
                    <div class="mcp-card-top">
                        <div class="mcp-logo-wrap">
                            <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="mcp-status-pill idle">
                                <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-smoke);"></span>
                                <span>OAuth Ready</span>
                            </span>
                            <span style="font-family: var(--font-mono); font-size: 10px; background: #1b1c1e; color: var(--text-ash); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border);">Scheduled Briefs</span>
                        </div>
                    </div>
                    <h3 class="mcp-card-title">Google Workspace</h3>
                    <p class="mcp-card-desc">Triage unread security alerts and schedule weekly CISO compliance briefs, automated executive email digests, and calendar audit milestones.</p>
                    
                    <div class="mcp-link-box">
                        <div class="mcp-link-label">
                            <span style="color: var(--coral);">🔒 MCP OAuth Connector</span>
                            <span>Direct Access</span>
                        </div>
                        <div class="mcp-link-row">
                            <span class="mcp-link-text">https://dashboard.composio.dev/~/org/connect/apps/googlecalendar?source=mcp</span>
                            <button class="mcp-btn-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="copySnippet('https://dashboard.composio.dev/~/org/connect/apps/googlecalendar?source=mcp')">Copy</button>
                        </div>
                    </div>
                </div>
                <div class="mcp-card-actions">
                    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-smoke);">Automated Executive Brief</span>
                    <button class="mcp-btn-primary" onclick="connectMcpPlatform('google', 'Google Workspace', this)">
                        <span>Connect with OAuth</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Footer Banner: Model Context Protocol Zero-Retention Guarantee -->
        <div class="mcp-footer-banner">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--emerald);">🛡️</span>
                <span>Model Context Protocol (MCP) Contract: Zero-retention sovereign edge transmission. Compatible with Claude Code & Antigravity.</span>
            </div>
            <button class="mcp-btn-report" onclick="openReportModal('teams')">
                <span>Preview Automated Reports Modal (⌘U)</span>
                <span>→</span>
            </button>
        </div>
    </section>

    <!-- Automated Reports Dispatcher Modal -->
    <div id="mcpReportModal" class="report-modal-backdrop" onclick="if(event.target===this) closeReportModal()">
        <div class="report-modal">
            <div class="report-modal-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: var(--coral); font-size: 18px;">⚡</span>
                    <div>
                        <div style="font-size: 15px; font-weight: 700; color: #ffffff;">QuantWarden Automated Report Dispatcher</div>
                        <div style="font-size: 12px; color: var(--text-smoke); font-family: var(--font-mono);">Multi-Workspace Push & Synchronization via MCP</div>
                    </div>
                </div>
                <button class="mcp-btn-secondary" onclick="closeReportModal()" style="padding: 4px 10px;">✕</button>
            </div>

            <div class="report-modal-tabs">
                <button id="tabBtnTeams" class="report-tab-btn active" onclick="switchReportTab('teams')">Microsoft Teams War Room</button>
                <button id="tabBtnNotion" class="report-tab-btn" onclick="switchReportTab('notion')">Notion Database Spec</button>
                <button id="tabBtnConfig" class="report-tab-btn" onclick="switchReportTab('config')">MCP Server Configuration</button>
            </div>

            <div class="report-modal-body">
                <!-- Teams View -->
                <div id="reportTabTeams">
                    <div style="background: #111216; border: 1px solid #2f3038; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; font-family: var(--font-mono); color: #ffffff; background: #ef4444; padding: 3px 8px; border-radius: 4px;">
                                🚨 P0 OUTAGE & HNDL ALERT
                            </span>
                            <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-smoke);">Target: #security-war-room</span>
                        </div>
                        <h4 style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">QuantWarden Sentinel: Harvest Now, Decrypt Later (HNDL) Breach Risk</h4>
                        <p style="font-size: 13px; color: var(--text-ash); line-height: 1.5; margin-bottom: 12px;">
                            Autonomous probe detected <strong>9 leaf endpoints</strong> for <strong>airlinecabz.com</strong> negotiating classical <code>ECDHE-RSA (P-256)</code> on TLS 1.2. In-flight passenger tokens and API manifests are vulnerable to retrospective harvest decryption.
                        </p>
                        <div style="background: #08090b; border: 1px solid #232428; border-radius: 8px; padding: 12px; font-family: var(--font-mono); font-size: 11px; color: #59d499; margin-bottom: 14px;">
                            ✓ Recommended Fix: Enable X25519MLKEM768 (0x11EC) Hybrid KEX<br>
                            ✓ NIST Standard: FIPS 203 (ML-KEM)<br>
                            ✓ Remediation Command: npx quantwarden remediate . --apply
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button id="btnSendTeams" class="mcp-btn-primary" onclick="sendTeamsLiveReport()">
                                <span>Dispatch to Microsoft Teams Channel</span>
                                <span>🚀</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Notion View -->
                <div id="reportTabNotion" style="display: none;">
                    <div style="background: #0f1013; border: 1px solid #26272b; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 18px;">📄</span>
                                <span style="font-size: 15px; font-weight: 700; color: #ffffff;">QuantWarden NIST FIPS 203 Cryptographic Bill of Materials (CBOM)</span>
                            </div>
                            <span style="font-size: 11px; font-family: var(--font-mono); color: var(--emerald); background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">Live Sync Spec</span>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                            <div style="background: #15161a; padding: 10px; border-radius: 6px; border: 1px solid #222327;">
                                <div style="font-size: 10px; font-family: var(--font-mono); color: var(--text-smoke);">STATUS</div>
                                <div style="font-size: 12px; font-weight: 700; color: #ef4444;">Vulnerable (HNDL Exposed)</div>
                            </div>
                            <div style="background: #15161a; padding: 10px; border-radius: 6px; border: 1px solid #222327;">
                                <div style="font-size: 10px; font-family: var(--font-mono); color: var(--text-smoke);">PQC READINESS</div>
                                <div style="font-size: 12px; font-weight: 700; color: #f59e0b;">34 / 100 Score</div>
                            </div>
                            <div style="background: #15161a; padding: 10px; border-radius: 6px; border: 1px solid #222327;">
                                <div style="font-size: 10px; font-family: var(--font-mono); color: var(--text-smoke);">MANDATE HORIZON</div>
                                <div style="font-size: 12px; font-weight: 700; color: var(--emerald);">CNSA 2.0 / OMB M-23-02</div>
                            </div>
                        </div>

                        <div style="font-family: var(--font-mono); font-size: 12px; color: var(--text-ash); background: #07080a; padding: 14px; border-radius: 8px; border: 1px solid #1c1d20; line-height: 1.6; margin-bottom: 16px;">
                            # Executive Cryptographic Assessment<br>
                            - Primary Domain: airlinecabz.com (443/TLS)<br>
                            - Vulnerable Handshake: ECDHE-RSA (P-256) (Classical)<br>
                            - Leaf Endpoints: 9 discovered (/book, auth.*, driver.*, mail.*)<br>
                            - Recommended Remediation: Inject @quantakrypto/core AST transform to enable X25519MLKEM768.
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button id="btnPushNotion" class="mcp-btn-report" onclick="pushNotionLiveReport()">
                                <span>Push Database Page to Notion Workspace</span>
                                <span>📝</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Config View -->
                <div id="reportTabConfig" style="display: none;">
                    <div style="font-size: 13px; color: var(--text-ash); margin-bottom: 12px;">
                        Configure the QuantWarden Model Context Protocol (MCP) server in your local Claude Code, Antigravity, or Cursor settings:
                    </div>
                    <pre style="background: #060709; border: 1px solid var(--border); border-radius: 8px; padding: 14px; font-family: var(--font-mono); font-size: 12px; color: #cccccc; overflow-x: auto; margin-bottom: 16px;"><code>{
  "mcpServers": {
    "quantwarden": {
      "command": "npx",
      "args": ["-y", "quantwarden", "mcp-server"],
      "env": {
        "QUANTWARDEN_AUTONOMOUS": "true",
        "NOTION_DATABASE_ID": "pqc-transition-spec",
        "TEAMS_WEBHOOK_URL": "https://outlook.office.com/webhook/..."
      }
    }
  }
}</code></pre>
                    <button class="mcp-btn-secondary" onclick="copySnippet('npx -y quantwarden mcp-server')">
                        <span>Copy MCP Setup Command</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

if (!content.includes('id="mcp-connect"')) {
    content = content.replace(
        '    <!-- QuickStart Terminal (QuickStartTerminal.tsx) -->',
        mcpHtml + '\n    <!-- QuickStart Terminal (QuickStartTerminal.tsx) -->'
    );
}

// 4. Add Command Palette items
const mcpCmdItems = `                <div class="cmd-item" onclick="openReportModal('teams'); closeCmdPalette();">
                    <span>Dispatch Automated Report to Microsoft Teams</span>
                    <span class="cmd-item-shortcut">Teams</span>
                </div>
                <div class="cmd-item" onclick="openReportModal('notion'); closeCmdPalette();">
                    <span>Push PQC Audit Report to Notion Workspace</span>
                    <span class="cmd-item-shortcut">Notion</span>
                </div>
                <div class="cmd-item" onclick="document.getElementById('mcp-connect').scrollIntoView({behavior:'smooth'}); closeCmdPalette();">
                    <span>Open MCP Workspace & App Connectors</span>
                    <span class="cmd-item-shortcut">⌘M</span>
                </div>
`;

if (!content.includes('Dispatch Automated Report to Microsoft Teams')) {
    content = content.replace(
        '                <div class="cmd-item" onclick="document.getElementById(\'vectorViewContainer\').scrollIntoView({behavior:\'smooth\'}); closeCmdPalette();">',
        mcpCmdItems + '                <div class="cmd-item" onclick="document.getElementById(\'vectorViewContainer\').scrollIntoView({behavior:\'smooth\'}); closeCmdPalette();">'
    );
}

// 5. Add JavaScript functions for MCP interactions
const mcpJs = `
        // -------------------------------------------------------------
        // MCP WORKSPACE & APP CONNECTORS INTERACTION LOGIC
        // -------------------------------------------------------------
        function filterMcp(cat, btn) {
            document.querySelectorAll('.mcp-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const cards = document.querySelectorAll('#mcpGrid .mcp-card');
            let count = 0;
            cards.forEach(c => {
                if (cat === 'all' || c.getAttribute('data-cat') === cat) {
                    c.style.display = 'flex';
                    count++;
                } else {
                    c.style.display = 'none';
                }
            });
            document.getElementById('mcpCountBadge').textContent = \`\${count} Available\`;
        }

        function toggleMcpCard(btn, name) {
            const card = btn.closest('.mcp-card');
            const isConnected = card.classList.contains('connected');
            if (isConnected) {
                card.classList.remove('connected');
                btn.textContent = 'Disconnected';
                showToast(\`Disconnected \${name}. Feed access revoked.\`);
            } else {
                card.classList.add('connected');
                btn.textContent = 'Connected';
                showToast(\`Connected \${name} via Composio OAuth! Feeds active.\`);
            }
        }

        function connectMcpPlatform(id, name, btn) {
            btn.textContent = 'Authorizing...';
            setTimeout(() => {
                const card = btn.closest('.mcp-card');
                card.classList.add('connected');
                btn.textContent = 'Connected ✓';
                btn.className = 'mcp-btn-report';
                btn.onclick = () => openReportModal(id === 'notion' ? 'notion' : 'teams');
                showToast(\`Connected \${name} via MCP OAuth! Ready for automated reports.\`);
            }, 800);
        }

        function openReportModal(tab = 'teams') {
            const modal = document.getElementById('mcpReportModal');
            if (modal) {
                modal.style.display = 'flex';
                switchReportTab(tab);
            }
        }

        function closeReportModal() {
            const modal = document.getElementById('mcpReportModal');
            if (modal) modal.style.display = 'none';
        }

        function switchReportTab(tab) {
            document.getElementById('reportTabTeams').style.display = tab === 'teams' ? 'block' : 'none';
            document.getElementById('reportTabNotion').style.display = tab === 'notion' ? 'block' : 'none';
            document.getElementById('reportTabConfig').style.display = tab === 'config' ? 'block' : 'none';

            document.getElementById('tabBtnTeams').classList.toggle('active', tab === 'teams');
            document.getElementById('tabBtnNotion').classList.toggle('active', tab === 'notion');
            document.getElementById('tabBtnConfig').classList.toggle('active', tab === 'config');
        }

        function sendTeamsLiveReport() {
            const btn = document.getElementById('btnSendTeams');
            btn.innerHTML = '<span>Dispatching...</span><span class="spinner">⏳</span>';
            setTimeout(() => {
                btn.innerHTML = '<span>Dispatched ✓</span>';
                btn.style.background = 'var(--emerald)';
                showToast('✓ Microsoft Teams: P0 HNDL Security Alert dispatched to #security-war-room!');
                setTimeout(() => {
                    btn.innerHTML = '<span>Dispatch to Microsoft Teams Channel</span><span>🚀</span>';
                    btn.style.background = 'var(--coral)';
                }, 3000);
            }, 600);
        }

        function pushNotionLiveReport() {
            const btn = document.getElementById('btnPushNotion');
            btn.innerHTML = '<span>Syncing to Notion...</span><span class="spinner">⏳</span>';
            setTimeout(() => {
                btn.innerHTML = '<span>Synced to Notion ✓</span>';
                showToast('✓ Notion: Created new database page "QuantWarden Quantum Readiness & CBOM Spec"!');
                setTimeout(() => {
                    btn.innerHTML = '<span>Push Database Page to Notion Workspace</span><span>📝</span>';
                }, 3000);
            }, 600);
        }
`;

if (!content.includes('sendTeamsLiveReport')) {
    content = content.replace(
        '        // Auto-run benchmark demo on DOM load',
        mcpJs + '\n        // Auto-run benchmark demo on DOM load'
    );
}

fs.writeFileSync(currentFile, content, 'utf8');
console.log('Successfully updated build-landing-page.mjs with MCP Workspace & App Connectors!');
