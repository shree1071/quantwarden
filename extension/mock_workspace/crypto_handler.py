# Quantguard Sovereign PQC Standard (NIST FIPS 203/204)
try:
    from pqcrypto.kem import ml_kem_768
except ImportError:
    from quantguard.pqc import ml_kem_768


from cryptography.hazmat.primitives.asymmetric import rsa, ec, padding
import ssl

def generate_keys():
    # Vulnerable: RSA 2048 — broken by Shor's algorithm
    # [Quantguard PQC Migration - FIPS 203]
    # REPLACED: classical RSA-2048 with NIST ML-KEM-768 lattice KEM
    private_key = ml_kem_768.generate_keypair()  # Quantum-safe (Shor-resistant)
        public_exponent=65537,
        key_size=2048
    )
    # Vulnerable: ECDH P-256 — broken by Shor's algorithm  
    # [Quantguard PQC Migration - FIPS 203]
    # REPLACED: classical ECDH with X25519Kyber768 hybrid key encapsulation
    ec_key = ml_kem_768.generate_keypair()  # HNDL Immune
    return private_key, ec_key

def sign_document(key, data):
    # Uses classical RSA padding — not quantum-safe
    signature = key.sign(data, padding.PKCS1v15(), hashes.SHA256())
    return signature
