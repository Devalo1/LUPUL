const crypto = require('crypto');

// Cheia privată din .env.local
const privateKeyPem = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDgvgno9K9M465g14CoKE0aIvKbSqwE3EvKm6NIcVO0ZQ7za08vXbe508JPioYoTRM2WN7CQTQQgupiRKtyPykE3lxpCMmLqLzpcsq0wm3o9tvCnB8WzbA2lpDre+EDcylPVyulZhrWn1Vf9sbJcFZREwMgYWewVVLwkTen92Qm5wIDAQABAoGAS1/xOuw1jvgdl+UvBTbfBRELhQG6R7cKxF0GmllH1Yy/QuyOljg8UlqvJLY04HdZJjUQIN51c8Q0j9iwF5UPUC3MgR0eQ70iislu6LGPnTnIJgbCs4QSWY/fjo08DgTh3uDUO4bIsIFKvGbVwd86kjTARldnQ4RonKwYkv1xDIECQQDtZg9onk7gcE31Z2QAEaUfloffY7vst4u+QUm6vZoQ+Eu4ohX3qciwN1daP5qd290OAEngOa8dtzDK/+tgbsU3AkEA8lobdWiVZkB+1q1Rl6LEOHuxXMyQ42s1L1L1Owc8Ftw6JGT8FewZ4lCD3U56MJSebCCqKCG32GGkO47R50aD0QJAIlnRQvcdPLajYS4btzLWbNKwSG+7Ao6whtAVphLHV0tGUaoKebK0mmL3ndR0QAFPZDZAelR+dVNLmSQc3/BHUwJAOw1rvWsTZEv43BR1Wi6GA4FYUVVjRJbd6b8cFBsKMEPPQwj8R9c042ldCDLUITxFcfFv pMG6i1YXb4+4Y9NR0QJBANt0qlS2GsS9S79eWhPkAnw5qxDcOEQeekk5z5jil7yw7J0yOEdf46C89U56v2zORfS5Due8YEYgSMRxXdY0/As=
-----END RSA PRIVATE KEY-----`;

try {
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const publicKey = crypto.createPublicKey(privateKey);
    const publicKeyPem = publicKey.export({
        type: 'spki',
        format: 'pem'
    });
    
    console.log('\n=== CHEIA PUBLICĂ CORESPUNZĂTOARE ===');
    console.log(publicKeyPem);
    
    // Să verific și cu cheia publică din .env.local
    const currentPublicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgvgno9K9M465g14CoKE0aIvKb
SqwE3EvKm6NIcVO0ZQ7za08vXbe508JPioYoTRM2WN7CQTQQgupiRKtyPykE3lxp
CMmLqLzpcsq0wm3o9tvCnB8WzbA2lpDre+EDcylPVyulZhrWn1Vf9sbJcFZREwMg
YWewVVLwkTen92Qm5wIDAQAB
-----END PUBLIC KEY-----`;

    console.log('\n=== VERIFICARE ===');
    console.log('Cheia publică din private key:', publicKeyPem.replace(/\n/g, ''));
    console.log('Cheia publică din .env.local:', currentPublicKey.replace(/\n/g, ''));
    console.log('MATCH:', publicKeyPem.trim() === currentPublicKey.trim() ? 'DA' : 'NU');
    
} catch (error) {
    console.error('Eroare:', error.message);
}
