/**
 * NETOPIA Live Credentials - separat pentru a nu depăși limita AWS Lambda de 4KB
 * Suportă atât variabile de mediu directe cât și în format base64
 */

// Funcție pentru a decoda din base64 dacă este necesar
function decodeBase64Credential(envVar, base64EnvVar, fallback) {
  // Încearcă prima dată variabila directă
  if (process.env[envVar]) {
    return process.env[envVar];
  }

  // Apoi încearcă variabila base64
  if (process.env[base64EnvVar]) {
    try {
      return Buffer.from(process.env[base64EnvVar], "base64").toString("utf-8");
    } catch (error) {
      console.error(`Error decoding ${base64EnvVar}:`, error);
    }
  }

  // Fallback la valoarea hardcoded
  return fallback;
}

const NETOPIA_LIVE_PRIVATE_KEY = decodeBase64Credential(
  "NETOPIA_LIVE_PRIVATE_KEY",
  "NETOPIA_LIVE_PRIVATE_KEY_B64",
  `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDgvgno9K9M465g14CoKE0aIvKbSqwE3EvKm6NIcVO0ZQ7za08v
Xbe508JPioYoTRM2WN7CQTQQgupiRKtyPykE3lxpCMmLqLzpcsq0wm3o9tvCnB8W
zbA2lpDre+EDcylPVyulZhrWn1Vf9sbJcFZREwMgYWewVVLwkTen92Qm5wIDAQAB
AoGAS1/xOuw1jvgdl+UvBTbfBRELhQG6R7cKxF0GmllH1Yy/QuyOljg8UlqvJLY0
4HdZJjUQIN51c8Q0j9iwF5UPUC3MgR0eQ70iislu6LGPnTnIJgbCs4QSWY/fjo08
DgTh3uDUO4bIsIFKvGbVwd86kjTARldnQ4RonKwYkv1xDIECQQDtZg9onk7gcE31
Z2QAEaUfloffY7vst4u+QUm6vZoQ+Eu4ohX3qciwN1daP5qd290OAEngOa8dtzDK
/+tgbsU3AkEA8lobdWiVZkB+1q1Rl6LEOHuxXMyQ42s1L1L1Owc8Ftw6JGT8FewZ
4lCD3U56MJSebCCqKCG32GGkO47R50aD0QJAIlnRQvcdPLajYS4btzLWbNKwSG+7
Ao6whtAVphLHV0tGUaoKebK0mmL3ndR0QAFPZDZAelR+dVNLmSQc3/BHUwJAOw1r
vWsTZEv43BR1Wi6GA4FYUVVjRJbd6b8cFBsKMEPPQwj8R9c042ldCDLUITxFcfFv
pMG6i1YXb4+4Y9NR0QJBANt0qlS2GsS9S79eWhPkAnw5qxDcOEQeekk5z5jil7yw
7J0yOEdf46C89U56v2zORfS5Due8YEYgSMRxXdY0/As=
-----END RSA PRIVATE KEY-----`
);

const NETOPIA_LIVE_CERTIFICATE = decodeBase64Credential(
  "NETOPIA_LIVE_CERTIFICATE",
  "NETOPIA_LIVE_CERTIFICATE_B64",
  `-----BEGIN CERTIFICATE-----
MIIC3zCCAkigAwIBAgIBATANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCUk8x
EjAQBgNVBAgTCUJ1Y2hhcmVzdDESMBAGA1UEBxMJQnVjaGFyZXN0MRAwDgYDVQQK
EwdORVRPUElBMSEwHwYDVQQLExhORVRPUElBIERldmVsb3BtZW50IHRlYW0xHDAa
BgNVBAMTE25ldG9waWEtcGF5bWVudHMucm8wHhcNMjUwNzEzMTI0ODM0WhcNMzUw
NzExMTI0ODM0WjCBiDELMAkGA1UEBhMCUk8xEjAQBgNVBAgTCUJ1Y2hhcmVzdDES
MBAGA1UEBxMJQnVjaGFyZXN0MRAwDgYDVQQKEwdORVRPUElBMSEwHwYDVQQLExhO
RVRPUElBIERldmVsb3BtZW50IHRlYW0xHDAaBgNVBAMTE25ldG9waWEtcGF5bWVu
dHMucm8wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBALwh0/NhEpZFuKvghZ9N
75CXba05MWNCh422kcfFKbqP5YViCUBg3Mc5ZYd1e0Xi9Ui1QI2Z/jvvchrDZGQw
jarApr3S9bowHEkZH81ZolOoPHBZbYpA28BIyHYRcaTXjLtiBGvjpwuzljmXeBoV
LinIaE0IUpMen9MLWG2fGMddAgMBAAGjVzBVMA4GA1UdDwEB/wQEAwIFoDATBgNV
HSUEDDAKBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ9yXCh
MGxzUzQflmkXT1oyIBoetTANBgkqhkiG9w0BAQsFAAOBgQAMnh95YlI+y3XcxrpG
gNWC9AwVBt61MTid213yuXDGxkouizSGFr1MjP1tk/YkcWdNka9QB3AtCr4bMers
/2f322soXcrhAOhj5JPVQkF6rlhJxg2JBO+8M5sOJTaxq5YvFHl/o2GGg0UuxWb5
RbUx6W/CU+uFDgDY8CdZ3hZ7kg==
-----END CERTIFICATE-----`
);

module.exports = {
  NETOPIA_LIVE_PRIVATE_KEY,
  NETOPIA_LIVE_CERTIFICATE,
};
