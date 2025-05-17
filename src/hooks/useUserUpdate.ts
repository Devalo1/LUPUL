import { useState } from "react";
import { firestore } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";

/**
 * Custom hook to update user data in Firestore
 */
export const useUserUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserData = async (
    user: User,
    data: Record<string, any>
  ): Promise<boolean> => {
    if (!user?.uid) {
      setError("No user is authenticated");
      return false;
    }

    setError(null);
    setLoading(true);

    try {
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error updating user data:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setLoading(false);
      return false;
    }
  };

  return {
    updateUserData,
    loading,
    error
  };
};

export default useUserUpdate;
