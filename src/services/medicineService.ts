import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import {
  Medicine,
  UserMedicalProfile,
  MedicalConsultation,
  DrugInteraction,
  MedicineCategory,
  MedicineForm,
} from "../models/Medicine";
import logger from "../utils/logger";

const COLLECTIONS = {
  MEDICINES: "medicines",
  USER_MEDICAL_PROFILES: "userMedicalProfiles",
  MEDICAL_CONSULTATIONS: "medicalConsultations",
  DRUG_INTERACTIONS: "drugInteractions",
};

export class MedicineService {
  // ===== MEDICINE CRUD OPERATIONS =====

  async addMedicine(
    medicine: Omit<Medicine, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const medicineData = {
        ...medicine,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(firestore, COLLECTIONS.MEDICINES),
        medicineData
      );
      logger.info(`Medicine added successfully: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      logger.error("Error adding medicine:", error);
      throw error;
    }
  }

  async getMedicine(id: string): Promise<Medicine | null> {
    try {
      const docRef = doc(firestore, COLLECTIONS.MEDICINES, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Medicine;
      }
      return null;
    } catch (error) {
      logger.error("Error getting medicine:", error);
      throw error;
    }
  }

  async getAllMedicines(): Promise<Medicine[]> {
    try {
      const querySnapshot = await getDocs(
        collection(firestore, COLLECTIONS.MEDICINES)
      );
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Medicine
      );
    } catch (error) {
      logger.error("Error getting all medicines:", error);
      throw error;
    }
  }

  async searchMedicines(searchTerm: string): Promise<Medicine[]> {
    try {
      const q = query(
        collection(firestore, COLLECTIONS.MEDICINES),
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff"),
        orderBy("name"),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Medicine
      );
    } catch (error) {
      logger.error("Error searching medicines:", error);
      throw error;
    }
  }

  async searchByActiveSubstance(activeSubstance: string): Promise<Medicine[]> {
    try {
      const q = query(
        collection(firestore, COLLECTIONS.MEDICINES),
        where("activeSubstance", "==", activeSubstance)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Medicine
      );
    } catch (error) {
      logger.error("Error searching by active substance:", error);
      throw error;
    }
  }

  async getMedicinesByCategory(
    category: MedicineCategory
  ): Promise<Medicine[]> {
    try {
      const q = query(
        collection(firestore, COLLECTIONS.MEDICINES),
        where("category", "==", category),
        orderBy("name")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Medicine
      );
    } catch (error) {
      logger.error("Error getting medicines by category:", error);
      throw error;
    }
  }

  // ===== USER MEDICAL PROFILE OPERATIONS =====

  async createUserMedicalProfile(
    profile: Omit<UserMedicalProfile, "createdAt" | "updatedAt">
  ): Promise<void> {
    try {
      const profileData = {
        ...profile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(
        collection(firestore, COLLECTIONS.USER_MEDICAL_PROFILES),
        profileData
      );
      logger.info(`Medical profile created for user: ${profile.userId}`);
    } catch (error) {
      logger.error("Error creating medical profile:", error);
      throw error;
    }
  }

  async getUserMedicalProfile(
    userId: string
  ): Promise<UserMedicalProfile | null> {
    try {
      const q = query(
        collection(firestore, COLLECTIONS.USER_MEDICAL_PROFILES),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { ...doc.data() } as UserMedicalProfile;
      }
      return null;
    } catch (error) {
      logger.error("Error getting user medical profile:", error);
      throw error;
    }
  }

  async updateUserMedicalProfile(
    userId: string,
    updates: Partial<UserMedicalProfile>
  ): Promise<void> {
    try {
      const q = query(
        collection(firestore, COLLECTIONS.USER_MEDICAL_PROFILES),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        });
        logger.info(`Medical profile updated for user: ${userId}`);
      }
    } catch (error) {
      logger.error("Error updating medical profile:", error);
      throw error;
    }
  }

  // ===== DRUG INTERACTION CHECKS =====

  async checkDrugInteractions(
    medicineIds: string[]
  ): Promise<DrugInteraction[]> {
    try {
      const interactions: DrugInteraction[] = [];

      // Get all medicines
      const medicines = await Promise.all(
        medicineIds.map((id) => this.getMedicine(id))
      );

      // Check interactions between each pair
      for (let i = 0; i < medicines.length; i++) {
        for (let j = i + 1; j < medicines.length; j++) {
          const med1 = medicines[i];
          const med2 = medicines[j];

          if (med1 && med2) {
            // Check if there are known interactions
            const interaction = await this.findInteraction(
              med1.activeSubstance,
              med2.activeSubstance
            );
            if (interaction) {
              interactions.push(interaction);
            }
          }
        }
      }

      return interactions;
    } catch (error) {
      logger.error("Error checking drug interactions:", error);
      throw error;
    }
  }

  private async findInteraction(
    substance1: string,
    substance2: string
  ): Promise<DrugInteraction | null> {
    try {
      const q = query(
        collection(firestore, COLLECTIONS.DRUG_INTERACTIONS),
        where("substances", "array-contains-any", [substance1, substance2])
      );

      const querySnapshot = await getDocs(q);

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        if (
          data.substances.includes(substance1) &&
          data.substances.includes(substance2)
        ) {
          return data as DrugInteraction;
        }
      }

      return null;
    } catch (error) {
      logger.error("Error finding interaction:", error);
      return null;
    }
  }

  // ===== MEDICAL CONSULTATION OPERATIONS =====

  async createMedicalConsultation(
    consultation: Omit<MedicalConsultation, "id" | "createdAt">
  ): Promise<string> {
    try {
      const consultationData = {
        ...consultation,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(firestore, COLLECTIONS.MEDICAL_CONSULTATIONS),
        consultationData
      );
      logger.info(`Medical consultation created: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      logger.error("Error creating medical consultation:", error);
      throw error;
    }
  }

