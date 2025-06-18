// User AI Profile Service for managing personalized AI therapy settings
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  Timestamp 
} from "firebase/firestore";
import { firestore } from "../firebase";

export interface UserAIProfile {
  userId: string;
  name?: string;
  age?: number; // Vârsta utilizatorului pentru adaptarea limbajului
  gender?: "masculin" | "feminin" | "neutru";
  expressionStyle?: "profesional" | "prietenos" | "casual";
  therapyType: "psihica" | "fizica" | "general";
  backgroundImage?: string; // Poza de fundal pentru editor
  totalConversations?: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export const userAIProfileService = {  // Create profile from AI settings for "general" type
  async createProfileFromAISettings(userId: string): Promise<UserAIProfile | null> {
    try {
      // Load AI settings from localStorage specific pentru utilizator
      const userPrefix = `user_${userId}_`;
      const age = localStorage.getItem(`${userPrefix}ai_user_age`) || localStorage.getItem("ai_user_age");
      const gender = (localStorage.getItem(`${userPrefix}ai_sex`) || localStorage.getItem("ai_sex")) as "masculin" | "feminin" | "neutru" | null;
      const name = localStorage.getItem(`${userPrefix}ai_name`) || localStorage.getItem("ai_name");
      const conversationStyle = (localStorage.getItem(`${userPrefix}ai_conversationStyle`) || localStorage.getItem("ai_conversationStyle")) as "profesional" | "prietenos" | "casual" | null;
      const backgroundImage = localStorage.getItem(`${userPrefix}ai_avatar`) || localStorage.getItem("ai_avatar");

      // Only create profile if we have personalization data (age or gender)
      if (!age && !gender) return null;

      const profile: UserAIProfile = {
        userId,
        name: name || undefined,
        age: age ? parseInt(age, 10) : undefined,
        gender: gender || "neutru",
        expressionStyle: conversationStyle || "prietenos",
        therapyType: "general",
        backgroundImage: backgroundImage || undefined,
        totalConversations: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the profile to Firebase
      await this.saveUserProfile(profile);
      console.log(`Created general AI profile from settings for user ${userId}`);
      
      return profile;
    } catch (error) {
      console.error("Error creating profile from AI settings:", error);
      return null;
    }
  },

  // Get user's active AI profile configuration
  async getActiveProfileConfig(userId: string, therapyType: "psihica" | "fizica" | "general"): Promise<UserAIProfile | null> {
    try {
      // Try to get the specific profile for the user and therapy type
      const profileId = `${userId}_${therapyType}`;
      const profileRef = doc(firestore, "userAIProfiles", profileId);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const data = profileDoc.data();        return {
          userId: data.userId,
          name: data.name,
          age: data.age,
          gender: data.gender,
          expressionStyle: data.expressionStyle,
          therapyType: data.therapyType,
          backgroundImage: data.backgroundImage,
          totalConversations: data.totalConversations || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      }

      // If no specific profile exists, try to get a general profile for the user
      const generalQuery = query(
        collection(firestore, "userAIProfiles"),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(generalQuery);
      
      if (!querySnapshot.empty) {
        // Return the first profile found (can be adapted for therapy type)
        const doc = querySnapshot.docs[0];
        const data = doc.data();        return {
          userId: data.userId,
          name: data.name,
          age: data.age,
          gender: data.gender,
          expressionStyle: data.expressionStyle,
          therapyType: therapyType, // Use the requested therapy type
          backgroundImage: data.backgroundImage,
          totalConversations: data.totalConversations || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };      }

      // For "general" therapy type, try to create profile from localStorage settings
      if (therapyType === "general") {
        console.log(`Attempting to create general profile from localStorage for user ${userId}`);
        return await this.createProfileFromAISettings(userId);
      }

      console.log(`No AI profile found for user ${userId}, therapy type: ${therapyType}`);
      return null;
    } catch (error) {
      console.error("Error getting AI profile:", error);
      throw error;
    }
  },
  // Generate system prompt based on user profile
  generateSystemPrompt(profile: UserAIProfile | null, defaultPrompt: string): string {
    if (!profile) return defaultPrompt;
    
    let personalizedPrompt = defaultPrompt;
    
    if (profile.name) {
      personalizedPrompt += ` Adresează-te utilizatorului cu numele ${profile.name}.`;
    }
    
    if (profile.age) {
      personalizedPrompt += ` Adaptează limbajul pentru o persoană de ${profile.age} ani. `;
      
      // Adaptare specifică pe vârste
      if (profile.age < 20) {
        personalizedPrompt += `Folosește un limbaj modern, relaxat și prietenos, specific tinerilor. Poți folosi expresii contemporane și un ton mai casual.`;
      } else if (profile.age >= 20 && profile.age < 35) {
        personalizedPrompt += `Folosește un limbaj dinamic, practic și orientat spre soluții, specific tinerilor adulți activi.`;
      } else if (profile.age >= 35 && profile.age < 50) {
        personalizedPrompt += `Folosește un limbaj echilibrat între profesional și personal, orientat spre eficiență și claritate.`;
      } else if (profile.age >= 50 && profile.age < 65) {
        personalizedPrompt += `Folosește un limbaj respectuos, calm și detaliat, cu explicații clare și structurate.`;
      } else if (profile.age >= 65) {
        personalizedPrompt += `Folosește un limbaj foarte respectuos, calm și răbdător, cu explicații pas cu pas și un ton cald.`;
      }
    }
    
    if (profile.gender && profile.gender !== "neutru") {
      personalizedPrompt += ` Adaptează tonul și stilul de comunicare pentru o persoană de gen ${profile.gender}.`;
      
      if (profile.gender === "feminin") {
        personalizedPrompt += ` Folosește un ton mai empatic, cald și înțelegător. Poți fi mai expresiv emoțional.`;
      } else if (profile.gender === "masculin") {
        personalizedPrompt += ` Folosește un ton direct, practic și orientat spre soluții. Fii concis dar prietenos.`;
      }
    }
    
    if (profile.expressionStyle) {
      switch (profile.expressionStyle) {
        case "prietenos":
          personalizedPrompt += ` Folosește un ton prietenos și cald.`;
          break;
        case "casual":
          personalizedPrompt += ` Folosește un limbaj casual și relaxat.`;
          break;
        case "profesional":
        default:
          personalizedPrompt += ` Menține un ton profesional și empatic.`;
          break;
      }
    }
    
    return personalizedPrompt;
  },
  // Update user profile usage statistics
  async updateUsageStats(userId: string, therapyType: "psihica" | "fizica" | "general"): Promise<void> {
    try {
      const profileId = `${userId}_${therapyType}`;
      const profileRef = doc(firestore, "userAIProfiles", profileId);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const currentData = profileDoc.data();
        await updateDoc(profileRef, {
          totalConversations: (currentData.totalConversations || 0) + 1,
          updatedAt: Timestamp.now()
        });
      } else {
        // Create a new profile with basic stats
        await setDoc(profileRef, {
          userId,
          therapyType,
          totalConversations: 1,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }

      console.log(`Updated usage stats for user ${userId}, therapy type: ${therapyType}`);
    } catch (error) {
      console.error("Error updating usage stats:", error);
      throw error;
    }
  },

  // Save or update user AI profile
  async saveUserProfile(profile: UserAIProfile): Promise<void> {
    try {
      const profileId = `${profile.userId}_${profile.therapyType}`;
      const profileRef = doc(firestore, "userAIProfiles", profileId);
        const profileData = {
        userId: profile.userId,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        expressionStyle: profile.expressionStyle,
        therapyType: profile.therapyType,
        backgroundImage: profile.backgroundImage,
        totalConversations: profile.totalConversations || 0,
        updatedAt: Timestamp.now()
      };

      // Check if profile exists to preserve createdAt
      const existingDoc = await getDoc(profileRef);
      if (existingDoc.exists()) {
        await updateDoc(profileRef, profileData);
      } else {
        await setDoc(profileRef, {
          ...profileData,
          createdAt: Timestamp.now()
        });
      }

      console.log(`Saved AI profile for user ${profile.userId}, therapy type: ${profile.therapyType}`);
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  },

  // Get all profiles for a user (across therapy types)
  async getUserProfiles(userId: string): Promise<UserAIProfile[]> {
    try {
      const profileQuery = query(
        collection(firestore, "userAIProfiles"),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(profileQuery);
      const profiles: UserAIProfile[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();        profiles.push({
          userId: data.userId,
          name: data.name,
          age: data.age,
          gender: data.gender,
          expressionStyle: data.expressionStyle,
          therapyType: data.therapyType,
          backgroundImage: data.backgroundImage,
          totalConversations: data.totalConversations || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });

      return profiles;
    } catch (error) {
      console.error("Error getting user profiles:", error);
      throw error;
    }
  },
  // Delete a user profile
  async deleteUserProfile(userId: string, therapyType: "psihica" | "fizica" | "general"): Promise<void> {
    try {
      const profileId = `${userId}_${therapyType}`;
      const profileRef = doc(firestore, "userAIProfiles", profileId);
      
      // Note: Using updateDoc to set a deleted flag instead of actual deletion
      // This preserves data for potential recovery
      await updateDoc(profileRef, {
        deleted: true,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      console.log(`Marked AI profile as deleted for user ${userId}, therapy type: ${therapyType}`);
    } catch (error) {
      console.error("Error deleting user profile:", error);
      throw error;
    }
  }
};