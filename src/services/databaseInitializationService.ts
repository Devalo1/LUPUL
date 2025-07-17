import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { medicineService } from "./medicineService";
import { MedicineCategory, MedicineForm } from "../models/Medicine";
import logger from "../utils/logger";

export class DatabaseInitializationService {
  async initializeAllDatabases(): Promise<void> {
    try {
      logger.info("Starting database initialization...");

      await this.initializeMedicineDatabase();
      await this.initializeDrugInteractionsDatabase();
      await this.initializeBasicAIKnowledge();

      logger.info("Database initialization completed successfully");
    } catch (error) {
      logger.error("Error during database initialization:", error);
      throw error;
    }
  }

  private async initializeMedicineDatabase(): Promise<void> {
    try {
      // Verifică dacă medicamentele sunt deja inițializate
      const existingMedicines = await medicineService.getAllMedicines();
      if (existingMedicines.length > 0) {
        logger.info("Medicine database already initialized");
        return;
      }

      logger.info("Initializing medicine database...");

      const medicines = [
        // ANALGEZICE ȘI ANTIPIRETICE
        {
          name: "Paracetamol 500mg",
          activeSubstance: "Paracetamol",
          composition: ["Paracetamol 500mg"],
          category: MedicineCategory.ANALGESIC,
          indications: [
            "durere de cap",
            "febra",
            "dureri musculare",
            "dureri dentare",
          ],
          contraindications: [
            "insuficienta hepatica severa",
            "alcoolism cronic",
          ],
          sideEffects: ["greata", "voma", "reactii alergice rare"],
          dosage: {
            adults: "500-1000mg la 4-6 ore, maxim 4g pe zi",
            children: "10-15mg/kg la 4-6 ore",
            elderly: "500mg la 4-6 ore, maxim 3g pe zi",
          },
          form: MedicineForm.TABLET,
          producer: "Farmacia Tei",
          price: 8.5,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: ["Nu depășiți doza maximă zilnică", "Evitați alcoolul"],
          storage: "La temperatura camerei, ferit de umiditate",
          activeIngredients: [
            { name: "Paracetamol", quantity: "500", unit: "mg" },
          ],
          therapeuticClass: "Analgezic non-opioid, antipiretic",
          atcCode: "N02BE01",
        },
        {
          name: "Ibuprofen 400mg",
          activeSubstance: "Ibuprofen",
          composition: ["Ibuprofen 400mg"],
          category: MedicineCategory.ANALGESIC,
          indications: [
            "durere",
            "inflamatie",
            "febra",
            "artrita",
            "dureri menstruale",
          ],
          contraindications: [
            "ulcer gastric activ",
            "insuficienta renala severa",
            "insuficienta cardiaca severa",
          ],
          sideEffects: [
            "dureri de stomac",
            "greata",
            "ameteala",
            "eruptii cutanate",
          ],
          dosage: {
            adults: "400mg la 6-8 ore, maxim 1200mg pe zi",
            children: "5-10mg/kg la 6-8 ore (peste 6 luni)",
            elderly: "Reducere doza cu 50%",
          },
          form: MedicineForm.TABLET,
          producer: "Gedeon Richter",
          price: 12.3,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: [
            "Administrare cu mâncare",
            "Evitați alcoolul",
            "Risc de sângerare gastrică",
          ],
          storage: "La temperatura camerei",
          activeIngredients: [
            { name: "Ibuprofen", quantity: "400", unit: "mg" },
          ],
          therapeuticClass: "AINS - Antiinflamator nesteroidian",
          atcCode: "M01AE01",
        },
        {
          name: "Aspirin 500mg",
          activeSubstance: "Acid acetilsalicilic",
          composition: ["Acid acetilsalicilic 500mg"],
          category: MedicineCategory.ANALGESIC,
          indications: [
            "durere",
            "febra",
            "inflamatie",
            "prevenirea trombozei",
          ],
          contraindications: ["copii sub 16 ani", "ulcer gastric", "hemofilie"],
          sideEffects: ["dureri de stomac", "sângerare gastrică", "tinnitus"],
          dosage: {
            adults: "500mg-1g la 4-6 ore, maxim 4g pe zi",
            elderly: "Reducere doza",
          },
          form: MedicineForm.TABLET,
          producer: "Bayer",
          price: 9.75,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: [
            "Nu administrați copiilor sub 16 ani",
            "Risc sindrom Reye",
          ],
          storage: "La temperatura camerei, uscat",
          activeIngredients: [
            { name: "Acid acetilsalicilic", quantity: "500", unit: "mg" },
          ],
          therapeuticClass: "AINS, antiagreant plachetar",
          atcCode: "N02BA01",
        },

        // MEDICAMENTE RESPIRATORII
        {
          name: "Tusisedal Sirop",
          activeSubstance: "Dextrometorfan",
          composition: ["Dextrometorfan 15mg/5ml"],
          category: MedicineCategory.RESPIRATORY,
          indications: ["tuse seaca", "tuse iritativa", "tuse nocturnă"],
          contraindications: [
            "copii sub 2 ani",
            "depresie respiratorie",
            "astm bronșic sever",
          ],
          sideEffects: ["somnolenta", "ameteala", "constipatie", "greață"],
          dosage: {
            adults: "15ml de 3-4 ori pe zi",
            children: "5-10ml de 3 ori pe zi (peste 6 ani)",
          },
          form: MedicineForm.SYRUP,
          producer: "Zentiva",
          price: 18.75,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: [
            "Nu administrați copiilor sub 2 ani",
            "Poate cauza somnolență",
          ],
          storage:
            "La temperatura camerei, după deschidere se consumă în 6 luni",
          activeIngredients: [
            { name: "Dextrometorfan", quantity: "15", unit: "mg/5ml" },
          ],
          therapeuticClass: "Antitusiv",
          atcCode: "R05DA09",
        },
        {
          name: "Mucosolvan Sirop",
          activeSubstance: "Ambroxol",
          composition: ["Ambroxol 30mg/5ml"],
          category: MedicineCategory.RESPIRATORY,
          indications: ["tuse cu expectorație", "bronșită", "pneumonie"],
          contraindications: ["hipersensibilitate la ambroxol"],
          sideEffects: ["greață", "diaree", "erupții cutanate"],
          dosage: {
            adults: "10ml de 3 ori pe zi",
            children: "2.5-5ml de 2-3 ori pe zi",
          },
          form: MedicineForm.SYRUP,
          producer: "Boehringer Ingelheim",
          price: 22.4,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: ["Administrare cu multă apă"],
          storage: "La temperatura camerei",
          activeIngredients: [
            { name: "Ambroxol", quantity: "30", unit: "mg/5ml" },
          ],
          therapeuticClass: "Mucolitic, expectorant",
          atcCode: "R05CB06",
        },

        // MEDICAMENTE DIGESTIVE
        {
          name: "Mezym Forte",
          activeSubstance: "Pancreatină",
          composition: ["Pancreatină 10000 UI"],
          category: MedicineCategory.DIGESTIVE,
          indications: ["insuficiență pancreatică", "dispepsie", "balonare"],
          contraindications: ["pancreatită acută", "hipersensibilitate"],
          sideEffects: ["greață", "diaree", "dureri abdominale"],
          dosage: {
            adults: "1-2 comprimate la masă",
            children: "Conform prescripției medicale",
          },
          form: MedicineForm.TABLET,
          producer: "Berlin-Chemie",
          price: 35.6,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: ["Se ia în timpul mesei", "Nu se mastică"],
          storage: "La temperatura camerei, uscat",
          activeIngredients: [
            { name: "Pancreatină", quantity: "10000", unit: "UI" },
          ],
          therapeuticClass: "Enzime digestive",
          atcCode: "A09AA02",
        },
        {
          name: "Smecta",
          activeSubstance: "Diosmectită",
          composition: ["Diosmectită 3g"],
          category: MedicineCategory.DIGESTIVE,
          indications: ["diaree acută", "diaree cronică", "dureri abdominale"],
          contraindications: ["obstrucție intestinală", "hipersensibilitate"],
          sideEffects: ["constipație", "balonare"],
          dosage: {
            adults: "1 plic de 3 ori pe zi",
            children: "1 plic de 1-2 ori pe zi",
          },
          form: MedicineForm.POWDER,
          producer: "Ipsen",
          price: 28.9,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: ["Se amestecă cu apă", "Se ia între mese"],
          storage: "La temperatura camerei, uscat",
          activeIngredients: [
            { name: "Diosmectită", quantity: "3", unit: "g" },
          ],
          therapeuticClass: "Antidiaroic",
          atcCode: "A07BC05",
        },

        // ANTIBIOTICE (necesită prescripție)
        {
          name: "Augmentin 625mg",
          activeSubstance: "Amoxicilină + Acid clavulanic",
          composition: ["Amoxicilină 500mg", "Acid clavulanic 125mg"],
          category: MedicineCategory.ANTIBIOTIC,
          indications: [
            "infecții respiratorii",
            "infecții urinare",
            "infecții pielii",
          ],
          contraindications: [
            "alergie la penicilină",
            "insuficiență hepatică severă",
          ],
          sideEffects: ["diaree", "greață", "erupții cutanate", "candidoză"],
          dosage: {
            adults: "1 comprimat la 12 ore",
            children: "Conform prescripției medicale",
          },
          form: MedicineForm.TABLET,
          producer: "GlaxoSmithKline",
          price: 45.8,
          prescription: true,
          availability: "available" as const,
          interactions: [],
          warnings: ["Cură completă obligatorie", "Administrare cu mâncare"],
          storage: "La temperatura camerei, uscat",
          activeIngredients: [
            { name: "Amoxicilină", quantity: "500", unit: "mg" },
            { name: "Acid clavulanic", quantity: "125", unit: "mg" },
          ],
          therapeuticClass: "Antibiotic beta-lactamic",
          atcCode: "J01CR02",
        },

        // MEDICAMENTE CARDIOVASCULARE
        {
          name: "Trombex 75mg",
          activeSubstance: "Clopidogrel",
          composition: ["Clopidogrel 75mg"],
          category: MedicineCategory.CARDIOVASCULAR,
          indications: [
            "prevenirea trombozei",
            "sindrom coronarian acut",
            "AVC",
          ],
          contraindications: ["sângerare activă", "hipersensibilitate"],
          sideEffects: ["sângerare", "hematom", "dureri de cap"],
          dosage: {
            adults: "75mg o dată pe zi",
            elderly: "75mg o dată pe zi",
          },
          form: MedicineForm.TABLET,
          producer: "Zentiva",
          price: 32.15,
          prescription: true,
          availability: "available" as const,
          interactions: [],
          warnings: ["Risc de sângerare", "Monitorizare medicală"],
          storage: "La temperatura camerei",
          activeIngredients: [
            { name: "Clopidogrel", quantity: "75", unit: "mg" },
          ],
          therapeuticClass: "Antiagreant plachetar",
          atcCode: "B01AC04",
        },

        // SUPLIMENTE ȘI VITAMINE
        {
          name: "Vitamina C 500mg",
          activeSubstance: "Acid ascorbic",
          composition: ["Acid ascorbic 500mg"],
          category: MedicineCategory.SUPPLEMENT,
          indications: [
            "deficiența de vitamina C",
            "scorbut",
            "întărirea imunității",
          ],
          contraindications: ["litiază renală", "hemocromatoză"],
          sideEffects: ["diaree", "greață", "dureri abdominale la doze mari"],
          dosage: {
            adults: "500mg pe zi",
            children: "100-300mg pe zi",
            elderly: "500mg pe zi",
          },
          form: MedicineForm.TABLET,
          producer: "Biofarm",
          price: 15.2,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: ["Nu depășiți doza recomandată"],
          storage: "La temperatura camerei, ferit de lumină",
          activeIngredients: [
            { name: "Acid ascorbic", quantity: "500", unit: "mg" },
          ],
          therapeuticClass: "Vitamină hidrosolubilă",
          atcCode: "A11GA01",
        },
        {
          name: "Magneziu + Vitamina B6",
          activeSubstance: "Magneziu + Vitamina B6",
          composition: ["Magneziu 300mg", "Vitamina B6 10mg"],
          category: MedicineCategory.SUPPLEMENT,
          indications: [
            "deficiența de magneziu",
            "crampe musculare",
            "stres",
            "oboseală",
          ],
          contraindications: ["insuficiența renală severă"],
          sideEffects: ["diaree", "greață"],
          dosage: {
            adults: "1-2 comprimate pe zi",
            children: "Conform recomandării medicale",
          },
          form: MedicineForm.TABLET,
          producer: "Sanofi",
          price: 24.3,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: ["Se ia cu mâncare"],
          storage: "La temperatura camerei, uscat",
          activeIngredients: [
            { name: "Magneziu", quantity: "300", unit: "mg" },
            { name: "Vitamina B6", quantity: "10", unit: "mg" },
          ],
          therapeuticClass: "Supliment mineral și vitaminic",
          atcCode: "A12AX",
        },
      ];

      for (const medicine of medicines) {
        await medicineService.addMedicine(medicine);
      }

      logger.info(`Initialized ${medicines.length} medicines in database`);
    } catch (error) {
      logger.error("Error initializing medicine database:", error);
      throw error;
    }
  }

