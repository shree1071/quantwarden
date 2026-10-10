export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
        status: "healthy",
        engine: "QuantWarden PQC Sentinel",
        pqcStandard: "NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)"
    });
}
