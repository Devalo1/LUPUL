import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  LocalPharmacy as PharmacyIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { intelligentAIService } from "../services/intelligentAIService";

import { Medicine } from "../models/Medicine";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestions?: string[];
  medicineRecommendations?: Medicine[];
  riskLevel?: string;
}

const IntelligentMedicalAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedbackDialog, setFeedbackDialog] = useState({
    open: false,
    messageId: "",
  });
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAssistant();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeAssistant = async () => {
    if (!user) return;

    try {
      await intelligentAIService.initializeAssistant();
      const newSessionId = await intelligentAIService.startConversation(
        user.uid
      );
      setSessionId(newSessionId);

      // Mesaj de bun venit
      const welcomeMessage: Message = {
        id: "welcome",
        text: "Salut! Sunt Dr. Lupul, asistentul tău medical inteligent. Sunt aici să te ajut cu întrebări despre sănătate, medicamente și să îți ofer sfaturi medicale. Cu ce te pot ajuta astăzi?",
        sender: "ai",
        timestamp: new Date(),
        suggestions: [
          "Am simptome și vreau sfaturi",
          "Întrebări despre medicamente",
          "Vreau să verific interacțiuni medicamentoase",
          "Sfaturi pentru un stil de viață sănătos",
        ],
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Error initializing assistant:", error);
      toast.error("Eroare la inițializarea asistentului medical");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !sessionId) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Procesează mesajul cu AI-ul
      const aiResponse = await intelligentAIService.processMessage(
        user.uid,
        inputValue,
        sessionId
      );

      // Analizează simptomele dacă sunt menționate
      let medicineRecommendations: Medicine[] = [];
      let riskLevel: string | undefined;

      if (containsSymptoms(inputValue)) {
        try {
          const symptoms = extractSymptoms(inputValue);
          const analysis = await intelligentAIService.analyzeSymptoms(
            symptoms,
            user.uid
          );
          medicineRecommendations = analysis.recommendations;
          riskLevel = analysis.riskLevel;
        } catch (error) {
          console.error("Error analyzing symptoms:", error);
        }
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
        medicineRecommendations:
          medicineRecommendations.length > 0
            ? medicineRecommendations
            : undefined,
        riskLevel,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: "Îmi pare rău, am întâmpinat o problemă tehnică. Te rog să încerci din nou.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Eroare la procesarea mesajului");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const containsSymptoms = (text: string): boolean => {
    const symptomKeywords = [
      "durere",
      "doare",
      "febră",
      "temperatură",
      "tuse",
      "răceală",
      "grip",
      "greață",
      "vomă",
      "diaree",
      "constipație",
      "amețeală",
      "oboseală",
      "insomnie",
      "anxietate",
      "stres",
      "depresie",
    ];

    return symptomKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword)
    );
  };

  const extractSymptoms = (text: string): string[] => {
    const symptomMap: Record<string, string[]> = {
      "durere de cap": ["durere de cap", "cefalee", "migrenă"],
      febră: ["febră", "temperatură", "fierbințeală"],
      tuse: ["tuse", "tușesc", "expectorație"],
      "durere de gât": ["durere de gât", "gât inflamat", "angină"],
      greață: ["greață", "greaţă", "rău"],
      diaree: ["diaree", "scaune moi"],
      constipație: ["constipație", "constipat"],
      amețeală: ["amețeală", "vertij", "ameţeală"],
    };

    const foundSymptoms: string[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(symptomMap).forEach(([symptom, variants]) => {
      if (variants.some((variant) => lowerText.includes(variant))) {
        foundSymptoms.push(symptom);
      }
    });

    return foundSymptoms;
  };

  const handleFeedback = (messageId: string) => {
    setFeedbackDialog({ open: true, messageId });
  };

  const submitFeedback = async () => {
    if (!user || !sessionId) return;

    try {
      await intelligentAIService.submitFeedback(
        user.uid,
        sessionId,
        feedbackRating as 1 | 2 | 3 | 4 | 5,
        "overall_satisfaction",
        `Rating: ${feedbackRating}/5`
      );

      toast.success("Mulțumim pentru feedback!");
      setFeedbackDialog({ open: false, messageId: "" });
      setFeedbackRating(0);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Eroare la trimiterea feedback-ului");
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === "user";

    return (
      <Box
        key={message.id}
        sx={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          mb: 2,
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 2,
            maxWidth: "70%",
            backgroundColor: isUser ? "primary.main" : "grey.100",
            color: isUser ? "white" : "text.primary",
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" sx={{ mb: 1 }}>
            {message.text}
          </Typography>

          {message.riskLevel && (
            <Alert
              severity={
                message.riskLevel === "high"
                  ? "error"
                  : message.riskLevel === "medium"
                    ? "warning"
                    : "info"
              }
              sx={{ mt: 1, fontSize: "0.875rem" }}
            >
              Nivel de risc:{" "}
              {message.riskLevel === "high"
                ? "Înalt"
                : message.riskLevel === "medium"
                  ? "Mediu"
                  : "Scăzut"}
            </Alert>
          )}

          {message.medicineRecommendations &&
            message.medicineRecommendations.length > 0 && (
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PharmacyIcon sx={{ mr: 1 }} />
                    <Typography>
                      Recomandări medicamente (
                      {message.medicineRecommendations.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {message.medicineRecommendations.map((medicine) => (
                    <Paper
                      key={medicine.id}
                      sx={{ p: 2, mb: 1, cursor: "pointer" }}
                      onClick={() => setSelectedMedicine(medicine)}
                    >
                      <Typography variant="subtitle2" color="primary">
                        {medicine.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {medicine.activeSubstance} • {medicine.form}
                      </Typography>
                      <Typography variant="caption">
                        {medicine.indications.slice(0, 2).join(", ")}
                      </Typography>
                      {medicine.prescription && (
                        <Chip
                          label="Necesită prescripție"
                          size="small"
                          color="warning"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Paper>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}

          {message.suggestions && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Sugestii:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {message.suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="small"
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{ cursor: "pointer" }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {!isUser && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                size="small"
                startIcon={<StarIcon />}
                onClick={() => handleFeedback(message.id)}
              >
                Evaluează
              </Button>
            </Box>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            {message.timestamp.toLocaleTimeString()}
          </Typography>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{ p: 2, backgroundColor: "primary.main", color: "white" }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PsychologyIcon sx={{ mr: 2, fontSize: 32 }} />
          <Box>
            <Typography variant="h6">
              Dr. Lupul - Asistent Medical Inteligent
            </Typography>
            <Typography variant="caption">
              Asistent AI pentru consultații medicale și sfaturi despre sănătate
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {messages.map(renderMessage)}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
            <Paper elevation={2} sx={{ p: 2, backgroundColor: "grey.100" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={20} sx={{ mr: 2 }} />
                <Typography>Dr. Lupul gândește...</Typography>
              </Box>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrie mesajul tău aici... (ex: Am durere de cap și febră)"
            disabled={isLoading || !user}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || !user}
            startIcon={<SendIcon />}
          >
            Trimite
          </Button>
        </Box>
      </Paper>

      {/* Medicine Details Dialog */}
      <Dialog
        open={Boolean(selectedMedicine)}
        onClose={() => setSelectedMedicine(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedMedicine && (
          <>
            <DialogTitle>
              {selectedMedicine.name}
              {selectedMedicine.prescription && (
                <Chip
                  label="Prescripție necesară"
                  color="warning"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Substanța activă:</strong>{" "}
                {selectedMedicine.activeSubstance}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                <strong>Forma farmaceutică:</strong> {selectedMedicine.form}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                <strong>Indicații:</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedMedicine.indications.join(", ")}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                <strong>Dozare adulți:</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedMedicine.dosage.adults}
              </Typography>

              {selectedMedicine.contraindications.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom color="error">
                    <WarningIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    <strong>Contraindicații:</strong>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedMedicine.contraindications.join(", ")}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle1" gutterBottom>
                <strong>Preț:</strong> {selectedMedicine.price} RON
              </Typography>

              <Alert severity="info" sx={{ mt: 2 }}>
                Această informație are scop educativ. Consultați întotdeauna un
                medic sau farmacist înainte de a administra orice medicament.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedMedicine(null)}>Închide</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialog.open}
        onClose={() => setFeedbackDialog({ open: false, messageId: "" })}
      >
        <DialogTitle>Evaluează răspunsul</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Cât de util a fost acest răspuns?
          </Typography>
          <Rating
            value={feedbackRating}
            onChange={(_, value) => setFeedbackRating(value || 0)}
            size="large"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setFeedbackDialog({ open: false, messageId: "" })}
          >
            Anulează
          </Button>
          <Button onClick={submitFeedback} disabled={feedbackRating === 0}>
            Trimite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntelligentMedicalAssistant;
