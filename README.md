# QuantWarden (QuantGuard)

```
  ██████╗  ██╗   ██╗  █████╗  ███╗   ██╗ ████████╗
 ██╔═══██╗ ██║   ██║ ██╔══██╗ ████╗  ██║ ╚══██╔══╝
 ██║   ██║ ██║   ██║ ███████║ ██╔██╗ ██║    ██║   
 ██║▄▄ ██║ ██║   ██║ ██╔══██║ ██║╚██╗██║    ██║   
 ╚██████╔╝ ╚██████╔╝ ██║  ██║ ██║ ╚████║    ██║   
  ╚══▀▀═╝   ╚═════╝  ╚═╝  ╚═╝ ╚═╝  ╚═══╝    ╚═╝   
 ██╗    ██╗  █████╗  ██████╗  ██████╗  ███████╗ ███╗   ██╗
 ██║    ██║ ██╔══██╗ ██╔══██╗ ██╔══██╗ ██╔════╝ ████╗  ██║
 ██║ █╗ ██║ ███████║ ██████╔╝ ██║  ██║ █████╗   ██╔██╗ ██║
 ██║███╗██║ ██╔══██║ ██╔══██╗ ██║  ██║ ██╔══╝   ██║╚██╗██║
 ╚███╔███╔╝ ██║  ██║ ██║  ██║ ██████╔╝ ███████╗ ██║ ╚████║
  ╚══╝╚══╝  ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═════╝  ╚══════╝ ╚═╝  ╚═══╝
```

<p align="center">
  <strong>The Sovereign Post-Quantum Cryptography (PQC) Security Platform & Perimeter Sentinel</strong><br>
  <em>Discover, audit, and immunize infrastructure against Harvest Now, Decrypt Later (HNDL) quantum attacks.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NIST-FIPS%20203%20%7C%20204%20%7C%20205-10b981?style=for-the-badge&logo=shield" alt="NIST FIPS 203/204/205">
  <img src="https://img.shields.io/badge/TLS%201.3-X25519MLKEM768%20(0x11EC)-0099ff?style=for-the-badge&logo=wireguard" alt="TLS 1.3 ML-KEM-768">
  <img src="https://img.shields.io/badge/CBOM-CycloneDX%201.6-8b5cf6?style=for-the-badge" alt="CycloneDX 1.6 CBOM">
  <img src="https://img.shields.io/badge/SARIF-OASIS%202.1.0-ec4899?style=for-the-badge" alt="SARIF 2.1.0">
  <img src="https://img.shields.io/badge/AI%20Layer-Google%20Gemini%203.8%20Flash-f59e0b?style=for-the-badge&logo=google" alt="Google Gemini AI">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge" alt="Apache 2.0">
</p>

---

## Table of Contents

