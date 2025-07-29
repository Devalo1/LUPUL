// Platform Mentor System - AI care cunoaște întreaga platformă și ghidează utilizatorii
// Sistem complet de ghidare pentru toate funcționalitățile platformei

export interface PlatformKnowledge {
  features: PlatformFeature[];
  services: ServiceCategory[];
  specialists: SpecialistInfo[];
  userJourney: UserJourneyStep[];
  resources: PlatformResource[];
}

export interface PlatformFeature {
  id: string;
  name: string;
  category:
    | "therapy"
    | "wellness"
    | "community"
    | "ai"
    | "admin"
    | "learning"
    | "business";
  description: string;
  userType: "all" | "user" | "specialist" | "admin";
  route: string;
  benefits: string[];
  howToAccess: string;
  tips: string[];
}

export interface ServiceCategory {
  name: string;
  description: string;
  services: ServiceDetail[];
  specialists: string[];
  benefits: string[];
}

export interface ServiceDetail {
  name: string;
  description: string;
  duration: number;
  priceRange: string;
  whoIsFor: string;
  benefits: string[];
}

export interface SpecialistInfo {
  category: string;
  description: string;
  services: string[];
  whenToConsult: string[];
  expectations: string[];
}

export interface UserJourneyStep {
  step: number;
  title: string;
  description: string;
  actions: string[];
  nextSteps: string[];
}

export interface PlatformResource {
  type: "guide" | "tutorial" | "faq" | "tips";
  category: string;
  title: string;
  content: string;
  relatedFeatures: string[];
}

