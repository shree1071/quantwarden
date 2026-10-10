/**
 * Config detector: classical-certificate TLS termination in standalone
 * reverse-proxy / load-balancer configuration and in-code gRPC channel
 * credentials.
 *
 * A standalone Envoy, Nginx, HAProxy, Traefik, or Caddy config that terminates
 * TLS with an RSA/ECDSA leaf certificate and negotiates an ECDHE key exchange is
 * the canonical harvest-now-decrypt-later (HNDL) surface: an attacker who
 * records today's handshake + ciphertext can decrypt it retroactively once a
 * cryptographically-relevant quantum computer (CRQC) can break the ephemeral
 * (EC)DHE secret. The Kubernetes / service-mesh detectors (`k8s.ts`, `mesh.ts`)
 * cover the CLUSTER-managed cert + mesh-mTLS surfaces; the STANDALONE proxy
 * config FILES and the in-code gRPC credential constructors below are seen by
 * neither them nor the language packs, so they are covered here.
 *
 * Because the config token itself does not name the cert's key algorithm (the
 * key lives in a referenced PEM file, out of band), these findings use
 * `algorithm: "unknown"` — the evidence is "a classical-cert TLS channel is
 * configured HERE", not a specific family. They are `category: "key-exchange"`
 * (the ECDHE handshake is the harvestable primitive) and `hndl: true`.
 * Confidence is `medium`: a config-level indicator of a classical TLS channel,
 * not a matched algorithm string.
 *
 * PRECISION / fast-reject: several of the matched tokens (`ssl_certificate`,
 * `private_key:`, `certificates:`) are generic enough to appear in unrelated
 * YAML/config, so `detect()` bails unless the file carries a distinctive
 * proxy/gRPC marker (see `hasProxyMarker`). This keeps a random YAML that merely
 * has a `private_key:` key, or a Traefik-shaped `certificates:` list that isn't
 * a Traefik config, from firing. Comments are masked (YAML/nginx/HCL `#`, plus
 * `//` and C-style `/* … *\/` blocks) so a commented-out directive can't fire.
 *
 * Covered surfaces:
 *  - Envoy   — `common_tls_context:` / `DownstreamTlsContext` /
 *              `UpstreamTlsContext` with `tls_certificates:` carrying a
 *              `certificate_chain:` + `private_key:` (and the
 *              `envoy.transport_sockets.tls` transport socket).
 *  - Nginx   — `ssl_certificate` + `ssl_certificate_key` directives.
 *  - HAProxy — `bind … ssl crt …` lines and `crt-store` sections.
 *  - Traefik — a `tls:` block's `certificates:` with `certFile:` + `keyFile:`
 *              (dynamic config) or a `certResolver` (ACME) reference.
 *  - gRPC    — in-code TLS channel credentials: `grpc.ssl_channel_credentials(`
 *              (Python), `grpc.credentials.createSsl(` (Node),
 *              `TlsChannelCredentials` (Java), `credentials.NewTLS(` (Go).
 */
import type { Detector } from "../types.js";
/**
 * Detects classical-cert TLS termination in standalone reverse-proxy /
 * load-balancer config files and in-code gRPC channel credentials. See the
 * module docstring for the covered surfaces and the fast-reject rationale.
 */
export declare const proxyDetector: Detector;
//# sourceMappingURL=proxy.d.ts.map