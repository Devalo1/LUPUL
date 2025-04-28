import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Box, TextField, Button, Typography, Paper, MenuItem, CircularProgress, Alert } from "@mui/material";
import { GridItem, GridContainer } from "../components/common/GridComponents";

interface SpecialistData {
  id?: string;
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
}

const EditSpecialist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [specialist, setSpecialist] = useState<SpecialistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSpecialist = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "specialists", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSpecialist({ id: docSnap.id, ...docSnap.data() } as SpecialistData);
        } else {
          setError("Specialistul nu a fost găsit");
        }
      } catch (err) {
        console.error("Eroare la încărcarea specialistului:", err);
        setError("Eroare la încărcarea datelor specialistului");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialist();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (specialist) {
      setSpecialist({
        ...specialist,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialist || !id) return;

    try {
      setLoading(true);
      const specialistRef = doc(db, "specialists", id);
      
      const { id: _specialistId, ...specialistData } = specialist;
      
      await updateDoc(specialistRef, specialistData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/specialists");
      }, 2000);
    } catch (err) {
      console.error("Eroare la actualizarea specialistului:", err);
      setError("Eroare la salvarea datelor. Încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !specialist) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !specialist) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate("/admin/specialists")}>
          Înapoi la lista de specialiști
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Editare specialist
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Specialistul a fost actualizat cu succes!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {specialist && (
          <form onSubmit={handleSubmit}>
            <GridContainer spacing={3}>
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
                />
              </GridItem>
              
              <GridItem xs={12} md={6}>
                <TextField
                  select
                  label="Status"
                  name="status"
                  value={specialist.status || "pending"}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="active">Activ</MenuItem>
                  <MenuItem value="inactive">Inactiv</MenuItem>
                  <MenuItem value="pending">În așteptare</MenuItem>
                </TextField>
              </GridItem>
              
              <GridItem xs={12}>
                <TextField
                  label="URL imagine profil"
                  name="imageUrl"
                  value={specialist.imageUrl || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </GridItem>
              
              <GridItem xs={12}>
                <TextField
                  label="Biografie"
                  name="bio"
                  value={specialist.bio || ""}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                />
              </GridItem>
              
              <GridItem xs={12}>
                <TextField
                  label="Disponibilitate"
                  name="availability"
                  value={specialist.availability || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="Exemplu: Luni-Vineri: 9:00-17:00"
                />
              </GridItem>
              
              <GridItem xs={12} sx={{ mt: 2, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Salvează modificările"}
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
        )}
      </Paper>
    </Box>
  );
};

export default EditSpecialist;