// Baza de cunoștințe completă a platformei
export const PLATFORM_KNOWLEDGE: PlatformKnowledge = {
  features: [
    // AI & Therapy Features
    {
      id: "ai_messenger",
      name: "AI Messenger",
      category: "ai",
      description:
        "Chat intelligent cu AI personalizat care îți oferă suport 24/7",
      userType: "all",
      route: "/ai-messenger",
      benefits: [
        "Suport emoțional instant",
        "Sfaturi personalizate",
        "Disponibilitate 24/7",
        "Memorie activă - AI-ul își amintește conversațiile anterioare",
        "Adaptare la personalitatea ta",
      ],
      howToAccess:
        "Click pe butonul AI din colțul din dreapta-jos sau mergi la /ai-messenger",
      tips: [
        "Fii deschis și sincer cu AI-ul pentru sfaturi mai bune",
        "Folosește setările AI pentru a personaliza experiența",
        "AI-ul învață din conversațiile tale - cu cât îl folosești mai mult, cu atât devine mai util",
      ],
    },
    {
      id: "ai_therapy_psychic",
      name: "Terapie Psihică AI",
      category: "therapy",
      description:
        "Consiliere psihologică cu AI specializat în sănătatea mentală",
      userType: "all",
      route: "/terapie/psihica",
      benefits: [
        "Gestionarea stresului și anxietății",
        "Suport pentru depresie",
        "Dezvoltare personală",
        "Tehnici de mindfulness",
        "Consiliere emoțională",
      ],
      howToAccess: "Mergi la Servicii > Terapie > Terapie Psihică",
      tips: [
        "Descrie-ți starea emoțională în detaliu",
        "Întreabă despre tehnici specifice de coping",
        "Cere exerciții practice pe care le poți face acasă",
      ],
    },
    {
      id: "ai_therapy_physical",
      name: "Terapie Fizică AI",
      category: "therapy",
      description: "Ghidare pentru sănătatea corporală și wellness fizic",
      userType: "all",
      route: "/terapie/fizica",
      benefits: [
        "Programe de exerciții personalizate",
        "Sfaturi pentru somn mai bun",
        "Tehnici de respirație",
        "Recuperare după accidentări",
        "Menținerea unei posturi corecte",
      ],
      howToAccess: "Mergi la Servicii > Terapie > Terapie Fizică",
      tips: [
        "Descrie stilul tău de viață și activitatea fizică",
        "Menționează orice dureri sau probleme fizice",
        "Cere rutine zilnice adaptate programului tău",
      ],
    },
    {
      id: "ai_settings",
      name: "Setări AI",
      category: "ai",
      description: "Personalizează AI-ul după preferințele tale",
      userType: "all",
      route: "/dashboard/AIsettings",
      benefits: [
        "AI personalizat cu numele tău preferat",
        "Adaptare la vârsta și genul tău",
        "Stil de conversație preferat",
        "Nivel de formalitate dorit",
        "Obiective specifice pentru AI",
      ],
      howToAccess: "Dashboard > Setări AI sau click pe Settings în AI Widget",
      tips: [
        "Completează toate câmpurile pentru o experiență optimă",
        "Testează diferite stiluri de conversație",
        "Actualizează setările pe măsură ce preferințele se schimbă",
      ],
    },

    // Community & Wellness Features
    {
      id: "emblems_system",
      name: "Sistem de Embleme NFT",
      category: "community",
      description:
        "Embleme digitale care îți oferă acces la beneficii exclusive",
      userType: "all",
      route: "/emblems/mint",
      benefits: [
        "Acces la evenimente exclusive",
        "Prioritate la servicii",
        "Comunitate selectă",
        "Badge-uri speciale",
        "Reduceri la servicii premium",
      ],
      howToAccess: "Navbar > Embleme sau /emblems/mint",
      tips: [
        "Alege emblema care se potrivește cel mai bine personalității tale",
        "Emblemele superioare oferă mai multe beneficii",
        "Participă la evenimente pentru a îți crește rangul în comunitate",
      ],
    },
    {
      id: "emblem_dashboard",
      name: "Dashboard Embleme",
      category: "community",
      description: "Vedere de ansamblu asupra emblemei tale și progresului",
      userType: "all",
      route: "/emblems/dashboard",
      benefits: [
        "Tracked progress către următorul nivel",
        "Statistici personale",
        "Evenimente viitoare",
        "Beneficiile tale active",
        "Rangul în comunitate",
      ],
      howToAccess: "Doar dacă deții o emblemă - accesează /emblems/dashboard",
      tips: [
        "Verifică progresul regulat pentru motivație",
        "Înregistrează-te la evenimente pentru mai mult engagement",
        "Marketplace-ul te ajută să tranzacționezi embleme rare",
      ],
    },
    {
      id: "marketplace",
      name: "Marketplace Embleme",
      category: "community",
      description: "Tranzacționează embleme cu alți membri ai comunității",
      userType: "all",
      route: "/emblems/marketplace",
      benefits: [
        "Cumpără embleme rare",
        "Vinde emblemele tale",
        "Investiție în colecția ta",
        "Acces la embleme speciale",
        "Trading cu comunitatea",
      ],
      howToAccess: "Navbar > Marketplace sau /emblems/marketplace",
      tips: [
        "Emblemele rare au mai multă valoare",
        "Verifică istoricul unei embleme înainte să cumperi",
        "Participarea la evenimente crește valoarea emblemei tale",
      ],
    },

    // Professional Services
    {
      id: "specialist_appointments",
      name: "Programări cu Specialiști",
      category: "therapy",
      description: "Programează sesiuni cu terapeuți și consilieri reali",
      userType: "all",
      route: "/appointments/specialist",
      benefits: [
        "Consiliere profesională personalizată",
        "Terapie individuală sau de cuplu",
        "Diverse specializări disponibile",
        "Flexibilitate în programare",
        "Follow-up continuu",
      ],
      howToAccess:
        "Dashboard > Programări sau Servicii > Programează o sesiune",
      tips: [
        "Alege specialistul care se potrivește nevoilor tale",
        "Pregătește întrebările înainte de sesiune",
        "Fii constant cu sesiunile pentru rezultate optime",
      ],
    },
    {
      id: "specialist_panel",
      name: "Panou Specialist",
      category: "business",
      description:
        "Pentru specialiști - gestionează programările și serviciile",
      userType: "specialist",
      route: "/specialist-panel",
      benefits: [
        "Gestionarea programărilor",
        "Crearea de servicii personalizate",
        "Comunicare cu clienții",
        "Statistici și analytics",
        "Gestionarea disponibilității",
      ],
      howToAccess: "Doar pentru specialiști autorizați - /specialist-panel",
      tips: [
        "Ține-ți calendarul actualizat",
        "Creează servicii clare și detaliate",
        "Răspunde prompt la întrebările clienților",
      ],
    },

    // Learning & Development
    {
      id: "articles_blog",
      name: "Articole și Blog",
      category: "learning",
      description: "Conținut educativ despre wellness și dezvoltare personală",
      userType: "all",
      route: "/articole",
      benefits: [
        "Cunoștințe despre sănătatea mentală",
        "Sfaturi practice pentru zi cu zi",
        "Ultimele cercetări în psihologie",
        "Ghiduri pas cu pas",
        "Inspirație și motivație",
      ],
      howToAccess: "Navbar > Articole sau /articole",
      tips: [
        "Citește regulat pentru dezvoltare continuă",
        "Aplică sfaturile în viața de zi cu zi",
        "Împărtășește articolele utile cu prietenii",
      ],
    },
    {
      id: "events_calendar",
      name: "Calendar Evenimente",
      category: "community",
      description: "Evenimente comunitare și workshop-uri exclusive",
      userType: "all",
      route: "/events",
      benefits: [
        "Workshop-uri cu experți",
        "Grupuri de suport",
        "Networking cu comunitatea",
        "Învățare colaborativă",
        "Experiențe noi și diverse",
      ],
      howToAccess: "Dashboard > Evenimente sau navbar > Evenimente",
      tips: [
        "Înregistrează-te din timp pentru locurile limitate",
        "Pregătește întrebări pentru speakeri",
        "Conectează-te cu alți participanți",
      ],
    },

    // User Management
    {
      id: "user_profile",
      name: "Profilul Utilizatorului",
      category: "wellness",
      description: "Gestionează informațiile personale și preferințele",
      userType: "all",
      route: "/profile",
      benefits: [
        "Personalizarea experienței",
        "Tracking al progresului",
        "Setări de confidențialitate",
        "Istoric activități",
        "Sincronizarea datelor",
      ],
      howToAccess: "Dashboard > Profil sau /profile",
      tips: [
        "Completează toate informațiile pentru o experiență optimă",
        "Revizuiește setările de confidențialitate regulat",
        "Actualizează obiectivele pe măsură ce progresezi",
      ],
    },
    {
      id: "dashboard_overview",
      name: "Dashboard Principal",
      category: "wellness",
      description: "Privire de ansamblu asupra activității și progresului tău",
      userType: "all",
      route: "/dashboard",
      benefits: [
        "Rezumat al activității recente",
        "Programări viitoare",
        "Progres în obiective",
        "Acțiuni rapide",
        "Notificări importante",
      ],
      howToAccess: "Link principal după autentificare sau navbar > Dashboard",
      tips: [
        "Verifică dashboard-ul zilnic pentru o rutină sănătoasă",
        "Folosește acțiunile rapide pentru eficiență",
        "Monitorizează progresul pentru motivație",
      ],
    },
  ],

  services: [
    {
      name: "Terapie Psihologică",
      description: "Servicii complete de suport pentru sănătatea mentală",
      services: [
        {
          name: "Ședință de terapie individuală",
          description:
            "Sesiune personalizată pentru abordarea problemelor emoționale și psihologice",
          duration: 60,
          priceRange: "150-200 RON",
          whoIsFor:
            "Persoane cu anxietate, depresie, stres, probleme emoționale",
          benefits: [
            "Suport emoțional profesional",
            "Strategii de coping",
            "Dezvoltare personală",
            "Rezolvarea traumelor",
          ],
        },
        {
          name: "Terapie de cuplu",
          description:
            "Consiliere pentru cupluri cu probleme de comunicare sau relație",
          duration: 90,
          priceRange: "220-300 RON",
          whoIsFor:
            "Cupluri cu conflicte, probleme de comunicare sau criză în relație",
          benefits: [
            "Îmbunătățirea comunicării",
            "Rezolvarea conflictelor",
            "Consolidarea relației",
            "Planuri de viitor comune",
          ],
        },
      ],
      specialists: [
        "Psihologi clinici",
        "Psihoterapeuți",
        "Consilieri de cuplu",
      ],
      benefits: [
        "Sănătate mentală îmbunătățită",
        "Gestionarea mai bună a stresului",
        "Relații mai sănătoase",
      ],
    },
    {
      name: "Consultanță și Evaluare",
      description: "Servicii profesionale de evaluare și consultanță",
      services: [
        {
          name: "Evaluare psihologică completă",
          description:
            "Evaluare detaliată pentru diagnosticare și planificarea tratamentului",
          duration: 90,
          priceRange: "200-250 RON",
          whoIsFor:
            "Persoane care au nevoie de diagnostic clar sau evaluare pentru tratament",
          benefits: [
            "Diagnostic precis",
            "Plan de tratament personalizat",
            "Înțelegerea problemelor",
            "Obiective clare",
          ],
        },
        {
          name: "Consultație inițială",
          description:
            "Prima întâlnire pentru evaluarea nevoilor și planificarea",
          duration: 60,
          priceRange: "120-150 RON",
          whoIsFor: "Oricine dorește să înceapă un parcurs terapeutic",
          benefits: [
            "Orientare profesională",
            "Plan de acțiune",
            "Clarificarea așteptărilor",
            "Matching cu terapeutul potrivit",
          ],
        },
      ],
      specialists: [
        "Psihologi clinici",
        "Consilieri",
        "Specialiști în evaluare",
      ],
      benefits: [
        "Claritate asupra problemelor",
        "Plan de acțiune concret",
        "Orientare profesională",
      ],
    },
    {
      name: "Educație și Dezvoltare",
      description: "Programe educaționale și de dezvoltare personală",
      services: [
        {
          name: "Workshop dezvoltare personală",
          description:
            "Ateliere practice pe teme de încredere în sine, comunicare, leadership",
          duration: 120,
          priceRange: "180-250 RON",
          whoIsFor:
            "Persoane care vor să își dezvolte abilitățile personale și sociale",
          benefits: [
            "Abilități noi",
            "Încredere în sine",
            "Networking",
            "Experiențe practice",
          ],
        },
        {
          name: "Coaching educațional",
          description:
            "Suport pentru îmbunătățirea performanțelor academice și de învățare",
          duration: 60,
          priceRange: "120-180 RON",
          whoIsFor: "Studenți, elevi, oricine dorește să învețe mai eficient",
          benefits: [
            "Tehnici de învățare",
            "Organizarea timpului",
            "Motivație crescută",
            "Performanțe îmbunătățite",
          ],
        },
      ],
      specialists: [
        "Coaching educațional",
        "Traineri dezvoltare personală",
        "Mentori",
      ],
      benefits: [
        "Competențe noi",
        "Performanțe îmbunătățite",
        "Dezvoltare continuă",
      ],
    },
    {
      name: "Wellness și Sport",
      description: "Servicii pentru sănătatea fizică și mentală prin sport",
      services: [
        {
          name: "Coaching performanță sportivă",
          description:
            "Suport psihologic pentru sportivi în vederea îmbunătățirii performanțelor",
          duration: 60,
          priceRange: "150-200 RON",
          whoIsFor: "Sportivi de performanță, amatori pasionați de sport",
          benefits: [
            "Performanțe sportive îmbunătățite",
            "Gestionarea presiunii",
            "Motivație",
            "Mindset de campion",
          ],
        },
        {
          name: "Program mindfulness pentru sportivi",
          description: "Tehnici de mindfulness adaptate pentru sportivi",
          duration: 60,
          priceRange: "120-150 RON",
          whoIsFor:
            "Sportivi care vor să îmbunătățească concentrarea și gestionarea stresului",
          benefits: [
            "Concentrare îmbunătățită",
            "Gestionarea anxietății de performanță",
            "Recuperare mentală",
            "Flow state",
          ],
        },
      ],
      specialists: [
        "Psihologi sportivi",
        "Instructori mindfulness",
        "Coaching de performanță",
      ],
      benefits: [
        "Performanțe fizice îmbunătățite",
        "Sănătate mentală prin sport",
        "Echilibru corp-minte",
      ],
    },
  ],

  specialists: [
    {
      category: "Psiholog Clinician",
      description:
        "Specialist în diagnosticarea și tratarea tulburărilor psihologice",
      services: [
        "Terapie individuală",
        "Evaluare psihologică",
        "Tratament tulburări de anxietate",
        "Terapie pentru depresie",
      ],
      whenToConsult: [
        "Simți anxietate persistentă sau atacuri de panică",
        "Ai simptome de depresie (tristețe, lipsa energiei, scăderea interesului)",
        "Traversezi o perioadă dificilă (divorț, pierderea unei persoane, schimbări majore)",
        "Ai probleme cu somnul, concentrarea sau memoria",
        "Vrei să lucrezi asupra dezvoltării personale într-un cadru profesional",
      ],
      expectations: [
        "Prima ședință va fi o evaluare pentru înțelegerea problemelor tale",
        "Vei primi strategii concrete și exerciții de aplicat acasă",
        "Progresul se vede de obicei după 4-6 ședințe",
        "Confidențialitatea este garantată 100%",
        "Vei avea acces la suport între ședințe dacă este nevoie",
      ],
    },
    {
      category: "Terapeut de Cuplu",
      description: "Specialist în terapia relațiilor și comunicarea în cuplu",
      services: [
        "Terapie de cuplu",
        "Consiliere maritală",
        "Medierea conflictelor",
        "Pregătirea pentru căsătorie",
      ],
      whenToConsult: [
        "Aveți conflicte frecvente sau intense",
        "Comunicarea s-a deteriorat sau ați încetat să mai comunicați",
        "Există probleme de încredere sau gelozie",
        "Viața intimă este afectată",
        "Nu reușiți să luați decizii importante împreună",
        "Considerați divorțul dar vreți să mai încercați",
      ],
      expectations: [
        "Ambii parteneri trebuie să fie deschisi la schimbare",
        "Terapia se concentrează pe pattern-urile de comunicare",
        "Veți primi exerciții de făcut acasă împreună",
        "Progresul poate fi lent în primele ședințe - este normal",
        "Obiectivul este să învățați să colaborați, nu să aveți dreptate",
      ],
    },
    {
      category: "Coach Dezvoltare Personală",
      description:
        "Specialist în susținerea dezvoltării personale și profesionale",
      services: [
        "Coaching personal",
        "Coaching de carieră",
        "Dezvoltarea încrederii în sine",
        "Goal setting și planning",
      ],
      whenToConsult: [
        "Vrei să faci o schimbare majoră în viață dar nu știi de unde să începi",
        "Ai obiective clare dar nu reușești să le atingi",
        "Îți lipsește motivația sau disciplina",
        "Vrei să îți dezvolți abilitățile de leadership",
        "Ești la o răscruce în carieră și ai nevoie de claritate",
      ],
      expectations: [
        "Coaching-ul este orientat către viitor și soluții",
        "Vei lucra activ la stabilirea și atingerea obiectivelor",
        "Coach-ul te va provoca să ieși din zona de confort",
        "Vei avea 'homework' și responsabilități între ședințe",
        "Rezultatele depind de implicarea ta activă",
      ],
    },
    {
      category: "Specialist Wellness",
      description: "Expert în sănătatea holistică și echilibrul viață-muncă",
      services: [
        "Coaching wellness",
        "Gestionarea stresului",
        "Tehnici de relaxare",
        "Echilibru viață-muncă",
      ],
      whenToConsult: [
        "Te simți epuizat fizic sau emoțional constant",
        "Ai probleme cu somnul sau nivelul de energie",
        "Stresul afectează sănătatea ta fizică",
        "Vrei să îți creezi un stil de viață mai sănătos",
        "Cauți tehnici de gestionare a stresului care să funcționeze pentru tine",
      ],
      expectations: [
        "Abordarea este holistică - corp, minte și spirit",
        "Vei învăța tehnici practice de relaxare și mindfulness",
        "Vei primi un plan personalizat de wellness",
        "Schimbările vor fi graduale și sustenabile",
        "Focus pe prevenție, nu doar pe tratarea simptomelor",
      ],
    },
  ],

  userJourney: [
    {
      step: 1,
      title: "Bun venit pe platformă!",
      description: "Primul tău pas către o viață mai echilibrată și fericită",
      actions: [
        "Creează-ți contul și completează profilul",
        "Explorează dashboard-ul pentru a te familiariza cu funcțiile",
        "Încearcă AI Messenger-ul - chatul cu AI este gratuit și mereu disponibil",
      ],
      nextSteps: [
        "Setează-ți obiectivele personale în profil",
        "Configurează AI-ul în setări pentru o experiență personalizată",
        "Explorează articolele pentru informații utile",
      ],
    },
    {
      step: 2,
      title: "Explorează serviciile disponibile",
      description:
        "Descoperă cum te poate ajuta platforma cu nevoile tale specifice",
      actions: [
        "Testează Terapia AI (psihică sau fizică) în funcție de nevoile tale",
        "Citește articolele recomandate pe baza profilului tău",
        "Verifică calendarul de evenimente pentru activități de grup",
      ],
      nextSteps: [
        "Participă la primul eveniment comunitar",
        "Consideră o consultație cu un specialist uman dacă AI-ul recomandă",
        "Explorează sistemul de embleme pentru beneficii extra",
      ],
    },
    {
      step: 3,
      title: "Personalizează experiența",
      description: "Adaptează platforma la stilul și nevoile tale unice",
      actions: [
        "Configurează setările AI pentru conversații personalizate",
        "Alege o emblemă NFT care te reprezintă",
        "Programează prima ta sesiune cu un specialist dacă este cazul",
      ],
      nextSteps: [
        "Folosește regulat AI-ul - cu cât îl folosești mai mult, cu atât devine mai util",
        "Participă la eventos pentru a-ți crește rangul în comunitate",
        "Explorează marketplace-ul pentru embleme rare",
      ],
    },
    {
      step: 4,
      title: "Dezvoltă-te continuu",
      description: "Creează o rutină de dezvoltare personală sustenabilă",
      actions: [
        "Stabilește o rutină de conversații cu AI-ul (zilnic sau săptămânal)",
        "Participă regulat la evenimente comunitare",
        "Ține un jurnal al progresului tău folosind dashboard-ul",
      ],
      nextSteps: [
        "Consideră să devii membru activ al comunității",
        "Exploreazã opțiunile de terapie specializată pentru dezvoltare avansată",
        "Împărtășește experiența ta pentru a ajuta alți utilizatori",
      ],
    },
    {
      step: 5,
      title: "Masterizează platforma",
      description: "Folosește toate funcțiile avansate pentru rezultate optime",
      actions: [
        "Folosește analytics-ul din dashboard pentru tracking avansat",
        "Participă la gebeurtene exclusive prin emblema ta",
        "Mentorizeazã utilizatori noi în comunitate",
      ],
      nextSteps: [
        "Consideră să devii un specialist pe platformă dacă ai calificările",
        "Explorează partnerships-uri și colaborări",
        "Contribuie cu feedback pentru îmbunătățirea platformei",
      ],
    },
  ],

  resources: [
    {
      type: "guide",
      category: "getting-started",
      title: "Cum să începi cu AI-ul",
      content:
        "AI-ul nostru este diferit de ChatGPT pentru că își amintește toate conversațiile tale și se adaptează la personalitatea ta. Pentru cea mai bună experiență: 1) Completează setările AI cu informații despre tine, 2) Fii deschis și sincer în conversații, 3) Folosește-l regulat - cu timpul devine mai inteligent și mai util pentru tine.",
      relatedFeatures: ["ai_messenger", "ai_settings", "ai_therapy_psychic"],
    },
    {
      type: "tutorial",
      category: "therapy",
      title: "Când să alegi AI vs. Specialist uman",
      content:
        "AI-ul este perfect pentru: sfaturi zilnice, suport emoțional instant, tehnici de relaxare, brainstorming soluții. Specialistul uman este necesar pentru: probleme grave de sănătate mentală, terapie de cuplu, trauma, diagnosticare, medicamente. Poți folosi ambele împreună - AI-ul pentru suport zilnic și specialistul pentru ședințe săptămânale.",
      relatedFeatures: [
        "ai_therapy_psychic",
        "specialist_appointments",
        "ai_therapy_physical",
      ],
    },
    {
      type: "faq",
      category: "community",
      title: "Tot despre sistemul de embleme",
      content:
        "Emblemele sunt NFT-uri care îți oferă acces la beneficii exclusive. Există 4 tipuri: Căutătorul Lumina (starter), Gardianul Wellness (intermediate), Corbul Mistic (advanced), Lupul Înțelept (premium). Cu cât emblema este mai avansată, cu atât ai acces la mai multe evenimente exclusive, reduceri și funcții premium. Poți cumpăra, vinde sau schimba embleme în marketplace.",
      relatedFeatures: ["emblems_system", "emblem_dashboard", "marketplace"],
    },
    {
      type: "tips",
      category: "wellness",
      title: "Creează-ți rutina de wellness perfect",
      content:
        "1) Începe ziua cu o conversație de 5 minute cu AI-ul pentru mood check-in, 2) Folosește terapia fizică AI pentru exerciții personalizate, 3) Citește un articol pe săptămână din biblioteca noastră, 4) Participă la un eveniment comunitar lunar, 5) Programa o sesiune cu specialist o dată pe lună pentru check-up mental, 6) Folosește dashboard-ul pentru a tracka progresul.",
      relatedFeatures: [
        "ai_messenger",
        "ai_therapy_physical",
        "articles_blog",
        "events_calendar",
        "specialist_appointments",
        "dashboard_overview",
      ],
    },
  ],
};

