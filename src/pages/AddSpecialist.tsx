import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Box, TextField, Button, Typography, Paper, MenuItem, CircularProgress, Alert } from "@mui/material";
import { GridItem, GridContainer, GridContainerItem } from "../components/common/GridComponents";

interface SpecialistData {
  uid: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  bio: string;
  availability: string;
  imageUrl: string;
  status: "active" | "inactive" | "pending";
  createdAt: number;
}

const AddSpecialist: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [specialist, setSpecialist] = useState<Partial<SpecialistData>>({
    uid: "",
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    bio: "",
    availability: "",
    imageUrl: "",
    status: "active"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSpecialist({
      ...specialist,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validare simplă
    if (!specialist.name || !specialist.email || !specialist.specialization) {
      setError("Completați toate câmpurile obligatorii");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Adăugăm timestamp-ul de creare
      const specialistToAdd = {
        ...specialist,
        createdAt: Date.now()
      } as SpecialistData;
      
      // Adăugăm documentul nou în colecția specialists
      await addDoc(collection(db, "specialists"), specialistToAdd);
      
      setSuccess(true);
      // După adăugare, redirecționăm înapoi la lista de specialiști după o scurtă pauză
      setTimeout(() => {
        navigate("/admin/specialists");
      }, 2000);
    } catch (err) {
      console.error("Eroare la adăugarea specialistului:", err);
      setError("Eroare la salvarea datelor. Încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Adăugare specialist nou
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Specialistul a fost adăugat cu succes!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <GridContainer spacing={3}>
            <GridItem xs={12} md={6}>
              <TextField
                label="ID Utilizator (UID)"
                name="uid"
                value={specialist.uid || ""}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                helperText="ID-ul utilizatorului din Firebase Auth"
              />
            </GridItem>
            
            <GridItem xs={12} md={6}>
              <TextField
                label="Nume și prenume"
                name="name"
                value={specialist.name || ""}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </GridItem>
            
            <GridItem xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={specialist.email || ""}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </GridItem>
            
            <GridItem xs={12} md={6}>
              <TextField
                label="Telefon"
                name="phone"
                value={specialist.phone || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </GridItem>
            
            <GridItem xs={12} md={6}>
              <TextField
                label="Specializare"
                name="specialization"
                value={specialist.specialization || ""}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </GridItem>
            
            <GridItem xs={12} md={6}>
              <TextField
                label="Experiență"
                name="experience"
                value={specialist.experience || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                helperText="Ex: 5 ani"
              />
            </GridItem>
            
            <GridItem xs={12} md={6}>
              <TextField
                select
                label="Status"
                name="status"
                value={specialist.status || "active"}
                onChange={handleChange}
                fullWidth
                margin="normal"
              >
                <MenuItem value="active">Activ</MenuItem>
                <MenuItem value="inactive">Inactiv</MenuItem>
                <MenuItem value="pending">În așteptare</MenuItem>
              </TextField>
            </GridItem>
            
            <GridContainerItem xs={12}>
              <TextField
                label="URL imagine profil"
                name="imageUrl"
                value={specialist.imageUrl || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                helperText="Link către o imagine de profil"
              />
            </GridContainerItem>
            
            <GridContainerItem xs={12}>
              <TextField
                label="Biografie"
                name="bio"
                value={specialist.bio || ""}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                helperText="O scurtă biografie profesională"
              />
            </GridContainerItem>
            
            <GridContainerItem xs={12}>
              <TextField
                label="Disponibilitate"
                name="availability"
                value={specialist.availability || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                helperText="Exemplu: Luni-Vineri: 9:00-17:00"
              />
            </GridContainerItem>
            
            <GridItem xs={12} sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Adaugă specialist"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/admin/specialists")}
              >
                Anulează
              </Button>
            </GridItem>
          </GridContainer>
        </form>
      </Paper>
    </Box>
  );
};

export default AddSpecialist;