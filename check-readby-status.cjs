const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDdBgqV1Y0WEDLpqLKKr9BZHWn8tU5yZ-g',
  authDomain: 'dani-cu-daniel.firebaseapp.com',
  projectId: 'dani-cu-daniel',
  storageBucket: 'dani-cu-daniel.appspot.com',
  messagingSenderId: '674635668500',
  appId: '1:674635668500:web:e6c0a999a4eb96b75d1c5e'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  try {
    console.log('🔍 Verificând starea readBy arrays în Firestore...');
    console.log('='.repeat(60));
    
    const articlesRef = collection(db, 'articles');
    const snapshot = await getDocs(articlesRef);
    
    console.log(`📄 Total articole găsite: ${snapshot.docs.length}\n`);
    
    if (snapshot.docs.length === 0) {
      console.log('❌ Nu s-au găsit articole în colecție!');
      return;
    }
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const title = data.title || 'Fără titlu';
      const readCount = data.readCount || 0;
      const readByLength = data.readBy ? data.readBy.length : 0;
      
      console.log(`📝 Articol ${index + 1}: ${title}`);
      console.log(`   📊 readCount: ${readCount}`);
      console.log(`   👥 readBy array length: ${readByLength}`);
      
      if (data.readBy && data.readBy.length > 0) {
        const usersList = data.readBy.slice(0, 3).join(', ');
        const moreUsers = data.readBy.length > 3 ? '...' : '';
        console.log(`   🔍 readBy users: ${usersList}${moreUsers}`);
        
        // Verifică consistența
        if (readCount !== readByLength) {
          console.log(`   ⚠️  INCONSISTENȚĂ: readCount (${readCount}) != readBy.length (${readByLength})`);
        } else {
          console.log(`   ✅ Consistență OK: readCount = readBy.length`);
        }
      } else {
        console.log('   ❌ Nu există utilizatori în readBy array');
        if (readCount > 0) {
          console.log(`   ⚠️  PROBLEMĂ: readCount este ${readCount} dar readBy este gol!`);
        }
      }
      console.log(''); // Linie goală între articole
    });
    
    // Statistici generale
    const totalReadCounts = snapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().readCount || 0);
    }, 0);
    
    const totalReadByEntries = snapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().readBy ? doc.data().readBy.length : 0);
    }, 0);
    
    console.log('📊 STATISTICI GENERALE:');
    console.log(`   Total readCount în toate articolele: ${totalReadCounts}`);
    console.log(`   Total readBy entries în toate articolele: ${totalReadByEntries}`);
    
    if (totalReadCounts !== totalReadByEntries) {
      console.log(`   ⚠️  PROBLEMĂ GLOBALĂ: Există inconsistențe în tracking!`);
    } else {
      console.log(`   ✅ Tracking-ul pare consistent global`);
    }
    
    console.log('\n✅ Verificare completă!');
  } catch (error) {
    console.error('❌ Eroare:', error);
  }
})();
