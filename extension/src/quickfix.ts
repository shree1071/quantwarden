import * as vscode from "vscode";

export class QuantguardQuickFixProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];

        for (const diagnostic of context.diagnostics) {
            if (diagnostic.source !== "Quantguard PQC") {
                continue;
            }

            const message = diagnostic.message;

            // 1. If it's an encryption / key exchange vulnerability (RSA, ECDH, DH)
            if (message.includes("RSA") || message.includes("ECDH") || message.includes("key exchange")) {
                const fixMLKEM = new vscode.CodeAction(
                    "🛡️ [Quantguard] Migrate to NIST ML-KEM-768 (FIPS 203)",
                    vscode.CodeActionKind.QuickFix
                );
                fixMLKEM.isPreferred = true;
                fixMLKEM.diagnostics = [diagnostic];
                fixMLKEM.edit = new vscode.WorkspaceEdit();

                // Provide sample code rewrite or comment guidance
                const line = document.lineAt(diagnostic.range.start.line);
                const indent = line.text.match(/^\s*/)?.[0] ?? "";
                
                if (document.languageId === "python") {
                    fixMLKEM.edit.insert(
                        document.uri,
                        new vscode.Position(line.lineNumber, 0),
                        `${indent}# TODO: [Quantguard Auto-Patch] Replace classical RSA/ECDH with NIST ML-KEM (liboqs / pqcrypto)\n${indent}# from pqcrypto.kem import ml_kem_768\n`
                    );
                } else if (document.languageId === "javascript" || document.languageId === "typescript") {
                    fixMLKEM.edit.insert(
                        document.uri,
                        new vscode.Position(line.lineNumber, 0),
                        `${indent}// TODO: [Quantguard Auto-Patch] Migrate to post-quantum ML-KEM-768 hybrid\n${indent}// import { mlkem768 } from '@quantakrypto/core';\n`
                    );
                }
                actions.push(fixMLKEM);

                // Hybrid Option
                const fixHybrid = new vscode.CodeAction(
                    "🛡️ [Quantguard] Enable X25519Kyber768 Hybrid Key Exchange",
                    vscode.CodeActionKind.QuickFix
                );
                fixHybrid.diagnostics = [diagnostic];
                actions.push(fixHybrid);
            }

            // 2. If it's a signature vulnerability (ECDSA, RSA-PSS, EdDSA)
            if (message.includes("signature") || message.includes("ECDSA") || message.includes("EdDSA")) {
                const fixMLDSA = new vscode.CodeAction(
                    "🛡️ [Quantguard] Migrate to NIST ML-DSA-65 (FIPS 204)",
                    vscode.CodeActionKind.QuickFix
                );
                fixMLDSA.isPreferred = true;
                fixMLDSA.diagnostics = [diagnostic];
                fixMLDSA.edit = new vscode.WorkspaceEdit();

                const line = document.lineAt(diagnostic.range.start.line);
                const indent = line.text.match(/^\s*/)?.[0] ?? "";
                fixMLDSA.edit.insert(
                    document.uri,
                    new vscode.Position(line.lineNumber, 0),
                    `${indent}# TODO: [Quantguard Auto-Patch] Migrate signature scheme to NIST ML-DSA-65 (Crystals-Dilithium)\n`
                );
                actions.push(fixMLDSA);
            }

            actions.push(suppressAction);

            // 4. Sovereign AI Explanation & Migration Advisor
            const aiExplainAction = new vscode.CodeAction(
                "🤖 [Quantguard AI] Explain Threat Vector & Migration Strategy",
                vscode.CodeActionKind.QuickFix
            );
            aiExplainAction.diagnostics = [diagnostic];
            aiExplainAction.command = {
                command: "quantguard.aiExplain",
                title: "Quantguard AI Threat Analysis",
                arguments: [diagnostic]
            };
            actions.push(aiExplainAction);
        }

        return actions;
    }
}
