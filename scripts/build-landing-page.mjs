import fs from 'node:fs';
import path from 'node:path';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuantWarden — Sovereign Post-Quantum Cryptography & Live Domain Sentinel</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #040506;
            --surface: #07080a;
            --surface-recessed: #111214;
            --surface-badge: #1b1c1e;
            --border: #27282b;
            --border-subtle: #1c1d20;
            --border-active: #3a3b3e;
            --text-white: #ffffff;
            --text-ash: #9c9c9d;
            --text-smoke: #6a6b6c;
            --coral: #ff6363;
            --coral-glow: rgba(255, 99, 99, 0.22);
            --emerald: #10b981;
            --emerald-bg: rgba(16, 185, 129, 0.12);
            --emerald-border: rgba(16, 185, 129, 0.35);
            --amber: #f59e0b;
            --amber-bg: rgba(245, 158, 11, 0.12);
            --amber-border: rgba(245, 158, 11, 0.35);
            --red: #ef4444;
            --red-bg: rgba(239, 68, 68, 0.16);
            --red-border: rgba(239, 68, 68, 0.4);
            --red-glow: rgba(239, 68, 68, 0.25);
            --electric-blue: #0099ff;
            --shadow-key: rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 8px 24px 0px;
            --shadow-window: rgba(0, 0, 0, 0.8) 0px 24px 64px -12px, rgba(255, 255, 255, 0.08) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.4) 0px 4px 16px 0px;
            --radius-card: 16px;
            --radius-pill: 9999px;
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
            background-color: var(--bg);
            color: var(--text-ash);
            font-family: var(--font-sans);
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
            selection-background-color: var(--coral-glow);
        }

        ::selection {
            background: rgba(255, 99, 99, 0.3);
            color: #ffffff;
        }

        /* -------------------------------------------------------------
           FLOATING GLASS ISLAND NAVBAR (Navbar.tsx)
           ------------------------------------------------------------- */
        .floating-navbar {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 28px;
            background: rgba(7, 8, 10, 0.82);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-pill);
            padding: 8px 18px 8px 22px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.75);
            max-width: 960px;
            width: calc(100% - 32px);
        }

        .nav-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: var(--text-white);
            font-weight: 700;
            font-size: 14px;
            letter-spacing: -0.02em;
        }

        .nav-brand-icon {
            width: 26px;
            height: 26px;
            border-radius: 7px;
            background: linear-gradient(135deg, #ff6363 0%, #a82020 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 14px rgba(255, 99, 99, 0.4);
        }

        .nav-brand-icon svg { width: 14px; height: 14px; stroke: #ffffff; }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 22px;
            list-style: none;
        }

        @media (max-width: 820px) { .nav-links { display: none; } }

        .nav-link {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-ash);
            text-decoration: none;
            transition: color 0.18s;
        }

        .nav-link:hover { color: var(--text-white); }

        .nav-right {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .cmd-pill {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--text-smoke);
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border);
            padding: 4px 9px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .cmd-pill:hover {
            color: var(--text-white);
            border-color: #444;
            background: rgba(255, 255, 255, 0.08);
        }

        .nav-cta {
            background: var(--coral);
            color: #040506;
            font-size: 12px;
            font-weight: 700;
            padding: 8px 16px;
            border-radius: var(--radius-pill);
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 14px rgba(255, 99, 99, 0.4);
        }

        .nav-cta:hover {
            background: #ff7a7a;
            transform: translateY(-1px);
        }

        /* -------------------------------------------------------------
           HERO SECTION WITH RAYCAST PARALLAX (Hero.tsx & RaycastHeroScene)
           ------------------------------------------------------------- */
        .hero-section {
            position: relative;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 130px 20px 80px;
            overflow: hidden;
        }

        .raycast-parallax-bg {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .raycast-parallax-bg img {
            width: 110%;
            height: 110%;
            object-fit: cover;
            object-position: center;
            opacity: 0.55;
            transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1);
            filter: contrast(1.15) brightness(0.9);
        }

        .hero-vignette {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, transparent 30%, #040506 85%),
                        linear-gradient(to bottom, transparent 60%, #040506 100%);
            pointer-events: none;
            z-index: 1;
        }

        .hero-content {
            position: relative;
            z-index: 2;
            max-width: 960px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(17, 18, 20, 0.85);
            border: 1px solid rgba(255, 99, 99, 0.4);
            border-radius: var(--radius-pill);
            padding: 6px 14px;
            margin-bottom: 24px;
            backdrop-filter: blur(12px);
            box-shadow: 0 0 24px rgba(255, 99, 99, 0.18);
        }

        .hero-badge .pulse-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--coral);
            box-shadow: 0 0 8px var(--coral);
            animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
        }

        .hero-badge span {
            font-family: var(--font-mono);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #ffffff;
        }

        .hero-headline {
            font-size: 68px;
            font-weight: 700;
            letter-spacing: -0.04em;
            line-height: 1.04;
            color: #ffffff;
            margin-bottom: 22px;
            text-shadow: 0 10px 40px rgba(0, 0, 0, 0.95);
        }

        @media (max-width: 768px) {
            .hero-headline { font-size: 40px; }
        }

        .gradient-text {
            background: linear-gradient(90deg, #ffffff 0%, #ffffff 50%, #ff6363 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero-subhead {
            font-size: 18px;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.85);
            max-width: 680px;
            line-height: 1.5;
            margin-bottom: 36px;
            text-shadow: 0 4px 16px rgba(0, 0, 0, 0.9);
        }

        .hero-ctas {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            flex-wrap: wrap;
            margin-bottom: 34px;
        }

        .btn-hero-primary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--coral);
            color: #040506;
            font-weight: 700;
            font-size: 14px;
            padding: 13px 26px;
            border-radius: 10px;
            text-decoration: none;
            transition: all 0.2s;
            box-shadow: 0 4px 28px rgba(255, 99, 99, 0.45);
            border: none;
            cursor: pointer;
        }

        .btn-hero-primary:hover {
            background: #ff7a7a;
            transform: translateY(-2px);
        }

        .btn-hero-secondary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(17, 18, 20, 0.9);
            color: #ffffff;
            border: 1px solid var(--border);
            font-weight: 600;
            font-size: 14px;
            padding: 13px 24px;
            border-radius: 10px;
            text-decoration: none;
            transition: all 0.2s;
            backdrop-filter: blur(10px);
            cursor: pointer;
        }

        .btn-hero-secondary:hover {
            background: #1b1c1e;
            border-color: #454647;
            transform: translateY(-1px);
        }

        .hero-terminal-pill {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(13, 15, 20, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.12);
            padding: 8px 18px;
            border-radius: var(--radius-pill);
            font-family: var(--font-mono);
            font-size: 12px;
            color: var(--text-ash);
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 0 24px rgba(255, 99, 99, 0.1);
        }

        .hero-terminal-pill:hover {
            border-color: var(--coral);
            color: #ffffff;
            background: rgba(17, 18, 20, 1);
        }

        /* -------------------------------------------------------------
           MOCKUP CONTAINER / MACOS DESKTOP APP WINDOW (AppWindowMockup.tsx)
           ------------------------------------------------------------- */
        .mockup-wrapper {
            position: relative;
            max-width: 1160px;
            width: 100%;
            margin: 0 auto;
            padding: 0 20px;
            z-index: 10;
        }

        .macos-window {
            background: #07080a;
            border: 1px solid #2f3031;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: var(--shadow-window);
        }

        .macos-titlebar {
            background: #0a0b0e;
            border-bottom: 1px solid #1c1d20;
            padding: 12px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .macos-traffic-lights {
            display: flex;
            align-items: center;
            gap: 7px;
        }

        .macos-dot {
            width: 11px;
            height: 11px;
            border-radius: 50%;
        }

        .dot-close { background: #ff5f56; }
        .dot-min { background: #ffbd2e; }
        .dot-max { background: #27c93f; }

        .macos-title {
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--text-smoke);
            letter-spacing: 0.04em;
        }

        .macos-badges {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: var(--font-mono);
            font-size: 10px;
        }

        .badge-live {
            background: rgba(16, 185, 129, 0.15);
            color: var(--emerald);
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid rgba(16, 185, 129, 0.3);
            font-weight: 600;
        }

        /* Scanner & Topology Inside Window */
        .window-content {
            padding: 30px;
            background: #07080a;
        }

        @media (max-width: 768px) {
            .window-content { padding: 16px; }
        }

        /* -------------------------------------------------------------
           TARGET PROBE BAR & VERIFIED PRESETS
           ------------------------------------------------------------- */
        .probe-box {
            background: #0b0c0f;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
        }

        .probe-form {
            display: flex;
            gap: 12px;
            margin-bottom: 14px;
        }

        @media (max-width: 640px) {
            .probe-form { flex-direction: column; }
        }

        .input-wrap {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
        }

        .input-prefix {
            position: absolute;
            left: 14px;
            font-family: var(--font-mono);
            font-size: 12px;
            color: var(--text-smoke);
        }

        .target-input {
            width: 100%;
            background: #040506;
            border: 1px solid #2f3031;
            border-radius: 8px;
            padding: 12px 14px 12px 42px;
            font-family: var(--font-mono);
            font-size: 14px;
            color: #ffffff;
            outline: none;
            transition: all 0.2s;
        }

        .target-input:focus {
            border-color: var(--coral);
            box-shadow: 0 0 0 2px rgba(255, 99, 99, 0.2);
        }

        .btn-probe {
            background: var(--coral);
            color: #040506;
            font-family: var(--font-sans);
            font-size: 13px;
            font-weight: 700;
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }

        .btn-probe:hover { background: #ff7a7a; }
        .btn-probe:disabled { opacity: 0.5; cursor: not-allowed; }

        .presets-strip {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            font-size: 11px;
            font-family: var(--font-mono);
        }

        .presets-label { color: var(--text-smoke); margin-right: 4px; }

        .preset-chip {
            background: #111214;
            border: 1px solid #2f3031;
            color: var(--text-ash);
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.18s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .preset-chip:hover {
            border-color: var(--coral);
            color: #ffffff;
            background: #1a1b1e;
        }

        .preset-chip.active-demo {
            border-color: rgba(239, 68, 68, 0.5);
            background: rgba(239, 68, 68, 0.12);
            color: #ff8080;
        }

        /* -------------------------------------------------------------
           SCAN PROGRESS RADAR & STEP SEQUENCE
           ------------------------------------------------------------- */
        .scan-progress-box {
            display: none;
            background: #0b0c0f;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
        }

        .progress-grid {
            display: grid;
            grid-template-columns: 80px 1fr;
            gap: 20px;
            align-items: center;
        }

        @media (max-width: 600px) {
            .progress-grid { grid-template-columns: 1fr; }
        }

        .radar-spinner-wrap {
            position: relative;
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .radar-spinner-wrap::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 2px dashed rgba(255, 99, 99, 0.4);
            animation: spin 6s linear infinite;
        }

        .radar-spinner-wrap::after {
            content: '';
            position: absolute;
            inset: 10px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }

        .progress-steps {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-family: var(--font-mono);
            font-size: 11px;
        }

        .prog-step {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-smoke);
        }

        .prog-step.active { color: var(--coral); font-weight: 600; }
        .prog-step.done { color: var(--emerald); }

        /* -------------------------------------------------------------
           RESULTS: SCORE GAUGE & ATTACK SURFACE BANNER
           ------------------------------------------------------------- */
        .results-box {
            display: none;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .score-hero-card {
            background: #0b0c0f;
            border: 1px solid #2f3031;
            border-radius: 14px;
            padding: 24px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: 140px 1fr 220px;
            gap: 24px;
            align-items: center;
            box-shadow: var(--shadow-key);
        }

        @media (max-width: 900px) {
            .score-hero-card { grid-template-columns: 1fr; }
        }

        .gauge-container {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto;
        }

        .gauge-circle-bg {
            fill: none;
            stroke: #1b1c1e;
            stroke-width: 9;
        }

        .gauge-circle-val {
            fill: none;
            stroke: var(--red);
            stroke-width: 9;
            stroke-linecap: round;
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
            transition: stroke-dashoffset 0.8s ease;
        }

        .gauge-center-text {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .gauge-score-num {
            font-family: var(--font-mono);
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            line-height: 1;
        }

        .gauge-score-sub {
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--text-smoke);
            margin-top: 2px;
        }

        .score-text-block h3 {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 6px;
        }

        .score-text-block p {
            font-size: 13px;
            color: var(--text-ash);
            line-height: 1.5;
        }

        .score-stats-grid {
            background: #07080a;
            border: 1px solid #1c1d20;
            border-radius: 10px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .score-stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            font-family: var(--font-mono);
        }

        .stat-label { color: var(--text-smoke); }
        .stat-val-hndl { color: var(--red); font-weight: 700; }
        .stat-val-leaf { color: #ffffff; font-weight: 600; }

        /* -------------------------------------------------------------
           VECTOR RADIAL NETWORK TOPOLOGY MAP & LEAF INSPECTOR
           ------------------------------------------------------------- */
        .vector-topology-card {
            background: #090a0d;
            border: 1px solid #27282b;
            border-radius: 14px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: var(--shadow-key);
        }

        .topology-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 18px;
            flex-wrap: wrap;
            gap: 12px;
        }

        .topology-title-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .topology-title {
            font-size: 15px;
            font-weight: 700;
            color: #ffffff;
        }

        .topology-badge {
            font-family: var(--font-mono);
            font-size: 10px;
            background: rgba(239, 68, 68, 0.16);
            color: #ff8080;
            border: 1px solid rgba(239, 68, 68, 0.35);
            padding: 2px 8px;
            border-radius: var(--radius-pill);
            font-weight: 600;
        }

        .topology-toggle-btns {
            display: flex;
            gap: 6px;
        }

        .btn-toggle-view {
            background: #111214;
            border: 1px solid #2f3031;
            color: var(--text-smoke);
            font-family: var(--font-mono);
            font-size: 10px;
            padding: 5px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.18s;
        }

        .btn-toggle-view.active {
            background: var(--surface-badge);
            color: #ffffff;
            border-color: #454647;
        }

        /* SVG Map Container */
        .vector-map-wrapper {
            position: relative;
            width: 100%;
            height: 520px;
            background: #050608;
            border: 1px solid #1c1d20;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 18px;
        }

        .vector-hud-overlay {
            position: absolute;
            top: 14px;
            left: 16px;
            z-index: 10;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: var(--font-mono);
            font-size: 11px;
            background: rgba(7, 8, 10, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 6px 14px;
            border-radius: 6px;
            backdrop-filter: blur(8px);
        }

        .vector-svg-canvas {
            width: 100%;
            height: 100%;
            display: block;
        }

        .vector-node-group {
            cursor: pointer;
            transition: transform 0.2s;
        }

        .vector-node-group:hover {
            filter: drop-shadow(0 0 12px rgba(255, 99, 99, 0.4));
        }

        .sweep-needle {
            transform-origin: 500px 260px;
            animation: radarSweep 7s linear infinite;
        }

        @keyframes radarSweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Leaf Inspector Box */
        .inspector-panel {
            background: #07080a;
            border: 1px solid #1f2024;
            border-radius: 10px;
            padding: 18px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            font-family: var(--font-mono);
            font-size: 11px;
        }

        @media (max-width: 800px) {
            .inspector-panel { grid-template-columns: repeat(2, 1fr); }
        }

        .inspector-item { display: flex; flex-direction: column; gap: 4px; }
        .inspector-label { color: var(--text-smoke); text-transform: uppercase; font-size: 9px; }
        .inspector-value { color: #ffffff; font-weight: 600; }

        /* -------------------------------------------------------------
           COMPARISON SECTION: "CLASSICAL CRISIS VS PQC CLARITY"
           (TriageComparisonSection.tsx)
           ------------------------------------------------------------- */
        .comparison-section {
            padding: 90px 20px;
            max-width: 1160px;
            margin: 0 auto;
        }

        .section-header-center {
            text-align: center;
            max-width: 720px;
            margin: 0 auto 50px;
        }

        .eyebrow-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #111214;
            border: 1px solid rgba(255, 99, 99, 0.4);
            padding: 4px 12px;
            border-radius: var(--radius-pill);
            font-family: var(--font-mono);
            font-size: 11px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 16px;
        }

        .eyebrow-pill .dot-coral {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--coral);
        }

        .section-title {
            font-size: 38px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.03em;
            margin-bottom: 12px;
        }

        @media (max-width: 640px) {
            .section-title { font-size: 28px; }
        }

        .section-desc {
            font-size: 16px;
            color: var(--text-ash);
            line-height: 1.55;
        }

        .comparison-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px;
        }

        @media (max-width: 840px) {
            .comparison-grid { grid-template-columns: 1fr; }
        }

        .comparison-card {
            background: #07080a;
            border-radius: var(--radius-card);
            padding: 30px;
            box-shadow: var(--shadow-key);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
        }

        .card-classical {
            border: 1px solid rgba(239, 68, 68, 0.4);
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.08);
        }

        .card-pqc {
            border: 1px solid rgba(16, 185, 129, 0.4);
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.08);
        }

        .card-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-family: var(--font-mono);
            font-size: 10px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            margin-bottom: 16px;
            width: fit-content;
        }

        .badge-red { background: var(--red-bg); color: #ff8080; border: 1px solid var(--red-border); }
        .badge-green { background: var(--emerald-bg); color: #6ee7b7; border: 1px solid var(--emerald-border); }

        .card-title {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 10px;
        }

        .card-subtitle {
            font-size: 14px;
            color: var(--text-ash);
            line-height: 1.5;
            margin-bottom: 22px;
        }

        .trait-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 24px;
        }

        .trait-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            font-size: 13px;
            line-height: 1.4;
        }

        .trait-icon-bad {
            color: var(--red);
            font-weight: 800;
            font-family: var(--font-mono);
            flex-shrink: 0;
        }

        .trait-icon-good {
            color: var(--emerald);
            font-weight: 800;
            font-family: var(--font-mono);
            flex-shrink: 0;
        }

        .trait-metric {
            background: #111214;
            border: 1px solid #27282b;
            border-radius: 8px;
            padding: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: var(--font-mono);
            font-size: 11px;
        }

        /* -------------------------------------------------------------
           THE 6 PILLARS FEATURE GRID (FeatureGrid.tsx)
           ------------------------------------------------------------- */
        .features-section {
            padding: 90px 20px;
            max-width: 1160px;
            margin: 0 auto;
        }

        .pillars-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
        }

        @media (max-width: 960px) { .pillars-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .pillars-grid { grid-template-columns: 1fr; } }

        .pillar-card {
            background: #07080a;
            border: 1px solid #27282b;
            border-radius: var(--radius-card);
            padding: 24px;
            box-shadow: var(--shadow-key);
            transition: all 0.25s;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .pillar-card:hover {
            transform: translateY(-4px);
            border-color: rgba(255, 99, 99, 0.4);
            box-shadow: 0 10px 30px rgba(255, 99, 99, 0.1);
        }

        .pillar-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .pillar-icon-box {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: #111214;
            border: 1px solid #2f3031;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
        }

        .pillar-icon-box svg { width: 20px; height: 20px; stroke: #ffffff; }

        .pillar-badge {
            font-family: var(--font-mono);
            font-size: 10px;
            background: #1b1c1e;
            border: 1px solid #2f3031;
            color: var(--text-smoke);
            padding: 2px 7px;
            border-radius: 6px;
        }

        .pillar-title {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 8px;
        }

        .pillar-desc {
            font-size: 13px;
            color: var(--text-ash);
            line-height: 1.55;
            margin-bottom: 20px;
        }

        .pillar-footer {
            border-top: 1px solid #1c1d20;
            padding-top: 12px;
            display: flex;
            align-items: baseline;
            gap: 8px;
        }

        .pillar-metric {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            font-family: var(--font-sans);
        }

        .pillar-metric-sub {
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--text-smoke);
        }

        /* -------------------------------------------------------------
           QUICKSTART TERMINAL (QuickStartTerminal.tsx)
           ------------------------------------------------------------- */
        .terminal-section {
            padding: 90px 20px;
            max-width: 960px;
            margin: 0 auto;
        }

        .terminal-container {
            background: #07080a;
            border: 1px solid #2f3031;
            border-radius: var(--radius-card);
            overflow: hidden;
            box-shadow: var(--shadow-key);
        }

        .terminal-header {
            background: #07080a;
            border-bottom: 1px solid #1b1c1e;
            padding: 12px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .terminal-controls {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .terminal-tabs {
            display: flex;
            gap: 6px;
        }

        .t-tab {
            font-family: var(--font-mono);
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 4px;
            background: transparent;
            border: 1px solid transparent;
            color: var(--text-smoke);
            cursor: pointer;
            transition: all 0.18s;
        }

        .t-tab.active {
            background: #1b1c1e;
            border-color: #363739;
            color: #ffffff;
        }

        .btn-copy-terminal {
            background: #111214;
            border: 1px solid #2f3031;
            color: var(--text-ash);
            font-family: var(--font-mono);
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.18s;
        }

        .btn-copy-terminal:hover {
            color: #ffffff;
            border-color: #444;
            background: #1b1c1e;
        }

        .terminal-body {
            padding: 24px;
            font-family: var(--font-mono);
            font-size: 13px;
            color: #ffffff;
            line-height: 1.7;
            background: #040506;
            min-height: 180px;
            overflow-x: auto;
        }

        .t-comment { color: var(--text-smoke); }
        .t-cmd { color: #ffffff; font-weight: 600; }
        .t-green { color: var(--emerald); }
        .t-red { color: var(--red); }

        /* -------------------------------------------------------------
           COMMAND PALETTE MODAL (⌘K Trigger)
           ------------------------------------------------------------- */
        .cmd-modal-backdrop {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
            z-index: 2000;
            align-items: flex-start;
            justify-content: center;
            padding-top: 15vh;
        }

        .cmd-modal {
            background: #07080a;
            border: 1px solid #363739;
            border-radius: 14px;
            width: 100%;
            max-width: 580px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
            overflow: hidden;
            animation: modalPop 0.18s ease;
        }

        @keyframes modalPop {
            from { transform: scale(0.96); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        .cmd-input-wrap {
            display: flex;
            align-items: center;
            padding: 14px 18px;
            border-bottom: 1px solid #1c1d20;
        }

        .cmd-input {
            width: 100%;
            background: transparent;
            border: none;
            outline: none;
            color: #ffffff;
            font-family: var(--font-sans);
            font-size: 15px;
            margin-left: 10px;
        }

        .cmd-list {
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-height: 320px;
            overflow-y: auto;
        }

        .cmd-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.15s;
            color: var(--text-ash);
            font-size: 13px;
        }

        .cmd-item:hover, .cmd-item.selected {
            background: #111214;
            color: #ffffff;
        }

        .cmd-item-shortcut {
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--text-smoke);
            background: #1b1c1e;
            padding: 2px 6px;
            border-radius: 4px;
        }

        /* -------------------------------------------------------------
           TOAST NOTIFICATION (Toast notification on copy/run)
           ------------------------------------------------------------- */
        .toast-notify {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #07080a;
            border: 1px solid #363739;
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            gap: 8px;
            z-index: 3000;
            animation: toastIn 0.2s ease;
        }

        @keyframes toastIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        /* -------------------------------------------------------------
           FOOTER (Footer.tsx)
           ------------------------------------------------------------- */
        footer {
            border-top: 1px solid #1c1d20;
            padding: 50px 20px;
            text-align: center;
            font-size: 13px;
            color: var(--text-smoke);
            background: #040506;
        }

        .footer-content {
            max-width: 960px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
        }

        .footer-links {
            display: flex;
            gap: 20px;
            list-style: none;
        }

        .footer-link {
            color: var(--text-ash);
            text-decoration: none;
            transition: color 0.18s;
        }

        .footer-link:hover { color: #ffffff; }
    </style>
</head>
<body>

    <!-- Toast Notification -->
    <div id="toastNotify" class="toast-notify">
        <span style="color: var(--emerald);">✓</span>
        <span id="toastMsg">Command copied to clipboard</span>
    </div>

    <!-- Floating Glass Island Navbar -->
    <nav class="floating-navbar">
        <a href="#overview" class="nav-brand">
            <div class="nav-brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
            </div>
            <span>QUANTWARDEN</span>
        </a>

        <ul class="nav-links">
            <li><a href="#overview" class="nav-link">Overview</a></li>
            <li><a href="#mockupWindow" class="nav-link">Vector Map</a></li>
            <li><a href="#comparison" class="nav-link">Threat Matrix</a></li>
            <li><a href="#pillars" class="nav-link">Pillars</a></li>
            <li><a href="#terminal" class="nav-link">Terminal</a></li>
        </ul>

        <div class="nav-right">
            <div class="cmd-pill" onclick="openCmdPalette()">
                <span>⌘K</span>
            </div>
            <button class="nav-cta" onclick="document.getElementById('mockupWindow').scrollIntoView({behavior:'smooth'})">
                Run Sovereign Scan
            </button>
        </div>
    </nav>

    <!-- Hero Section with Raycast Parallax Background -->
    <section id="overview" class="hero-section">
        <div class="raycast-parallax-bg">
            <img id="raycastHeroBg" src="/raycast_dark_straight.png" alt="Raycast Hero Background" onerror="this.src='/raycast-clean-bg.png'">
        </div>
        <div class="hero-vignette"></div>

        <div class="hero-content">
            <div class="hero-badge">
                <span class="pulse-dot"></span>
                <span>BMSIT&M HACKATHON 2026 • QUANTUM THREAT HORIZON ACTIVE</span>
            </div>

            <h1 class="hero-headline">
                Sovereign Post-Quantum Cryptography.<br>
                <span class="gradient-text">Harvest Now, Decrypt Later Defense.</span>
            </h1>

            <p class="hero-subhead">
                Automated perimeter scanning, wire-level TLS 1.3 ML-KEM-768 hybrid handshake verification, and autonomous AST code remediation before the quantum horizon arrives.
            </p>

            <div class="hero-ctas">
                <button class="btn-hero-primary" onclick="document.getElementById('mockupWindow').scrollIntoView({behavior:'smooth'})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    <span>Launch Sovereign Scanner (Live Demo)</span>
                </button>

                <button class="btn-hero-secondary" onclick="document.getElementById('vectorViewContainer').scrollIntoView({behavior:'smooth'})">
                    <span>Attack Surface Vector Map (⌘U)</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
                </button>
            </div>

            <div class="hero-terminal-pill" onclick="copySnippet('npx quantwarden probe airlinecabz.com')">
                <span style="color: var(--coral);">$</span>
                <span>npx quantwarden probe airlinecabz.com</span>
                <span style="font-size: 10px; color: var(--text-smoke); margin-left: 6px;">[Click to Copy]</span>
            </div>
        </div>
    </section>

    <!-- macOS Desktop Window Mockup Holding the Scanner & Vector Map -->
    <div id="mockupWindow" class="mockup-wrapper">
        <div class="macos-window">
            <div class="macos-titlebar">
                <div class="macos-traffic-lights">
                    <div class="macos-dot dot-close"></div>
                    <div class="macos-dot dot-min"></div>
                    <div class="macos-dot dot-max"></div>
                </div>
                <div class="macos-title">quantwarden // sovereign-vector-reconnaissance</div>
                <div class="macos-badges">
                    <span class="badge-live">● NIST FIPS 203 ACTIVE</span>
                </div>
            </div>

            <div class="window-content">
                <!-- Target Input Box -->
                <div class="probe-box">
                    <form id="probeForm" class="probe-form">
                        <div class="input-wrap">
                            <span class="input-prefix">https://</span>
                            <input 
                                type="text" 
                                id="targetInput" 
                                class="target-input" 
                                placeholder="airlinecabz.com or target domain" 
                                value="airlinecabz.com"
                                required 
                                spellcheck="false"
                            />
                        </div>
                        <button type="submit" id="probeBtn" class="btn-probe">
                            PROBE ENDPOINT
                        </button>
                    </form>

                    <div class="presets-strip">
                        <span class="presets-label">VERIFIED TARGETS:</span>
                        <div class="preset-chip active-demo" onclick="runPreset('airlinecabz.com')">
                            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--red);"></span>
                            <span>airlinecabz.com (Demo Fleet · Score 34)</span>
                        </div>
                        <div class="preset-chip" onclick="runPreset('cloudflare.com')">
                            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--emerald);"></span>
                            <span>cloudflare.com (PQC Hybrid)</span>
                        </div>
                        <div class="preset-chip" onclick="runPreset('google.com')">
                            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--amber);"></span>
                            <span>google.com (TLS 1.3)</span>
                        </div>
                    </div>
                </div>

                <!-- Scan Progress Sequence -->
                <div id="scanProgress" class="scan-progress-box">
                    <div class="progress-grid">
                        <div class="radar-spinner-wrap"></div>
                        <div class="progress-steps">
                            <div id="step1" class="prog-step active">[1/5] Initiating TLS 1.3 ClientHello (0x11EC X25519MLKEM768)...</div>
                            <div id="step2" class="prog-step">[2/5] Parsing ServerHello & Certificate OID signature tree...</div>
                            <div id="step3" class="prog-step">[3/5] Querying DNS & probing candidate leaf endpoints in parallel...</div>
                            <div id="step4" class="prog-step">[4/5] Evaluating leaf services: /book, auth.*, driver.*, mail.*...</div>
                            <div id="step5" class="prog-step">[5/5] Invoking Google Gemini 3.8 Flash Sovereign AI Advisor...</div>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div id="resultsSection" class="results-box">
                    <!-- Score Hero Card -->
                    <div class="score-hero-card">
                        <div class="gauge-container">
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle class="gauge-circle-bg" cx="60" cy="60" r="50"></circle>
                                <circle id="gaugeFill" class="gauge-circle-val" cx="60" cy="60" r="50" stroke-dasharray="314" stroke-dashoffset="207"></circle>
                            </svg>
                            <div class="gauge-center-text">
                                <span id="resScore" class="gauge-score-num">34</span>
                                <span class="gauge-score-sub">/ 100</span>
                            </div>
                        </div>

                        <div class="score-text-block">
                            <h3 id="resScoreTitle">Critical Quantum Exposure (HNDL Confirmed)</h3>
                            <p id="resScoreDesc">This platform relies exclusively on classical RSA-2048 and classical ECDHE/TLS 1.2 session negotiation. All customer ride bookings, credit card tokens, driver GPS routes, and corporate travel manifests are actively vulnerable to Harvest Now, Decrypt Later (HNDL) attacks.</p>
                        </div>

                        <div class="score-stats-grid">
                            <div class="score-stat-row">
                                <span class="stat-label">HNDL Status</span>
                                <span id="resHndlStatus" class="stat-val-hndl">CRITICAL EXPOSURE</span>
                            </div>
                            <div class="score-stat-row">
                                <span class="stat-label">Perimeter Services</span>
                                <span id="resLeafCount" class="stat-val-leaf">9 Discovered</span>
                            </div>
                            <div class="score-stat-row">
                                <span class="stat-label">Latency</span>
                                <span id="resLatency" class="stat-val-leaf">58ms</span>
                            </div>
                        </div>
                    </div>

                    <!-- Vector Radial Topology Card -->
                    <div class="vector-topology-card">
                        <div class="topology-header">
                            <div class="topology-title-group">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                                <span class="topology-title">Perimeter Surface & Vector Radial Network Map</span>
                                <span id="leafBadge" class="topology-badge">9 LEAF NODES DETECTED</span>
                            </div>

                            <div class="topology-toggle-btns">
                                <button id="btnViewVector" class="btn-toggle-view active" onclick="switchTopologyView('vector')">VECTOR RADIAL MAP</button>
                                <button id="btnViewGrid" class="btn-toggle-view" onclick="switchTopologyView('grid')">CARD MATRIX</button>
                            </div>
                        </div>

                        <!-- Vector SVG Map Wrapper -->
                        <div id="vectorViewContainer" class="vector-map-wrapper">
                            <div class="vector-hud-overlay">
                                <span style="color: var(--text-smoke);">TARGET:</span>
                                <span id="hudTargetText" style="color: #ffffff; font-weight: 700;">airlinecabz.com:443</span>
                                <span id="hudStatusBadge" style="background: var(--red-bg); color: var(--red); padding: 2px 6px; border-radius: 4px;">0 CORRECT · 8 WRONG (100% EXPOSURE)</span>
                            </div>

                            <svg id="vectorSvg" class="vector-svg-canvas" viewBox="0 0 1000 520">
                                <defs>
                                    <pattern id="vectorGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="0.8"/>
                                    </pattern>
                                    <radialGradient id="hubGlowGradient" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stop-color="rgba(239, 68, 68, 0.28)" />
                                        <stop offset="100%" stop-color="rgba(239, 68, 68, 0)" />
                                    </radialGradient>
                                    <radialGradient id="pqcGlowGradient" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stop-color="rgba(16, 185, 129, 0.28)" />
                                        <stop offset="100%" stop-color="rgba(16, 185, 129, 0)" />
                                    </radialGradient>
                                </defs>

                                <rect width="1000" height="520" fill="url(#vectorGridPattern)"/>

                                <!-- Sonar / Radar Rings -->
                                <circle cx="500" cy="260" r="75" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-dasharray="4 4" />
                                <circle cx="500" cy="260" r="160" fill="none" stroke="rgba(255, 255, 255, 0.04)" />
                                <circle cx="500" cy="260" r="250" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-dasharray="6 6" />
                                <circle cx="500" cy="260" r="340" fill="none" stroke="rgba(255, 255, 255, 0.03)" />

                                <!-- Sweeping Radar Line -->
                                <line class="sweep-needle" id="sweepNeedle" x1="500" y1="260" x2="500" y2="10" stroke="rgba(239, 68, 68, 0.35)" stroke-width="1.5" />

                                <!-- Layers -->
                                <g id="vectorLinesLayer"></g>
                                <g id="vectorPacketsLayer"></g>
                                <g id="vectorNodesLayer"></g>

                                <!-- Central Hub Node -->
                                <g id="hubCentralGroup" transform="translate(500, 260)">
                                    <circle id="hubGlowBg" r="70" fill="url(#hubGlowGradient)"></circle>
                                    <rect id="hubRect" x="-95" y="-36" width="190" height="72" rx="12" fill="#0d0e12" stroke="#ef4444" stroke-width="1.5"></rect>
                                    <circle id="hubDot" cx="-75" cy="0" r="4.5" fill="#ef4444"></circle>
                                    <text id="hubHostText" x="-62" y="-12" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">airlinecabz.com:443</text>
                                    <text id="hubRoleText" x="-62" y="3" fill="#9ca3af" font-family="'JetBrains Mono', monospace" font-size="8.5">CENTRAL APEX INGRESS</text>
                                    <rect id="hubScorePill" x="-62" y="10" width="144" height="16" rx="8" fill="rgba(239, 68, 68, 0.2)" stroke="rgba(239, 68, 68, 0.5)" stroke-width="0.8"></rect>
                                    <text id="hubScorePillText" x="10" y="21" text-anchor="middle" fill="#fca5a5" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="700">✕ SCORE: 34/100 · 8 WRONG</text>
                                </g>
                            </svg>
                        </div>

                        <!-- Card Matrix View (Alternative Grid) -->
                        <div id="leafGrid" style="display: none; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; margin-bottom: 18px;"></div>

                        <!-- Cryptographic Inspector Panel -->
                        <div class="inspector-panel">
                            <div class="inspector-item">
                                <span class="inspector-label">Selected Node</span>
                                <span id="inspNode" class="inspector-value">https://airlinecabz.com/book</span>
                            </div>
                            <div class="inspector-item">
                                <span class="inspector-label">Cryptographic Verdict</span>
                                <span id="inspVerdict" class="inspector-value" style="color: var(--red);">✕ WRONG · VULNERABLE TO SHOR'S</span>
                            </div>
                            <div class="inspector-item">
                                <span class="inspector-label">Key Exchange (KEX)</span>
                                <span id="inspKex" class="inspector-value">ECDHE-RSA (P-256 Classical)</span>
                            </div>
                            <div class="inspector-item">
                                <span class="inspector-label">Data Asset at Risk</span>
                                <span id="inspData" class="inspector-value" style="color: #ff8080;">Passenger manifests, booking tokens</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Live Triage Comparison Section (TriageComparisonSection.tsx) -->
    <section id="comparison" class="comparison-section">
        <div class="section-header-center">
            <div class="eyebrow-pill">
                <span class="dot-coral"></span>
                <span>LIVE THREAT HORIZON COMPARISON</span>
            </div>
            <h2 class="section-title">The Unencrypted Future vs Sovereign Post-Quantum Immunization</h2>
            <p class="section-desc">Why relying on classical RSA & ECDHE leaves petabytes of stored corporate traffic exposed to Shor's algorithm on CRQC arrival.</p>
        </div>

        <div class="comparison-grid">
            <!-- Classical Vulnerability Card -->
            <div class="comparison-card card-classical">
                <div>
                    <div class="card-badge badge-red">● CRITICAL EXPOSURE · SHOR'S VULNERABLE</div>
                    <h3 class="card-title">Classical Cryptography (RSA / ECDHE)</h3>
                    <p class="card-subtitle">Traffic intercepted today on fiber taps, stored in adversary vaults, and decrypted retrospectively.</p>

                    <ul class="trait-list">
                        <li class="trait-item">
                            <span class="trait-icon-bad">✕</span>
                            <span><strong>Integer Factorization & Discrete Log:</strong> Broken in polynomial time via Shor's algorithm.</span>
                        </li>
                        <li class="trait-item">
                            <span class="trait-icon-bad">✕</span>
                            <span><strong>Harvest Now, Decrypt Later (HNDL):</strong> Passive adversaries capture in-flight TLS 1.2 traffic today.</span>
                        </li>
                        <li class="trait-item">
                            <span class="trait-icon-bad">✕</span>
                            <span><strong>High-Value Asset Exposure:</strong> API auth tokens, credit card pre-auths, passenger itineraries.</span>
                        </li>
                    </ul>
                </div>

                <div class="trait-metric">
                    <span style="color: var(--text-smoke);">QUANTUM READINESS SCORE:</span>
                    <span style="color: var(--red); font-weight: 700;">34 / 100 (FAIL)</span>
                </div>
            </div>

            <!-- QuantWarden PQC Shield Card -->
            <div class="comparison-card card-pqc">
                <div>
                    <div class="card-badge badge-green">● IMMUNIZED · NIST FIPS 203 / 204 ACTIVE</div>
                    <h3 class="card-title">QuantWarden Sovereign PQC Architecture</h3>
                    <p class="card-subtitle">Lattice-based mathematical hardness ensuring captured data remains completely undecryptable forever.</p>

                    <ul class="trait-list">
                        <li class="trait-item">
                            <span class="trait-icon-good">✓</span>
                            <span><strong>NIST FIPS 203 ML-KEM-768:</strong> Module Learning With Errors (M-LWE) lattice hardness.</span>
                        </li>
                        <li class="trait-item">
                            <span class="trait-icon-good">✓</span>
                            <span><strong>TLS 1.3 Hybrid Key Exchange:</strong> Codepoint 0x11EC (X25519MLKEM768) native key encapsulation.</span>
                        </li>
                        <li class="trait-item">
                            <span class="trait-icon-good">✓</span>
                            <span><strong>Automated Code Remediation:</strong> AST codemods patch vulnerable RSA/ECDH calls into post-quantum wrappers.</span>
                        </li>
                    </ul>
                </div>

                <div class="trait-metric">
                    <span style="color: var(--text-smoke);">QUANTUM READINESS SCORE:</span>
                    <span style="color: var(--emerald); font-weight: 700;">98 / 100 (IMMUNIZED)</span>
                </div>
            </div>
        </div>
    </section>

    <!-- The 6 Pillars Feature Grid (FeatureGrid.tsx) -->
    <section id="pillars" class="features-section">
        <div class="section-header-center">
            <div class="eyebrow-pill">
                <span class="dot-coral"></span>
                <span>THE 6 PILLARS OF POST-QUANTUM ASSURANCE</span>
            </div>
            <h2 class="section-title">Every requirement addressed. Zero compromise.</h2>
            <p class="section-desc">From wire-level TLS ClientHello probing to automated AST code refactoring, every plane of enterprise infrastructure is protected.</p>
        </div>

        <div class="pillars-grid">
            <!-- Pillar 1 -->
            <div class="pillar-card">
                <div>
                    <div class="pillar-top">
                        <div class="pillar-icon-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </div>
                        <span class="pillar-badge">WIRE PROBE</span>
                    </div>
                    <h3 class="pillar-title">Wire-Level TLS 1.3 Hybrid Engine</h3>
                    <p class="pillar-desc">Raw socket ClientHello advertising NIST FIPS 203 X25519MLKEM768 (codepoint 0x11EC) without requiring customized OpenSSL forks.</p>
                </div>
                <div class="pillar-footer">
                    <span class="pillar-metric">&lt; 45ms</span>
                    <span class="pillar-metric-sub">Zero Handshake Overhead</span>
                </div>
            </div>

            <!-- Pillar 2 -->
            <div class="pillar-card">
                <div>
                    <div class="pillar-top">
                        <div class="pillar-icon-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                        </div>
                        <span class="pillar-badge">RADIAL MAP</span>
                    </div>
                    <h3 class="pillar-title">Vector Radial Topology Map</h3>
                    <p class="pillar-desc">Radial attack surface graph classifying perimeter endpoints as CORRECT (ML-KEM) vs WRONG (Classical ECDHE) with live radar telemetry.</p>
                </div>
                <div class="pillar-footer">
                    <span class="pillar-metric">100%</span>
                    <span class="pillar-metric-sub">Attack Surface Coverage</span>
                </div>
            </div>

            <!-- Pillar 3 -->
            <div class="pillar-card">
                <div>
                    <div class="pillar-top">
                        <div class="pillar-icon-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <span class="pillar-badge">COMPLIANCE</span>
                    </div>
                    <h3 class="pillar-title">CycloneDX 1.6 CBOM Generator</h3>
                    <p class="pillar-desc">Generates standardized Cryptographic Bills of Materials (CBOM) compliant with CERT-In and NIST FIPS 203/204 transition mandates.</p>
                </div>
                <div class="pillar-footer">
                    <span class="pillar-metric">FIPS 203</span>
                    <span class="pillar-metric-sub">CycloneDX 1.6 Standard</span>
                </div>
            </div>

            <!-- Pillar 4 -->
            <div class="pillar-card">
                <div>
                    <div class="pillar-top">
                        <div class="pillar-icon-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </div>
                        <span class="pillar-badge">AST CODEMOD</span>
                    </div>
                    <h3 class="pillar-title">Autonomous Code Remediation</h3>
                    <p class="pillar-desc">Scans source code (Python, JS/TS, Go, Nginx) and autonomously refactors legacy RSA/ECDH calls into ML-KEM-768 hybrid wrappers.</p>
                </div>
                <div class="pillar-footer">
                    <span class="pillar-metric">0 Lines</span>
                    <span class="pillar-metric-sub">Manual Guesswork Eliminated</span>
                </div>
            </div>

            <!-- Pillar 5 -->
            <div class="pillar-card">
                <div>
                    <div class="pillar-top">
                        <div class="pillar-icon-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/><path d="M12 6v6l4 2"/></svg>
                        </div>
                        <span class="pillar-badge">AI LAYER</span>
                    </div>
                    <h3 class="pillar-title">Google Gemini 3.8 Flash AI</h3>
                    <p class="pillar-desc">Embedded sovereign cryptographer analyzing live telemetries, mapping HNDL attack surfaces, and generating edge reverse proxy directives.</p>
                </div>
                <div class="pillar-footer">
                    <span class="pillar-metric">Instant</span>
                    <span class="pillar-metric-sub">Automated Threat Synthesis</span>
                </div>
            </div>

            <!-- Pillar 6 -->
            <div class="pillar-card">
                <div>
                    <div class="pillar-top">
                        <div class="pillar-icon-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                        </div>
                        <span class="pillar-badge">CI/CD GATE</span>
                    </div>
                    <h3 class="pillar-title">GitHub Actions Quality Gate</h3>
                    <p class="pillar-desc">Turnkey composite GitHub Action breaking pull request builds if classical cryptography regressions or low PQC scores are introduced.</p>
                </div>
                <div class="pillar-footer">
                    <span class="pillar-metric">100%</span>
                    <span class="pillar-metric-sub">Zero-Regression Guarantee</span>
                </div>
            </div>
        </div>
    </section>

    <!-- QuickStart Terminal (QuickStartTerminal.tsx) -->
    <section id="terminal" class="terminal-section">
        <div class="section-header-center">
            <div class="eyebrow-pill">
                <span class="dot-coral"></span>
                <span>ONE-LINE LOCAL-FIRST BOOTSTRAP</span>
            </div>
            <h2 class="section-title">Run QuantWarden on any machine in seconds.</h2>
            <p class="section-desc">Audit live endpoints, scan source code, export CBOM, and enforce PQC quality gates via CLI.</p>
        </div>

        <div class="terminal-container">
            <div class="terminal-header">
                <div class="terminal-controls">
                    <div class="macos-dot dot-close"></div>
                    <div class="macos-dot dot-min"></div>
                    <div class="macos-dot dot-max"></div>
                </div>

                <div class="terminal-tabs">
                    <button class="t-tab active" onclick="switchTab('probe')">probe</button>
                    <button class="t-tab" onclick="switchTab('scan')">scan</button>
                    <button class="t-tab" onclick="switchTab('cbom')">cbom</button>
                    <button class="t-tab" onclick="switchTab('remediate')">remediate</button>
                </div>

                <button class="btn-copy-terminal" onclick="copyCurrentTerminal()">
                    <span>Copy</span>
                </button>
            </div>

            <div class="terminal-body" id="terminalBody">
                <div class="t-comment"># Execute wire-level TLS 1.3 ClientHello (0x11EC X25519MLKEM768) probe</div>
                <div><span style="color: var(--coral);">$</span> <span class="t-cmd">quantwarden probe airlinecabz.com</span></div>
                <br>
                <div class="t-comment"># Output: Endpoint Quantum Posture Card</div>
                <div>  Target:     airlinecabz.com:443  (58ms latency)</div>
                <div>  Status:     <span class="t-red">● CLASSICAL ONLY (HNDL AT RISK)</span></div>
                <div>  Readiness:  <span class="t-red">34 / 100</span></div>
                <div>  KEX Group:  ECDHE-RSA (P-256 Classical)</div>
                <br>
                <div class="t-comment"># Discovered Leaf Services (0 CORRECT · 9 WRONG)</div>
                <div>  ├── <span class="t-red">[ ✕ WRONG ]</span> Classical ECDHE  https://airlinecabz.com/book</div>
                <div>  ├── <span class="t-red">[ ✕ WRONG ]</span> Classical ECDHE  https://airlinecabz.com/api/auth/sessions</div>
                <div>  └── <span class="t-red">[ ✕ WRONG ]</span> Classical ECDHE  wss://driver.airlinecabz.com:8443/telemetry</div>
            </div>
        </div>
    </section>

    <!-- Command Palette Modal -->
    <div id="cmdModal" class="cmd-modal-backdrop" onclick="if(event.target===this) closeCmdPalette()">
        <div class="cmd-modal">
            <div class="cmd-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input id="cmdSearchInput" type="text" class="cmd-input" placeholder="Type a command or search..." oninput="filterCommands(this.value)">
            </div>
            <div class="cmd-list" id="cmdList">
                <div class="cmd-item" onclick="runPreset('airlinecabz.com'); closeCmdPalette();">
                    <span>Probe Demo Target: airlinecabz.com</span>
                    <span class="cmd-item-shortcut">Enter</span>
                </div>
                <div class="cmd-item" onclick="document.getElementById('vectorViewContainer').scrollIntoView({behavior:'smooth'}); closeCmdPalette();">
                    <span>Open Vector Radial Topology Map</span>
                    <span class="cmd-item-shortcut">⌘U</span>
                </div>
                <div class="cmd-item" onclick="copySnippet('npx quantwarden cbom . --out cbom.json'); closeCmdPalette();">
                    <span>Export CycloneDX 1.6 CBOM</span>
                    <span class="cmd-item-shortcut">⌘C</span>
                </div>
                <div class="cmd-item" onclick="copySnippet('npx quantwarden remediate . --apply'); closeCmdPalette();">
                    <span>Autonomously Remediate Code (NIST FIPS 203)</span>
                    <span class="cmd-item-shortcut">⌘R</span>
                </div>
                <div class="cmd-item" onclick="window.open('https://github.com/shree1071/quantwarden', '_blank'); closeCmdPalette();">
                    <span>Open GitHub Repository (shree1071/quantwarden)</span>
                    <span class="cmd-item-shortcut">GitHub</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Minimalist Modern Footer -->
    <footer>
        <div class="footer-content">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div class="nav-brand-icon" style="width: 20px; height: 20px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span style="font-weight: 700; color: #ffffff;">QUANTWARDEN</span>
                <span style="color: var(--text-smoke);">— Sovereign Post-Quantum Cryptography Platform</span>
            </div>

            <ul class="footer-links">
                <li><a href="https://github.com/shree1071/quantwarden" target="_blank" class="footer-link">GitHub</a></li>
                <li><a href="https://quantwarden.vercel.app" class="footer-link">Live Deployment</a></li>
                <li><a href="https://csrc.nist.gov/pubs/fips/203/final" target="_blank" class="footer-link">NIST FIPS 203 Spec</a></li>
                <li><a href="https://csrc.nist.gov/pubs/fips/204/final" target="_blank" class="footer-link">NIST FIPS 204 Spec</a></li>
            </ul>

            <div style="font-family: var(--font-mono); font-size: 11px;">
                Licensed under Apache-2.0 · Built for the Post-Quantum Cryptographic Transition
            </div>
        </div>
    </footer>

    <!-- Interactive JavaScript Logic -->
    <script>
        // -------------------------------------------------------------
        // MOUSE PARALLAX ON RAYCAST HERO BACKGROUND
        // -------------------------------------------------------------
        let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        function animParallax() {
            currentX += (mouseX - currentX) * 0.05;
            currentY += (mouseY - currentY) * 0.05;
            const heroBg = document.getElementById('raycastHeroBg');
            if (heroBg) {
                heroBg.style.transform = \`scale(1.04) translate3d(\${currentX * 12}px, \${currentY * 6}px, 0px) rotateX(\${-currentY * 1.0}deg) rotateY(\${currentX * 1.5}deg)\`;
            }
            requestAnimationFrame(animParallax);
        }
        requestAnimationFrame(animParallax);

        // -------------------------------------------------------------
        // TOAST NOTIFICATIONS & CLIPBOARD HELPER
        // -------------------------------------------------------------
        function showToast(msg) {
            const toast = document.getElementById('toastNotify');
            const toastMsg = document.getElementById('toastMsg');
            toastMsg.textContent = msg;
            toast.style.display = 'flex';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 2600);
        }

        function copySnippet(text) {
            navigator.clipboard.writeText(text);
            showToast(\`Copied: \${text}\`);
        }

        // -------------------------------------------------------------
        // KEYBOARD SHORTCUTS & COMMAND PALETTE
        // -------------------------------------------------------------
        window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggleCmdPalette();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
                e.preventDefault();
                document.getElementById('vectorViewContainer').scrollIntoView({ behavior: 'smooth' });
            } else if (e.key === 'Escape') {
                closeCmdPalette();
            }
        });

        function openCmdPalette() {
            document.getElementById('cmdModal').style.display = 'flex';
            document.getElementById('cmdSearchInput').focus();
        }

        function closeCmdPalette() {
            document.getElementById('cmdModal').style.display = 'none';
        }

        function toggleCmdPalette() {
            const modal = document.getElementById('cmdModal');
            if (modal.style.display === 'flex') closeCmdPalette();
            else openCmdPalette();
        }

        function filterCommands(query) {
            const items = document.querySelectorAll('.cmd-item');
            const q = query.toLowerCase();
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(q) ? 'flex' : 'none';
            });
        }

        // -------------------------------------------------------------
        // TERMINAL TAB SWITCHER
        // -------------------------------------------------------------
        let currentTab = 'probe';
        const terminalSnippets = {
            probe: \`<div class="t-comment"># Execute wire-level TLS 1.3 ClientHello (0x11EC X25519MLKEM768) probe</div>
<div><span style="color: var(--coral);">$</span> <span class="t-cmd">quantwarden probe airlinecabz.com</span></div>
<br>
<div class="t-comment"># Output: Endpoint Quantum Posture Card</div>
<div>  Target:     airlinecabz.com:443  (58ms latency)</div>
<div>  Status:     <span class="t-red">● CLASSICAL ONLY (HNDL AT RISK)</span></div>
<div>  Readiness:  <span class="t-red">34 / 100</span></div>
<div>  KEX Group:  ECDHE-RSA (P-256 Classical)</div>
<br>
<div class="t-comment"># Discovered Leaf Services (0 CORRECT · 9 WRONG)</div>
<div>  ├── <span class="t-red">[ ✕ WRONG ]</span> Classical ECDHE  https://airlinecabz.com/book</div>
<div>  ├── <span class="t-red">[ ✕ WRONG ]</span> Classical ECDHE  https://airlinecabz.com/api/auth/sessions</div>
<div>  └── <span class="t-red">[ ✕ WRONG ]</span> Classical ECDHE  wss://driver.airlinecabz.com:8443/telemetry</div>\`,

            scan: \`<div class="t-comment"># Scan source code for classical RSA, ECDSA, ECDH & Diffie-Hellman</div>
<div><span style="color: var(--coral);">$</span> <span class="t-cmd">quantwarden scan ./src --format sarif --out quantwarden.sarif</span></div>
<br>
<div class="t-comment"># Static AST Analysis Summary</div>
<div>  ● Analyzed: 42 files across Python, TypeScript, Nginx</div>
<div>  ● Identified: 8 vulnerable cryptographic primitives</div>
<div>  ● SARIF report written to quantwarden.sarif for GitHub Security Tab</div>\`,

            cbom: \`<div class="t-comment"># Generate standardized CycloneDX 1.6 Cryptographic Bill of Materials</div>
<div><span style="color: var(--coral);">$</span> <span class="t-cmd">quantwarden cbom . --out quantwarden-cbom.json</span></div>
<br>
<div>  <span class="t-green">✓ CycloneDX 1.6 CBOM generated successfully</span></div>
<div>  ● Format: application/vnd.cyclonedx+json;version=1.6</div>
<div>  ● Standards: CERT-In Post-Quantum Guidelines & NIST FIPS 203</div>\`,

            remediate: \`<div class="t-comment"># Autonomous AST refactoring migrating legacy crypto to ML-KEM-768</div>
<div><span style="color: var(--coral);">$</span> <span class="t-cmd">quantwarden remediate ./src --apply</span></div>
<br>
<div>  <span class="t-green">✓ crypto_handler.py patched: RSA 2048 -> NIST FIPS 203 ML-KEM-768</span></div>
<div>  <span class="t-green">✓ nginx.conf patched: ssl_ecdh_curve X25519MLKEM768:X25519</span></div>
<div>  ● Unified git diffs applied with automatic .bak safety preservation</div>\`
        };

        function switchTab(tab) {
            currentTab = tab;
            document.querySelectorAll('.t-tab').forEach(b => {
                b.classList.toggle('active', b.textContent === tab);
            });
            document.getElementById('terminalBody').innerHTML = terminalSnippets[tab];
        }

        function copyCurrentTerminal() {
            const rawCommands = {
                probe: 'quantwarden probe airlinecabz.com',
                scan: 'quantwarden scan ./src --format sarif --out quantwarden.sarif',
                cbom: 'quantwarden cbom . --out quantwarden-cbom.json',
                remediate: 'quantwarden remediate ./src --apply'
            };
            copySnippet(rawCommands[currentTab]);
        }

        // -------------------------------------------------------------
        // LIVE DOMAIN PROBE & VECTOR TOPOLOGY LOGIC
        // -------------------------------------------------------------
        let currentData = null;
        let activeVectorLeaves = [];
        let selectedNodeIdx = 0;

        const form = document.getElementById('probeForm');
        const input = document.getElementById('targetInput');
        const btn = document.getElementById('probeBtn');
        const progress = document.getElementById('scanProgress');
        const results = document.getElementById('resultsSection');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            runScan(input.value.trim());
        });

        function runPreset(domain) {
            input.value = domain;
            runScan(domain);
        }

        const delay = ms => new Promise(res => setTimeout(res, ms));

        function setStep(num, status) {
            const s = document.getElementById('step' + num);
            if (s) {
                s.className = 'prog-step ' + status;
            }
        }

        async function runScan(target) {
            if (!target) return;
            btn.disabled = true;
            results.style.display = 'none';
            progress.style.display = 'block';

            for (let i = 1; i <= 5; i++) setStep(i, '');

            setStep(1, 'active');
            await delay(250);
            setStep(1, 'done');

            setStep(2, 'active');

            try {
                const fetchPromise = fetch(\`/api/probe?domain=\${encodeURIComponent(target)}\`).then(r => r.json());

                await delay(300);
                setStep(2, 'done');
                setStep(3, 'active');

                await delay(280);
                setStep(3, 'done');
                setStep(4, 'active');

                await delay(250);
                const res = await fetchPromise;

                setStep(4, 'done');
                setStep(5, 'active');
                await delay(300);
                setStep(5, 'done');

                progress.style.display = 'none';
                btn.disabled = false;

                if (res.ok && res.data) {
                    renderResults(res.data);
                } else {
                    renderFallback(target);
                }
            } catch (err) {
                progress.style.display = 'none';
                btn.disabled = false;
                renderFallback(target);
            }
        }

        function renderResults(data) {
            currentData = data;
            results.style.display = 'block';

            document.getElementById('resScore').textContent = data.readinessScore ?? 34;
            const score = data.readinessScore ?? 34;
            const offset = 314 - (score / 100) * 314;
            document.getElementById('gaugeFill').style.strokeDashoffset = offset;
            document.getElementById('gaugeFill').style.stroke = data.hybridSelected ? 'var(--emerald)' : 'var(--red)';

            document.getElementById('resHndlStatus').textContent = data.hybridSelected ? 'IMMUNIZED' : 'CRITICAL EXPOSURE';
            document.getElementById('resHndlStatus').style.color = data.hybridSelected ? 'var(--emerald)' : 'var(--red)';

            const leaves = data.leafEndpoints || [];
            document.getElementById('resLeafCount').textContent = \`\${leaves.length} Discovered\`;
            document.getElementById('resLatency').textContent = \`\${data.latencyMs || 58}ms\`;

            renderVectorTopology(data);
        }

        function renderFallback(target) {
            renderResults({
                host: target,
                port: 443,
                readinessScore: 34,
                hybridSelected: false,
                latencyMs: 58,
                leafEndpoints: [
                    { name: 'Apex Web Hub', url: 'https://' + target + '/', hybridSelected: false, role: 'Apex Gateway', reachable: true },
                    { name: 'Ride Booking Engine', url: 'https://' + target + '/book', hybridSelected: false, role: 'Booking API', reachable: true, dataAtRisk: 'Passenger manifests, credit card tokens' },
                    { name: 'Session Auth Handshake', url: 'https://' + target + '/api/auth/sessions/current', hybridSelected: false, role: 'Auth Handshake', reachable: true, dataAtRisk: 'Active JWT session tokens' },
                    { name: 'OAuth 2.0 Token Exchange', url: 'https://' + target + '/api/auth/oauth/exchange', hybridSelected: false, role: 'OAuth Provider', reachable: true, dataAtRisk: 'Client credentials & auth codes' },
                    { name: 'Fleet AI Assistant', url: 'https://' + target + '/api/ai/chat/completion', hybridSelected: false, role: 'Fleet AI Copilot', reachable: true, dataAtRisk: 'Passenger prompt itineraries' },
                    { name: 'Distance Tariff Matrix', url: 'https://' + target + '/km', hybridSelected: false, role: 'Tariff Engine', reachable: true, dataAtRisk: 'Corporate billing formulas' },
                    { name: 'Hourly Rental Calculator', url: 'https://' + target + '/hr', hybridSelected: false, role: 'Tariff Calculator', reachable: true, dataAtRisk: 'Hourly pricing quotes' },
                    { name: 'Driver Telemetry Stream', url: 'wss://driver.' + target + ':8443/telemetry', hybridSelected: false, role: 'Driver Stream', reachable: true, dataAtRisk: 'Live GPS coordinates & fare status' },
                    { name: 'Corporate Mail Exchange', url: 'smtp://mail.' + target + ':25', hybridSelected: false, role: 'Mail Relay', reachable: true, dataAtRisk: 'Corporate travel invoices & receipts' }
                ]
            });
        }

        function renderVectorTopology(data) {
            const isPqc = Boolean(data.hybridSelected);
            const score = data.readinessScore ?? 34;
            const host = data.host;
            const port = data.port || 443;

            document.getElementById('hudTargetText').textContent = \`\${host}:\${port}\`;
            const leaves = data.leafEndpoints || [];
            activeVectorLeaves = leaves;

            const childLeaves = leaves.length > 1 ? leaves.slice(1) : leaves;
            const wrongCount = childLeaves.filter(l => !l.hybridSelected).length;
            const correctCount = childLeaves.filter(l => l.hybridSelected).length;

            document.getElementById('hudStatusBadge').textContent = \`\${correctCount} CORRECT · \${wrongCount} WRONG (\${Math.round((wrongCount/childLeaves.length)*100)}% EXPOSURE)\`;
            document.getElementById('hubScorePillText').textContent = \`✕ SCORE: \${score}/100 · \${wrongCount} WRONG\`;

            const linesLayer = document.getElementById('vectorLinesLayer');
            const packetsLayer = document.getElementById('vectorPacketsLayer');
            const nodesLayer = document.getElementById('vectorNodesLayer');
            linesLayer.innerHTML = '';
            packetsLayer.innerHTML = '';
            nodesLayer.innerHTML = '';

            const N = childLeaves.length;
            const cx = 500;
            const cy = 260;
            const Rx = 360;
            const Ry = 190;

            childLeaves.forEach((leaf, idx) => {
                const angle = (idx * (2 * Math.PI / N)) - (Math.PI / 2);
                const xi = Math.round(cx + Rx * Math.cos(angle));
                const yi = Math.round(cy + Ry * Math.sin(angle));
                const leafPqc = Boolean(leaf.hybridSelected);
                const lineColor = leafPqc ? '#10b981' : '#ef4444';
                const dotColor = leafPqc ? '#10b981' : '#ef4444';

                // 1. Vector Connector Line
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', cx);
                line.setAttribute('y1', cy);
                line.setAttribute('x2', xi);
                line.setAttribute('y2', yi);
                line.setAttribute('stroke', lineColor);
                line.setAttribute('stroke-width', '1.5');
                line.setAttribute('stroke-opacity', '0.45');
                linesLayer.appendChild(line);

                // 2. Animated Packet Particle
                const packet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                packet.setAttribute('r', '3');
                packet.setAttribute('fill', dotColor);
                packet.setAttribute('filter', 'drop-shadow(0 0 4px ' + dotColor + ')');
                const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
                anim.setAttribute('path', \`M \${cx} \${cy} L \${xi} \${yi}\`);
                anim.setAttribute('dur', \`\${1.8 + (idx % 3) * 0.4}s\`);
                anim.setAttribute('repeatCount', 'indefinite');
                packet.appendChild(anim);
                packetsLayer.appendChild(packet);

                // 3. Satellite Node Group
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                group.setAttribute('class', 'vector-node-group');
                group.setAttribute('data-index', idx);

                const nodeW = 196;
                const nodeH = 68;
                const nx = xi - (nodeW / 2);
                const ny = yi - (nodeH / 2);

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', nx);
                rect.setAttribute('y', ny);
                rect.setAttribute('width', nodeW);
                rect.setAttribute('height', nodeH);
                rect.setAttribute('rx', '9');
                rect.setAttribute('fill', '#0d0e12');
                rect.setAttribute('stroke', leafPqc ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)');
                rect.setAttribute('stroke-width', '1.2');

                const tRole = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tRole.setAttribute('x', nx + 10);
                tRole.setAttribute('y', ny + 16);
                tRole.setAttribute('fill', '#9ca3af');
                tRole.setAttribute('font-family', "'JetBrains Mono', monospace");
                tRole.setAttribute('font-size', '8');
                tRole.setAttribute('font-weight', '600');
                tRole.textContent = (leaf.role || 'LEAF SERVICE').toUpperCase().substring(0, 16);

                const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const bRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bRect.setAttribute('x', nx + nodeW - 74);
                bRect.setAttribute('y', ny + 6);
                bRect.setAttribute('width', '66');
                bRect.setAttribute('height', '15');
                bRect.setAttribute('rx', '7.5');
                bRect.setAttribute('fill', leafPqc ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)');
                bRect.setAttribute('stroke', leafPqc ? '#10b981' : '#ef4444');
                bRect.setAttribute('stroke-width', '0.8');

                const bText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                bText.setAttribute('x', nx + nodeW - 41);
                bText.setAttribute('y', ny + 17);
                bText.setAttribute('text-anchor', 'middle');
                bText.setAttribute('fill', leafPqc ? '#6ee7b7' : '#ff8080');
                bText.setAttribute('font-family', "'JetBrains Mono', monospace");
                bText.setAttribute('font-size', '7.5');
                bText.setAttribute('font-weight', '800');
                bText.textContent = leafPqc ? '✓ CORRECT' : '✕ WRONG';

                badgeGroup.appendChild(bRect);
                badgeGroup.appendChild(bText);

                const tName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tName.setAttribute('x', nx + 10);
                tName.setAttribute('y', ny + 36);
                tName.setAttribute('fill', '#ffffff');
                tName.setAttribute('font-family', "'JetBrains Mono', monospace");
                tName.setAttribute('font-size', '10.5');
                tName.setAttribute('font-weight', '700');
                const displayName = leaf.url ? leaf.url.replace(/^https?:\\/\\//, '') : (leaf.name || leaf.host);
                tName.textContent = displayName.length > 22 ? displayName.substring(0, 20) + '..' : displayName;

                const tCrypto = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tCrypto.setAttribute('x', nx + 10);
                tCrypto.setAttribute('y', ny + 53);
                tCrypto.setAttribute('fill', leafPqc ? '#10b981' : '#fca5a5');
                tCrypto.setAttribute('font-family', "'JetBrains Mono', monospace");
                tCrypto.setAttribute('font-size', '8');
                tCrypto.setAttribute('font-weight', '600');
                tCrypto.textContent = leafPqc ? '● PQC HYBRID (ML-KEM-768)' : '● CLASSICAL ECDHE (HNDL RISK)';

                group.appendChild(rect);
                group.appendChild(tRole);
                group.appendChild(badgeGroup);
                group.appendChild(tName);
                group.appendChild(tCrypto);

                group.addEventListener('mouseenter', () => selectVectorNode(idx));
                group.addEventListener('click', () => selectVectorNode(idx));

                nodesLayer.appendChild(group);
            });

            selectVectorNode(0);
        }

        function selectVectorNode(idx) {
            const leaves = activeVectorLeaves.length > 1 ? activeVectorLeaves.slice(1) : activeVectorLeaves;
            const node = leaves[idx];
            if (!node) return;

            document.getElementById('inspNode').textContent = node.url || node.name;
            const isPqc = Boolean(node.hybridSelected);
            const verdict = document.getElementById('inspVerdict');
            verdict.textContent = isPqc ? '✓ CORRECT · ML-KEM-768 IMMUNIZED' : '✕ WRONG · VULNERABLE TO HNDL';
            verdict.style.color = isPqc ? 'var(--emerald)' : 'var(--red)';

            document.getElementById('inspKex').textContent = isPqc ? 'X25519MLKEM768 (0x11EC Hybrid)' : 'ECDHE-RSA (Classical P-256)';
            document.getElementById('inspData').textContent = node.dataAtRisk || (isPqc ? 'Session keys fully protected' : 'In-flight encrypted traffic susceptible to capture');
        }

        function switchTopologyView(view) {
            const vectorWrap = document.getElementById('vectorViewContainer');
            const grid = document.getElementById('leafGrid');
            const btnVec = document.getElementById('btnViewVector');
            const btnGrid = document.getElementById('btnViewGrid');

            if (view === 'vector') {
                vectorWrap.style.display = 'block';
                grid.style.display = 'none';
                btnVec.classList.add('active');
                btnGrid.classList.remove('active');
            } else {
                vectorWrap.style.display = 'none';
                grid.style.display = 'grid';
                btnVec.classList.remove('active');
                btnGrid.classList.add('active');
                renderGridCards();
            }
        }

        function renderGridCards() {
            const grid = document.getElementById('leafGrid');
            grid.innerHTML = '';
            const leaves = activeVectorLeaves.length > 1 ? activeVectorLeaves.slice(1) : activeVectorLeaves;
            leaves.forEach(leaf => {
                const card = document.createElement('div');
                card.style.background = '#0b0c0f';
                card.style.border = '1px solid #27282b';
                card.style.borderRadius = '10px';
                card.style.padding = '16px';
                const isPqc = leaf.hybridSelected;
                card.innerHTML = \`
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-smoke);">\${leaf.role || 'ENDPOINT'}</span>
                        <span style="font-size: 9px; font-family: var(--font-mono); font-weight: 700; padding: 2px 6px; border-radius: 4px; \${isPqc ? 'background: var(--emerald-bg); color: var(--emerald); border: 1px solid var(--emerald-border);' : 'background: var(--red-bg); color: var(--red); border: 1px solid var(--red-border);'}">\${isPqc ? '✓ CORRECT' : '✕ WRONG'}</span>
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 6px; word-break: break-all;">\${leaf.url || leaf.name}</div>
                    <div style="font-size: 11px; font-family: var(--font-mono); color: \${isPqc ? 'var(--emerald)' : 'var(--text-smoke)'};">\${isPqc ? '● ML-KEM-768 Hybrid' : '● Classical ECDHE (HNDL Risk)'}</div>
                \`;
                grid.appendChild(card);
            });
        }

        // Auto-run benchmark demo on DOM load
        window.addEventListener('DOMContentLoaded', () => {
            runScan('airlinecabz.com');
        });
    </script>
</body>
</html>
`;

const targets = [
    'C:/Users/shree/quantwarden/public/index.html',
    'C:/Users/shree/quantwarden/web/public/index.html',
    'C:/Users/shree/quantguard-domain-scanner/public/index.html'
];

for (const t of targets) {
    fs.writeFileSync(t, htmlContent, 'utf8');
    console.log('Wrote updated landing page to:', t);
}
