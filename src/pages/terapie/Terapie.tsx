import React, { useState } from "react";
import { getTherapyResponse } from "../../services/openaiService";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/terapie-chat.css";

const Terapie: React.FC = () => {
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

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    try {
      // Folosește profilul "general" cu configurările sale specifice
      const aiResponse = await getTherapyResponse(newMessages, "general");
      setMessages([...newMessages, { role: "assistant", content: aiResponse }]);
    } catch (err) {
      setError("A apărut o eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terapie-chat-container">
      <h2>Terapie AI personalizată</h2>
      <div className="terapie-nav-row">
        <button
          className="terapie-nav-btn-psihica"
          onClick={() => navigate("/terapie/psihica")}
        >
          Terapie psihică
        </button>
        <button
          className="terapie-nav-btn-fizica"
          onClick={() => navigate("/terapie/fizica")}
        >
          Terapie fizică
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
              <b>{msg.role === "user" ? "Tu" : "Terapeut AI"}:</b> {msg.content}
            </div>
          ))}
        {loading && <div>Se generează răspunsul...</div>}
        {error && <div className="terapie-chat-error">{error}</div>}
      </div>
      <div className="terapie-chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Scrie mesajul tău..."
          className="terapie-chat-input"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Trimite
        </button>
      </div>
    </div>
  );
};

export default Terapie;