// Funcții pentru ghidarea inteligentă a utilizatorilor
export class PlatformMentorAI {
  // Analizează întrebarea utilizatorului și oferă ghidare contextuală
  static analyzeUserQuery(query: string): {
    intent: string;
    recommendations: PlatformFeature[];
    guidance: string;
    quickActions: string[];
  } {
    const lowerQuery = query.toLowerCase();

    // Detectează intențiile comune
    let intent = "general";
    let recommendations: PlatformFeature[] = [];
    let guidance = "";
    let quickActions: string[] = [];

    // Anxietate și probleme emoționale
    if (
      lowerQuery.includes("anxiet") ||
      lowerQuery.includes("stres") ||
      lowerQuery.includes("trist") ||
      lowerQuery.includes("deprim")
    ) {
      intent = "emotional_support";
      recommendations = PLATFORM_KNOWLEDGE.features.filter(
        (f) => f.category === "therapy" || f.category === "ai"
      );
      guidance =
        "Văd că ai nevoie de suport emoțional. Îți recomand să începi cu terapia psihică AI pentru sfaturi imediate, și să consideră o programare cu un psiholog pentru suport profesional.";
      quickActions = [
        "Începe o conversație cu terapia psihică AI",
        "Programează o consultație cu un psiholog",
        "Citește articole despre gestionarea anxietății",
        "Participă la un eveniment de grup pentru suport",
      ];
    }

    // Probleme fizice și wellness
    else if (
      lowerQuery.includes("exercit") ||
      lowerQuery.includes("fizic") ||
      lowerQuery.includes("corp") ||
      lowerQuery.includes("somn") ||
      lowerQuery.includes("obosit")
    ) {
      intent = "physical_wellness";
      recommendations = PLATFORM_KNOWLEDGE.features.filter(
        (f) => f.id === "ai_therapy_physical" || f.category === "wellness"
      );
      guidance =
        "Pentru sănătatea fizică și wellness-ul corpului, îți recomand să începi cu terapia fizică AI care îți poate da sfaturi personalizate pentru exerciții, somn și recuperare.";
      quickActions = [
        "Încearcă terapia fizică AI",
        "Programează o sesiune de wellness coaching",
        "Explorează articolele despre sănătatea fizică",
        "Verifică calendarul pentru workshop-uri de wellness",
      ];
    }

    // Întrebări despre funcțiile platformei
    else if (
      lowerQuery.includes("cum funcți") ||
      lowerQuery.includes("ce pot face") ||
      lowerQuery.includes("cum folosesc") ||
      lowerQuery.includes("ghid")
    ) {
      intent = "platform_guidance";
      recommendations = [
        PLATFORM_KNOWLEDGE.features.find((f) => f.id === "dashboard_overview")!,
        PLATFORM_KNOWLEDGE.features.find((f) => f.id === "ai_messenger")!,
        PLATFORM_KNOWLEDGE.features.find((f) => f.id === "ai_settings")!,
      ].filter(Boolean);
      guidance =
        "Îți pot explica cum să folosești platforma! Începe cu dashboard-ul pentru o privire de ansamblu, apoi configurează AI-ul în setări și explorează funcțiile pas cu pas.";
      quickActions = [
        "Vizitează dashboard-ul principal",
        "Configurează setările AI",
        "Încearcă AI Messenger-ul",
        "Citește ghidurile pentru începători",
      ];
    }

    // Comunitate și evenimente
    else if (
      lowerQuery.includes("event") ||
      lowerQuery.includes("comunit") ||
      lowerQuery.includes("grup") ||
      lowerQuery.includes("oameni") ||
      lowerQuery.includes("prieteni")
    ) {
      intent = "community";
      recommendations = PLATFORM_KNOWLEDGE.features.filter(
        (f) => f.category === "community"
      );
      guidance =
        "Pentru a te conecta cu comunitatea, îți recomand să verifici calendarul de evenimente și să consideri o emblemă NFT pentru acces la evenimente exclusive.";
      quickActions = [
        "Vezi evenimente viitoare",
        "Explorează sistemul de embleme",
        "Înscrie-te la un workshop",
        "Vizitează marketplace-ul comunității",
      ];
    }

    // Servicii profesionale
    else if (
      lowerQuery.includes("specialist") ||
      lowerQuery.includes("terapeut") ||
      lowerQuery.includes("programar") ||
      lowerQuery.includes("doctor") ||
      lowerQuery.includes("consilier")
    ) {
      intent = "professional_services";
      recommendations = [
        PLATFORM_KNOWLEDGE.features.find(
          (f) => f.id === "specialist_appointments"
        )!,
      ].filter(Boolean);
      guidance =
        "Pentru servicii profesionale, poți programa sesiuni cu specialiștii noștri. Avem psihologi, terapeuți de cuplu, coach-i și specialiști în wellness.";
      quickActions = [
        "Vezi specialiștii disponibili",
        "Programează o consultație inițială",
        "Citește despre tipurile de terapie",
        "Compară serviciile și prețurile",
      ];
    }

    // AI și personalizare
    else if (
      lowerQuery.includes("ai") ||
      lowerQuery.includes("personalizare") ||
      lowerQuery.includes("setări") ||
      lowerQuery.includes("configurare")
    ) {
      intent = "ai_customization";
      recommendations = [
        PLATFORM_KNOWLEDGE.features.find((f) => f.id === "ai_settings")!,
        PLATFORM_KNOWLEDGE.features.find((f) => f.id === "ai_messenger")!,
      ].filter(Boolean);
      guidance =
        "AI-ul nostru se poate personaliza complet! În setări poți configura numele, personalitatea, stilul de conversație și obiectivele AI-ului. Cu cât îl folosești mai mult, cu atât devine mai inteligent.";
      quickActions = [
        "Deschide setările AI",
        "Testează AI Messenger-ul",
        "Configurează preferințele de conversație",
        "Încearcă terapia AI specializată",
      ];
    }

    // Default pentru întrebări generale
    else {
      intent = "general";
      recommendations = [
        PLATFORM_KNOWLEDGE.features.find((f) => f.id === "dashboard_overview")!,
        PLATFORM_KNOWLEDGE.features.find((f) => f.id === "ai_messenger")!,
        PLATFORM_KNOWLEDGE.features.find((f) => f.id === "articles_blog")!,
      ].filter(Boolean);
      guidance =
        "Îți pot răspunde la orice întrebare despre platformă! Explorează dashboard-ul pentru o privire de ansamblu, sau începe o conversație cu AI-ul pentru sfaturi personalizate.";
      quickActions = [
        "Explorează dashboard-ul",
        "Vorbește cu AI-ul",
        "Citește ultimele articole",
        "Vezi ce evenimente sunt programate",
      ];
    }

    return { intent, recommendations, guidance, quickActions };
  }

