import * as fs from "node:fs";
import * as path from "node:path";

export interface FilePatch {
    file: string;
    modified: boolean;
    newContent: string;
}

export function computeFilePatch(filePath: string): FilePatch {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
        return { file: filePath, modified: false, newContent: "" };
    }

    const originalContent = fs.readFileSync(absPath, "utf8");
    const lines = originalContent.split("\n");
    const ext = path.extname(absPath).toLowerCase();
    const fileName = path.basename(absPath).toLowerCase();

    let newLines = [...lines];
    let modified = false;

    // 1. Python Remediations
    if (ext === ".py") {
        let needsPqcImport = false;

        newLines = newLines.map((line) => {
            if (line.includes("rsa.generate_private_key")) {
                modified = true;
                needsPqcImport = true;
                const indent = line.match(/^\s*/)?.[0] || "";
                return `${indent}# [Quantguard PQC Migration - FIPS 203]\n${indent}# REPLACED: classical RSA-2048 with NIST ML-KEM-768 lattice KEM\n${indent}private_key = ml_kem_768.generate_keypair()  # Quantum-safe (Shor-resistant)`;
            }

            if (line.includes("ec.generate_private_key")) {
                modified = true;
                needsPqcImport = true;
                const indent = line.match(/^\s*/)?.[0] || "";
                return `${indent}# [Quantguard PQC Migration - FIPS 203]\n${indent}# REPLACED: classical ECDH with X25519Kyber768 hybrid key encapsulation\n${indent}ec_key = ml_kem_768.generate_keypair()  # HNDL Immune`;
            }

            return line;
        });

        if (needsPqcImport && !originalContent.includes("from pqcrypto.kem import ml_kem_768")) {
            newLines.unshift("# Quantguard Sovereign PQC Standard (NIST FIPS 203/204)\ntry:\n    from pqcrypto.kem import ml_kem_768\nexcept ImportError:\n    from quantguard.pqc import ml_kem_768\n");
        }
    }

    // 2. JavaScript / TypeScript Remediations
    else if (ext === ".js" || ext === ".ts" || ext === ".mjs") {
        let needsJsImport = false;

        newLines = newLines.map((line) => {
            if (line.includes("crypto.generateKeyPairSync") && (line.includes("'rsa'") || line.includes('"rsa"'))) {
                modified = true;
                needsJsImport = true;
                const indent = line.match(/^\s*/)?.[0] || "";
                return `${indent}// [Quantguard PQC Migration - FIPS 203]\n${indent}// REPLACED: classical RSA key generation with NIST ML-KEM-768\n${indent}const { publicKey, privateKey } = mlkem768.generateKeyPair();`;
            }

            if (line.includes("crypto.createDiffieHellman")) {
                modified = true;
                needsJsImport = true;
                const indent = line.match(/^\s*/)?.[0] || "";
                return `${indent}// [Quantguard PQC Migration - FIPS 203]\n${indent}// REPLACED: finite-field DH with X25519Kyber768 hybrid key exchange\n${indent}const dh = mlkem768.createHybridKeyExchange();`;
            }

            return line;
        });

        if (needsJsImport && !originalContent.includes("@quantakrypto/core")) {
            newLines.unshift("// Quantguard Sovereign PQC Runtime (NIST FIPS 203)\nimport { mlkem768 } from '@quantakrypto/core';\n");
        }
    }

    // 3. Nginx / TLS Configuration Remediations
    else if (fileName.includes("nginx") || ext === ".conf") {
        newLines = newLines.map((line) => {
            if (line.trim().startsWith("ssl_ciphers") && (line.includes("ECDHE-RSA") || line.includes("DHE-RSA"))) {
                modified = true;
                const indent = line.match(/^\s*/)?.[0] || "";
                return `${indent}# [Quantguard PQC Modernization]\n${indent}# Enforce post-quantum hybrid groups & modern TLS 1.3 ciphers\n${indent}ssl_protocols TLSv1.3 TLSv1.2;\n${indent}ssl_ecdh_curve X25519Kyber768Draft00:x25519_kyber768:secp256r1;\n${indent}ssl_ciphers TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-ECDSA-AES256-GCM-SHA384;`;
            }
            return line;
        });
    }

    return {
        file: filePath,
        modified,
        newContent: newLines.join("\n")
    };
}

export function remediateWorkspaceFiles(workspaceRoot: string): string[] {
    const filesToAudit: string[] = [];

    const walk = (dir: string) => {
        for (const file of fs.readdirSync(dir)) {
            if (file.startsWith(".") || file === "node_modules" || file === "__pycache__") continue;
            const full = path.join(dir, file);
            if (fs.statSync(full).isDirectory()) walk(full);
            else filesToAudit.push(full);
        }
    };
    walk(workspaceRoot);

    const patchedFiles: string[] = [];

    for (const file of filesToAudit) {
        const patch = computeFilePatch(file);
        if (patch.modified) {
            fs.writeFileSync(`${file}.bak`, fs.readFileSync(file));
            fs.writeFileSync(file, patch.newContent, "utf8");
            patchedFiles.push(file);
        }
    }

    return patchedFiles;
}
