import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import {
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { databaseInitializationService } from "../services/databaseInitializationService";
import { intelligentAIService } from "../services/intelligentAIService";
import toast from "react-hot-toast";

interface DatabaseStatus {
  medicines: number;
  interactions: number;
  knowledgeEntries: number;
}

const DatabaseManagement: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatus>({
    medicines: 0,
    interactions: 0,
    knowledgeEntries: 0,
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [initProgress, setInitProgress] = useState(0);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const dbStatus =
        await databaseInitializationService.checkDatabaseStatus();
      setStatus(dbStatus);
    } catch (error) {
      console.error("Error checking database status:", error);
      toast.error("Eroare la verificarea statusului bazei de date");
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setInitializing(true);
    setInitProgress(0);

    try {
      // Simulează progresul pentru feedback vizual
      const progressInterval = setInterval(() => {
        setInitProgress((prev) => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 500);

      await databaseInitializationService.initializeAllDatabases();
      await intelligentAIService.initializeAssistant();

      clearInterval(progressInterval);
      setInitProgress(100);

      toast.success("Baza de date a fost inițializată cu succes!");
      await checkStatus();
    } catch (error) {
      console.error("Error initializing database:", error);
      toast.error("Eroare la inițializarea bazei de date");
    } finally {
      setInitializing(false);
      setInitProgress(0);
    }
  };

  const resetDatabase = async () => {
    setResetDialog(false);
    setLoading(true);

    try {
      await databaseInitializationService.resetDatabase();
      toast.success("Baza de date a fost resetată");
      await checkStatus();
    } catch (error) {
      console.error("Error resetting database:", error);
      toast.error("Eroare la resetarea bazei de date");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (count: number) => {
    if (count === 0) return "error";
    if (count < 10) return "warning";
    return "success";
  };

  const getStatusIcon = (count: number) => {
    if (count === 0) return <WarningIcon />;
    if (count < 10) return <InfoIcon />;
    return <CheckIcon />;
  };

  const isFullyInitialized =
    status.medicines > 0 &&
    status.interactions > 0 &&
    status.knowledgeEntries > 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <StorageIcon sx={{ mr: 2 }} />
        Gestionare Baze de Date Medicale
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Administrează bazele de date pentru medicamentele, interacțiunile
        medicamentoase și cunoștințele AI.
      </Typography>

      {/* Status Overview */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {getStatusIcon(status.medicines)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Medicamente
                </Typography>
              </Box>
              <Typography
                variant="h3"
                color={`${getStatusColor(status.medicines)}.main`}
              >
                {loading ? <CircularProgress size={40} /> : status.medicines}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Medicamente în baza de date
              </Typography>
              <Chip
                label={status.medicines === 0 ? "Neinițializat" : "Activ"}
                color={getStatusColor(status.medicines)}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {getStatusIcon(status.interactions)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Interacțiuni
                </Typography>
              </Box>
              <Typography
                variant="h3"
                color={`${getStatusColor(status.interactions)}.main`}
              >
                {loading ? <CircularProgress size={40} /> : status.interactions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interacțiuni medicamentoase
              </Typography>
              <Chip
                label={status.interactions === 0 ? "Neinițializat" : "Activ"}
                color={getStatusColor(status.interactions)}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {getStatusIcon(status.knowledgeEntries)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Cunoștințe AI
                </Typography>
              </Box>
              <Typography
                variant="h3"
                color={`${getStatusColor(status.knowledgeEntries)}.main`}
              >
                {loading ? (
                  <CircularProgress size={40} />
                ) : (
                  status.knowledgeEntries
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intrări în baza de cunoștințe
              </Typography>
              <Chip
                label={
                  status.knowledgeEntries === 0 ? "Neinițializat" : "Activ"
                }
                color={getStatusColor(status.knowledgeEntries)}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Status Alert */}
      {!isFullyInitialized && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Baza de date nu este complet inițializată
          </Typography>
          <Typography variant="body2">
            Pentru funcționarea optimă a asistentului medical AI, este necesar
            să inițializați toate bazele de date. Aceasta va adăuga medicamente,
            interacțiuni și cunoștințe medicale esențiale.
          </Typography>
        </Alert>
      )}

      {isFullyInitialized && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Baza de date este complet inițializată
          </Typography>
          <Typography variant="body2">
            Toate componentele sunt active și funcționale. Asistentul medical AI
            are acces la informații complete.
          </Typography>
        </Alert>
      )}

      {/* Progress Indicator */}
      {initializing && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Inițializare în curs...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={initProgress}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {initProgress < 30 && "Inițializare medicamente..."}
              {initProgress >= 30 &&
                initProgress < 60 &&
                "Configurare interacțiuni medicamentoase..."}
              {initProgress >= 60 &&
                initProgress < 90 &&
                "Populare baza de cunoștințe AI..."}
              {initProgress >= 90 && "Finalizare..."}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          size="large"
          onClick={initializeDatabase}
          disabled={initializing || loading}
          startIcon={
            initializing ? <CircularProgress size={20} /> : <StorageIcon />
          }
        >
          {isFullyInitialized
            ? "Reinițializează Baza de Date"
            : "Inițializează Baza de Date"}
        </Button>

        <Button
          variant="outlined"
          size="large"
          onClick={checkStatus}
          disabled={loading || initializing}
          startIcon={<RefreshIcon />}
        >
          Verifică Status
        </Button>

        {isFullyInitialized && (
          <Button
            variant="outlined"
            color="error"
            size="large"
            onClick={() => setResetDialog(true)}
            disabled={loading || initializing}
            startIcon={<WarningIcon />}
          >
            Resetează Baza de Date
          </Button>
        )}
      </Box>

      {/* Database Content Preview */}
      {isFullyInitialized && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Conținut Bază de Date
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <Typography variant="subtitle2" color="primary">
                  Categorii Medicamente:
                </Typography>
                <Typography variant="body2">
                  • Analgezice și Antipiretice
                  <br />
                  • Antibiotice
                  <br />
                  • Medicamente Respiratorii
                  <br />
                  • Medicamente Digestive
                  <br />
                  • Medicamente Cardiovasculare
                  <br />• Suplimente și Vitamine
                </Typography>
              </Box>
              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <Typography variant="subtitle2" color="primary">
                  Tipuri Interacțiuni:
                </Typography>
                <Typography variant="body2">
                  • Interacțiuni severe
                  <br />
                  • Interacțiuni moderate
                  <br />
                  • Interacțiuni ușoare
                  <br />
                  • Contraindicații
                  <br />• Avertismente speciale
                </Typography>
              </Box>
              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <Typography variant="subtitle2" color="primary">
                  Cunoștințe AI:
                </Typography>
                <Typography variant="body2">
                  • Mapare simptome-medicamente
                  <br />
                  • Protocoale de urgență
                  <br />
                  • Ghiduri de dozare
                  <br />
                  • Avertismente de siguranță
                  <br />• Recomandări personalizate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>Confirmare Resetare</DialogTitle>
        <DialogContent>
          <Typography>
            Sunteți sigur că doriți să resetați complet baza de date? Această
            acțiune va șterge toate medicamentele, interacțiunile și
            cunoștințele AI.
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            Această acțiune nu poate fi anulată!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>Anulează</Button>
          <Button onClick={resetDatabase} color="error" variant="contained">
            Resetează
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DatabaseManagement;
