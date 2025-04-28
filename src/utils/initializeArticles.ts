import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { createLogger } from "./logger";

const logger = createLogger("initializeArticles");

/**
 * Utility function to initialize the articles collection with sample data if needed
 */
export const initializeArticles = async (): Promise<boolean> => {
  try {
    logger.info("Checking if articles collection exists and has data...");
    
    if (!db) {
      logger.error("Firestore instance is undefined");
      return false;
    }
    
    const articlesRef = collection(db, "articles");
    const snapshot = await getDocs(articlesRef);
    
    if (snapshot.empty) {
      logger.info("No articles found. Creating sample articles...");
      
      // Simplify the content to avoid template string issues
      const sampleArticles = [
        {
          title: "Importanța sănătății mentale în era digitală",
          date: "10 Mai 2023",
          author: "Dr. Ana Popescu",
          preview: "Descoperă cum să-ți menții echilibrul mental în mijlocul agitației cotidiene...",
          content: `Dragă prieten,

Îți scriu această scrisoare cu speranța că te vei opri pentru un moment din agitația zilnică pentru a reflecta asupra sănătății tale mentale.

În lumea noastră digitală, suntem constant bombardați cu informații, notificări și stimuli care ne solicită atenția. Acest flux neîntrerupt poate duce la anxietate, burnout și sentimente de izolare, chiar dacă suntem mai conectați ca niciodată din punct de vedere tehnologic.

Aș dori să îți împărtășesc câteva practici care m-au ajutat pe mine și pe pacienții mei:

1. **Stabilește limite digitale** - Desemnează perioade din zi când nu folosești dispozitivele electronice
2. **Practică mindfulness** - Chiar și 5 minute de meditație zilnică pot face diferența
3. **Mișcarea fizică** - O plimbare de 30 de minute poate îmbunătăți considerabil starea de spirit
4. **Conectează-te autentic** - Nimic nu înlocuiește conversațiile sincere față în față

Sănătatea mentală nu este un lux, ci o necesitate, la fel de importantă ca sănătatea fizică. Te încurajez să o tratezi cu aceeași prioritate.

Cu gânduri bune,
Dr. Ana Popescu
Specialist în psihologie clinică`,
          createdAt: new Date().toISOString()
        },
        {
          title: "Cum să cultivi motivația intrinsecă pentru obiective de lungă durată",
          date: "23 Iunie 2023",
          author: "Prof. Mihai Ionescu",
          preview: "Află strategii dovedite științific pentru a-ți menține motivația în proiectele importante...",
          content: `Dragă cititorule,

Îți scriu astăzi despre o provocare cu care mulți dintre noi ne confruntăm: cum să rămânem motivați când drumul este lung și rezultatele par îndepărtate.

În cei 20 de ani de cercetare în psihologia motivației, am observat că oamenii care reușesc să-și mențină angajamentul față de obiectivele de lungă durată nu se bazează doar pe motivația extrinsecă (recompense, recunoaștere), ci dezvoltă o motivație intrinsecă puternică.

Iată câteva strategii care te pot ajuta:

1. **Conectează obiectivele la valorile tale profunde** - Când obiectivul este aliniat cu ceea ce contează cu adevărat pentru tine, motivația devine naturală
   
2. **Bucură-te de proces** - Găsește aspecte ale drumului care îți aduc satisfacție, nu te concentra doar pe destinație

3. **Identifică progresul** - Ține un jurnal al micilor victorii și al lecțiilor învățate

4. **Creează un sistem de responsabilizare** - Un mentor sau un grup de suport poate face diferența în momentele dificile

5. **Practică auto-compasiunea** - În zilele când motivația scade, tratează-te cu înțelegere, nu cu critică

Motivația fluctuează în mod natural - aceasta este experiența umană normală. Secretul constă în a crea sisteme și practici care te ajută să continui chiar și când entuziasmul inițial s-a diminuat.

Cu încredere în călătoria ta,
Prof. Mihai Ionescu
Facultatea de Psihologie`,
          createdAt: new Date().toISOString()
        }
      ];
      
      try {
        // Add the sample articles to Firestore
        for (const article of sampleArticles) {
          const docRef = await addDoc(articlesRef, article);
          logger.info(`Added sample article with ID: ${docRef.id}`);
        }
        
        logger.info("Sample articles created successfully!");
        return true;
      } catch (error) {
        logger.error("Error adding sample articles:", error);
        return false;
      }
    } else {
      logger.info(`Articles collection already has ${snapshot.docs.length} documents.`);
      return false;
    }
  } catch (error) {
    logger.error("Error initializing articles:", error);
    return false;
  }
};

export default initializeArticles;