  // Generează un răspuns complet de mentor bazat pe query
  static generateMentorResponse(query: string): string {
    const analysis = this.analyzeUserQuery(query);

    let response = `${analysis.guidance}\n\n`;

    // Adaugă recomandări specifice
    if (analysis.recommendations.length > 0) {
      response += "🎯 **Funcții recomandate pentru tine:**\n";
      analysis.recommendations.forEach((feature, index) => {
        response += `${index + 1}. **${feature.name}** - ${feature.description}\n`;
        response += `   📍 Acces: ${feature.howToAccess}\n`;
        if (feature.tips.length > 0) {
          response += `   💡 Tip: ${feature.tips[0]}\n`;
        }
        response += "\n";
      });
    }

    // Adaugă acțiuni rapide
    if (analysis.quickActions.length > 0) {
      response += "⚡ **Acțiuni rapide pe care le poți face acum:**\n";
      analysis.quickActions.forEach((action) => {
        response += `• ${action}\n`;
      });
      response += "\n";
    }

    // Adaugă sfaturi contexuale
    const relevantTips = this.getContextualTips(analysis.intent);
    if (relevantTips.length > 0) {
      response += "💫 **Sfaturi pentru tine:**\n";
      relevantTips.forEach((tip) => {
        response += `• ${tip}\n`;
      });
    }

    return response;
  }

