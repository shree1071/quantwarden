// Quantguard Sovereign PQC Runtime (NIST FIPS 203)
import { mlkem768 } from '@quantakrypto/core';


const crypto = require('crypto');

function generateKeyPair() {
    // Vulnerable: RSA 2048 for JWT signing
    // [Quantguard PQC Migration - FIPS 203]
    // REPLACED: classical RSA key generation with NIST ML-KEM-768
    const { publicKey, privateKey } = mlkem768.generateKeyPair();
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return { publicKey, privateKey };
}

function createDHExchange() {
    // Vulnerable: Classical Diffie-Hellman — broken by Shor's
    // [Quantguard PQC Migration - FIPS 203]
    // REPLACED: finite-field DH with X25519Kyber768 hybrid key exchange
    const dh = mlkem768.createHybridKeyExchange();
    dh.generateKeys();
    return dh;
}
