import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

// Primary Gemini API Key configured for QuantWarden from environment
const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || "";

/**
 * Query AI Layer using Google Gemini (@google/genai)
 */
export async function explainVulnerability(finding, fileSnippet = "") {
    const apiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;

    try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a Post-Quantum Cryptography (PQC) Security Architect.
Analyze this quantum-vulnerable cryptographic finding and provide an exact remediation plan.

Finding:
- Algorithm: ${finding.algorithm}
- Rule: ${finding.ruleId}
- Severity: ${finding.severity}
- HNDL (Harvest Now Decrypt Later): ${finding.hndl}
- Code Snippet:
${fileSnippet || finding.snippet || "(No code context)"}

Return ONLY strict, valid JSON with this structure (no markdown fences, no extra text):
{
  "exposureScore": number between 0 and 100,
  "threatSummary": "concise 1-2 sentence threat explanation",
  "shorRisk": "exact quantum algorithmic threat, e.g., Shor's discrete log or integer factorization and estimated qubits needed",
  "nistStandard": "e.g. NIST FIPS 203 (ML-KEM-768) or NIST FIPS 204 (ML-DSA-65)",
  "migrationSteps": ["step 1", "step 2", "step 3"],
  "recommendedCode": "sample post-quantum code replacement"
}`;

        // 1. Try with interactions.create (gemini-3.8-flash)
        if (ai.interactions && typeof ai.interactions.create === "function") {
            try {
                const interaction = await ai.interactions.create({
                    model: "gemini-3.8-flash",
                    input: prompt
                });

                const rawText = interaction.output_text || interaction.text || "";
                const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
                const parsed = JSON.parse(cleanedText);

                return {
                    ruleId: finding.ruleId,
                    algorithm: finding.algorithm,
                    exposureScore: parsed.exposureScore ?? 92,
                    threatSummary: parsed.threatSummary,
                    shorRisk: parsed.shorRisk,
                    nistStandard: parsed.nistStandard || "NIST FIPS 203 (ML-KEM-768)",
                    migrationSteps: parsed.migrationSteps || [],
                    recommendedCode: parsed.recommendedCode || "ml_kem_768.generate_keypair()",
                    aiProvider: "Google Gemini 3.8 Flash (Live)"
                };
            } catch (innerErr) {
                // fall through to models.generateContent
            }
        }

        // 2. Try with models.generateContent (gemini-2.5-flash)
        if (ai.models && typeof ai.models.generateContent === "function") {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });

            const rawText = response.text || "";
            const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanedText);

            return {
                ruleId: finding.ruleId,
                algorithm: finding.algorithm,
                exposureScore: parsed.exposureScore ?? 92,
                threatSummary: parsed.threatSummary,
                shorRisk: parsed.shorRisk,
                nistStandard: parsed.nistStandard || "NIST FIPS 203 (ML-KEM-768)",
                migrationSteps: parsed.migrationSteps || [],
                recommendedCode: parsed.recommendedCode || "ml_kem_768.generate_keypair()",
                aiProvider: "Google Gemini 2.5 Flash (Live)"
            };
        }
    } catch (e) {
        // Fall back cleanly to embedded sovereign intelligence if offline
    }

    // 3. Sovereign Offline Fallback
    const fallback = getSovereignIntelligence(finding);
    fallback.aiProvider = "Sovereign Embedded Engine (Offline Fallback)";
    return fallback;
}

/**
 * Embedded Sovereign Knowledge Engine
 * Provides immediate, mathematically rigorous PQC triage without external API dependency
 */
export function getSovereignIntelligence(finding) {
    const algo = finding.algorithm?.toUpperCase() || "";

    if (algo.includes("RSA")) {
        return {
            ruleId: finding.ruleId,
            algorithm: finding.algorithm,
            exposureScore: 92,
            threatSummary: "RSA relies on the hardness of factoring large semiprimes. A Cryptanalytically Relevant Quantum Computer (CRQC) running Shor's Algorithm solves prime factorization in polynomial time O((log N)^3).",
            shorRisk: "Peter Shor's Quantum Order-Finding algorithm will factor 2048-bit RSA in ~8 hours using ~4,096 logical qubits (~20 million noisy physical qubits).",
            nistStandard: "NIST FIPS 203 (ML-KEM-768 for KEM) / NIST FIPS 204 (ML-DSA-65 for Signatures)",
            migrationSteps: [
                "Isolate RSA key generation and signing entrypoints",
                "For Key Encapsulation / Encryption: Migrate to NIST ML-KEM-768 (Lattice Module-LWE)",
                "For Digital Signatures: Migrate to NIST ML-DSA-65 (Crystals-Dilithium) or SLH-DSA (SPHINCS+)",
                "Enable dual-signing (hybrid RSA + ML-DSA) during transition window"
            ],
            recommendedCode: "from pqcrypto.kem import ml_kem_768\npublic_key, secret_key = ml_kem_768.generate_keypair()  # NIST FIPS 203"
        };
    }

    if (algo.includes("ECDH") || algo.includes("EC") || algo.includes("DH")) {
        return {
            ruleId: finding.ruleId,
            algorithm: finding.algorithm,
            exposureScore: 96,
            threatSummary: "Elliptic Curve and Finite-Field Diffie-Hellman are critical Harvest Now, Decrypt Later (HNDL) targets. Adversaries record encrypted sessions today to decrypt once a CRQC is operational.",
            shorRisk: "Shor's Algorithm solves the Elliptic Curve Discrete Logarithm Problem (ECDLP) with fewer quantum resources than RSA (only ~2,330 logical qubits for SECP256R1).",
            nistStandard: "NIST FIPS 203 (ML-KEM-768) / X25519Kyber768 Hybrid Key Exchange",
            migrationSteps: [
                "High Urgency: Any TLS session or key exchange over public networks is subject to HNDL recording",
                "Deploy X25519Kyber768 hybrid key agreement to preserve FIPS 140-3 compliance while introducing post-quantum security",
                "Update TLS configurations to enforce ssl_ecdh_curve X25519Kyber768Draft00:x25519_kyber768:secp256r1"
            ],
            recommendedCode: "// Node.js Post-Quantum Hybrid\nimport { mlkem768 } from '@quantakrypto/core';\nconst hybridExchange = mlkem768.createHybridKeyExchange();"
        };
    }

    return {
        ruleId: finding.ruleId,
        algorithm: finding.algorithm,
        exposureScore: 80,
        threatSummary: "Classical asymmetric cryptographic primitive lacks quantum resistance and is vulnerable to polynomial-time quantum cryptanalysis.",
        shorRisk: "Vulnerable to Shor's period-finding algorithm on quantum hardware.",
        nistStandard: "NIST FIPS 203 / FIPS 204 Post-Quantum Cryptography Standard",
        migrationSteps: [
            "Conduct cryptographic inventory and assess data shelf-life (Mosca's Theorem: X + Y > Z)",
            "Migrate asymmetric primitives to standardized post-quantum lattice alternatives (ML-KEM, ML-DSA)",
            "Audit cipher suites against CERT-In and CNSA 2.0 guidance"
        ],
        recommendedCode: "# Quantguard NIST FIPS 203/204 Post-Quantum Migration"
    };
}
