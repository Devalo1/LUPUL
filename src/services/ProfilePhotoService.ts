import { auth, storage, functions, firestore } from "../firebase";
import { httpsCallable } from "firebase/functions";
import { User } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { processImageUrl } from "../utils/imageUtils";
import { ref, deleteObject } from "firebase/storage";

/**
 * Serviciu pentru gestionarea fotografiilor de profil
 * Utilizează o funcție cloud pentru a încărca și sincroniza fotografiile
 * pentru a preveni problemele de cache și inconsistențele între colecții
 */
export class ProfilePhotoService {
  private user: User | null;

  // Cache pentru URL-uri de imagini
  static imageCache: Record<string, string> = {};

  constructor(user: User | null) {
    this.user = user;
  }

  /**
   * Metodă statică pentru încărcarea fotografiei de profil
   * @param file Fișierul imagine
   * @param user Utilizatorul curent
   * @returns Promisiune cu URL-ul fotografiei
   */
  static async uploadProfilePhoto(file: File, user: User): Promise<string> {
    const service = new ProfilePhotoService(user);
    return service.uploadProfilePhoto(file);
  }

  /**
   * Reîmprospătează cache-ul pentru imaginea de profil
   * @param userId ID-ul utilizatorului
   * @returns Promisiune rezolvată când cache-ul este reîmprospătat
   */
  static async refreshImageCache(userId: string): Promise<void> {
    if (!userId) return;

    try {
      // Actualizăm cache-ul local
      if (auth.currentUser?.photoURL) {
        this.imageCache[userId] = ProfilePhotoService.getPhotoURLWithTimestamp(
          auth.currentUser.photoURL
        );
      }
    } catch (error) {
      console.error("Eroare la reîmprospătarea cache-ului imaginii:", error);
    }
  }

  /**
   * Încarcă o fotografie de profil și o sincronizează în toate colecțiile
   * @param file Fișierul imagine
   * @returns Promisiune cu URL-ul imaginii
   */
  async uploadProfilePhoto(file: File): Promise<string> {
    if (!this.user) {
      throw new Error("Utilizatorul nu este autentificat");
    }

    try {
      // Convertește fișierul în base64
      const base64 = await this.convertToBase64(file);

      // Apelează funcția cloud pentru încărcare și sincronizare
      const uploadProfilePhotoFunction = httpsCallable(
        functions,
        "uploadProfilePhoto"
      );
      const result = await uploadProfilePhotoFunction({
        photoBase64: base64,
        userId: this.user.uid,
      });

      // Extrage datele din rezultat
      const data = result.data as {
        success: boolean;
        photoURL: string;
        timestamp: number;
      };

      if (!data.success) {
        throw new Error("Încărcarea fotografiei a eșuat");
      }

      // Actualizează și profilul local pentru a afișa imediat fotografia
      await this.updateLocalPhotoReferences(data.photoURL, data.timestamp);

      return data.photoURL;
    } catch (error) {
      console.error("Eroare la încărcarea fotografiei:", error);
      throw error;
    }
  }

  /**
   * Elimină fotografia de profil
   * @param userId ID-ul utilizatorului
   * @returns Promisiune rezolvată când fotografia este eliminată
   */
  async removeProfilePhoto(userId: string): Promise<void> {
    try {
      const photoRef = ref(storage, `profile-photos/${userId}`);
      await deleteObject(photoRef);
      // Optional: Update the user profile to remove the photo URL
      const userDocRef = doc(firestore, "users", userId);
      await updateDoc(userDocRef, {
        photoURL: null,
      });
    } catch (error) {
      console.error("Error removing profile photo:", error);
      throw error;
    }
  }

  /**
   * Actualizează referințele locale pentru a afișa imediat fotografia
   * @param photoURL URL-ul fotografiei
   * @param timestamp Timestamp pentru a preveni cache-ul
   */
  private async updateLocalPhotoReferences(
    photoURL: string,
    timestamp: number
  ) {
    if (!this.user) return;

    try {
      // Actualizează documentul utilizatorului cu timestamp pentru a forța actualizarea
      const userRef = doc(firestore, "users", this.user.uid);
      await updateDoc(userRef, {
        photoURL,
        photoTimestamp: timestamp,
      });

      // Verifică dacă există și document de specialist
      const specialistRef = doc(firestore, "specialists", this.user.uid);
      try {
        await updateDoc(specialistRef, {
          photoURL,
          photoTimestamp: timestamp,
        });
      } catch (e) {
        // Ignorăm eroarea dacă utilizatorul nu este specialist
      }
    } catch (error) {
      console.error("Eroare la actualizarea referințelor locale:", error);
    }
  }

  /**
   * Obține URL-ul fotografiei cu parametru timestamp pentru a preveni cache-ul
   * @param photoURL URL-ul fotografiei
   * @returns URL-ul fotografiei cu parametru timestamp
   */
  static getPhotoURLWithTimestamp(photoURL: string | null | undefined): string {
    if (!photoURL) return "";

    // Folosim processImageUrl pentru a asigura consistența procesării URL-urilor
    // Asta va aplica toate corectările necesare și va adăuga un singur timestamp
    return processImageUrl(photoURL, true);
  }

  /**
   * Convertește un fișier în format base64
   * @param file Fișierul pentru conversie
   * @returns Promisiune cu string-ul base64
   */
  private convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}