  private async initializeDrugInteractionsDatabase(): Promise<void> {
    try {
      logger.info("Initializing drug interactions database...");

      const interactions = [
        {
          substances: ["Warfarină", "Aspirin"],
          severity: "severe",
          description: "Risc crescut de sângerare",
          recommendation:
            "Evitați administrarea simultană sau monitorizați INR frecvent",
          mechanism: "Sinergism anticoagulant",
        },
        {
          substances: ["Paracetamol", "Alcool"],
          severity: "moderate",
          description: "Risc de hepatotoxicitate",
          recommendation:
            "Limitați consumul de alcool sau reduceți doza de paracetamol",
          mechanism: "Competiție pentru aceleași enzime hepatice",
        },
        {
          substances: ["Ibuprofen", "Warfarină"],
          severity: "severe",
          description: "Risc crescut de sângerare gastrointestinală",
          recommendation:
            "Evitați combinația sau folosiți protectoare gastrice",
          mechanism: "Inhibarea agregării plachetare + anticoagulare",
        },
        {
          substances: ["Digoxină", "Amiodaronă"],
          severity: "severe",
          description: "Risc de intoxicație cu digoxină",
          recommendation: "Reduceți doza de digoxină cu 50% și monitorizați",
          mechanism: "Inhibarea clearance-ului renal al digoxinei",
        },
        {
          substances: ["Simvastatină", "Eritromicină"],
          severity: "severe",
          description: "Risc de rabdomioliză",
          recommendation: "Evitați combinația sau întrerupeți statina temporar",
          mechanism: "Inhibarea CYP3A4",
        },
      ];

      for (const interaction of interactions) {
        await addDoc(collection(firestore, "drugInteractions"), {
          ...interaction,
          createdAt: Timestamp.now(),
        });
      }

      logger.info(`Initialized ${interactions.length} drug interactions`);
    } catch (error) {
      logger.error("Error initializing drug interactions:", error);
      throw error;
    }
  }

