/**
 * Script pentru listarea bucket-urilor disponibile și actualizarea configurației CORS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path-ul către fișierul de configurare service account
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

/**
 * Listează toate bucket-urile disponibile
 */
async function listBuckets() {
  console.log('Listare bucket-uri de storage disponibile...');
  
  try {
    // Verificăm dacă fișierul de service account există
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`Fișierul de service account nu a fost găsit la ${serviceAccountPath}`);
      console.error(`Te rog să descarci fișierul serviceAccountKey.json din Firebase Console:`);
      console.error('1. Accesează https://console.firebase.google.com/');
      console.error('2. Selectează proiectul tău -> Project settings -> Service accounts');
      console.error('3. Apasă "Generate new private key" și salvează fișierul ca serviceAccountKey.json în directorul rădăcină al proiectului');
      return;
    }
    
    // Inițializăm Google Cloud Storage cu credențialele service account
    const storage = new Storage({
      keyFilename: serviceAccountPath,
      projectId: 'lupulcorbul'
    });
    
    console.log('Se obțin bucket-urile disponibile...');
    
    // Listăm toate bucket-urile
    const [buckets] = await storage.getBuckets();
    
    console.log('Bucket-uri disponibile:');
    if (buckets.length > 0) {
      buckets.forEach(bucket => {
        console.log(`- ${bucket.name}`);
      });
    } else {
      console.log('Nu s-au găsit bucket-uri. Este posibil ca Storage să nu fie încă configurat sau service account-ul nu are permisiunile necesare.');
    }
    
  } catch (error) {
    console.error('Eroare la listarea bucket-urilor:', error.message);
    console.error('\nDetalii eroare:', error);
    
    if (error.code === 403) {
      console.error('\nEroare de permisiune. Asigură-te că service account-ul are rol de Storage Admin sau Storage Object Viewer.');
      console.error('Poți adăuga acest rol din Firebase Console -> Project settings -> Service accounts -> Cloud Platform');
    }
    
    process.exit(1);
  }
}

// Rulăm funcția de listare a bucket-urilor
listBuckets();