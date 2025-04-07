/**
 * Script pentru verificarea stării emulatorilor Firebase
 */

const checkEmulators = async () => {
  console.log('Verificare stare emulatori Firebase...');
  
  const emulators = [
    { name: 'Firestore', url: 'http://127.0.0.1:8080/' },
    { name: 'Auth', url: 'http://127.0.0.1:9099/' },
    { name: 'Functions', url: 'http://127.0.0.1:5002/' },
    { name: 'Storage', url: 'http://127.0.0.1:9199/' },
    { name: 'Emulator UI', url: 'http://127.0.0.1:4000/' }
  ];
  
  for (const emulator of emulators) {
    try {
      const response = await fetch(emulator.url, { mode: 'no-cors' });
      console.log(`✅ Emulatorul ${emulator.name} pare să fie pornit`);
    } catch (error) {
      console.error(`❌ Emulatorul ${emulator.name} nu răspunde: ${error.message}`);
    }
  }
  
  console.log('Verificare completă. Asigură-te că ai pornit emulatorii cu comanda:');
  console.log('firebase emulators:start');
};

export default checkEmulators;
