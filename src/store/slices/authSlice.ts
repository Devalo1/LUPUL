import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../models/User";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Check localStorage for persisted state
const persistedUser = localStorage.getItem("authUser");
const initialUser = persistedUser ? JSON.parse(persistedUser) : null;

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      
      // Persist user in localStorage
      localStorage.setItem("authUser", JSON.stringify(action.payload));
      
      console.log("Auth state updated: User is authenticated", action.payload.email);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      
      // Clear persisted state
      localStorage.removeItem("authUser");
      
      console.log("Auth state updated: User logged out");
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { login, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;