  // Obține sfaturi contextuale bazate pe intenție
  static getContextualTips(intent: string): string[] {
    const tipCategories: Record<string, string[]> = {
      emotional_support: [
        "AI-ul nostru îți oferă suport 24/7 - nu ezita să îl folosești oricând ai nevoie",
        "Combină terapia AI cu sesiuni regulate cu un specialist pentru rezultate optime",
        "Participarea la evenimente de grup te poate ajuta să te simți mai puțin singur",
      ],
      physical_wellness: [
        "Începe cu exerciții simple recomandate de AI și crește intensitatea gradual",
        "Somnul de calitate este la fel de important ca exercițiile - AI-ul te poate sfătui",
        "Tracking-ul progresului în dashboard îți oferă motivație pe termen lung",
      ],
      platform_guidance: [
        "Explorează platforma pas cu pas - nu e nevoie să folosești totul odată",
        "Setările AI sunt cheia pentru o experiență personalizată - investește timp în ele",
        "Dashboard-ul îți oferă o privire de ansamblu - verifică-l zilnic pentru o rutină sănătoasă",
      ],
      community: [
        "Emblemele NFT îți oferă acces la evenimente exclusive - merită investiția",
        "Participarea regulată la evenimente îți crește rangul în comunitate",
        "Marketplace-ul te ajută să faci trading cu alte embleme pentru beneficii diferite",
      ],
      professional_services: [
        "Prima consultație te ajută să înțelegi dacă specialistul e potrivit pentru tine",
        "Combină sesiunile cu specialistul cu suportul zilnic al AI-ului",
        "Pregătește întrebări înainte de fiecare sesiune pentru a maximiza beneficiile",
      ],
      ai_customization: [
        "Cu cât îi oferi mai multe informații AI-ului, cu atât devine mai util pentru tine",
        "AI-ul nostru are memorie activă - își amintește toate conversațiile anterioare",
        "Testează diferite stiluri de conversație până găsești ce funcționează pentru tine",
      ],
    };

    return (
      tipCategories[intent] || [
        "Platforma e creată să te sprijine în dezvoltarea personală - folosește-o în ritmul tău",
        "Nu ezita să îmi pui întrebări oricând - sunt aici să te ghidez",
        "Combinarea mai multor funcții (AI + specialiști + comunitate) oferă cele mai bune rezultate",
      ]
    );
  }

