import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { probeDomain } from "./probe-engine.js";
import { generateDomainAnalysis } from "./ai-engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const PORT = parseInt(process.env.PORT || "3000", 10);

// In-memory cache for recent domain scans to avoid re-probing within 60 seconds
const scanCache = new Map();

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".ico": "image/x-icon"
    };
    return map[ext] || "application/octet-stream";
}

export async function handleRequest(req, res) {
    const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = reqUrl.pathname;

    // CORS headers for API
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Health check
    if (pathname === "/api/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            status: "healthy",
            engine: "Quantguard PQC Sentinel & Live Domain Scanner",
            pqcStandard: "NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)",
            uptime: process.uptime()
        }));
        return;
    }

    // API: /api/probe?domain=...
    if (pathname === "/api/probe") {
        const domain = reqUrl.searchParams.get("domain") || reqUrl.searchParams.get("target");
        const port = parseInt(reqUrl.searchParams.get("port") || "443", 10);
        const mode = reqUrl.searchParams.get("mode") || "auto";
        const skipAi = reqUrl.searchParams.get("ai") === "false";

        if (!domain) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Missing required 'domain' parameter." }));
            return;
        }

        const cacheKey = `${domain}:${port}:${mode}`;
        const cached = scanCache.get(cacheKey);
        if (cached && (Date.now() - cached.cachedAt < 60000)) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, cached: true, data: cached.data }));
            return;
        }

        try {
            const probeResult = await probeDomain(domain, { port, mode });

            if (probeResult.status === "error") {
                res.writeHead(422, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: probeResult.error, data: probeResult }));
                return;
            }

            let aiReport = null;
            if (!skipAi) {
                aiReport = await generateDomainAnalysis(probeResult);
            }

            const payload = {
                ...probeResult,
                ai: aiReport
            };

            scanCache.set(cacheKey, { cachedAt: Date.now(), data: payload });

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, data: payload }));
        } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: err?.message || String(err) }));
        }
        return;
    }

    // API: /api/cbom?domain=...
    if (pathname === "/api/cbom") {
        const domain = reqUrl.searchParams.get("domain");
        if (!domain) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Missing domain" }));
            return;
        }

        const probeResult = await probeDomain(domain);
        if (probeResult.cbom) {
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${domain}-cbom.json"`
            });
            res.end(JSON.stringify(probeResult.cbom, null, 2));
        } else {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to generate CBOM" }));
        }
        return;
    }

    // API: /api/sarif?domain=...
    if (pathname === "/api/sarif") {
        const domain = reqUrl.searchParams.get("domain");
        if (!domain) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Missing domain" }));
            return;
        }

        const probeResult = await probeDomain(domain);
        if (probeResult.sarif) {
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${domain}.sarif"`
            });
            res.end(JSON.stringify(probeResult.sarif, null, 2));
        } else {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to generate SARIF" }));
        }
        return;
    }

    // Static File Serving
    let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);
    
    // Security: avoid path traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const mime = getMimeType(filePath);
        res.writeHead(200, { "Content-Type": mime });
        fs.createReadStream(filePath).pipe(res);
    } else {
        // Fallback to index.html for SPA
        const indexHtml = path.join(PUBLIC_DIR, "index.html");
        if (fs.existsSync(indexHtml)) {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            fs.createReadStream(indexHtml).pipe(res);
        } else {
            res.writeHead(404);
            res.end("Not Found");
    }
}

export const server = http.createServer(handleRequest);

export function startServer(port = PORT) {
    return new Promise((resolve) => {
        server.listen(port, () => {
            console.log(`\n  \x1b[38;2;16;185;129m●\x1b[0m \x1b[1mQuantguard Domain Scanner is live!\x1b[0m`);
            console.log(`    Local:   \x1b[36mhttp://localhost:${port}\x1b[0m`);
            console.log(`    Engine:  \x1b[90mTLS 1.3 X25519MLKEM768 (0x11EC) & NIST FIPS 203/204\x1b[0m`);
            console.log(`    AI:      \x1b[90mGoogle Gemini 2.5/3.8 Flash Active\x1b[0m\n`);
            resolve(server);
        });
    });
}

// Auto-start if run directly
if (process.argv[1] && process.argv[1].endsWith("server.js")) {
    const portArgIdx = process.argv.indexOf("--port");
    const cliPort = portArgIdx !== -1 ? parseInt(process.argv[portArgIdx + 1], 10) : PORT;
    startServer(cliPort);
}
