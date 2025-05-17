#!/usr/bin/env node

/**
 * This script checks if Firebase emulators are running
 * It's useful for automated environments and CI/CD pipelines
 */

const http = require('http');

// Default emulator ports
const EMULATOR_PORTS = {
  firestore: 8080,
  auth: 9099,
  storage: 9199,
  functions: 5001
};

// Check if an emulator is running on the specified port
function checkEmulator(port, name) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 1000
      },
      (res) => {
        console.log(`✅ ${name} emulator is running on port ${port}`);
        resolve(true);
      }
    );

    req.on('error', () => {
      console.log(`❌ ${name} emulator is NOT running on port ${port}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ ${name} emulator timed out on port ${port}`);
      resolve(false);
    });

    req.end();
  });
}

async function checkAllEmulators() {
  let allRunning = true;
  
  // Check each emulator
  for (const [name, port] of Object.entries(EMULATOR_PORTS)) {
    const isRunning = await checkEmulator(port, name);
    if (!isRunning) {
      allRunning = false;
    }
  }

  if (allRunning) {
    console.log('\n✅ All Firebase emulators are running!');
  } else {
    console.log('\n❌ Some Firebase emulators are not running.');
    console.log('To start all emulators, run: firebase emulators:start');
    process.exit(1); // Exit with error code
  }
}

// Run the check
checkAllEmulators();
