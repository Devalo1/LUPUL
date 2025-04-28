import _React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const DataInitializer = () => {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Inițializează datele necesare pentru aplicație
    const initializeData = async () => {
      if (!user || initialized) return;

      try {
        console.log("Verificând și inițializând datele necesare...");
        
        // Inițializează serviciile implicite pentru fiecare specializare
        const servicesCollection = collection(firestore, "services");
        const servicesSnapshot = await getDocs(servicesCollection);
        
        if (servicesSnapshot.empty) {
          console.log("Nu există servicii. Inițializând servicii implicite...");
          
          // Servicii pentru Terapie
          const terapieServices = [
            {
              name: "Ședință de terapie individuală",
              category: "Terapie",
              duration: 60,
              price: 200,
              description: "Ședință individuală de terapie pentru diverse probleme.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Terapie"
            },
            {
              name: "Psihoterapie de cuplu",
              category: "Psihoterapie",
              duration: 90,
              price: 250,
              description: "Ședință de terapie pentru cupluri care întâmpină dificultăți.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Terapie"
            },
            {
              name: "Consiliere psihologică",
              category: "Consiliere",
              duration: 45,
              price: 150,
              description: "Consiliere pentru situații diverse și decizii importante.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Terapie"
            },
            {
              name: "Terapie cognitiv-comportamentală",
              category: "Psihologie",
              duration: 60,
              price: 220,
              description: "Terapie specializată pentru anxietate și depresie.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Terapie"
            }
          ];
          
          // Servicii pentru Consultație
          const consultatieServices = [
            {
              name: "Consultație generală",
              category: "Consultație",
              duration: 30,
              price: 150,
              description: "Consultație generală pentru evaluarea stării de sănătate.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Consultație"
            },
            {
              name: "Consultație nutrițională",
              category: "Nutriție",
              duration: 60,
              price: 180,
              description: "Evaluare nutrițională și recomandări personalizate de dietă.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Consultație"
            },
            {
              name: "Control medical",
              category: "Medicină",
              duration: 20,
              price: 100,
              description: "Control de rutină pentru monitorizarea stării de sănătate.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Consultație"
            },
            {
              name: "Evaluare medicală complexă",
              category: "Sănătate",
              duration: 90,
              price: 300,
              description: "Evaluare medicală completă cu recomandări de tratament.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Consultație"
            }
          ];
          
          // Servicii pentru Educație
          const educatieServices = [
            {
              name: "Coaching personal",
              category: "Coaching",
              duration: 60,
              price: 180,
              description: "Ședință de coaching pentru dezvoltare personală și profesională.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Educație"
            },
            {
              name: "Mentorat profesional",
              category: "Mentorat",
              duration: 90,
              price: 250,
              description: "Ședință de mentorat pentru dezvoltarea carierei.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Educație"
            },
            {
              name: "Training comunicare",
              category: "Training",
              duration: 120,
              price: 300,
              description: "Curs de îmbunătățire a abilităților de comunicare.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Educație"
            },
            {
              name: "Workshop dezvoltare personală",
              category: "Dezvoltare",
              duration: 180,
              price: 350,
              description: "Workshop interactiv pentru dezvoltare personală.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Educație"
            }
          ];
          
          // Servicii pentru Sport
          const sportServices = [
            {
              name: "Antrenament personal",
              category: "Sport",
              duration: 60,
              price: 150,
              description: "Ședință de antrenament personalizat cu antrenor.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Sport"
            },
            {
              name: "Ședință Yoga",
              category: "Yoga",
              duration: 90,
              price: 120,
              description: "Ședință de yoga pentru toate nivelurile.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Sport"
            },
            {
              name: "Clasă Pilates",
              category: "Pilates",
              duration: 60,
              price: 100,
              description: "Clasă de pilates pentru tonifiere musculară.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Sport"
            },
            {
              name: "Program fitness personalizat",
              category: "Fitness",
              duration: 120,
              price: 200,
              description: "Evaluare și creare program fitness personalizat.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Sport"
            },
            {
              name: "Antrenament funcțional",
              category: "Antrenament",
              duration: 45,
              price: 120,
              description: "Antrenament funcțional pentru îmbunătățirea forței și mobilității.",
              isActive: true,
              createdAt: serverTimestamp(),
              specializationType: "Sport"
            }
          ];
          
          // Adăugăm toate serviciile în Firestore
          const allServices = [
            ...terapieServices, 
            ...consultatieServices, 
            ...educatieServices, 
            ...sportServices
          ];
          
          for (const service of allServices) {
            await addDoc(collection(firestore, "services"), service);
          }
          
          console.log(`Servicii implicite adăugate cu succes (${allServices.length} servicii).`);
        } else {
          console.log(`Serviciile există deja în baza de date (${servicesSnapshot.docs.length} servicii).`);
        }
        
        setInitialized(true);
      } catch (error) {
        console.error("Eroare la inițializarea datelor:", error);
      }
    };

    initializeData();
  }, [user, initialized]);

  return null; // Nu afișăm nimic, componenta are doar rol de inițializare
};

export default DataInitializer;