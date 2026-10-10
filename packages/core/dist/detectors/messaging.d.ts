/**
 * Config detector: classical transport crypto in message brokers / event streams
 * (Kafka, RabbitMQ, MQTT/Mosquitto, NATS). Broker traffic is "communication
 * between things"; a legacy TLS floor or a classical (EC)DHE cipher suite makes
 * every message in flight harvest-now-decrypt-later exposed.
 *
 * Covered in broker config files (`.properties`, `.conf`, `.cfg`, `.ini`):
 *  - Kafka `ssl.protocol` / `ssl.enabled.protocols = TLSv1 | TLSv1.1` (legacy).
 *  - MQTT/Mosquitto `tls_version tlsv1 | tlsv1.1` (legacy).
 *  - Kafka `ssl.cipher.suites` naming a static-RSA `TLS_RSA_WITH_*` key-transport
 *    suite (the ECDHE/DHE suites are owned by source.ts's `tls-classical-kex`).
 */
import type { Detector } from "../types.js";
/** Detects classical transport crypto in message-broker / event-stream config. */
export declare const messagingDetector: Detector;
//# sourceMappingURL=messaging.d.ts.map