  async getUserConsultations(userId: string): Promise<MedicalConsultation[]> {
    try {
      const q = query(
        collection(firestore, COLLECTIONS.MEDICAL_CONSULTATIONS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as MedicalConsultation
      );
    } catch (error) {
      logger.error("Error getting user consultations:", error);
      throw error;
    }
  }

  // ===== AI RECOMMENDATION SYSTEM =====

  async generateMedicineRecommendations(
    symptoms: string[],
    userProfile: UserMedicalProfile
  ): Promise<Medicine[]> {
    try {
      // Basic symptom-to-medicine mapping
      const symptomMedicineMap: Record<string, MedicineCategory[]> = {
        "durere de cap": [MedicineCategory.ANALGESIC],
        febra: [MedicineCategory.ANALGESIC],
        tuse: [MedicineCategory.RESPIRATORY],
        "durere de gat": [MedicineCategory.RESPIRATORY],
        "durere de stomac": [MedicineCategory.DIGESTIVE],
        diaree: [MedicineCategory.DIGESTIVE],
        constipatie: [MedicineCategory.DIGESTIVE],
        insomnie: [MedicineCategory.NEUROLOGICAL],
        anxietate: [MedicineCategory.PSYCHIATRIC],
        depresie: [MedicineCategory.PSYCHIATRIC],
      };

      const relevantCategories = new Set<MedicineCategory>();

      symptoms.forEach((symptom) => {
        const categories = symptomMedicineMap[symptom.toLowerCase()];
        if (categories) {
          categories.forEach((cat) => relevantCategories.add(cat));
        }
      });

      // Get medicines from relevant categories
      const recommendations: Medicine[] = [];

      for (const category of relevantCategories) {
        const medicines = await this.getMedicinesByCategory(category);

        // Filter based on user profile
        const filteredMedicines = medicines.filter((medicine) => {
          // Check allergies
          if (
            userProfile.allergies.some(
              (allergy) =>
                medicine.activeSubstance
                  .toLowerCase()
                  .includes(allergy.toLowerCase()) ||
                medicine.composition.some((comp) =>
                  comp.toLowerCase().includes(allergy.toLowerCase())
                )
            )
          ) {
            return false;
          }

          // Check contraindications
          if (
            medicine.contraindications.some((contraindication) =>
              userProfile.chronicConditions.some((condition) =>
                contraindication.toLowerCase().includes(condition.toLowerCase())
              )
            )
          ) {
            return false;
          }

          return true;
        });

        recommendations.push(...filteredMedicines.slice(0, 3)); // Limit to 3 per category
      }

      return recommendations;
    } catch (error) {
      logger.error("Error generating medicine recommendations:", error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  async initializeBasicMedicines(): Promise<void> {
    try {
      const basicMedicines = [
        {
          name: "Paracetamol 500mg",
          activeSubstance: "Paracetamol",
          composition: ["Paracetamol 500mg"],
          category: MedicineCategory.ANALGESIC,
          indications: ["durere de cap", "febra", "dureri musculare"],
          contraindications: ["insuficienta hepatica severa"],
          sideEffects: ["greata", "voma", "reactii alergice"],
          dosage: {
            adults: "500-1000mg la 4-6 ore, max 4g/zi",
            children: "10-15mg/kg la 4-6 ore",
            elderly: "500mg la 4-6 ore",
          },
          form: MedicineForm.TABLET,
          producer: "Farmacia Tei",
          price: 8.5,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: ["Nu depasiti doza maxima zilnica"],
          storage: "La temperatura camerei, ferit de umiditate",
          activeIngredients: [
            { name: "Paracetamol", quantity: "500", unit: "mg" },
          ],
          therapeuticClass: "Analgezic non-opioid",
        },
        {
          name: "Ibuprofen 400mg",
          activeSubstance: "Ibuprofen",
          composition: ["Ibuprofen 400mg"],
          category: MedicineCategory.ANALGESIC,
          indications: ["durere", "inflamatie", "febra"],
          contraindications: [
            "ulcer gastric activ",
            "insuficienta renala severa",
          ],
          sideEffects: ["dureri de stomac", "greata", "ameteala"],
          dosage: {
            adults: "400mg la 6-8 ore, max 1200mg/zi",
            children: "5-10mg/kg la 6-8 ore",
            elderly: "Reducere doza cu 50%",
          },
          form: MedicineForm.TABLET,
          producer: "Gedeon Richter",
          price: 12.3,
          prescription: false,
          availability: "available" as const,
          interactions: [],
          warnings: ["Administrare cu mancare", "Evitati alcoolul"],
          storage: "La temperatura camerei",
          activeIngredients: [
            { name: "Ibuprofen", quantity: "400", unit: "mg" },
          ],
          therapeuticClass: "AINS - Antiinflamator nesteroidian",
        },
        {
          name: "Tusisedal Sirop",
          activeSubstance: "Dextrometorfan",
          composition: ["Dextrometorfan 15mg/5ml"],
          category: MedicineCategory.RESPIRATORY,
          indications: ["tuse seaca", "tuse iritativa"],
          contraindications: ["copii sub 2 ani", "depresie respiratorie"],
          sideEffects: ["somnolenta", "ameteala", "constipatie"],
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
          warnings: ["Nu administrati copiilor sub 2 ani"],
          storage:
            "La temperatura camerei, dupa deschidere se consuma in 6 luni",
          activeIngredients: [
            { name: "Dextrometorfan", quantity: "15", unit: "mg/5ml" },
          ],
          therapeuticClass: "Antitusiv",
        },
      ];

      for (const medicine of basicMedicines) {
        await this.addMedicine(medicine);
      }

      logger.info("Basic medicines initialized successfully");
    } catch (error) {
      logger.error("Error initializing basic medicines:", error);
      throw error;
    }
  }
}

export const medicineService = new MedicineService();
