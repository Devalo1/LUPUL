import React, { useState, useEffect } from "react";
import { getTherapyResponse } from "../../services/openaiService";
import { useNavigate } from "react-router-dom";
import { getAIAssistantName } from "../../utils/aiNameUtils";
import { useAuth } from "../../contexts/AuthContext";
import "../../assets/styles/terapie-chat.css";

const Terapie: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "Ești un terapeut virtual empatic și profesionist. Oferă răspunsuri personalizate și suportive.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Încarcă profilul utilizatorului și setările AI
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          // Logare pentru debug
          console.log("User loaded:", user.uid);
        } catch (error) {
          console.error("Eroare la încărcarea datelor utilizatorului:", error);
        }
      }
    };

    loadUserData();
  }, [user]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    try {
      // Folosește profilul "general" cu configurările sale specifice
      const aiResponse = await getTherapyResponse(
        newMessages,
        "general",
        undefined,
        user?.uid
      );
      setMessages([...newMessages, { role: "assistant", content: aiResponse }]);
    } catch (err) {
      setError("A apărut o eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="terapie-chat-container">
      <div className="terapie-chat-inner">
        <div className="terapie-chat-header">
          <h2>Terapie AI Personalizată</h2>
          <p>Alege tipul de terapie care ți se potrivește cel mai bine</p>
        </div>

        <div className="terapie-nav-row">
          <button
            className="terapie-nav-btn-psihica"
            onClick={() => navigate("/terapie/psihica")}
          >
            🧠 Terapie Psihică
          </button>
          <button
            className="terapie-nav-btn-fizica"
            onClick={() => navigate("/terapie/fizica")}
          >
            💪 Terapie Fizică
          </button>
        </div>

        <div className="terapie-chat-box">
          {messages
            .filter((m) => m.role !== "system")
            .map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.role === "user"
                    ? "terapie-chat-msg user"
                    : "terapie-chat-msg ai"
                }
              >
                <b>
                  {msg.role === "user"
                    ? "Tu"
                    : getAIAssistantName(undefined, {
                        name: user?.displayName || undefined,
                      })}
                </b>
                {msg.content}
              </div>
            ))}
          {loading && (
            <div className="terapie-loading">
              <span>Se generează răspunsul</span>
              <div className="terapie-loading-dots">
                <div className="terapie-loading-dot"></div>
                <div className="terapie-loading-dot"></div>
                <div className="terapie-loading-dot"></div>
              </div>
            </div>
          )}
          {error && <div className="terapie-chat-error">{error}</div>}
        </div>

        <div className="terapie-chat-input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Întreabă-mă orice despre sănătatea ta..."
            className="terapie-chat-input"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            {loading ? "Se trimite..." : "Trimite"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terapie;
