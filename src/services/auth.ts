import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  getRedirectResult
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc 
} from "firebase/firestore";
import { auth, firestore } from "../firebase";

// Define our custom User type here instead of importing it
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Convert Firebase user to our custom User type
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  };
};

// Subscribe to auth state changes - CORECTAREA IMPLEMENTĂRII
export const onAuthChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUserToUser(firebaseUser) : null);
  });
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<{success: boolean, user?: User, error?: string}> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: mapFirebaseUserToUser(userCredential.user)
    };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "A apărut o eroare la autentificare";
    console.error("Eroare la autentificare:", errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Check admin status
export const checkAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return false;

    const idTokenResult = await firebaseUser.getIdTokenResult();
    if (idTokenResult.claims.admin === true) {
      return true;
    }
    
    const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
    if (userDoc.exists() && userDoc.data().isAdmin === true) {
      return true;
    }
    
    if (firebaseUser.email?.endsWith("@admin.com")) {
      return true;
    }
    
    return false;
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "Error checking admin status";
    console.error("Error checking admin status:", errorMessage);
    return false;
  }
};

// Sign out user
export const logOut = async (): Promise<{success: boolean, error?: string}> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "A apărut o eroare la delogare";
    console.error("Eroare la delogare:", errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<{success: boolean, error?: string}> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "A apărut o eroare la resetarea parolei";
    console.error("Eroare la resetarea parolei:", errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<{success: boolean, user?: User, error?: string}> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    await setDoc(doc(firestore, "users", firebaseUser.uid), {
      email: firebaseUser.email,
      createdAt: new Date(),
      isAdmin: false
    });
    
    return {
      success: true,
      user: mapFirebaseUserToUser(firebaseUser)
    };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "A apărut o eroare la înregistrare";
    console.error("Eroare la înregistrare:", errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Update user profile
export const updateUserProfile = async (displayName: string, photoURL?: string): Promise<{success: boolean, error?: string}> => {
  try {
    if (!auth.currentUser) {
      return {
        success: false,
        error: "Nu există niciun utilizator autentificat"
      };
    }
    
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL: photoURL || (auth.currentUser.photoURL as string | undefined)
    });
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "A apărut o eroare la actualizarea profilului";
    console.error("Eroare la actualizarea profilului:", errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Sign in with Google - Actualizat pentru a folosi redirect în loc de popup
export const signInWithGoogle = async (): Promise<{success: boolean, user?: User, error?: string}> => {
  try {
    // Folosim funcția loginWithGoogleRedirect din firebase.ts
    // care este deja configurată pentru redirecționare
    const { loginWithGoogleRedirect } = await import("../firebase");
    await loginWithGoogleRedirect();
    
    // Nu mai returnăm un rezultat direct, pentru că redirecționarea
    // va întrerupe execuția scriptului current
    return {
      success: true
    };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "A apărut o eroare la autentificarea cu Google";
    console.error("Eroare la autentificarea cu Google:", errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Metodă îmbunătățită pentru a procesa rezultatul redirecționării Google
export const processGoogleRedirect = async (): Promise<{success: boolean, user?: User, error?: string}> => {
  try {
    console.log("Verificăm rezultatul redirecționării Google...");
    
    // Folosim instanța auth din firebase.ts importat la începutul fișierului
    const result = await getRedirectResult(auth);
    
    if (result && result.user) {
      console.log("Autentificare Google reușită:", result.user.email);
      
      // Creăm/actualizăm utilizatorul în Firestore
      const userRef = doc(firestore, "users", result.user.uid);
      
      // Verificăm dacă utilizatorul există deja
      const userDoc = await getDoc(userRef);
      
      // Verificăm dacă este admin
      const isAdminUser = result.user.email === "dani_popa21@yahoo.ro";
      
      // Pregătim datele pentru actualizare
      const userData = {
        email: result.user.email,
        displayName: result.user.displayName || result.user.email?.split("@")[0] || "Utilizator",
        photoURL: result.user.photoURL,
        lastLogin: new Date(),
        updatedAt: new Date(),
        isAdmin: isAdminUser,
        role: isAdminUser ? "admin" : "user"
      };
      
      try {
        // Verificăm dacă utilizatorul există
        if (userDoc.exists()) {
          // Păstrăm câmpurile existente și actualizăm doar ce e nou
          await setDoc(userRef, {
            ...userData,
            createdAt: userDoc.data().createdAt // Keep the original creation date
          }, { merge: true });
          console.log("Utilizator existent actualizat în Firestore");
        } else {
          // Creare document nou cu câmpuri adiționale pentru utilizatori noi
          await setDoc(userRef, {
            ...userData,
            createdAt: new Date()
          });
          console.log("Utilizator nou creat în Firestore");
        }
      } catch (firestoreError) {
        console.error("Eroare la actualizarea datelor utilizatorului în Firestore:", firestoreError);
        // Continue anyway - Firebase Auth authentication succeeded
      }
      
      // Creăm documentul de admin dacă este cazul
      if (isAdminUser) {
        try {
          // Verificăm dacă utilizatorul este deja în colecția de admini
          const adminsRef = collection(firestore, "admins");
          const adminsQuery = query(adminsRef, where("email", "==", result.user.email));
          const adminsSnapshot = await getDocs(adminsQuery);
          
          if (adminsSnapshot.empty) {
            // Adăugăm utilizatorul în colecția de admini
            await addDoc(adminsRef, {
              userId: result.user.uid,
              email: result.user.email,
              createdAt: new Date()
            });
            console.log("Admin adăugat în colecția de admini");
          } else {
            console.log("Admin există deja în colecția de admini");
          }
        } catch (adminError) {
          console.error("Eroare la actualizarea colecției de admini:", adminError);
          // Continue anyway - user document update succeeded
        }
      }
      
      // Salvăm email-ul utilizatorului pentru viitoare autentificări
      sessionStorage.setItem("lastEmail", result.user.email || "");
      
      // Returnăm utilizatorul mapat
      return {
        success: true,
        user: mapFirebaseUserToUser(result.user)
      };
    } else {
      console.log("Nu există rezultat sau utilizator după redirecționare");
    }
    
    return { success: false };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "A apărut o eroare la procesarea redirecționării Google";
    console.error("Eroare la procesarea redirecționării Google:", errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Check if current user is logged in
export const isUserLoggedIn = (): boolean => {
  return !!auth.currentUser;
};
