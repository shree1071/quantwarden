/**
 * Quantguard Sovereign AI Engine for VS Code Extension
 * Provides deep cryptographic threat intelligence, Shor's resource estimates, and NIST FIPS 203/204 migration blueprints.
 */

export interface AiTriageResult {
    ruleId: string;
    algorithm: string;
    exposureScore: number;
    threatSummary: string;
    shorRisk: string;
    nistStandard: string;
    migrationSteps: string[];
    recommendedCode: string;
}

export async function explainVulnerability(finding: { algorithm: string; ruleId: string; severity: string; hndl: boolean; snippet?: string }): Promise<AiTriageResult> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
    const baseUrl = process.env.LLM_BASE_URL || (process.env.OLLAMA_HOST ? `${process.env.OLLAMA_HOST}/v1` : "http://localhost:11434/v1");
    const model = process.env.LLM_MODEL || "gpt-4o-mini";

    if (apiKey || process.env.OLLAMA_HOST) {
        try {
            const prompt = `You are a Post-Quantum Cryptography (PQC) Security Architect.
Analyze this quantum-vulnerable cryptographic finding:
- Algorithm: ${finding.algorithm}
- Rule: ${finding.ruleId}
- Severity: ${finding.severity}
- HNDL: ${finding.hndl}

Return valid JSON with:
{
  "exposureScore": number (0-100),
  "threatSummary": string,
  "shorRisk": string,
  "nistStandard": string,
  "migrationSteps": [string array],
  "recommendedCode": string
}`;

            const res = await fetch(`${apiKey ? "https://api.openai.com/v1" : baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: "system", content: "You are an expert post-quantum cryptography advisor. Return only strict JSON." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.1
                }),
                signal: AbortSignal.timeout(3500)
            });

            if (res.ok) {
                const data: any = await res.json();
                const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
                return {
                    ruleId: finding.ruleId,
                    algorithm: finding.algorithm,
                    exposureScore: parsed.exposureScore ?? 88,
                    threatSummary: parsed.threatSummary || "Classical asymmetric algorithm vulnerable to Shor's polynomial-time quantum algorithm.",
                    shorRisk: parsed.shorRisk || "Shor's Algorithm solves the discrete logarithm or integer factorization in polynomial time.",
                    nistStandard: parsed.nistStandard || "NIST FIPS 203 (ML-KEM-768)",
                    migrationSteps: parsed.migrationSteps || ["Replace classical keygen with ML-KEM-768", "Enable X25519Kyber768 hybrid mode"],
                    recommendedCode: parsed.recommendedCode || "ml_kem_768.generate_keypair()"
                };
            }
        } catch {
            // fallback to sovereign intelligence
        }
    }

    return getSovereignIntelligence(finding);
}

export function getSovereignIntelligence(finding: { algorithm: string; ruleId: string; hndl: boolean }): AiTriageResult {
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
                "High Urgency: Any TLS session or key agreement over public networks is subject to HNDL recording",
                "Deploy X25519Kyber768 hybrid key agreement to preserve legacy compatibility while introducing post-quantum security",
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
