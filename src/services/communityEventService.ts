// Event System pentru comunitatea de embleme
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove as _arrayRemove,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { emblemService } from "./emblemService";

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: "wellness_session" | "masterclass" | "vip_meetup" | "product_dev";
  date: Timestamp;
  startDate: Timestamp; // alias pentru date
  duration: number; // în minute
  maxParticipants: number;
  requiredTier: number; // 1-4, corespunzând tierurilor de embleme
  participants: string[]; // userIds
  waitingList: string[];
  registeredCount?: number; // calculat dinamic
  location?: string; // pentru meetup-uri fizice
  zoomLink?: string;
  telegramGroupId?: string;
  host: {
    name: string;
    bio: string;
    avatar: string;
  };
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  resources?: {
    title: string;
    url: string;
    type: "pdf" | "video" | "audio";
  }[];
  feedback?: {
    rating: number;
    comments: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EventRegistration {
  eventId: string;
  userId: string;
  emblemType: string;
  registeredAt: Timestamp;
  attended: boolean;
  feedback?: {
    rating: number;
    comment: string;
  };
}

export interface EventTemplate {
  type: "wellness_session" | "masterclass" | "vip_meetup" | "product_dev";
  title: string;
  description: string;
  duration: number;
  maxParticipants: number;
  requiredTier: number;
  defaultResources: any[];
}

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    type: "wellness_session",
    title: "Sesiune de Wellness Ghidată",
    description:
      "Meditație, mindfulness și tehnici de relaxare pentru toți membrii comunității",
    duration: 60,
    maxParticipants: 50,
    requiredTier: 1,
    defaultResources: [],
  },
  {
    type: "masterclass",
    title: "Masterclass Premium",
    description: "Sesiuni avansate cu experți în psihologie și wellness",
    duration: 90,
    maxParticipants: 25,
    requiredTier: 2,
    defaultResources: [],
  },
  {
    type: "vip_meetup",
    title: "Meetup VIP Exclusiv",
    description: "Întâlniri fizice pentru membrii de top ai comunității",
    duration: 120,
    maxParticipants: 10,
    requiredTier: 4,
    defaultResources: [],
  },
  {
    type: "product_dev",
    title: "Sesiune Dezvoltare Produs",
    description:
      "Input direct în dezvoltarea platformei pentru membrii selecti",
    duration: 75,
    maxParticipants: 15,
    requiredTier: 3,
    defaultResources: [],
  },
];

class CommunityEventService {
  // Creează un eveniment nou
  async createEvent(eventData: Partial<CommunityEvent>): Promise<string> {
    try {
      const eventId = `event_${Date.now()}`;

      const event: CommunityEvent = {
        id: eventId,
        title: eventData.title || "Eveniment fără titlu",
        description: eventData.description || "",
        type: eventData.type || "wellness_session",
        date: eventData.date || Timestamp.now(),
        startDate: eventData.date || Timestamp.now(), // alias pentru date
        duration: eventData.duration || 60,
        maxParticipants: eventData.maxParticipants || 30,
        requiredTier: eventData.requiredTier || 1,
        participants: [],
        waitingList: [],
        location: eventData.location,
        zoomLink: eventData.zoomLink,
        telegramGroupId: eventData.telegramGroupId,
        host: eventData.host || {
          name: "Echipa Lupul și Corbul",
          bio: "Echipa dedicată wellness-ului și dezvoltării personale",
          avatar: "/default-host-avatar.png",
        },
        status: "upcoming",
        resources: eventData.resources || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(firestore, "communityEvents", eventId), event);

      console.log(`Eveniment creat cu succes: ${eventId}`);
      return eventId;
    } catch (error) {
      console.error("Eroare la crearea evenimentului:", error);
      throw error;
    }
  }

