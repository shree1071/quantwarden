import { probeDomain } from "../web/src/probe-engine.js";
import { generateDomainAnalysis } from "../web/src/ai-engine.js";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
    }

    const domain = req.query.domain || req.query.target;
    const port = parseInt(req.query.port || "443", 10);
    const mode = req.query.mode || "auto";
    const skipAi = req.query.ai === "false";

    if (!domain) {
        res.status(400).json({ ok: false, error: "Missing required 'domain' parameter." });
        return;
    }

    try {
        const probeResult = await probeDomain(domain, { port, mode });
        if (probeResult.status === "error") {
            res.status(422).json({ ok: false, error: probeResult.error, data: probeResult });
            return;
        }

        let aiReport = null;
        if (!skipAi) {
            aiReport = await generateDomainAnalysis(probeResult);
        }

        res.status(200).json({
            ok: true,
            data: {
                ...probeResult,
                ai: aiReport
            }
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
}
