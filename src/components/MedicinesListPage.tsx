import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  LocalPharmacy as PharmacyIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Medicine } from "../models/Medicine";
import { MedicineService } from "../services/medicineService";

const MedicinesListPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);

  const medicineService = new MedicineService();

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = medicines.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.activeSubstance
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          medicine.producer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [searchTerm, medicines]);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const medicinesList = await medicineService.getAllMedicines();
      setMedicines(medicinesList);
      setFilteredMedicines(medicinesList);
    } catch (error) {
      console.error("Eroare la încărcarea medicamentelor:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<
      string,
      | "primary"
      | "secondary"
      | "success"
      | "error"
      | "warning"
      | "info"
      | "default"
    > = {
      analgezic: "primary",
      antibiotic: "secondary",
      antiinflamator: "success",
      cardiovascular: "error",
      digestiv: "warning",
      respirator: "info",
    };
    return colors[category] || "default";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PharmacyIcon sx={{ mr: 2, fontSize: 40, color: "primary.main" }} />
          Baza de Date Medicamente
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Informații complete despre medicamente românești
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Căutați după nume, substanță activă sau producător..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Găsite {filteredMedicines.length} medicamente din {medicines.length}{" "}
          total
        </Typography>
      </Box>

      {/* Medicines List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredMedicines.map((medicine) => (
          <Card key={medicine.id} elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Header cu nume și preț */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {medicine.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {medicine.producer}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="h6" color="primary">
                      {medicine.price?.toFixed(2)} RON
                    </Typography>
                    <Chip
                      label={medicine.category}
                      color={getCategoryColor(medicine.category)}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* Detalii medicament */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  <Box sx={{ flex: "1 1 300px" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Substanță activă:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {medicine.activeSubstance}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: "1 1 200px" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Forma farmaceutică:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {medicine.form}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: "1 1 200px" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Compoziție:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {medicine.composition.join(", ")}
                    </Typography>
                  </Box>
                </Box>

                {/* Dozaj și indicații */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  <Box sx={{ flex: "1 1 400px" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Dozaj recomandat:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {medicine.dosage.adults}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: "1 1 400px" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Indicații:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {medicine.indications?.join(", ")}
                    </Typography>
                  </Box>
                </Box>

                {/* Contraindicații și efecte adverse */}
                {medicine.contraindications &&
                  medicine.contraindications.length > 0 && (
                    <Alert severity="warning" icon={<WarningIcon />}>
                      <Typography variant="subtitle2" gutterBottom>
                        Contraindicații:
                      </Typography>
                      <Typography variant="body2">
                        {medicine.contraindications.join(", ")}
                      </Typography>
                    </Alert>
                  )}

                {medicine.sideEffects && medicine.sideEffects.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Efecte adverse posibile:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {medicine.sideEffects.join(", ")}
                    </Typography>
                  </Box>
                )}

                {/* Disponibilitate */}
                {medicine.prescription && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <WarningIcon color="warning" fontSize="small" />
                    <Typography variant="body2" color="warning.main">
                      Necesită prescripție medicală
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {filteredMedicines.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <PharmacyIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nu au fost găsite medicamente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Încercați să modificați criteriile de căutare
          </Typography>
        </Box>
      )}

      {/* Footer Info */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          ℹ️ Informații importante
        </Typography>
        <Typography variant="body2">
          Aceste informații sunt furnizate cu scop educativ. Consultați
          întotdeauna medicul sau farmacistul înainte de a utiliza orice
          medicament. Nu întrerupeți sau nu modificați tratamentul fără sfatul
          medical.
        </Typography>
      </Alert>
    </Box>
  );
};

export default MedicinesListPage;
