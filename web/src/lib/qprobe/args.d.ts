/**
 * Hand-rolled CLI argument parser (zero dependencies), mirroring qScan's approach:
 * the parser is pure and total — it never throws and never does I/O.
 */
type ProbeModeArg = "tls" | "ssh" | "smtp" | "imap" | "pop3" | "postgres" | "auto";
type FormatArg = "human" | "json" | "sarif" | "cbom";
interface CliArgs {
    targets: string[];
    mode: ProbeModeArg;
    iOwnThis: boolean;
    ownedHostsFile?: string;
    servername?: string;
    timeoutMs: number;
    format: FormatArg;
    help: boolean;
}
export declare function parseArgs(argv: readonly string[]): CliArgs;
export declare const HELP = "qprobe \u2014 active post-quantum readiness probing of live TLS/SSH endpoints you OWN.\n\nUSAGE\n  qprobe [options] <host[:port]> [host[:port] ...]\n\nAUTHORIZATION (required \u2014 one of)\n  --i-own-this            Attest you are authorized to probe the given endpoint(s).\n  --owned-hosts <file>    Ownership manifest (one host per line, # comments).\n\n  A target is one host or host:port, e.g. api.example.com \u2014 not a URL.\n  Active probing of endpoints you do not own may be unlawful. qprobe refuses CIDR\n  blocks, IP ranges, wildcards and target lists. See THREAT-MODEL.md.\n\nOPTIONS\n  --tls | --ssh | --smtp | --imap | --pop3 | --postgres\n                          Force a probe mode (default: auto by well-known port \u2014\n                          SSH :22, SMTP :25/:587, IMAP :143, POP3 :110,\n                          PostgreSQL :5432, else direct TLS \u2014 which covers HTTPS\n                          :443, IMAPS :993, DoT :853).\n  --servername <name>     TLS SNI server name (default: the host).\n  --timeout <ms>          Per-connection timeout (default: 8000).\n  --format <human|json|sarif|cbom>\n                          Output format (default: human). --json / --sarif / --cbom\n                          are aliases. SARIF 2.1.0 and CycloneDX 1.6 CBOM compose\n                          with qScan output (same formats).\n  -h, --help              Show this help.\n\nEXAMPLES\n  qprobe --i-own-this example.com                 # TLS 443: hybrid KEX + cert posture\n  qprobe --ssh --i-own-this git.example.com       # SSH 22: KEXINIT algorithms\n  qprobe --owned-hosts hosts.txt api.example.com:8443 --json\n\nqprobe reports the negotiated reality; it never modifies an endpoint (\"engine disposes\").";
export {};
//# sourceMappingURL=args.d.ts.map