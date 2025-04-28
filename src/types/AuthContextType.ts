import { User } from "./user";

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  currentUser: User | null;
}

export default AuthContextType;