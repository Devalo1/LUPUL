import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAssistantProfile } from "../../contexts/useAssistantProfile";
import { useConversations } from "../../hooks/useConversations";
import { getAIAssistantName } from "../../utils/aiNameUtils";
import { getTherapyResponse } from "../../services/openaiService";
import { Timestamp } from "firebase/firestore";
import "./AIMessenger.css";

// Același serviciu OpenAI ca în widget
async function fetchAIResponse(
  prompt: string,
  assistantProfile: { name: string; addressMode: string }
) {
  try {
    const systemPrompt = `${assistantProfile.name} este un asistent AI personal amabil și profesionist care vorbește română perfect. Oferă sprijin general pentru viața de zi cu zi, organizare, productivitate, dezvoltare personală și rezolvarea problemelor cotidiene.

IMPORTANTE DESPRE GRAMATICA ROMÂNĂ:
- Folosește DOAR gramatica română standard, corectă și impecabilă
- Respectă toate regulile de ortografie și punctuație
- Acordul în gen și număr să fie perfect
- Folosește diacriticele obligatoriu (ă, â, î, ș, ț)
- Verifică de două ori fiecare propoziție înainte de a răspunde
- Folosește forme de plural corecte și conjugări verbale precise
- Evită barbarismele și anglicismele inutile

Folosește modul de adresare: ${assistantProfile.addressMode}. Fii empatic, constructiv și orientat pe soluții practice, dar mai presus de toate, să vorbești româna perfect.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];
    const response = await getTherapyResponse(messages, "general");
    return response || "(Fără răspuns AI)";
  } catch (err) {
    console.error("Eroare la fetchAIResponse:", err);
    return "(Eroare la răspunsul AI. Încearcă din nou mai târziu.)";
  }
}

const AIMessenger: React.FC = () => {
  const { user } = useAuth();
  const { profileState } = useAssistantProfile();
  const assistantProfile = profileState.current;
  const assistantName = getAIAssistantName(
    undefined,
    user ? { name: user.displayName || undefined } : undefined,
    user?.uid
  );
  const {
    conversations,
    activeConversation,
    setActiveConversationId,
    createConversation,
    renameConversation,
    deleteConversation,
    addMessage,
  } = useConversations();

  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, aiTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.uid) return;

    const userMessage = input.trim();
    setInput("");

    try {
      let convId = activeConversation?.id;

      // Create new conversation if none exists
      if (!convId) {
        convId = await createConversation("");
        if (!convId) {
          console.error("Nu s-a putut crea conversația");
          return;
        }
        setActiveConversationId(convId);
      }      // Add user message
      await addMessage({
        id: Date.now().toString(),
        sender: "user",
        content: userMessage,
        timestamp: Timestamp.now(),
      });

      // Get AI response
      setAiTyping(true);
      const aiReply = await fetchAIResponse(userMessage, assistantProfile);
      setAiTyping(false);      // Add AI response
      await addMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: aiReply,
        timestamp: Timestamp.now(),
      });

      // Generate title if this is the first exchange and conversation has no subject
      if (activeConversation && (!activeConversation.subject || activeConversation.subject === "")) {
        console.log("[AIMessenger] Generez titlu automat pentru conversația:", convId);
        
        const titleMessages = [
          {
            role: "system",
            content: "Ești un asistent care creează titluri pentru conversații folosind gramatica română perfectă. Analizează conversația și creează un titlu scurt, relevant și descriptiv în română standard (maxim 5 cuvinte). OBLIGATORIU să folosești diacriticele corecte (ă, â, î, ș, ț) și să respecti toate regulile gramaticale. Răspunde DOAR cu titlul, fără ghilimele sau explicații. Exemplu bun: 'Planificare vacanță în Greece' sau 'Sfaturi pentru productivitate'.",
          },
          {
            role: "user",
            content: `Creează un titlu în română perfectă pentru această conversație:\nUtilizator: "${userMessage}"\nAsistent: "${aiReply}"\n\nTitlu:`,
          },
        ];

        try {
          const generatedTitle = await getTherapyResponse(titleMessages, "general");
          const cleanTitle = generatedTitle?.replace(/['"]/g, "").trim() || "Conversație generală";
          console.log("[AIMessenger] Titlu generat:", cleanTitle);
          await renameConversation(convId, cleanTitle);
        } catch (err) {
          console.error("Eroare la generarea titlului:", err);
          const fallbackTitle = userMessage.slice(0, 30) + (userMessage.length > 30 ? "..." : "");
          await renameConversation(convId, fallbackTitle);
        }
      }
    } catch (error) {
      console.error("Eroare la trimiterea mesajului:", error);
      setAiTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ai-messenger">
      <div className="ai-messenger__container">
        {/* Sidebar */}
        <div className="ai-messenger__sidebar">
          <div className="ai-messenger__sidebar-header">
            <h3>💬 Conversații</h3>
            <button
              className="ai-messenger__new-btn"
              onClick={async () => {
                try {
                  const id = await createConversation("");
                  if (id) {
                    setActiveConversationId(id);
                  }
                } catch (error) {
                  console.error("Eroare la crearea conversației:", error);
                }
              }}
              title="Conversație nouă"
            >
              + Nouă
            </button>
          </div>
          
          <div className="ai-messenger__conversations">
            {conversations.length === 0 ? (
              <div className="ai-messenger__empty">
                <div className="ai-messenger__empty-icon">💭</div>
                <small>Începe prima ta conversație!</small>
              </div>
            ) : (
              <div className="ai-messenger__conversations-list">
                {conversations.map((conv, idx) => (
                  <div
                    key={conv.id}
                    className={`ai-messenger__conversation-item${
                      activeConversation?.id === conv.id ? " active" : ""
                    }`}
                  >
                    <button
                      className="ai-messenger__conversation-btn"
                      onClick={() => setActiveConversationId(conv.id)}
                      title={conv.subject}
                    >
                      <div className="ai-messenger__conversation-content">
                        <span className="ai-messenger__conversation-number">
                          {idx + 1}.
                        </span>
                        <span className="ai-messenger__conversation-title">
                          {conv.subject || `Conversație #${idx + 1}`}
                        </span>
                        <div className="ai-messenger__conversation-meta">
                          <span className="ai-messenger__conversation-date">
                            {new Date(
                              conv.createdAt instanceof Timestamp
                                ? conv.createdAt.toDate()
                                : conv.createdAt || new Date()
                            ).toLocaleDateString("ro-RO", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="ai-messenger__conversation-count">
                            {conv.messages?.length || 0} mesaje
                          </span>
                        </div>
                      </div>
                    </button>
                    <div className="ai-messenger__conversation-actions">
                      <button
                        className="ai-messenger__conversation-action"
                        onClick={() => {
                          const newSubject = prompt(
                            "Numele conversației:",
                            conv.subject || ""
                          );
                          if (newSubject) {
                            renameConversation(conv.id, newSubject);
                          }
                        }}
                        title="Redenumește conversația"
                      >
                        ✏️
                      </button>
                      <button
                        className="ai-messenger__conversation-action"
                        onClick={() => {
                          if (
                            confirm(
                              "Ești sigur că vrei să ștergi această conversație?"
                            )
                          ) {
                            deleteConversation(conv.id);
                          }
                        }}
                        title="Șterge conversația"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="ai-messenger__main">
          <div className="ai-messenger__header">
            <div className="ai-messenger__assistant-info">
              <div className="ai-messenger__assistant-avatar">
                <img
                  src="https://via.placeholder.com/40x40/667eea/ffffff?text=AI"
                  alt={assistantName}
                />
              </div>
              <div className="ai-messenger__assistant-details">
                <h4>{assistantName}</h4>
                <span className="ai-messenger__assistant-status">
                  Asistent AI Personal
                </span>
              </div>
            </div>
          </div>

          <div className="ai-messenger__messages">
            {activeConversation?.messages?.length === 0 ? (
              <div className="ai-messenger__welcome">
                <div className="ai-messenger__welcome-avatar">
                  <img
                    src="https://via.placeholder.com/80x80/667eea/ffffff?text=AI"
                    alt={assistantName}
                  />
                </div>
                <h3>Bună ziua! Sunt {assistantName}</h3>
                <p>
                  Sunt aici să te ajut cu orice întrebări sau sarcini ai.
                  Cum te pot ajuta astăzi?
                </p>
              </div>
            ) : (
              activeConversation?.messages?.map((message) => (                <div
                  key={message.id}
                  className={`ai-messenger__message ai-messenger__message--${message.sender}`}
                >
                  <div className="ai-messenger__message-content">
                    {message.content}
                  </div>
                  <div className="ai-messenger__message-time">
                    {message.timestamp &&
                    message.timestamp instanceof Timestamp
                      ? message.timestamp
                          .toDate()
                          .toLocaleTimeString("ro-RO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                      : ""}
                  </div>
                </div>
              ))
            )}
            {aiTyping && (
              <div className="ai-messenger__message ai-messenger__message--assistant">
                <div className="ai-messenger__typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-messenger__input-area">
            <div className="ai-messenger__input-container">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Scrie un mesaj pentru ${assistantName}...`}
                className="ai-messenger__input"
                rows={1}
                disabled={aiTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || aiTyping}
                className="ai-messenger__send-btn"
                title="Trimite mesajul"
              >
                📤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMessenger;
