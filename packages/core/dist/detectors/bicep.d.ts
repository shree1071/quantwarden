/**
 * IaC detector: classical asymmetric cryptography and legacy TLS declared in Azure
 * Bicep (`.bicep`) — Azure's native IaC DSL, distinct from the ARM/CloudFormation
 * JSON the cloudformation detector already covers (Bicep is the *source*; ARM JSON is
 * its compiled output). Bicep provisions the same Key Vault keys and TLS floors, but
 * in its own single-quoted-string syntax that the JSON detector never sees.
 *
 * Covered (gated to `.bicep` files):
 *  - `Microsoft.KeyVault/vaults/keys` `kty: 'RSA' | 'RSA-HSM' | 'EC' | 'EC-HSM'` — a
 *    classical Key Vault key. RSA is KEM (HNDL); EC feeds ECDSA + ECDH (the ECDH path
 *    is HNDL). Gated to a `Microsoft.KeyVault` marker so a stray `kty` elsewhere in a
 *    template does not fire.
 *  - `minimumTlsVersion: 'TLS1_0' | 'TLS1_1'` — a deprecated TLS floor on storage /
 *    app-service / other resources (RFC 8996). Not HNDL (a config weakness), category
 *    "tls".
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric crypto and legacy TLS declared in Azure Bicep. */
export declare const bicepDetector: Detector;
//# sourceMappingURL=bicep.d.ts.map