  private async initializeBasicAIKnowledge(): Promise<void> {
    try {
      logger.info("Initializing basic AI knowledge base...");

      const knowledgeEntries = [
        {
          category: "symptom_medicine_mapping",
          data: {
            "durere de cap": {
              recommendedMedicines: ["Paracetamol", "Ibuprofen", "Aspirin"],
              severity: "mild",
              urgencyLevel: "low",
              additionalAdvice: "Odihnă, hidratare, evitarea stresului",
            },
            febra: {
              recommendedMedicines: ["Paracetamol", "Ibuprofen"],
              severity: "moderate",
              urgencyLevel: "medium",
              additionalAdvice:
                "Hidratare abundentă, odihnă, monitorizarea temperaturii",
            },
            "tuse seaca": {
              recommendedMedicines: ["Dextrometorfan", "Sirop de tuse"],
              severity: "mild",
              urgencyLevel: "low",
              additionalAdvice:
                "Umidificarea aerului, consumul de lichide calde",
            },
            "durere în piept": {
              recommendedMedicines: [],
              severity: "severe",
              urgencyLevel: "emergency",
              additionalAdvice:
                "Consultație medicală urgentă - posibil infarct",
            },
          },
        },
        {
          category: "emergency_symptoms",
          data: {
            symptoms: [
              "durere în piept",
              "dificultăți severe de respirație",
              "durere de cap foarte severă",
              "convulsii",
              "pierdere de cunoștință",
              "sângerare abundentă",
              "febră peste 40°C",
              "durere abdominală severă",
            ],
            action: "Contactați imediat serviciul de urgență 112",
          },
        },
        {
          category: "contraindications_alerts",
          data: {
            aspirin: {
              contraindications: ["copii sub 16 ani", "sindrom Reye"],
              warnings: ["risc de sângerare", "ulcer gastric"],
            },
            ibuprofen: {
              contraindications: [
                "insuficiență renală",
                "insuficiență cardiacă",
              ],
              warnings: ["administrare cu mâncare", "evitarea alcoolului"],
            },
            paracetamol: {
              contraindications: ["insuficiență hepatică severă"],
              warnings: [
                "doza maximă 4g/zi",
                "risc hepatotoxicitate cu alcool",
              ],
            },
          },
        },
        {
          category: "dosage_guidelines",
          data: {
            paracetamol: {
              adults: "500-1000mg la 4-6 ore, max 4g/zi",
              children: "10-15mg/kg la 4-6 ore",
              elderly: "reducere doza cu 25%",
            },
            ibuprofen: {
              adults: "400mg la 6-8 ore, max 1200mg/zi",
              children: "5-10mg/kg la 6-8 ore",
              elderly: "reducere doza cu 50%",
            },
          },
        },
      ];

      for (const entry of knowledgeEntries) {
        await addDoc(collection(firestore, "aiKnowledgeBase"), {
          ...entry,
          createdAt: Timestamp.now(),
          lastUpdated: Timestamp.now(),
          version: "1.0",
        });
      }

      logger.info(
        `Initialized ${knowledgeEntries.length} AI knowledge entries`
      );
    } catch (error) {
      logger.error("Error initializing AI knowledge base:", error);
      throw error;
    }
  }