  // Înregistrează un utilizator la eveniment
  async registerForEvent(
    userId: string,
    eventId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verifică dacă evenimentul există
      const eventDoc = await getDoc(doc(firestore, "communityEvents", eventId));
      if (!eventDoc.exists()) {
        return { success: false, message: "Evenimentul nu există" };
      }

      const event = eventDoc.data() as CommunityEvent;

      // Verifică statusul evenimentului
      if (event.status !== "upcoming") {
        return {
          success: false,
          message: "Evenimentul nu este disponibil pentru înregistrare",
        };
      }

      // Verifică dacă utilizatorul are deja o emblemă și tierul corespunzător
      const canAttend = await emblemService.canUserAttendEvent(
        userId,
        event.requiredTier
      );
      if (!canAttend) {
        return {
          success: false,
          message: "Nu ai emblema necesară pentru acest eveniment",
        };
      }

      // Verifică dacă utilizatorul este deja înregistrat
      if (
        event.participants.includes(userId) ||
        event.waitingList.includes(userId)
      ) {
        return {
          success: false,
          message: "Ești deja înregistrat la acest eveniment",
        };
      }

      const batch = writeBatch(firestore);
      const eventRef = doc(firestore, "communityEvents", eventId);

      // Înregistrează participantul sau îl pune pe waiting list
      if (event.participants.length < event.maxParticipants) {
        batch.update(eventRef, {
          participants: arrayUnion(userId),
          updatedAt: Timestamp.now(),
        });

        // Înregistrează în tabelul de registrations
        const registrationRef = doc(
          firestore,
          "eventRegistrations",
          `${eventId}_${userId}`
        );
        batch.set(registrationRef, {
          eventId,
          userId,
          emblemType:
            (await emblemService.getUserEmblem(userId))?.type || "unknown",
          registeredAt: Timestamp.now(),
          attended: false,
        } as EventRegistration);

        // Adaugă puncte de engagement pentru înregistrare
        await emblemService.addEngagement(userId, "eventAttendance", {
          eventId,
          eventType: event.type,
          action: "registered",
        });

        await batch.commit();
        return {
          success: true,
          message: "Te-ai înregistrat cu succes la eveniment!",
        };
      } else {
        batch.update(eventRef, {
          waitingList: arrayUnion(userId),
          updatedAt: Timestamp.now(),
        });

        await batch.commit();
        return {
          success: true,
          message: "Ai fost adăugat pe lista de așteptare",
        };
      }
    } catch (error) {
      console.error("Eroare la înregistrarea pentru eveniment:", error);
      return {
        success: false,
        message: "Eroare tehnică. Te rugăm să încerci din nou.",
      };
    }
  }

  // Obține toate evenimentele viitoare
  async getUpcomingEvents(userId?: string): Promise<CommunityEvent[]> {
    try {
      const now = Timestamp.now();
      const eventsQuery = query(
        collection(firestore, "communityEvents"),
        where("status", "==", "upcoming"),
        where("date", ">", now),
        orderBy("date", "asc"),
        limit(10)
      );

      const snapshot = await getDocs(eventsQuery);
      const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          registeredCount: (data.participants || []).length,
        } as CommunityEvent & { registeredCount: number };
      });

      // Filtrează pe baza tierului utilizatorului dacă e specificat
      if (userId) {
        const userEmblem = await emblemService.getUserEmblem(userId);
        if (userEmblem) {
          const userTier = await this.getUserTier(userId);
          return events.filter((event) => event.requiredTier <= userTier);
        }
      }

      return events;
    } catch (error) {
      console.error("Eroare la obținerea evenimentelor:", error);
      return [];
    }
  }

  // Obține înregistrările utilizatorului
  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    try {
      const registrationsQuery = query(
        collection(firestore, "eventRegistrations"),
        where("userId", "==", userId),
        orderBy("registeredAt", "desc")
      );

      const snapshot = await getDocs(registrationsQuery);
      return snapshot.docs.map((doc) => doc.data() as EventRegistration);
    } catch (error) {
      console.error("Eroare la obținerea înregistrărilor:", error);
      return [];
    }
  }

  // Obține tierul utilizatorului pe baza emblemei
  private async getUserTier(userId: string): Promise<number> {
    try {
      const emblem = await emblemService.getUserEmblem(userId);
      if (!emblem) return 0;

      return 1; // Simplificat pentru moment
    } catch (error) {
      console.error("Eroare la obținerea tierului:", error);
      return 0;
    }
  }

  // Marchează prezența la eveniment
  async markAttendance(userId: string, eventId: string): Promise<boolean> {
    try {
      const registrationRef = doc(
        firestore,
        "eventRegistrations",
        `${eventId}_${userId}`
      );
      await updateDoc(registrationRef, {
        attended: true,
      });

      // Adaugă puncte de engagement pentru participare
      await emblemService.addEngagement(userId, "eventAttendance", {
        eventId,
        action: "attended",
      });

      return true;
    } catch (error) {
      console.error("Eroare la marcarea prezenței:", error);
      return false;
    }
  }

  // Creează evenimente template pentru luna viitoare
  async createMonthlyEvents(): Promise<string[]> {
    try {
      const eventIds: string[] = [];
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      for (const template of EVENT_TEMPLATES) {
        // Calculează data pentru fiecare tip de eveniment
        let eventDate: Date;

        switch (template.type) {
          case "wellness_session":
            // Săptămânal, duminica la 19:00
            eventDate = new Date(nextMonth);
            eventDate.setDate(eventDate.getDate() + (7 - eventDate.getDay())); // Următoarea duminică
            eventDate.setHours(19, 0, 0, 0);
            break;

          case "masterclass":
            // Bilunar, sâmbăta la 15:00
            eventDate = new Date(nextMonth);
            eventDate.setDate(15); // A 15-a a lunii
            eventDate.setHours(15, 0, 0, 0);
            break;

          case "vip_meetup":
            // Lunar, ultima vineri la 18:00
            eventDate = new Date(
              nextMonth.getFullYear(),
              nextMonth.getMonth() + 1,
              0
            ); // Ultima zi a lunii
            eventDate.setDate(
              eventDate.getDate() - ((eventDate.getDay() + 2) % 7)
            ); // Ultima vineri
            eventDate.setHours(18, 0, 0, 0);
            break;

          case "product_dev":
            // Lunar, prima miercuri la 20:00
            eventDate = new Date(nextMonth);
            eventDate.setDate(
              eventDate.getDate() + ((3 - eventDate.getDay() + 7) % 7)
            ); // Prima miercuri
            eventDate.setHours(20, 0, 0, 0);
            break;

          default:
            eventDate = nextMonth;
        }

        const eventId = await this.createEvent({
          title: template.title,
          description: template.description,
          type: template.type,
          date: Timestamp.fromDate(eventDate),
          duration: template.duration,
          maxParticipants: template.maxParticipants,
          requiredTier: template.requiredTier,
          resources: template.defaultResources,
        });

        eventIds.push(eventId);
      }

      console.log(
        `Au fost create ${eventIds.length} evenimente pentru luna viitoare`
      );
      return eventIds;
    } catch (error) {
      console.error("Eroare la crearea evenimentelor lunare:", error);
      return [];
    }
  }
}

export const communityEventService = new CommunityEventService();
export default communityEventService;
