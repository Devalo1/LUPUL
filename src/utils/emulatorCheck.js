/**
 * Script pentru verificarea stării emulatorilor Firebase
 */
import { logger } from './logger';

const emulatorLogger = logger.createLogger('EmulatorCheck');

const checkEmulators = async () => {
  emulatorLogger.info('Verificare stare emulatori Firebase...');
  
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
      emulatorLogger.info(`✅ Emulatorul ${emulator.name} pare să fie pornit`);
    } catch (error) {
      emulatorLogger.error(`❌ Emulatorul ${emulator.name} nu răspunde: ${error.message}`);
    }
  }
  
  emulatorLogger.info('Verificare completă. Asigură-te că ai pornit emulatorii cu comanda:');
  emulatorLogger.info('firebase emulators:start');
};

export default checkEmulators;
