import fs from 'node:fs';

const currentFile = 'C:/Users/shree/quantwarden/scripts/build-landing-page.mjs';
let content = fs.readFileSync(currentFile, 'utf8');

// 1. Add hero logos styles
const heroLogosCss = `
        /* -------------------------------------------------------------
           HERO PLATFORM LOGOS INTEGRATION STRIP (Hero.tsx style)
           ------------------------------------------------------------- */
        .hero-integrations-strip {
            margin-top: 36px;
            margin-bottom: 24px;
            width: 100%;
            max-width: 960px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            z-index: 10;
        }

        .hero-integration-announcement {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 7px 18px;
            border-radius: var(--radius-pill);
            background: rgba(13, 15, 20, 0.95);
            border: 1px solid #262836;
            box-shadow: 0 0 24px rgba(255, 99, 99, 0.12);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            cursor: pointer;
            margin-bottom: 16px;
            transition: all 0.25s ease;
        }

        .hero-integration-announcement:hover {
            background: #141721;
            border-color: rgba(255, 99, 99, 0.5);
            transform: translateY(-1px);
        }

        .ping-badge {
            position: relative;
            display: flex;
            width: 8px;
            height: 8px;
        }

        .ping-dot {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: var(--coral);
            opacity: 0.75;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
        }

        .ping-center {
            position: relative;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--coral);
            box-shadow: 0 0 6px var(--coral);
        }

        .mcp-oauth-pill {
            font-size: 10px;
            font-family: var(--font-mono);
            font-weight: 700;
            text-transform: uppercase;
            color: #ff7575;
            background: rgba(255, 99, 99, 0.12);
            border: 1px solid rgba(255, 99, 99, 0.25);
            padding: 2px 8px;
            border-radius: 9999px;
        }

        .mcp-announcement-text {
            font-size: 12px;
            font-weight: 600;
            color: #d4d6e0;
            letter-spacing: -0.01em;
        }

        .hero-integration-announcement:hover .mcp-announcement-text {
            color: #ffffff;
        }

        .mcp-arrow {
            font-size: 13px;
            color: var(--coral);
            opacity: 0.8;
            transition: transform 0.2s;
        }

        .hero-integration-announcement:hover .mcp-arrow {
            opacity: 1;
            transform: translateX(2px);
        }

        .hero-logos-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 12px;
        }

        .hero-logo-btn {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            padding: 8px 16px;
            border-radius: 12px;
            background: rgba(12, 13, 18, 0.95);
            border: 1px solid #232532;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-logo-btn:hover {
            background: #141620;
            transform: translateY(-2px);
        }

        .hero-logo-btn.teams:hover {
            border-color: rgba(80, 90, 201, 0.6);
            box-shadow: 0 4px 24px rgba(80, 90, 201, 0.25);
        }

        .hero-logo-btn.notion:hover {
            border-color: rgba(255, 255, 255, 0.45);
            box-shadow: 0 4px 24px rgba(255, 255, 255, 0.15);
        }

        .hero-logo-btn.slack:hover {
            border-color: rgba(224, 30, 90, 0.55);
            box-shadow: 0 4px 24px rgba(224, 30, 90, 0.25);
        }

        .hero-logo-btn.github:hover {
            border-color: rgba(255, 255, 255, 0.4);
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.12);
        }

        .hero-logo-btn.discord:hover {
            border-color: rgba(88, 101, 242, 0.55);
            box-shadow: 0 4px 24px rgba(88, 101, 242, 0.25);
        }

        .hero-logo-btn.google:hover {
            border-color: rgba(66, 133, 244, 0.55);
            box-shadow: 0 4px 24px rgba(66, 133, 244, 0.25);
        }

        .hero-logo-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .hero-logo-icon svg {
            width: 18px;
            height: 18px;
        }

        .hero-logo-label {
            font-size: 13px;
            font-weight: 600;
            color: #d4d6e0;
            letter-spacing: -0.01em;
        }

        .hero-logo-btn:hover .hero-logo-label {
            color: #ffffff;
        }

        .hero-badge-live {
            font-size: 9px;
            font-family: var(--font-mono);
            font-weight: 700;
            padding: 2px 5px;
            border-radius: 4px;
            background: rgba(16, 185, 129, 0.12);
            color: var(--emerald);
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .hero-integrations-subtext {
            font-size: 13px;
            color: #9c9c9d;
            max-width: 680px;
            line-height: 1.5;
        }

        .hero-integrations-subtext strong {
            color: #ffffff;
        }
`;

if (!content.includes('.hero-integrations-strip')) {
    content = content.replace('    </style>', heroLogosCss + '\n    </style>');
}

