import { storage, firestore } from "../firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject as _deleteObject,
} from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";

/**
 * Serviciu simplificat pentru încărcarea fotografiilor
 */
class SimplePhotoUploader {
  /**
   * Cache-ul local pentru URL-uri de imagini
   * Folosit pentru a reduce latența între încărcare și afișare
   */
  private static imageCache: Record<string, string> = {};

  /**
   * Încarcă o fotografie în Firebase Storage și actualizează toate referințele
   * @param file Fișierul imagine de încărcat
   * @param userId ID-ul utilizatorului
   * @returns URL-ul imaginii încărcate
   */
  static async uploadPhoto(file: File, userId: string): Promise<string> {
    try {
      // Validări de bază
      if (!file || !userId) {
        throw new Error("Fișierul sau ID-ul utilizatorului lipsește");
      }

      // Validare dimensiune fișier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(
          "Imaginea este prea mare. Dimensiunea maximă este 5MB."
        );
      }

      // Validare tip fișier
      if (!file.type.startsWith("image/")) {
        throw new Error("Vă rugăm să încărcați doar fișiere imagine.");
      }

      // Generăm un nume unic pentru a evita suprascrierea și pentru a evita problemele de cache
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `${userId}_${timestamp}.${fileExtension}`;
      const storagePath = `profile-photos/${fileName}`;

      // Referință la Storage
      const storageRef = ref(storage, storagePath);

