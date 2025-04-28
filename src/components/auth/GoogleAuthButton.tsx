import React, { useState } from "react";
import { Button, Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { login } from "../../store/slices/authSlice";
import { auth, firestore } from "../firebase";
import GoogleIcon from "@mui/icons-material/Google";

const GoogleAuthButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log("Starting Google sign-in process");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in successful, user:", result.user.email);
      
      if (result.user) {
        const { uid, email, displayName, photoURL } = result.user;
        const userRef = doc(firestore, "users", uid);
        
        // Check if user exists in Firestore
        const userSnapshot = await getDoc(userRef);
        const now = Timestamp.now();
        
        let userData;
        
        if (userSnapshot.exists()) {
          // Update existing user
          console.log("Updating existing user data");
          await setDoc(userRef, {
            lastLogin: now,
            updatedAt: now
          }, { merge: true });
          
          const existingData = userSnapshot.data();
          userData = {
            uid,
            email: email || "",
            displayName,
            photoURL,
            lastLogin: now,
            updatedAt: now,
            createdAt: existingData.createdAt || now,
            isAdmin: existingData.isAdmin || false,
            role: existingData.role || "user"
          };
        } else {
          // Create new user
          console.log("Creating new user data");
          userData = {
            uid,
            email: email || "",
            displayName,
            photoURL,
            lastLogin: now,
            updatedAt: now,
            createdAt: now,
            isAdmin: false,
            role: "user"
          };
          
          await setDoc(userRef, {
            email,
            displayName,
            photoURL,
            lastLogin: now,
            updatedAt: now,
            createdAt: now,
            isAdmin: false,
            role: "user"
          });
        }
        
        console.log("Dispatching login action with user data:", userData);
        dispatch(login(userData));
        
        toast.success("Successfully signed in!");
        console.log("Navigating to dashboard...");
        
        // Use a slight delay to ensure state updates before navigation
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 300);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2, width: "100%" }}>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        startIcon={
          isLoading ? 
          <CircularProgress size={20} color="inherit" /> : 
          <GoogleIcon sx={{ color: "#4285F4" }} />
        }
        sx={{
          py: 1,
          color: "#757575",
          borderColor: "#dadce0",
          "&:hover": {
            borderColor: "#bdc1c6",
            backgroundColor: "rgba(66, 133, 244, 0.04)",
          },
        }}
      >
        <Typography variant="button" sx={{ ml: 1 }}>
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </Typography>
      </Button>
    </Box>
  );
};

export default GoogleAuthButton;