// 2. Add hero logos HTML right inside hero-content
const heroLogosHtml = `
            <!-- Unified MCP & Composio Platform Integrations Strip (Hero.tsx style) -->
            <div class="hero-integrations-strip">
                <!-- Top Announcement Pill -->
                <button class="hero-integration-announcement" onclick="document.getElementById('mcp-connect').scrollIntoView({behavior:'smooth'})">
                    <span class="ping-badge">
                        <span class="ping-dot"></span>
                        <span class="ping-center"></span>
                    </span>
                    <span class="mcp-oauth-pill">MCP & COMPOSIO</span>
                    <span class="mcp-announcement-text">CONNECT ONCE VIA MCP • AUTONOMOUS WORKSPACE REPORTING</span>
                    <span class="mcp-arrow">→</span>
                </button>

                <!-- Platform Logos Pill Bar -->
                <div class="hero-logos-bar">
                    <!-- Microsoft Teams -->
                    <button class="hero-logo-btn teams" onclick="openReportModal('teams')" title="Connect Microsoft Teams via MCP">
                        <div class="hero-logo-icon">
                            <svg viewBox="0 0 24 24" fill="#505AC9"><path d="M19.5 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-3 1.5h6a1.5 1.5 0 0 1 1.5 1.5v4.5a3 3 0 0 1-3 3h-1.5v4.5a1.5 1.5 0 0 1-1.5 1.5h-1a1 1 0 0 1-1-1v-14zm-9-1.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-4.5 2h9a2 2 0 0 1 2 2v6a4 4 0 0 1-4 4h-5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/></svg>
                        </div>
                        <span class="hero-logo-label">Microsoft Teams</span>
                        <span class="hero-badge-live">LIVE</span>
                    </button>

                    <!-- Notion Workspace -->
                    <button class="hero-logo-btn notion" onclick="openReportModal('notion')" title="Connect Notion via MCP">
                        <div class="hero-logo-icon">
                            <svg viewBox="0 0 24 24" fill="#ffffff"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.093-.373L17.85 1.547c-.56-.42-1.353-.84-2.52-.747L3.06 1.873c-.42.047-.56.327-.373.513zm.56 3.685v14.129c0 .746.373 1.026 1.213.98l14.475-.84c.84-.047 1.073-.513 1.073-1.166V6.821c0-.653-.28-.98-.84-.933l-15.08.886c-.606.047-.84.373-.84.933zm13.12 1.492c.093.42 0 .84-.42.887l-.746.14c-.42.047-.606-.14-.653-.513l-.56-3.078c-.047-.327-.233-.42-.513-.373l-4.57 2.705c-.28.187-.373.467-.373.84v6.295c0 .513.233.793.746.746l2.1-.14c.42-.047.56.233.56.56v.373c0 .327-.233.467-.56.513l-4.71.28c-.373.047-.56-.186-.56-.513v-.373c0-.327.187-.467.56-.513l1.866-.14c.513-.047.606-.327.606-.793V9.67c0-.467-.187-.7-.56-.653l-1.913.14c-.373.047-.56-.187-.56-.513v-.373c0-.327.187-.467.56-.513l4.385-.28c.513-.047.793.14.98.42l4.292 6.575v-6.06c0-.42-.233-.7-.653-.653l-.746.047c-.42.047-.56-.233-.56-.56v-.373c0-.327.233-.467.653-.513l3.5-.233c.373-.047.56.187.56.513z"/></svg>
                        </div>
                        <span class="hero-logo-label">Notion</span>
                        <span class="hero-badge-live">SYNC</span>
                    </button>

                    <!-- Slack -->
                    <button class="hero-logo-btn slack" onclick="document.getElementById('mcp-connect').scrollIntoView({behavior:'smooth'})" title="Connect Slack via MCP">
                        <div class="hero-logo-icon">
                            <svg viewBox="0 0 24 24" fill="#E01E5A"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>
                        </div>
                        <span class="hero-logo-label">Slack</span>
                    </button>

                    <!-- GitHub -->
                    <button class="hero-logo-btn github" onclick="document.getElementById('mcp-connect').scrollIntoView({behavior:'smooth'})" title="Connect GitHub via MCP">
                        <div class="hero-logo-icon">
                            <svg viewBox="0 0 24 24" fill="#ffffff"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                        </div>
                        <span class="hero-logo-label">GitHub</span>
                    </button>

                    <!-- Discord -->
                    <button class="hero-logo-btn discord" onclick="document.getElementById('mcp-connect').scrollIntoView({behavior:'smooth'})" title="Connect Discord via MCP">
                        <div class="hero-logo-icon">
                            <svg viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                        </div>
                        <span class="hero-logo-label">Discord</span>
                    </button>

                    <!-- Google Workspace -->
                    <button class="hero-logo-btn google" onclick="document.getElementById('mcp-connect').scrollIntoView({behavior:'smooth'})" title="Connect Google Workspace via MCP">
                        <div class="hero-logo-icon">
                            <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
                        </div>
                        <span class="hero-logo-label">Google Workspace</span>
                    </button>
                </div>

                <p class="hero-integrations-subtext">
                    Connect directly to <strong>Microsoft Teams</strong>, <strong>Notion</strong>, <strong>Slack</strong> & <strong>GitHub</strong> via MCP to dispatch automated Post-Quantum compliance reports and CBOM audit specs.
                </p>
            </div>
`;

if (!content.includes('class="hero-integrations-strip"')) {
    content = content.replace(
        '            <div class="hero-terminal-pill"',
        heroLogosHtml + '\n            <div class="hero-terminal-pill"'
    );
}

fs.writeFileSync(currentFile, content, 'utf8');
console.log('Successfully updated build-landing-page.mjs with hero logos bar!');
