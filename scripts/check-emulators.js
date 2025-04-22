#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');

/**
 * Verifică dacă un port este deschis
 * @param {string} host - host-ul de verificat
 * @param {number} port - portul de verificat
 * @returns {Promise<boolean>} - true dacă portul este deschis, false altfel
 */
function checkPort(host, port) {
  return new Promise((resolve) => {
    const req = http.request({
      host: host,
      port: port,
      method: 'HEAD',
      timeout: 1000
    }, () => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Verifică toți emulatorii Firebase
 */
async function checkEmulators() {
  console.log('Verificare emulatori Firebase...');
  
  const emulators = [
    { name: 'Firestore', port: 8080 },
    { name: 'Auth', port: 9099 },
    { name: 'Functions', port: 5002 },
    { name: 'Storage', port: 9199 },
    { name: 'Emulator UI', port: 4000 }
  ];
  
  let allRunning = true;
  
  for (const emulator of emulators) {
    const isRunning = await checkPort('127.0.0.1', emulator.port);
    if (isRunning) {
      console.log(`✅ Emulatorul ${emulator.name} rulează pe portul ${emulator.port}`);
    } else {
      console.log(`❌ Emulatorul ${emulator.name} NU rulează pe portul ${emulator.port}`);
      allRunning = false;
    }
  }
  
  if (!allRunning) {
    console.log('\n⚠️ Unii emulatori nu rulează. Dorești să îi pornești acum? (y/n)');
    process.stdin.once('data', (data) => {
      const input = data.toString().trim().toLowerCase();
      if (input === 'y') {
        console.log('Pornire emulatori...');
        exec('firebase emulators:start', (error, stdout, stderr) => {
          if (error) {
            console.error(`Eroare la pornirea emulatorilor: ${error.message}`);
            return;
          }
          console.log(stdout);
        });
      } else {
        console.log('Continuă fără a porni emulatorii. Aplicația va folosi Firebase live.');
      }
    });
  }
}

checkEmulators();
