/**
 * Config detector: classical asymmetric keys provisioned by Ansible's
 * `community.crypto` collection. Playbooks that mint TLS/SSH key material with
 * `openssl_privatekey` / `openssl_csr` / `x509_certificate` provision real
 * classical keys the language packs never see — the IaC surface, in YAML.
 *
 * Gated to a `community.crypto` / `openssl_privatekey` marker so a bare
 * `type: RSA` in unrelated YAML does not fire.
 */
import type { Detector } from "../types.js";
/** Detects classical asymmetric keys provisioned by Ansible community.crypto. */
export declare const ansibleDetector: Detector;
//# sourceMappingURL=ansible.d.ts.map