- [Overview](#overview)
- [The Threat: Harvest Now, Decrypt Later (HNDL)](#the-threat-harvest-now-decrypt-later-hndl)
- [Key Features](#key-features)
  - [1. Interactive Vector Radial Topology Graph](#1-interactive-vector-radial-topology-graph)
  - [2. Wire-Level PQC TLS 1.3 Probe Engine](#2-wire-level-pqc-tls-13-probe-engine)
  - [3. Autonomous Codebase Remediation](#3-autonomous-codebase-remediation)
  - [4. CycloneDX 1.6 CBOM & SARIF 2.1.0](#4-cyclonedx-16-cbom--sarif-210)
  - [5. Sovereign AI Analysis (Gemini 3.8 Flash)](#5-sovereign-ai-analysis-gemini-38-flash)
  - [6. CI/CD GitHub Action Quality Gate](#6-cicd-github-action-quality-gate)
  - [7. VS Code Extension](#7-vs-code-extension)
- [Repository Structure (Monorepo)](#repository-structure-monorepo)
- [Quick Start](#quick-start)
- [CLI Command Reference](#cli-command-reference)
- [Web Dashboard Sentinel](#web-dashboard-sentinel)
- [Real-World Benchmark Case Study: `airlinecabz.com`](#real-world-benchmark-case-study-airlinecabzcom)
- [GitHub Actions Integration](#github-actions-integration)
- [Cryptographic Standards Reference](#cryptographic-standards-reference)
- [License](#license)

---

## Overview

**QuantWarden** (also distributed as **QuantGuard**) is an end-to-end Post-Quantum Cryptography (PQC) security platform. It provides automated perimeter scanning, wire-level TLS 1.3 hybrid handshake verification, codebase vulnerability discovery, Cryptography Bill of Materials (CBOM) generation, and automated code refactoring.

Built to operationalize **NIST FIPS 203 (ML-KEM)**, **FIPS 204 (ML-DSA)**, **FIPS 205 (SLH-DSA)**, and **NSA CNSA 2.0** mandates, QuantWarden enables security engineering teams to identify quantum attack vectors before adversaries decrypt captured traffic.

---

## The Threat: Harvest Now, Decrypt Later (HNDL)

Traditional encryption algorithms protecting global web traffic, APIs, authentication tokens, and databases depend on mathematical problems vulnerable to Shor's algorithm:

- **RSA (Rivest–Shamir–Adleman)**: Integer factorization
- **Diffie-Hellman / ECDHE**: Discrete logarithm problem over elliptic curves (P-256, P-384, X25519)

### The Asymmetric Threat Horizon
Adversaries and nation-states are executing **Harvest Now, Decrypt Later (HNDL)** campaigns—intercepting and storing petabytes of encrypted HTTPS, VPN, and database replication traffic today. When Cryptanalytically Relevant Quantum Computers (CRQCs) come online, this stored traffic will be decrypted retrospectively.

```
+-----------------------------------------------------------------------------------+
|                           HARVEST NOW, DECRYPT LATER (HNDL)                       |
+-----------------------------------------------------------------------------------+
|  TODAY (Classical Era)                |  FUTURE (Quantum Era - CRQC Arrival)      |
|                                       |                                           |
|  [ Client ] ----( TLS 1.2 / ECDHE )---> [ Server ]                                |
|        |                              |                                           |
|        v [ Adversary Intercepts ]     |                                           |
|  [ Encrypted Vault / Storage ] =====> |  [ Shor's Algorithm Applied ]             |
|                                       |       |                                   |
|                                       |       v                                   |
|                                       |  [ PLAINTEXT PASSWORDS, SESSIONS, PII ]   |
+-----------------------------------------------------------------------------------+
```

---

## Key Features

### 1. Interactive Vector Radial Topology Graph

The web dashboard provides a live vector map visualizing an organization's public attack surface:
- **Central Apex Hub**: Shows root domain TLS posture, overall quantum readiness score, and real-time radar sweep needle.
- **Perimeter Leaf Nodes**: Arrayed radially around the center, mapping every API route, web service, OAuth endpoint, and mail gateway.
- **High-Contrast Badges**: Explicitly marks every endpoint as:
  - `[ ✓ CORRECT ]`: Fully immunized with post-quantum hybrid key encapsulation (`X25519MLKEM768`).
  - `[ ✕ WRONG ]`: Classical ECDHE/RSA vulnerable to HNDL capture.
- **Live Vector Packet Animation**: Dynamic SVG particles flowing along connecting lines representing real-time traffic risk.
- **Cryptographic Inspector Panel**: Click or hover any node to reveal cipher suites, certificate key lengths, signature families, and specific data assets at risk.

```
                         [ ✕ WRONG ]
                    /api/auth/sessions/current
                             o
                              \
          [ ✕ WRONG ]          \          [ ✕ WRONG ]
      https://.../book  o-------+-------o  /api/ai/chat/completion
                               / \
                              /   \
                             o     o
                        [ ✕ WRONG ] [ ✕ WRONG ]
                           /km         /hr
```

### 2. Wire-Level PQC TLS 1.3 Probe Engine

QuantWarden features an embedded wire-level TLS probe engine that negotiates native TLS 1.3 ClientHello handshakes advertising post-quantum key shares:
- **`X25519MLKEM768` (Codepoint `0x11EC`)**: NIST FIPS 203 compliant hybrid key exchange.
- **`SecP256r1MLKEM768` (Codepoint `0x11EB`)**: Elliptic curve hybrid fallback.
- Operates over pure TCP sockets in Node.js—**no customized OpenSSL forks or liboqs builds required**.

### 3. Autonomous Codebase Remediation

Scans source code repositories (JavaScript/TypeScript, Python, Go, Rust, Java, and Nginx configurations) to detect:
- Classical RSA key generation and encryption (`crypto.generateKeyPairSync('rsa')`)
- Deprecated curve Diffie-Hellman (`crypto.createECDH('secp256k1')`)
- Insecure TLS protocol configurations (`ssl_protocols TLSv1.2`)
- Weak signature algorithms (`crypto.createSign('RSA-SHA256')`)

QuantWarden generates unified diffs and can autonomously patch files to NIST FIPS 203/204 compliant equivalents with `--apply`.

### 4. CycloneDX 1.6 CBOM & SARIF 2.1.0

- **CBOM (Cryptographic Bill of Materials)**: Emits CycloneDX 1.6 standard JSON detailing all cryptographic assets, key sizes, algorithms, and post-quantum migration targets.
- **SARIF 2.1.0**: Emits OASIS Static Analysis Results Interchange Format for native GitHub Code Scanning Security Tab ingestion.

### 5. Sovereign AI Analysis (Gemini 3.8 Flash)

Powered by Google Gemini 3.8 Flash, QuantWarden performs automated cryptographic threat modeling:
- Identifies business-critical attack vectors (e.g., session token harvesting, passenger manifests).
- Generates tailored migration directives for Nginx, Envoy, Cloudflare, AWS ALB, and Caddy.

### 6. CI/CD GitHub Action Quality Gate

Includes a turnkey GitHub Action (`action.yml` and workflow) to enforce PQC compliance in CI:
- Breaks pull requests if classical crypto regressions are introduced.
- Enforces minimum acceptable Quantum Readiness Scores (e.g., `--min-score 70`).
- Publishes automated summary tables to `$GITHUB_STEP_SUMMARY`.

### 7. VS Code Extension

Features an integrated VS Code extension:
- Real-time diagnostic squigglies highlighting classical algorithms in the editor.
- Lightbulb 1-click QuickFixes to refactor code to post-quantum alternatives.
- Interactive Quantum Readiness Activity Bar sidebar and WebView dashboard.

---

## Repository Structure (Monorepo)

```
quantwarden/
├── cli/                               # QuantWarden CLI & Core Scanning Engine
│   ├── bin/
│   │   ├── quantwarden.js             # Main binary executable
│   │   └── quantguard.js              # Backward-compatible alias
│   ├── src/
│   │   ├── ai.js                      # Google Gemini 3.8 Flash AI layer
│   │   ├── formatter.js               # Terminal UI & ASCII banners
│   │   ├── index.js                   # CLI command dispatcher
│   │   ├── remediator.js              # Autonomous code refactoring engine
│   │   └── scanner.js                 # Static codebase analyzer & CBOM generator
│   └── package.json
│
├── web/                               # Domain Sentinel Web Platform
│   ├── public/
│   │   └── index.html                 # Framer dark UI, Vector Radial SVG Graph & Inspector
│   ├── src/
│   │   ├── ai-engine.js               # Web AI synthesis layer
│   │   ├── probe-engine.js            # Live domain & perimeter crawler
│   │   └── server.js                  # Express HTTP & API daemon
│   ├── crawl.mjs                      # Attack surface discovery crawler
│   └── package.json
│
├── extension/                         # VS Code Extension
│   ├── src/
│   │   ├── ai.ts                      # Editor AI assistance
│   │   ├── dashboard.ts               # Webview posture dashboard
│   │   ├── extension.ts               # Extension entrypoint & commands
│   │   ├── quickfix.ts                # Code Action provider (1-click fixes)
│   │   ├── remediator.ts              # In-editor code refactorer
│   │   ├── scanner.ts                 # Real-time workspace linter
│   │   └── sidebar.ts                 # Activity Bar TreeDataProvider
│   ├── resources/shield.svg           # Activity Bar icon
│   ├── tsconfig.json
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── quantwarden-gate.yml       # Turnkey CI/CD Quality Gate workflow
├── action.yml                         # Reusable GitHub Action definition
├── LICENSE                            # Apache-2.0 License
├── package.json                       # Monorepo workspaces configuration
└── README.md                          # Platform documentation
```

---

## Quick Start

### Prerequisites
- **Node.js**: v20.0.0 or higher (v22 LTS recommended)
- **Git**: For version control & patch generation
- *(Optional)* `GEMINI_API_KEY`: Set as an environment variable for AI threat modeling

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/shreeharshazarthi/quantwarden.git
cd quantwarden

# Install dependencies across all workspaces
npm install
```

### Link CLI Globally

```bash
cd cli
npm link
```

Now `quantwarden` and `quantguard` are available globally in your terminal.

---

## CLI Command Reference

### 1. Probe a Live Domain for PQC Handshake

Probes an endpoint to verify whether it negotiates TLS 1.3 `X25519MLKEM768` hybrid key exchange:

```bash
quantwarden probe airlinecabz.com
```

**Output Preview:**
```
  QUANTGUARD LIVE DOMAIN PROBE [Target: airlinecabz.com:443]
  ────────────────────────────────────────────────────────────────────────

┌─ Endpoint Post-Quantum Posture ───────────────────────────────────────────┐
│  Target:     airlinecabz.com:443  (58ms latency)
│  Status:     ● CLASSICAL ONLY (HNDL AT RISK)
│  Readiness:  34 / 100
├───────────────────────────────────────────────────────────────────────────┤
│  Key Exchange (KEX):    ECDHE-RSA (Classical - No PQC)
│  Cipher Suite:          TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (TLSv1.2)
│  Leaf Certificate:      RSA 2048b · Sig: SHA256withRSA
└───────────────────────────────────────────────────────────────────────────┘

  ● Discovered Leaf Endpoints (9 perimeter services):
    Compliance Summary: 0 CORRECT · 9 WRONG / VULNERABLE

    ├── [ ✕ WRONG ]   Classical ECDHE  Apex Web Hub             https://www.airlinecabz.com/                   (48ms)
    ├── [ ✕ WRONG ]   Classical ECDHE  Ride Booking Engine      https://www.airlinecabz.com/book               (52ms)
    ├── [ ✕ WRONG ]   Classical ECDHE  Session Auth Handshake   https://www.airlinecabz.com/api/auth/sessions/current (58ms)
    ├── [ ✕ WRONG ]   Classical ECDHE  OAuth 2.0 Token Exchange https://www.airlinecabz.com/api/auth/oauth/exchange (64ms)
    ├── [ ✕ WRONG ]   Classical ECDHE  Fleet AI Assistant       https://www.airlinecabz.com/api/ai/chat/completion (76ms)
    ├── [ ✕ WRONG ]   Classical ECDHE  Distance Tariff Matrix   https://www.airlinecabz.com/km                 (49ms)
    ├── [ ✕ WRONG ]   Classical ECDHE  Hourly Rental Calculator https://www.airlinecabz.com/hr                 (51ms)
    ├── [ ✕ WRONG ]   Classical ECDHE  Driver Telemetry Stream  wss://driver.airlinecabz.com:8443/telemetry    (71ms)
    └── [ ✕ WRONG ]   Classical ECDHE  Corporate Mail Exchange  smtp://mail.airlinecabz.com:25                 (92ms)
```

### 2. Scan a Codebase for Cryptographic Weaknesses

Scans source code for quantum-vulnerable cryptography:

```bash
quantwarden scan ./src
```

### 3. Generate CycloneDX 1.6 CBOM

Generates a Cryptography Bill of Materials compliant with CERT-In and NIST directives:

```bash
quantwarden cbom . --out cbom.json
```

### 4. Enforce CI Quality Gate

Audits codebase and breaks the build if quantum readiness score falls below threshold:

```bash
quantwarden gate . --min-score 70 --fail-on high --sarif results.sarif
```

### 5. Autonomous Code Remediation

Preview unified git diffs refactoring classical cryptography into NIST FIPS 203/204 algorithms:

```bash
# Preview diffs
quantwarden remediate ./src

# Apply patches directly to disk
quantwarden remediate ./src --apply
```

### 6. Launch Web Dashboard

```bash
quantwarden web --port 3000
```
Then visit [`http://localhost:3000`](http://localhost:3000) in your browser.

---

## Web Dashboard Sentinel

The Web Dashboard features a Framer dark design canvas (`#090909`, `#141414`, `#262626`) optimized for high-density security operations:

1. **Vector Radial Topology Map**: An interactive SVG visual graph rendering the apex hub and radiating leaf service nodes.
2. **Rotating Radar Sweep**: Visual feedback indicating real-time perimeter monitoring.
3. **Verdict Pills**: Immediate visual differentiation between `[ ✓ CORRECT ]` (ML-KEM-768 hybrid) and `[ ✕ WRONG ]` (classical ECDHE).
4. **Interactive Node Inspector**: Real-time inspection of selected nodes detailing key exchanges, ciphers, latencies, and threat descriptions.
5. **Cards Matrix View**: Switch between the vector map and an animated card matrix for service-by-service triage.

---

## Real-World Benchmark Case Study: `airlinecabz.com`

During empirical testing against live mobility infrastructure, QuantWarden identified significant Harvest Now, Decrypt Later exposure across the perimeter:

| Endpoint | Protocol | Cipher Suite / KEX | Verdict | Data at Risk |
| :--- | :--- | :--- | :--- | :--- |
| `https://www.airlinecabz.com/` | TLS 1.2 | ECDHE-RSA (P-256) | `[ ✕ WRONG ]` | Root traffic distribution |
| `https://www.airlinecabz.com/book` | TLS 1.2 | ECDHE-RSA (P-256) | `[ ✕ WRONG ]` | Customer passenger manifests, ride itineraries, payment pre-auth tokens |
| `https://www.airlinecabz.com/api/auth/sessions/current` | TLS 1.2 | ECDHE-RSA (P-256) | `[ ✕ WRONG ]` | Active JWT session tokens, authentication cookies |
| `https://www.airlinecabz.com/api/auth/oauth/exchange` | TLS 1.2 | ECDHE-RSA (P-256) | `[ ✕ WRONG ]` | OAuth 2.0 authorization codes & client credentials |
| `https://www.airlinecabz.com/api/ai/chat/completion` | TLS 1.2 | ECDHE-RSA (P-256) | `[ ✕ WRONG ]` | Conversational ride queries, corporate itinerary prompts |
| `https://www.airlinecabz.com/km` | TLS 1.2 | ECDHE-RSA (P-256) | `[ ✕ WRONG ]` | Mileage-based corporate billing calculation formulas |
| `https://www.airlinecabz.com/hr` | TLS 1.2 | ECDHE-RSA (P-256) | `[ ✕ WRONG ]` | Hourly rental tariff calculations & quote pricing engines |
| `wss://driver.airlinecabz.com:8443/telemetry` | WSS | ECDHE-RSA (P-256) | `[ ✕ WRONG ]` | Live driver GPS coordinates, vehicle telemetry, active fare status |
| `smtp://mail.airlinecabz.com:25` | STARTTLS | RSA 2048 | `[ ✕ WRONG ]` | Corporate travel confirmations, booking receipts, corporate invoices |

**Composite Quantum Readiness Score:** `34 / 100`  
**Compliance Summary:** `0 CORRECT · 9 WRONG / VULNERABLE` (100% Exposure)

---

## GitHub Actions Integration

Add QuantWarden directly into your repository's CI pipeline using `.github/workflows/quantwarden.yml`:

```yaml
name: QuantWarden PQC Security Gate

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  pqc-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run QuantWarden PQC Gatekeeper
        uses: shreeharshazarthi/quantwarden@v1
        with:
          min-score: "70"
          fail-on: "high"
          sarif-file: "quantwarden.sarif"
          cbom-file: "cbom.json"
          probe-domain: "api.yourdomain.com"
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

---

## Cryptographic Standards Reference

QuantWarden adheres strictly to standardized post-quantum algorithms finalized by NIST in August 2024:

| Category | Standard | Algorithm | Security Level | Recommended Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Key Encapsulation (KEM)** | **NIST FIPS 203** | **ML-KEM-768** (Kyber) | Category 3 (AES-192 equiv.) | General HTTPS, TLS 1.3 Key Exchange, VPN tunnels |
| **Key Encapsulation (KEM)** | **NIST FIPS 203** | **ML-KEM-1024** (Kyber) | Category 5 (AES-256 equiv.) | High-security government & banking communications |
| **Digital Signatures** | **NIST FIPS 204** | **ML-DSA-65** (Dilithium) | Category 3 | General code signing, PKI root certificates |
| **Digital Signatures** | **NIST FIPS 204** | **ML-DSA-87** (Dilithium) | Category 5 | High-assurance identity documents, firmware signing |
| **State-Free Hash Signatures** | **NIST FIPS 205** | **SLH-DSA** (SPHINCS+) | Category 1 / 3 / 5 | Hash-based fallback when lattice trust is in doubt |
| **Hybrid KEX** | **RFC 9180 Draft** | **X25519MLKEM768** | Hybrid | Defense-in-depth: ECDH + Kyber combination |

---

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.