      // Încărcăm fișierul
      await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          uploadTime: new Date().toISOString(),
          originalName: file.name,
        },
      });

      // Obținem URL-ul de descărcare
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Imagine încărcată cu succes: ", downloadURL);

      // Adăugăm un token anti-cache la URL
      const cachedURL = `${downloadURL}?t=${timestamp}`;

      // Salvăm URL-ul în cache-ul local pentru acces rapid
      SimplePhotoUploader.imageCache[userId] = cachedURL;

      // Salvăm în localStorage pentru persistență între reîncărcări
      try {
        localStorage.setItem(`user_${userId}_photoURL`, cachedURL);
        localStorage.setItem(
          `user_${userId}_photoURL_timestamp`,
          timestamp.toString()
        );
      } catch (storageError) {
        console.error("Eroare la salvarea în localStorage", storageError);
      }

      // Actualizăm toate locațiile necesare
      await SimplePhotoUploader.updateAllUserReferences(userId, cachedURL);

      return cachedURL;
    } catch (error) {
      console.error("Eroare la încărcarea fotografiei:", error);
      throw error;
    }
  }

  /**
   * Actualizează toate referințele utilizatorului cu noua imagine
   * @param userId ID-ul utilizatorului
   * @param photoURL URL-ul noii fotografii
   */
  private static async updateAllUserReferences(
    userId: string,
    photoURL: string
  ): Promise<void> {
    try {
      const updatePromises: Promise<any>[] = [];

      // 1. Actualizăm Firestore - colecția users
      try {
        const userDoc = doc(firestore, "users", userId);
        updatePromises.push(
          updateDoc(userDoc, {
            photoURL: photoURL,
            imageUrl: photoURL,
            avatarURL: photoURL,
            profileImage: photoURL,
            lastUpdated: new Date(),
          })
        );
      } catch (e) {
        console.error("Eroare la actualizarea documentului users:", e);
      }

      // 2. Actualizăm Firestore - colecția specialists
      try {
        const specialistDoc = doc(firestore, "specialists", userId);
        updatePromises.push(
          updateDoc(specialistDoc, {
            photoURL: photoURL,
            imageUrl: photoURL,
            avatarURL: photoURL,
            profileImage: photoURL,
            lastUpdated: new Date(),
          })
        );
      } catch (e) {
        console.error("Eroare la actualizarea documentului specialists:", e);
      }

      // 3. Actualizăm Firebase Auth user profile
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          updatePromises.push(
            updateProfile(currentUser, {
              photoURL: photoURL,
            })
          );
        }
      } catch (e) {
        console.error("Eroare la actualizarea profilului Firebase Auth:", e);
      }

      // Așteptăm finalizarea tuturor actualizărilor, dar nu lăsăm erorile să se propage
      await Promise.allSettled(updatePromises);

      console.log(
        "Toate referințele utilizatorului au fost actualizate cu noua imagine"
      );
    } catch (error) {
      console.error(
        "Eroare la actualizarea referințelor utilizatorului:",
        error
      );
    }
  }

  /**
   * Obține URL-ul fotografiei de profil cu prioritate din cache local, apoi din localStorage,
   * apoi din Firebase dacă nu este disponibil local
   * @param userId ID-ul utilizatorului
   * @returns URL-ul fotografiei de profil sau null dacă nu există
   */
  static async getProfilePhotoURL(userId: string): Promise<string | null> {
    // 1. Verificăm mai întâi cache-ul local
    if (SimplePhotoUploader.imageCache[userId]) {
      return SimplePhotoUploader.imageCache[userId];
    }

    // 2. Dacă nu este în cache, verificăm localStorage
    try {
      const cachedURL = localStorage.getItem(`user_${userId}_photoURL`);
      if (cachedURL) {
        SimplePhotoUploader.imageCache[userId] = cachedURL;
        return cachedURL;
      }
    } catch (e) {
      console.error("Eroare la citirea din localStorage:", e);
    }

    // 3. Dacă nu este în localStorage, încercăm să îl obținem din Firebase
    try {
      // Verificăm mai întâi în colecția users
      const userDoc = await getDoc(doc(firestore, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const photoURL =
          userData.photoURL ||
          userData.imageUrl ||
          userData.avatarURL ||
          userData.profileImage;

        if (photoURL) {
          // Adăugăm un token anti-cache
          const cachedURL = `${photoURL}${photoURL.includes("?") ? "&" : "?"}t=${Date.now()}`;
          SimplePhotoUploader.imageCache[userId] = cachedURL;

          // Salvăm în localStorage pentru acces rapid în viitor
          try {
            localStorage.setItem(`user_${userId}_photoURL`, cachedURL);
          } catch (storageError) {
            console.error("Eroare la salvarea în localStorage", storageError);
          }

          return cachedURL;
        }
      }

      // Dacă nu, verificăm în colecția specialists
      const specialistDoc = await getDoc(doc(firestore, "specialists", userId));
      if (specialistDoc.exists()) {
        const specialistData = specialistDoc.data();
        const photoURL =
          specialistData.photoURL ||
          specialistData.imageUrl ||
          specialistData.avatarURL ||
          specialistData.profileImage;

        if (photoURL) {
          // Adăugăm un token anti-cache
          const cachedURL = `${photoURL}${photoURL.includes("?") ? "&" : "?"}t=${Date.now()}`;
          SimplePhotoUploader.imageCache[userId] = cachedURL;

          // Salvăm în localStorage pentru acces rapid în viitor
          try {
            localStorage.setItem(`user_${userId}_photoURL`, cachedURL);
          } catch (storageError) {
            console.error("Eroare la salvarea în localStorage", storageError);
          }

          return cachedURL;
        }
      }

      // Verificăm și Firebase Auth
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.photoURL) {
        const cachedURL = `${currentUser.photoURL}${currentUser.photoURL.includes("?") ? "&" : "?"}t=${Date.now()}`;
        SimplePhotoUploader.imageCache[userId] = cachedURL;
        return cachedURL;
      }
    } catch (e) {
      console.error(
        "Eroare la obținerea URL-ului fotografiei din Firebase:",
        e
      );
    }

    return null;
  }

  /**
   * Forțează reîmprospătarea cache-ului de imagini
   * @param userId ID-ul utilizatorului
   */
  static async refreshImageCache(userId: string): Promise<string | null> {
    // Eliminăm din cache
    delete SimplePhotoUploader.imageCache[userId];

    // Obținem din nou
    return await SimplePhotoUploader.getProfilePhotoURL(userId);
  }
}

export default SimplePhotoUploader;
