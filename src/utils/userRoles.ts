import { doc, setDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { firestore, db } from "../firebase"; // Direct import from the central firebase.ts

/**
 * Checks if a user with the given email has admin privileges
 */
export const isUserAdmin = async (userEmail: string): Promise<boolean> => {
  if (!userEmail) return false;
  
  try {
    console.log(`Checking admin status for ${userEmail}`);
    const adminsCollection = collection(firestore, 'admins');
    const q = query(adminsCollection, where('email', '==', userEmail));
    const querySnapshot = await getDocs(q);
    
    const isAdmin = !querySnapshot.empty;
    console.log(`User ${userEmail} admin status: ${isAdmin}`);
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Makes a user admin by adding their email to the admins collection
 */
export const makeUserAdmin = async (userEmail: string): Promise<boolean> => {
  if (!userEmail) return false;
  
  try {
    // First check if user is already admin
    if (await isUserAdmin(userEmail)) {
      console.log(`User ${userEmail} is already an admin.`);
      return true;
    }
    
    // Add to admins collection
    const adminsCollection = collection(firestore, 'admins');
    await addDoc(adminsCollection, {
      email: userEmail,
      createdAt: new Date()
    });
    
    console.log(`User ${userEmail} has been made an admin.`);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
};

export const assignRoleToUser = async (userId: string, role: string): Promise<void> => {
  const userRoleRef = doc(db, 'userRoles', userId);
  await setDoc(userRoleRef, { role, updatedAt: new Date() }, { merge: true });
};
