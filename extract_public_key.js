import fs from "fs";
import crypto from "crypto";

// Citește certificatul
const certContent = fs.readFileSync("netopia_cert.crt", "utf8");

// Extrage cheia publică din certificat
const cert = new crypto.X509Certificate(certContent);
const publicKey = cert.publicKey.export({ type: "spki", format: "pem" });

// Salvează cheia publică
fs.writeFileSync("netopia_public_key.pem", publicKey);

console.log("✅ Cheia publică a fost extrasă cu succes!");
console.log("Conținutul cheii publice:");
console.log(publicKey);
