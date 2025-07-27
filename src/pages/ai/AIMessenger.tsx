import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useConversations } from "../../hooks/useConversations";
import { useAssistantProfile } from "../../contexts/useAssistantProfile";
import { fetchAIResponseSafe } from "../../utils/aiApiUtils";
import { getTherapyResponse } from "../../services/openaiService";
import { Timestamp } from "firebase/firestore";
import "./AIMessenger.css";

const fetchAIResponse = fetchAIResponseSafe;

const AIMessenger: React.FC = () => {
  const { user } = useAuth();
  const { profileState } = useAssistantProfile();
  const assistantProfile = profileState.current;
  const assistantName = assistantProfile?.name || "Dum";
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
  const [_forceUpdate, _setForceUpdate] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    console.log(
      "[AIMessenger] Messages changed, scrolling to bottom. Messages count:",
      activeConversation?.messages?.length
    );
    // Force scroll to bottom with a slight delay to ensure DOM update
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);
  }, [activeConversation?.messages, aiTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.uid) return;

    const userMessage = input.trim();
    console.log("[AIMessenger] 🚀 TRIMITE MESAJ:", userMessage);

    // 1. Clear input IMEDIAT pentru feedback vizual instant
    setInput("");
    console.log("[AIMessenger] ✅ Input cleared pentru feedback instant");

    try {
      let convId = activeConversation?.id;
      let isNewConversation = false;

      // Create new conversation if none exists
      if (!convId) {
        console.log("[AIMessenger] Creating new conversation...");
        convId = await createConversation("");
        if (!convId) {
          console.error("Nu s-a putut crea conversația");
          setInput(userMessage); // Restore input on error
          return;
        }
        setActiveConversationId(convId);
        isNewConversation = true;
        console.log("[AIMessenger] New conversation created:", convId);

        // Wait a bit for conversation to be set as active
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(
        "[AIMessenger] 📋 Adding user message to conversation:",
        convId
      );

      // 2. Create user message object
      const userMsg = {
        id: Date.now().toString(),
        sender: "user" as const,
        content: userMessage,
        timestamp: Timestamp.now(),
      };

      console.log("[AIMessenger] 📨 Mesaj utilizator creat:", userMsg);

      // 3. Add user message cu afișare INSTANTANEE în UI
      await addMessage(userMsg);
      console.log("[AIMessenger] ✅ Mesaj utilizator afișat INSTANT în UI");

      // 4. Force scroll pentru a vedea mesajul nou
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 50);

      console.log("[AIMessenger] 🤖 Starting AI response processing...");

      // 5. Set typing indicator AFTER user message is visible
      setAiTyping(true);

      try {
        console.log(
          `[AIMessenger] Calling fetchAIResponse with userId: ${user?.uid}`
        );

        // Gather full conversation history for context
        const historyMessages = activeConversation?.messages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content,
        }));

        const aiReply = await fetchAIResponse(
          userMessage,
          user?.uid,
          assistantProfile,
          historyMessages
        );

        console.log(
          "[AIMessenger] AI response received:",
          aiReply?.substring(0, 100)
        );

        // 6. Add AI response
        await addMessage({
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content: aiReply,
          timestamp: Timestamp.now(),
        });

        console.log("[AIMessenger] ✅ AI response added to conversation");
      } finally {
        setAiTyping(false);
      }

      console.log("[AIMessenger] 🎉 Message exchange completed successfully");

      // Generate title for new conversations after first message exchange
      if (isNewConversation) {
        console.log(
          "[AIMessenger] 🏷️ Generez titlu automat pentru conversația nouă:",
          convId
        );

        const titleMessages = [
          {
            role: "system",
            content:
              "Ești un asistent care creează titluri pentru conversații folosind gramatica română perfectă. Analizează conversația și creează un titlu scurt, relevant și descriptiv în română standard (maxim 5 cuvinte). OBLIGATORIU să folosești diacriticele corecte (ă, â, î, ș, ț) și să respecti toate regulile gramaticale. Răspunde DOAR cu titlul, fără ghilimele sau explicații. Exemplu bun: 'Planificare vacanță în Greece' sau 'Sfaturi pentru productivitate'.",
          },
          {
            role: "user",
            content: `Creează un titlu în română perfectă pentru această conversație cu primul mesaj: "${userMessage}"`,
          },
        ];

        try {
          const generatedTitle = await getTherapyResponse(
            titleMessages,
            "general"
          );
          const cleanTitle =
            generatedTitle?.replace(/['"]/g, "").trim() ||
            "Conversație generală";
          console.log("[AIMessenger] Titlu generat:", cleanTitle);
          await renameConversation(convId, cleanTitle);
        } catch (err) {
          console.error("Eroare la generarea titlului:", err);
          const fallbackTitle =
            userMessage.slice(0, 30) + (userMessage.length > 30 ? "..." : "");
          await renameConversation(convId, fallbackTitle);
        }
      }
    } catch (error) {
      console.error("Eroare la trimiterea mesajului:", error);
      setAiTyping(false);
      setInput(userMessage); // Restore input on error
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
              ➕ Nou
            </button>
          </div>

          <div className="ai-messenger__conversations">
            {conversations.length === 0 ? (
              <div className="ai-messenger__no-conversations">
                <p>Nu există conversații încă.</p>
                <p>Începe o conversație nouă! 🚀</p>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          const newName = prompt(
                            "Introdu un nume nou pentru conversație:",
                            conv.subject
                          );
                          if (newName) {
                            renameConversation(conv.id, newName);
                          }
                        }}
                        title="Redenumește conversația"
                      >
                        ✏️
                      </button>
                      <button
                        className="ai-messenger__conversation-action"
                        onClick={(e) => {
                          e.stopPropagation();
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
            {(() => {
              console.log("[AIMessenger] Conversation state:", {
                hasActiveConversation: !!activeConversation,
                conversationId: activeConversation?.id,
                messagesLength: activeConversation?.messages?.length || 0,
                messages:
                  activeConversation?.messages?.map((m) => ({
                    id: m.id,
                    sender: m.sender,
                    contentPreview: m.content?.substring(0, 30),
                  })) || [],
              });
              return null;
            })()}

            {!activeConversation ||
            activeConversation?.messages?.length === 0 ? (
              <div className="ai-messenger__welcome">
                <div className="ai-messenger__welcome-avatar">
                  <img
                    src="https://via.placeholder.com/80x80/667eea/ffffff?text=AI"
                    alt={assistantName}
                  />
                </div>
                <h3>Bună ziua! Sunt {assistantName}</h3>
                <p>
                  Sunt aici să te ajut cu orice întrebări sau sarcini ai. Cum te
                  pot ajuta astăzi?
                </p>
              </div>
            ) : (
              activeConversation?.messages?.map((message, index) => {
                console.log(
                  `[AIMessenger] Rendering message ${index}:`,
                  message.sender,
                  message.content?.substring(0, 50)
                );
                return (
                  <div
                    key={message.id}
                    className={`ai-messenger__message ai-messenger__message--${message.sender} debug-message`}
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
                );
              })
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
