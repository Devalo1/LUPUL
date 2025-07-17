// Interface pentru medicamentele din baza de date
import { Timestamp } from "firebase/firestore";

export interface Medicine {
  id: string;
  name: string;
  activeSubstance: string;
  composition: string[];
  category: MedicineCategory;
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  dosage: {
    adults: string;
    children?: string;
    elderly?: string;
    pregnancy?: string;
  };
  form: MedicineForm;
  producer: string;
  price: number;
  prescription: boolean;
  availability: "available" | "out_of_stock" | "discontinued";
  interactions: DrugInteraction[];
  warnings: string[];
  storage: string;
  expirationDate?: Date;
  barcode?: string;
  activeIngredients: ActiveIngredient[];
  therapeuticClass: string;
  atcCode?: string; // Anatomical Therapeutic Chemical Classification
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ActiveIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface DrugInteraction {
  drugName: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  recommendation: string;
}

export enum MedicineCategory {
  ANALGESIC = "analgesic",
  ANTIBIOTIC = "antibiotic",
  ANTIVIRAL = "antiviral",
  ANTIFUNGAL = "antifungal",
  CARDIOVASCULAR = "cardiovascular",
  RESPIRATORY = "respiratory",
  DIGESTIVE = "digestive",
  NEUROLOGICAL = "neurological",
  DERMATOLOGICAL = "dermatological",
  ENDOCRINE = "endocrine",
  IMMUNOLOGICAL = "immunological",
  ONCOLOGICAL = "oncological",
  OPHTHALMOLOGICAL = "ophthalmological",
  PSYCHIATRIC = "psychiatric",
  SUPPLEMENT = "supplement",
  CONTRACEPTIVE = "contraceptive",
  VACCINE = "vaccine",
}

export enum MedicineForm {
  TABLET = "tablet",
  CAPSULE = "capsule",
  SYRUP = "syrup",
  INJECTION = "injection",
  CREAM = "cream",
  OINTMENT = "ointment",
  DROPS = "drops",
  SPRAY = "spray",
  PATCH = "patch",
  SUPPOSITORY = "suppository",
  POWDER = "powder",
  SOLUTION = "solution",
}

// Interface pentru profilul medical al utilizatorului
export interface UserMedicalProfile {
  userId: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: UserMedication[];
  medicalHistory: MedicalHistoryEntry[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  bloodType?: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: "male" | "female" | "other";
  pregnancyStatus?: boolean;
  breastfeeding?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserMedication {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string;
  notes?: string;
  active: boolean;
}

export interface MedicalHistoryEntry {
  date: Date;
  condition: string;
  treatment: string;
  doctor?: string;
  notes?: string;
}

// Interface pentru consultări medicale
export interface MedicalConsultation {
  id: string;
  userId: string;
  symptoms: string[];
  questions: ConsultationQuestion[];
  aiRecommendations: AIRecommendation[];
  riskLevel: "low" | "medium" | "high" | "emergency";
  urgency:
    | "not_urgent"
    | "schedule_appointment"
    | "seek_immediate_care"
    | "emergency";
  followUpNeeded: boolean;
  createdAt: Timestamp;
  status: "active" | "resolved" | "escalated";
}

export interface ConsultationQuestion {
  question: string;
  answer: string;
  importance: "low" | "medium" | "high";
}

export interface AIRecommendation {
  type:
    | "medication"
    | "lifestyle"
    | "doctor_visit"
    | "emergency"
    | "information";
  title: string;
  description: string;
  confidence: number; // 0-100
  sources: string[];
  warnings?: string[];
}