  async checkDatabaseStatus(): Promise<{
    medicines: number;
    interactions: number;
    knowledgeEntries: number;
  }> {
    try {
      const medicinesSnapshot = await getDocs(
        collection(firestore, "medicines")
      );
      const interactionsSnapshot = await getDocs(
        collection(firestore, "drugInteractions")
      );
      const knowledgeSnapshot = await getDocs(
        collection(firestore, "aiKnowledgeBase")
      );

      return {
        medicines: medicinesSnapshot.size,
        interactions: interactionsSnapshot.size,
        knowledgeEntries: knowledgeSnapshot.size,
      };
    } catch (error) {
      logger.error("Error checking database status:", error);
      return { medicines: 0, interactions: 0, knowledgeEntries: 0 };
    }
  }

  async resetDatabase(): Promise<void> {
    try {
      logger.warn("Resetting all databases - this will delete all data!");

      // Șterge toate medicamentele
      const medicinesSnapshot = await getDocs(
        collection(firestore, "medicines")
      );
      const deletePromises = medicinesSnapshot.docs.map((docSnap) =>
        deleteDoc(docSnap.ref)
      );

      // Șterge toate interacțiunile
      const interactionsSnapshot = await getDocs(
        collection(firestore, "drugInteractions")
      );
      deletePromises.push(
        ...interactionsSnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref))
      );

      // Șterge cunoștințele AI
      const knowledgeSnapshot = await getDocs(
        collection(firestore, "aiKnowledgeBase")
      );
      deletePromises.push(
        ...knowledgeSnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref))
      );

      await Promise.all(deletePromises);

      logger.info("Database reset completed");
    } catch (error) {
      logger.error("Error resetting database:", error);
      throw error;
    }
  }
}

export const databaseInitializationService =
  new DatabaseInitializationService();
