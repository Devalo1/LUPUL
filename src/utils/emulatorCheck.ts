/**
 * Script pentru verificarea stării emulatorilor Firebase
 */

type Emulator = {
  name: string;
  url: string;
};

const checkEmulators = async (): Promise<void> => {
  console.log("Verificare stare emulatori Firebase...");
  
  const emulators: Emulator[] = [
    { name: "Firestore", url: "http://127.0.0.1:8080/" },
    { name: "Auth", url: "http://127.0.0.1:9099/" },
    { name: "Functions", url: "http://127.0.0.1:5002/" },
    { name: "Storage", url: "http://127.0.0.1:9199/" },
    { name: "Emulator UI", url: "http://127.0.0.1:4000/" }
  ];
  
  for (const emulator of emulators) {
    try {
      // Realizăm cererea fără a stoca răspunsul într-o variabilă
      await fetch(emulator.url, { mode: "no-cors" });
      console.log(`✅ Emulatorul ${emulator.name} pare să fie pornit`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Emulatorul ${emulator.name} nu răspunde: ${errorMessage}`);
    }
  }
  
  console.log("Verificare completă. Asigură-te că ai pornit emulatorii cu comanda:");
  console.log("firebase emulators:start");
};

export default checkEmulators;
