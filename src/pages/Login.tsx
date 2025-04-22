import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

const Login: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center" 
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            width: "100%"
          }}
        >
          <Typography component="h1" variant="h5">
            Sign in to your account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            Choose your preferred sign-in method below
          </Typography>
          
          <GoogleAuthButton />
          
          {/* Add other authentication methods here if needed */}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