  // Oferă ghidare pentru user journey bazată pe experiența utilizatorului
  static getPersonalizedGuidance(
    userLevel: "beginner" | "intermediate" | "advanced",
    completedActions: string[] = []
  ): {
    currentStep: UserJourneyStep;
    nextRecommendations: string[];
    motivationalMessage: string;
  } {
    const journey = PLATFORM_KNOWLEDGE.userJourney;

    let currentStepIndex = 0;
    if (userLevel === "intermediate") currentStepIndex = 2;
    if (userLevel === "advanced") currentStepIndex = 4;

    const currentStep = journey[currentStepIndex];

    const nextRecommendations = [
      ...currentStep.actions.filter(
        (action) => !completedActions.includes(action)
      ),
      ...currentStep.nextSteps.slice(0, 2),
    ];

    const motivationalMessages = {
      beginner:
        "🌟 Bun venit în călătoria ta de dezvoltare personală! Fiecare pas mic contează.",
      intermediate:
        "🚀 Excelent progres! Acum e momentul să aprofundezi și să personalizezi experiența.",
      advanced:
        "👑 Ești pe drumul cel bun către masterizare! Folosește funcțiile avansate pentru rezultate maxime.",
    };

    return {
      currentStep,
      nextRecommendations,
      motivationalMessage: motivationalMessages[userLevel],
    };
  }
}

export default {
  PLATFORM_KNOWLEDGE,
  PlatformMentorAI,
};
