/**
 * Script pentru monitorizarea performanței emulatorilor Firebase
 * Oferă informații despre consumul de resurse și recomandări de optimizare
 */

import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obține calea curentă pentru ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Verifică dacă emulatorii rulează
async function checkRunningEmulators() {
  console.log('📊 Verificare emulatori Firebase...\n');
  
  try {
    // Colectare informații sistem
    const totalMem = Math.round(os.totalmem() / (1024 * 1024));
    const freeMem = Math.round(os.freemem() / (1024 * 1024));
    const usedMem = totalMem - freeMem;
    const memUsage = Math.round((usedMem / totalMem) * 100);
    
    console.log(`Informații sistem:`);
    console.log(`- CPU: ${os.cpus().length} core-uri`);
    console.log(`- Memorie totală: ${totalMem} MB`);
    console.log(`- Memorie utilizată: ${usedMem} MB (${memUsage}%)`);
    console.log(`- Platformă: ${os.platform()} ${os.release()}`);
    
    // Verificare procese emulatori
    console.log('\nVerificare procese emulatori Firebase...');
    
    const isWindows = os.platform() === 'win32';
    const command = isWindows ? 
      'tasklist /fi "IMAGENAME eq java.exe" /fo list' : 
      'ps aux | grep "[j]ava.*firebase.*emulator"';
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log('Nu s-au putut verifica procesele. Verificați manual dacă emulatorii rulează.');
        return;
      }
      
      const javaProcesses = stdout.toString();
      
      if (javaProcesses.includes('java') || javaProcesses.includes('Java')) {
        console.log('✅ Emulatori Firebase detectați ca active!');
        
        // Pentru Windows, extrage informații despre memorie din output
        if (isWindows) {
          const memLines = javaProcesses.match(/Mem Usage: \d+,?\d* K/g);
          
          if (memLines && memLines.length > 0) {
            let totalEmulatorMem = 0;
            
            memLines.forEach(line => {
              const memValue = line.replace('Mem Usage: ', '')
                .replace(' K', '')
                .replace(',', '');
              totalEmulatorMem += parseInt(memValue, 10);
            });
            
            const totalEmulatorMemMB = Math.round(totalEmulatorMem / 1024);
            console.log(`\nEmulatorii Firebase utilizează aproximativ ${totalEmulatorMemMB} MB de memorie.`);
            
            if (totalEmulatorMemMB > 1000) {
              console.log('⚠️ Utilizare ridicată a memoriei detectată!');
              console.log('Recomandare: Folosiți scriptul "npm run emulators:optimized" pentru a porni doar emulatorii necesari.');
            }
          }
        }
        
        // Verifică porturile deschise
        const portCommand = isWindows ? 
          'netstat -ano | findstr "9099 8080 5001 9199 4000"' : 
          'lsof -i:9099,8080,5001,9199,4000';
        
        exec(portCommand, (error, stdout, stderr) => {
          if (!error) {
            console.log('\nPorturi active detectate:');
            const output = stdout.toString();
            
            const ports = {
              '9099': 'Auth Emulator',
              '8080': 'Firestore Emulator',
              '5001': 'Functions Emulator',
              '9199': 'Storage Emulator',
              '4000': 'Emulator UI'
            };
            
            Object.keys(ports).forEach(port => {
              if (output.includes(port)) {
                console.log(`✅ ${ports[port]} (port ${port}): Activ`);
              } else {
                console.log(`❌ ${ports[port]} (port ${port}): Inactiv`);
              }
            });
          }
          
          // Verifică log-urile
          console.log('\nVerificare fișiere log:');
          const logFiles = [
            { name: 'firebase-debug.log', label: 'Firebase general' },
            { name: 'firestore-debug.log', label: 'Firestore' },
            { name: 'ui-debug.log', label: 'UI' }
          ];
          
          logFiles.forEach(file => {
            // Calea absolută către fișierul de log
            const logPath = join(process.cwd(), file.name);
            
            if (fs.existsSync(logPath)) {
              const stats = fs.statSync(logPath);
              const fileSizeInMB = Math.round((stats.size / (1024 * 1024)) * 100) / 100;
              
              console.log(`✅ ${file.label} (${file.name}): ${fileSizeInMB} MB`);
              
              if (fileSizeInMB > 10) {
                console.log(`   ⚠️ Fișier log mare detectat! Considerați ștergerea pentru a elibera spațiu.`);
              }
            } else {
              console.log(`❌ ${file.label} (${file.name}): Nu a fost găsit`);
            }
          });
          
          console.log('\n📋 Recomandări:');
          if (memUsage > 80) {
            console.log('- Sistemul dvs. are o utilizare ridicată a memoriei. Închideți alte aplicații pentru performanță optimă.');
          }
          
          console.log('- Pentru a reduce consumul de resurse, utilizați "npm run emulators:optimized" și selectați doar emulatorii necesari.');
          console.log('- Puteți comuta între Firebase real și emulatori folosind "npm run toggle-firebase".');
          console.log('- Pentru a curăța log-urile și a elibera spațiu, ștergeți fișierele *-debug.log.');
        });
      } else {
        console.log('❌ Nu au fost detectați emulatori Firebase rulând.');
        console.log('\nPentru a porni emulatori:');
        console.log('- Utilizați "npm run emulators" pentru a porni toți emulatorii');
        console.log('- Sau "npm run emulators:optimized" pentru a porni doar emulatorii necesari');
      }
    });
  } catch (err) {
    console.error('Eroare la verificarea emulatorilor:', err);
  }
}

// Execută verificarea
checkRunningEmulators();