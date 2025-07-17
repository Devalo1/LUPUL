import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
} from "@mui/material";
import {
  Psychology as PsychologyIcon,
  LocalPharmacy as PharmacyIcon,
  Storage as StorageIcon,
  Emergency as EmergencyIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const MedicalSystemDashboard: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Asistent Medical AI",
      description:
        "Dr. Lupul - Conversații inteligente despre sănătate, analiză simptome și recomandări personalizate",
      path: "/medical/assistant",
      color: "primary",
      benefits: [
        "Disponibil 24/7",
        "Răspunsuri în română",
        "Detectare urgențe",
      ],
    },
    {
      icon: <PharmacyIcon sx={{ fontSize: 40, color: "success.main" }} />,
      title: "Baza de Date Medicamente",
      description:
        "Informații complete despre medicamente românești, dozaje, contraindicații și prețuri",
      path: "/medical/medicines",
      color: "success",
      benefits: [
        "10+ medicamente",
        "Verificare interacțiuni",
        "Prețuri actualizate",
      ],
    },
    {
      icon: <StorageIcon sx={{ fontSize: 40, color: "warning.main" }} />,
      title: "Gestionare Sistem",
      description:
        "Administrare baze de date, inițializare sistem și monitorizare performanță",
      path: "/medical/database",
      color: "warning",
      benefits: [
        "Inițializare automată",
        "Status în timp real",
        "Backup & Restore",
      ],
    },
  ];

  const stats = [
    { label: "Medicamente în DB", value: "10+", icon: <PharmacyIcon /> },
    {
      label: "Interacțiuni verificate",
      value: "5+",
      icon: <CheckCircleIcon />,
    },
    { label: "Categorii medicale", value: "6", icon: <TrendingUpIcon /> },
    { label: "Cunoștințe AI", value: "4+", icon: <PsychologyIcon /> },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EmergencyIcon sx={{ mr: 2, fontSize: 48, color: "error.main" }} />
          Sistem Medical AI
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Platformă inteligentă pentru consultații medicale, gestionarea
          medicamentelor și asistență AI
        </Typography>
        <Chip
          label="Sistem Activ"
          color="success"
          variant="outlined"
          icon={<CheckCircleIcon />}
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Statistici rapide */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {stats.map((stat, index) => (
          <Box key={index} sx={{ flex: "1 1 200px", minWidth: "150px" }}>
            <Card elevation={1}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Box sx={{ color: "primary.main", mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h4" color="primary">
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Alertă informativă */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          🏥 Sistemul Medical AI este complet operațional
        </Typography>
        <Typography variant="body2">
          Toate componentele sunt active și funcționale. Asistentul Dr. Lupul
          poate oferi consultații medicale virtuale, recomandări de medicamente
          și detecta situații de urgență. Sistemul este sigur și respectă
          standardele medicale.
        </Typography>
      </Alert>

      {/* Funcționalități principale */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 4 }}>
        {features.map((feature, index) => (
          <Box key={index} sx={{ flex: "1 1 300px", minWidth: "300px" }}>
            <Card
              elevation={3}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    {feature.title}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {feature.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {feature.benefits.map((benefit, idx) => (
                    <Chip
                      key={idx}
                      label={benefit}
                      size="small"
                      color={
                        feature.color === "primary"
                          ? "primary"
                          : feature.color === "success"
                            ? "success"
                            : "warning"
                      }
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  color={
                    feature.color === "primary"
                      ? "primary"
                      : feature.color === "success"
                        ? "success"
                        : "warning"
                  }
                  fullWidth
                  size="large"
                  onClick={() => navigate(feature.path)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  Acces {feature.title}
                </Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Funcționalități avansate */}
      <Card
        sx={{
          mt: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            🚀 Funcționalități Avansate AI
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ flex: "1 1 300px" }}>
              <Typography variant="subtitle1" gutterBottom>
                🧠 Inteligență Artificială
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                • Procesare limbaj natural în română
                <br />
                • Analiză sentiment și emoții
                <br />
                • Învățare din conversații
                <br />• Personalizare recomandări
              </Typography>
            </Box>
            <Box sx={{ flex: "1 1 300px" }}>
              <Typography variant="subtitle1" gutterBottom>
                🛡️ Siguranță și Validare
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                • Verificare interacțiuni medicamentoase
                <br />
                • Detectare automată urgențe
                <br />
                • Validare doze și contraindicații
                <br />• Escaladare către medici
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              color="inherit"
              onClick={() => navigate("/medical/assistant")}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
              }}
            >
              Începe Consultația
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate("/medical/database")}
              sx={{
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Configurare Sistem
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Footer cu informații importante */}
      <Alert severity="warning" sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          ⚠️ Disclaimer Medical Important
        </Typography>
        <Typography variant="body2">
          Acest sistem AI oferă informații cu scop educativ și nu înlocuiește
          consultul medical profesional. În situații de urgență, contactați
          imediat serviciul 112 sau medicul dumneavoastră.
        </Typography>
      </Alert>
    </Box>
  );
};

export default MedicalSystemDashboard;
