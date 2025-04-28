/**
 * Script pentru pornirea controlată a emulatorilor Firebase
 * Permite selectarea specifică a emulatorilor care trebuie porniți
 * pentru a reduce încărcarea sistemului
 */

import { spawn } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obține calea curentă pentru ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Creare interfață readline pentru citirea input-ului utilizatorului
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Opțiuni disponibile pentru emulatori
const EMULATOR_OPTIONS = {
  1: { name: 'auth', label: 'Autentificare (Auth)' },
  2: { name: 'firestore', label: 'Bază de date (Firestore)' },
  3: { name: 'functions', label: 'Funcții (Functions)' },
  4: { name: 'storage', label: 'Stocare (Storage)' },
  5: { name: 'hosting', label: 'Găzduire (Hosting)' },
  6: { name: 'ui', label: 'Interfață UI', default: true }
};

// Configurări prestabilite pentru scenarii comune
const PRESETS = {
  1: {
    label: 'Minim (doar Auth și Firestore)',
    emulators: ['auth', 'firestore', 'ui']
  },
  2: {
    label: 'Standard (Auth, Firestore, Functions)',
    emulators: ['auth', 'firestore', 'functions', 'ui']
  },
  3: {
    label: 'Complet (toate serviciile)',
    emulators: ['auth', 'firestore', 'functions', 'storage', 'hosting', 'ui']
  },
  4: {
    label: 'Custom (selectare manuală)',
    emulators: null
  }
};

// Memorie utilizată de fiecare emulator (aproximativ, în MB)
const EMULATOR_MEMORY = {
  'auth': 150,
  'firestore': 400,
  'functions': 300, 
  'storage': 150,
  'hosting': 100,
  'ui': 100
};

// Funcția principală
async function startEmulators() {
  console.log('\n🔥 Pornire emulatori Firebase optimizați 🔥\n');
  
  // Prezentare configurări prestabilite
  console.log('Alege o configurație prestabilită:');
  for (const [key, preset] of Object.entries(PRESETS)) {
    const memoryUsage = preset.emulators 
      ? preset.emulators.reduce((total, emulator) => total + (EMULATOR_MEMORY[emulator] || 0), 0)
      : 'variabil';
    console.log(`  ${key}. ${preset.label} (Memorie estimată: ~${memoryUsage} MB)`);
  }
  
  const presetChoice = await askQuestion('\nSelectează o configurație (1-4): ');
  const selectedPreset = PRESETS[presetChoice];
  
  if (!selectedPreset) {
    console.log('Selecție invalidă. Vă rugăm să alegeți un număr între 1 și 4.');
    rl.close();
    return;
  }
  
  let selectedEmulators;
  
  if (selectedPreset.emulators) {
    // Utilizatorul a selectat o configurație prestabilită
    selectedEmulators = selectedPreset.emulators;
    console.log(`\nAți ales configurația: ${selectedPreset.label}`);
    console.log(`Emulatori selectați: ${selectedEmulators.filter(e => e !== 'ui').join(', ')}`);
  } else {
    // Utilizatorul a ales configurația personalizată
    console.log('\nSelectați emulatorii pe care doriți să-i porniți:');
    selectedEmulators = [];
    
    for (const [key, option] of Object.entries(EMULATOR_OPTIONS)) {
      if (option.name === 'ui') continue; // UI-ul va fi întrebat separat
      
      const shouldStart = await askYesNo(`Pornire ${option.label}? (y/n): `);
      if (shouldStart) {
        selectedEmulators.push(option.name);
      }
    }
    
    // Întreabă pentru UI
    const shouldStartUI = await askYesNo(`Pornire interfață grafică (UI) pentru emulatori? (y/n): `);
    if (shouldStartUI) {
      selectedEmulators.push('ui');
    }
  }
  
  if (selectedEmulators.length === 0) {
    console.log('Nu a fost selectat niciun emulator. Operațiunea a fost anulată.');
    rl.close();
    return;
  }

  // Calculează memoria estimată
  const totalMemory = selectedEmulators.reduce((total, emulator) => {
    return total + (EMULATOR_MEMORY[emulator] || 0);
  }, 0);
  
  console.log(`\nMemorie RAM estimată: ~${totalMemory} MB`);
  
  // Generează comanda pentru pornirea emulatorilor
  const emulatorCommand = `firebase emulators:start --only ${selectedEmulators.filter(e => e !== 'ui').join(',')}`;
  console.log(`\nComanda care va fi executată: ${emulatorCommand}`);
  
  const confirmStart = await askYesNo('\nConfirmați pornirea emulatorilor? (y/n): ');
  
  if (confirmStart) {
    console.log('\n🚀 Pornire emulatori...\n');
    
    // Execută comanda într-un proces separat
    const emulatorProcess = spawn('firebase', ['emulators:start', '--only', selectedEmulators.filter(e => e !== 'ui').join(',')], {
      stdio: 'inherit',
      shell: true
    });
    
    // Gestionează închiderea procesului
    emulatorProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`\nProces încheiat cu codul: ${code}`);
      }
    });
    
    // Nu închide readline pentru a menține procesul activ
  } else {
    console.log('Operațiune anulată.');
    rl.close();
  }
}

// Funcție helper pentru a pune întrebări și a aștepta răspunsuri
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Funcție helper pentru întrebări de tip da/nu
async function askYesNo(question) {
  const answer = await askQuestion(question);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

// Pornește scriptul
startEmulators().catch(error => {
  console.error('Eroare la pornirea emulatorilor:', error);
  rl.close();
});