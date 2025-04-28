import { Timestamp as _Timestamp } from "firebase/firestore";

// Define the types of specialization categories
export interface SpecializationCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

// Interface for default service
export interface DefaultService {
  name: string;
  description: string;
  duration: number;
  price: number;
}

// Define the four main categories of specialization
export const specializationCategories: SpecializationCategory[] = [
  {
    id: "terapie",
    name: "Terapie",
    description: "Servicii de terapie psihologică și suport emoțional",
    icon: "therapy"
  },
  {
    id: "consultare",
    name: "Consultare",
    description: "Servicii de consultare și evaluare psihologică",
    icon: "consultation"
  },
  {
    id: "educatie",
    name: "Educație",
    description: "Servicii educaționale și de dezvoltare personală",
    icon: "education"
  },
  {
    id: "sport",
    name: "Sport",
    description: "Servicii de antrenament și psihologie sportivă",
    icon: "sports"
  }
];

// Export with uppercase name for backward compatibility
export const SpecializationCategories = specializationCategories;

// Get default services for each specialization category
export const getDefaultServicesForSpecialization = (specialization: string): DefaultService[] => {
  const defaultServices: Record<string, DefaultService[]> = {
    "Terapie": [
      {
        name: "Ședință de terapie individuală",
        description: "Sesiune de terapie individuală pentru abordarea problemelor emoționale, comportamentale sau cognitive.",
        duration: 60,
        price: 150
      },
      {
        name: "Terapie de cuplu",
        description: "Terapie pentru cupluri care doresc să îmbunătățească relația sau să rezolve conflicte.",
        duration: 90,
        price: 220
      },
      {
        name: "Terapie de familie",
        description: "Terapie pentru familii care doresc să îmbunătățească comunicarea și să rezolve conflicte.",
        duration: 90,
        price: 240
      }
    ],
    "Consultare": [
      {
        name: "Evaluare psihologică",
        description: "Evaluare completă pentru diagnosticarea problemelor psihologice și stabilirea unui plan de tratament.",
        duration: 90,
        price: 200
      },
      {
        name: "Consultație inițială",
        description: "Consultație pentru evaluarea nevoilor și stabilirea unui plan de intervenție.",
        duration: 60,
        price: 150
      },
      {
        name: "Consultație de control",
        description: "Reevaluare a evoluției și ajustarea planului de tratament.",
        duration: 30,
        price: 100
      }
    ],
    "Educație": [
      {
        name: "Workshop dezvoltare personală",
        description: "Atelier practic pe teme de dezvoltare personală (încredere, comunicare, etc).",
        duration: 120,
        price: 200
      },
      {
        name: "Coaching educațional",
        description: "Sesiune de coaching pentru dezvoltarea abilităților de învățare și performanță academică.",
        duration: 60,
        price: 150
      },
      {
        name: "Consiliere parentală",
        description: "Consiliere pentru părinți în vederea dezvoltării abilităților parentale și rezolvării problemelor specifice.",
        duration: 60,
        price: 150
      }
    ],
    "Sport": [
      {
        name: "Coaching performanță sportivă",
        description: "Coaching pentru sportivi care doresc să-și îmbunătățească performanța și rezistența mentală.",
        duration: 60,
        price: 180
      },
      {
        name: "Program mindfulness pentru sportivi",
        description: "Program specializat de mindfulness pentru gestionarea stresului și concentrare în sport.",
        duration: 60,
        price: 150
      },
      {
        name: "Evaluare psihologică pentru sportivi",
        description: "Evaluare specializată pentru sportivi, cu focus pe performanță și reziliență.",
        duration: 90,
        price: 200
      }
    ]
  };
  
  return defaultServices[specialization] || [
    {
      name: "Consultație standard",
      description: "Consultație individuală standard",
      duration: 60,
      price: 150
    }
  ];
};

// Map service types to specializations
export const mapServiceToSpecialization = (serviceType: string): string => {
  const mapping: Record<string, string> = {
    "Psihoterapie individuală": "Terapie",
    "Terapie de cuplu": "Terapie",
    "Terapie de familie": "Terapie",
    "Terapie cognitivă": "Terapie",
    "Psihanaliză": "Terapie",
    "Terapie comportamentală": "Terapie",
    
    "Consultație psihologică": "Consultare",
    "Evaluare psihologică": "Consultare",
    "Consultație psihiatrică": "Consultare",
    "Consiliere psihologică": "Consultare",
    
    "Workshop": "Educație",
    "Coaching": "Educație",
    "Dezvoltare personală": "Educație",
    "Consiliere parentală": "Educație",
    "Mindfulness": "Educație",
    
    "Coaching sportiv": "Sport",
    "Psihologie sportivă": "Sport",
    "Antrenament mental": "Sport",
    "Performanță sportivă": "Sport"
  };
  
  return mapping[serviceType] || "Consultare";
};

// Get abbreviated code for a specialization category
export const getSpecializationCode = (specialization: string): string => {
  const mapping: Record<string, string> = {
    "Terapie": "TER",
    "Consultare": "CON",
    "Educație": "EDU",
    "Sport": "SPT"
  };
  
  return mapping[specialization] || "GEN";
};

// Get full name for a specialization code
export const getSpecializationFullName = (code: string): string => {
  const mapping: Record<string, string> = {
    "TER": "Terapie",
    "CON": "Consultare",
    "EDU": "Educație",
    "SPT": "Sport",
    "GEN": "General"
  };
  
  return mapping[code] || "General";
};