/**
 * Script pentru actualizarea configurației CORS pentru Firebase Storage
 * Acest script utilizează Google Cloud Storage Client pentru a aplica setările CORS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path-ul către fișierul de configurare CORS
const corsFilePath = path.join(__dirname, '..', 'cors.json');
// Path-ul către fișierul de configurare service account
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

/**
 * Aplică configurația CORS la bucket-ul de storage folosind Google Cloud Storage Client
 */
async function updateCorsSetting() {
  console.log('Actualizare configurație CORS pentru Firebase Storage...');
  
  try {
    // Verificăm dacă fișierul de configurare CORS există
    if (!fs.existsSync(corsFilePath)) {
      console.error(`Fișierul de configurare CORS nu a fost găsit la ${corsFilePath}`);
      console.log('Se creează un fișier de configurare CORS implicit...');
      
      // Creăm un fișier de configurare CORS implicit
      const defaultCorsConfig = [
        {
          "origin": ["*"],
          "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
          "responseHeader": [
            "Content-Type", 
            "Access-Control-Allow-Origin", 
            "Access-Control-Allow-Methods", 
            "Access-Control-Allow-Headers",
            "Cache-Control", 
            "X-Requested-With"
          ],
          "maxAgeSeconds": 3600
        }
      ];
      
      fs.writeFileSync(corsFilePath, JSON.stringify(defaultCorsConfig, null, 2));
      console.log(`Fișier de configurare CORS implicit creat la ${corsFilePath}`);
    }
    
    // Verificăm dacă fișierul de service account există
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`Fișierul de service account nu a fost găsit la ${serviceAccountPath}`);
      console.error(`Te rog să descarci fișierul serviceAccountKey.json din Firebase Console:`);
      console.error('1. Accesează https://console.firebase.google.com/');
      console.error('2. Selectează proiectul tău -> Project settings -> Service accounts');
      console.error('3. Apasă "Generate new private key" și salvează fișierul ca serviceAccountKey.json în directorul rădăcină al proiectului');
      return;
    }
    
    // Încărcăm configurația CORS
    const corsConfig = JSON.parse(fs.readFileSync(corsFilePath, 'utf8'));
    console.log('Configurația CORS încărcată:', JSON.stringify(corsConfig, null, 2));
    
    // Inițializăm Google Cloud Storage cu credențialele service account
    const storage = new Storage({
      keyFilename: serviceAccountPath,
      projectId: 'lupulcorbul'
    });
    
    // Lista bucket-urilor pentru care aplicăm configurația CORS
    const bucketNames = [
      'lupulcorbul.appspot.com',         // Bucket-ul configurat în aplicație
      'lupulcorbul.firebasestorage.app'  // Bucket-ul alternativ găsit la listare
    ];
    
    // Aplicăm configurația CORS pentru fiecare bucket
    let hasSuccess = false;
    
    for (const bucketName of bucketNames) {
      try {
        console.log(`Se aplică configurația CORS la bucket-ul ${bucketName}...`);
        const bucket = storage.bucket(bucketName);
        await bucket.setCorsConfiguration(corsConfig);
        console.log(`Configurația CORS a fost actualizată cu succes pentru bucket-ul ${bucketName}!`);
        hasSuccess = true;
      } catch (bucketError) {
        console.error(`Eroare la actualizarea configurației CORS pentru bucket-ul ${bucketName}:`, bucketError.message);
      }
    }
    
    if (hasSuccess) {
      console.log('Configurația CORS a fost actualizată cu succes pentru cel puțin un bucket!');
      console.log(`Configurație: ${corsFilePath}`);
    } else {
      throw new Error('Nu s-a putut actualiza configurația CORS pentru niciunul dintre bucket-uri');
    }
  } catch (error) {
    console.error('Eroare la actualizarea configurației CORS:', error.message);
    
    if (error.code === 403) {
      console.error('Eroare de permisiune. Asigură-te că service account-ul are rol de Storage Admin.');
      console.error('Poți adăuga acest rol din Firebase Console -> Project settings -> Service accounts -> Cloud Platform');
    } else if (error.code === 404) {
      console.error('Bucket-ul specificat nu există. Verifică numele bucket-ului Firebase Storage.');
    }
    
    console.log('\nAlternativ, poți actualiza configurația CORS manual din Firebase Console:');
    console.log('1. Accesează https://console.firebase.google.com/');
    console.log('2. Selectează proiectul tău');
    console.log('3. Navigă la Storage -> Rules');
    console.log('4. Adaugă următoarea configurație CORS din fișierul cors.json');
    
    process.exit(1);
  }
}

// Funcție pentru a afișa configurația CORS curentă
function showCurrentCorsSetting() {
  try {
    const corsConfig = JSON.parse(fs.readFileSync(corsFilePath, 'utf8'));
    console.log('Configurația CORS curentă:');
    console.log(JSON.stringify(corsConfig, null, 2));
  } catch (error) {
    console.error(`Nu s-a putut citi configurația CORS din ${corsFilePath}:`, error.message);
    process.exit(1);
  }
}

// Procesăm argumentele comenzii
const args = process.argv.slice(2);
if (args.includes('--show')) {
  showCurrentCorsSetting();
} else {
  updateCorsSetting();
}

export {
  updateCorsSetting,
  showCurrentCorsSetting
};