/**
 * Script pentru comutarea ușoară între Firebase real și emulator
 * Acest script modifică fișierul .env.local pentru a activa sau dezactiva emulatorii
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obține calea curentă pentru ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Calea către fișierul .env.local
const envFilePath = path.join(__dirname, '..', '.env.local');
const backupPath = path.join(__dirname, '..', '.env.local.backup');

// Conținutul pentru modul cu emulator
const emulatorConfig = `# Configurație pentru controlul utilizării emulatorilor Firebase
# Setează la 'true' pentru a folosi emulatorii sau 'false' pentru a folosi Firebase real
VITE_USE_FIREBASE_EMULATORS=true

# Configurație mediu de rulare
VITE_ENVIRONMENT=development

# Flaguri pentru debugging
VITE_DEBUG=true

# Porturile emulatorilor (opțional)
VITE_FIREBASE_AUTH_EMULATOR_PORT=9099
VITE_FIREBASE_FIRESTORE_EMULATOR_PORT=8080
VITE_FIREBASE_FUNCTIONS_EMULATOR_PORT=5001
VITE_FIREBASE_STORAGE_EMULATOR_PORT=9199
`;

// Conținutul pentru modul Firebase real
const realFirebaseConfig = `# Configurație pentru controlul utilizării emulatorilor Firebase
# Setează la 'true' pentru a folosi emulatorii sau 'false' pentru a folosi Firebase real
VITE_USE_FIREBASE_EMULATORS=false

# Configurație mediu de rulare
VITE_ENVIRONMENT=development

# Flaguri pentru debugging
VITE_DEBUG=true

# Nu modificați această valoare decât dacă știți ce faceți
VITE_FORCE_REAL_FIREBASE=true
`;

// Creează o interfață readline pentru interacțiunea cu utilizatorul
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funcție pentru backup-ul fișierului curent
function backupCurrentConfig() {
  try {
    if (fs.existsSync(envFilePath)) {
      fs.copyFileSync(envFilePath, backupPath);
      console.log(`Backup creat la: ${backupPath}`);
    }
  } catch (error) {
    console.error('Eroare la crearea backup-ului:', error);
  }
}

// Funcție pentru detectarea configurației curente
function detectCurrentMode() {
  try {
    if (fs.existsSync(envFilePath)) {
      const content = fs.readFileSync(envFilePath, 'utf8');
      if (content.includes('VITE_USE_FIREBASE_EMULATORS=true')) {
        return 'emulator';
      } else {
        return 'real';
      }
    }
  } catch (error) {
    console.error('Eroare la detectarea modului:', error);
  }
  return 'unknown';
}

// Funcție principală
function toggleFirebaseMode() {
  const currentMode = detectCurrentMode();
  console.log(`Mod curent detectat: ${currentMode === 'emulator' ? 'EMULATOR' : 'FIREBASE REAL'}`);
  
  if (currentMode === 'unknown') {
    console.log('Nu s-a putut detecta modul curent. Alegeți manual.');
    askUserForMode();
    return;
  }
  
  // Întrebăm utilizatorul ce mod dorește
  rl.question(`Doriți să comutați la ${currentMode === 'emulator' ? 'FIREBASE REAL' : 'EMULATOR'}? (y/n): `, (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      backupCurrentConfig();
      
      try {
        // Comutăm la celălalt mod
        const newConfig = currentMode === 'emulator' ? realFirebaseConfig : emulatorConfig;
        fs.writeFileSync(envFilePath, newConfig);
        
        console.log(`\n✅ Configurație actualizată la: ${currentMode === 'emulator' ? 'FIREBASE REAL' : 'EMULATOR'}`);
        console.log('\nPentru ca schimbarea să aibă efect, reporniți aplicația:');
        console.log('1. Opriți serverul de dezvoltare (Ctrl+C)');
        console.log('2. Porniți din nou: npm run dev');
        
        if (currentMode === 'real' && newConfig === emulatorConfig) {
          console.log('\n⚠️ Atenție: Pentru a folosi emulatorii, asigurați-vă că aceștia sunt porniți:');
          console.log('firebase emulators:start');
        }
      } catch (error) {
        console.error('Eroare la actualizarea configurației:', error);
      }
    } else {
      console.log('Operațiune anulată. Configurația rămâne neschimbată.');
    }
    
    rl.close();
  });
}

// Funcție pentru a cere utilizatorului să aleagă manual modul
function askUserForMode() {
  rl.question('Ce mod doriți să activați? (1 = EMULATOR, 2 = FIREBASE REAL): ', (answer) => {
    if (answer === '1') {
      backupCurrentConfig();
      fs.writeFileSync(envFilePath, emulatorConfig);
      console.log('\n✅ Configurație actualizată la: EMULATOR');
      console.log('\n⚠️ Atenție: Pentru a folosi emulatorii, asigurați-vă că aceștia sunt porniți:');
      console.log('firebase emulators:start');
    } else if (answer === '2') {
      backupCurrentConfig();
      fs.writeFileSync(envFilePath, realFirebaseConfig);
      console.log('\n✅ Configurație actualizată la: FIREBASE REAL');
    } else {
      console.log('Opțiune invalidă. Operațiune anulată.');
    }
    
    rl.close();
  });
}

// Rulăm funcția principală
toggleFirebaseMode();