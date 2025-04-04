export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date | number;
  
  // Personal information
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  
  // Address information
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  
  // Preferences and settings
  preferences?: {
    newsletter?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
  
  // Additional user information
  birthDate?: string;
  occupation?: string;
  interests?: string[];
  bio?: string;
  
  // User activity
  lastLogin?: Date | number;
  isActive?: boolean;
}

export type UserProfile = Omit<User, 'uid'>;
