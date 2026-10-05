import { GoogleGenAI } from "@google/genai";

const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || "";

export async function generateDomainAnalysis(probeResult) {
    const apiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
    const { host, port, protocol, cipher, kexGroup, hybridSelected, certKeyType, certSigFamily, readinessScore, hndlExposed } = probeResult;

    const prompt = `You are an elite Post-Quantum Cryptography (PQC) Security Architect and Infrastructure Specialist.
Analyze the live post-quantum cryptographic posture for this endpoint:
- Host/Port: ${host}:${port}
- TLS Version: ${protocol || "TLS 1.3"}
- Cipher Suite: ${cipher || "TLS_AES_256_GCM_SHA384"}
- Key Exchange (KEX) Group: ${kexGroup || "X25519"}
- Hybrid Post-Quantum KEX (X25519MLKEM768 / 0x11EC): ${hybridSelected ? "NEGOTIATED & ACTIVE" : "NOT NEGOTIATED (Classical ECDHE/RSA Only)"}
- Leaf Certificate Key: ${certKeyType || "EC(prime256v1)"}
- Certificate Signature Algorithm: ${certSigFamily || "ECDSA"}
- Post-Quantum Readiness Score: ${readinessScore} / 100
- HNDL (Harvest Now, Decrypt Later) Risk: ${hndlExposed ? "CRITICAL / EXPOSED" : "PROTECTED / MITIGATED"}

Provide an authoritative, executive technical analysis and exact infrastructure migration directives.
Return STRICT JSON ONLY (no markdown formatting, no code block fences, no extra text):
{
  "executiveSummary": "2-3 crisp sentences detailing current quantum resilience and compliance status against NIST FIPS 203/204.",
  "hndlAnalysis": "1-2 sentences on how session keys can or cannot be intercepted and decrypted by adversary harvest operations.",
  "qubitThreatWindow": "Estimated quantum threat timeline regarding Shor's and Grover's algorithm exposure for this configuration.",
  "migrationSteps": [
    "Concrete step 1",
    "Concrete step 2",
    "Concrete step 3"
  ],
  "nginxConfig": "# Nginx 1.25+ ssl_ecdh_curve directive\\nssl_ecdh_curve X25519MLKEM768:X25519:secp384r1;",
  "caddyConfig": "# Caddyfile directive\\ntls {\\n    curves x25519mlkem768 x25519\\n}"
}`;

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const rawText = response.text || "";
        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedText);

        return {
            ...parsed,
            provider: "Google Gemini 2.5 Flash (Sovereign Intelligence)"
        };
    } catch (err) {
        // Fallback to deterministic sovereign intelligence
        return getSovereignDomainIntelligence(probeResult);
    }
}

function getSovereignDomainIntelligence(probeResult) {
    const { host, hybridSelected, hndlExposed, readinessScore } = probeResult;

    if (hybridSelected) {
        return {
            executiveSummary: `${host} has successfully enabled Post-Quantum Cryptography hybrid key exchange (X25519MLKEM768), achieving superior defense against future Cryptanalytically Relevant Quantum Computers (CRQC). The endpoint aligns with NIST FIPS 203 (ML-KEM) guidance.`,
            hndlAnalysis: `Harvest Now, Decrypt Later (HNDL) protection is ACTIVE. Intercepted TLS traffic cannot be retroactively decrypted even if classical ECDHE parameters are solved via Shor's algorithm.`,
            qubitThreatWindow: `Ephemeral session keys are post-quantum hardened (~128-bit quantum security margin). Leaf certificate signatures remain classical until CA ecosystem transitions to NIST FIPS 204 (ML-DSA).`,
            migrationSteps: [
                "Maintain X25519MLKEM768 as the prioritized TLS 1.3 key share.",
                "Prepare Public Key Infrastructure (PKI) for ML-DSA-65 certificate issuance upon browser root CA acceptance.",
                "Verify upstream reverse proxies and internal microservice mesh also enforce ML-KEM."
            ],
            nginxConfig: `# Nginx 1.25+ Post-Quantum Configuration for ${host}\nssl_protocols TLSv1.3;\nssl_ecdh_curve X25519MLKEM768:X25519:secp384r1;\nssl_prefer_server_ciphers off;`,
            caddyConfig: `# Caddyfile PQC Configuration for ${host}\n${host} {\n    tls {\n        curves x25519mlkem768 x25519\n    }\n}`,
            provider: "Quantguard Sovereign PQC Advisor (Embedded)"
        };
    }

    return {
        executiveSummary: `${host} currently relies solely on classical key exchange (${probeResult.kexGroup || "ECDHE"}), leaving all in-flight encrypted traffic susceptible to Harvest Now, Decrypt Later (HNDL) campaigns by sophisticated state actors.`,
        hndlAnalysis: `HNDL EXPOSURE CONFIRMED. Adversaries storing captured TLS sessions today will be able to compute private ephemeral keys using Shor's discrete logarithm algorithm on a quantum computer with ~2,000-4,000 logical qubits.`,
        qubitThreatWindow: `High risk. Estimated Cryptanalytically Relevant Quantum Computer window is 2029-2033 (NSA CNSA 2.0 and NIST mandate full transition by 2030).`,
        migrationSteps: [
            "Enable hybrid post-quantum key exchange (X25519MLKEM768 / codepoint 0x11EC) on edge load balancers, CDN, or web servers.",
            "Enforce TLS 1.3 as minimum protocol version, deprecating legacy RSA key exchange suites.",
            "Update edge reverse proxy (Nginx, Cloudflare, Envoy, or Caddy) to advertise ML-KEM-768 key shares in ClientHello."
        ],
        nginxConfig: `# Nginx 1.25+ PQC Remediation for ${host}\nssl_protocols TLSv1.3;\nssl_ecdh_curve X25519MLKEM768:X25519:secp384r1;\nssl_prefer_server_ciphers off;`,
        caddyConfig: `# Caddyfile PQC Remediation for ${host}\n${host} {\n    tls {\n        curves x25519mlkem768 x25519\n    }\n}`,
        provider: "Quantguard Sovereign PQC Advisor (Embedded)"
    };
}
