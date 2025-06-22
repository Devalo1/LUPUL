import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useConversations } from "../../hooks/useConversations";
import { useAssistantProfile } from "../../contexts/useAssistantProfile";
import { fetchAIResponseSafe } from "../../utils/aiApiUtils";
import { Timestamp } from "firebase/firestore";
import { Message } from "../../models/Conversation";
import "./AIMessengerAdvanced.css";

const AIMessengerAdvanced: React.FC = () => {
  const { user } = useAuth();
  const { profileState } = useAssistantProfile();
  const assistantProfile = profileState.current;
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

  useEffect(() => {
    // Make the page fullscreen by hiding app layout elements
    document.body.style.overflow = "hidden";
    const root = document.getElementById("root");
    if (root) {
      root.style.height = "100vh";
      root.style.overflow = "hidden";
    }

    return () => {
      // Cleanup when component unmounts
      document.body.style.overflow = "";
      if (root) {
        root.style.height = "";
        root.style.overflow = "";
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, aiTyping]);

  // Set first conversation as active if none selected
  useEffect(() => {
    if (conversations.length > 0 && !activeConversation) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversation, setActiveConversationId]);
  const handleCreateConversation = async () => {
    if (!user?.uid) return;
    const newId = await createConversation("Conversație nouă");
    if (newId) {
      setActiveConversationId(newId);
    }
  };

  const formatTimestamp = (timestamp: Timestamp | Date): string => {
    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else {
      date = timestamp;
    }
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (timestamp: Timestamp | Date): string => {
    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else {
      date = timestamp;
    }
    return date.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetchAIResponseSafe(userMessage, assistantProfile);
      return response;
    } catch (error) {
      console.error("Error generating AI response:", error);
      // Fallback response
      return `Îmi pare rău, am întâmpinat o problemă tehnică. Îți pot răspunde la altă întrebare?`;
    }
  };

  const generateTitle = (userMessage: string): string => {
    // Simple title generation based on first words
    const words = userMessage.toLowerCase().split(" ").slice(0, 3);
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.uid) return;

    const userMessage = input.trim();
    setInput("");

    let convId = activeConversation?.id;

    // Create new conversation if none exists
    if (!convId) {
      convId = await createConversation("Conversație nouă");
      if (!convId) return;
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: userMessage,
      timestamp: Timestamp.now(),
    };

    await addMessage(userMsg);

    // Get AI response
    setAiTyping(true);

    try {
      const aiResponse = await generateAIResponse(userMessage);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: aiResponse,
        timestamp: Timestamp.now(),
      };

      await addMessage(aiMsg);

      // Generate title if this is the first exchange and conversation has no subject
      if (
        activeConversation &&
        (!activeConversation.subject ||
          activeConversation.subject === "Conversație nouă")
      ) {
        const title = generateTitle(userMessage);
        await renameConversation(convId, title);
      }
    } catch (error) {
      console.error("Error in conversation:", error);
    } finally {
      setAiTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  return (
    <div className="ai-messenger-advanced">
      <div className="ai-messenger__container">
        {/* Sidebar */}
        <div className="ai-messenger__sidebar">
          <div className="ai-messenger__sidebar-header">
            <h3>💬 Conversații</h3>{" "}
            <button
              className="ai-messenger__new-btn"
              onClick={handleCreateConversation}
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
                      title={conv.subject || `Conversație #${idx + 1}`}
                    >
                      <div className="ai-messenger__conversation-content">
                        <span className="ai-messenger__conversation-number">
                          {idx + 1}.
                        </span>
                        <span className="ai-messenger__conversation-title">
                          {conv.subject || `Conversație #${idx + 1}`}
                        </span>
                        <div className="ai-messenger__conversation-meta">
                          {" "}
                          <span className="ai-messenger__conversation-date">
                            {formatTimestamp(conv.createdAt)}
                          </span>
                          <span className="ai-messenger__conversation-count">
                            {conv.messages?.length || 0} mesaje
                          </span>
                        </div>
                      </div>
                    </button>
                    <button
                      className="ai-messenger__delete-btn"
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="ai-messenger__main">
          {activeConversation ? (
            <>
              <div className="ai-messenger__header">
                <div className="ai-messenger__header-info">
                  <h2>{activeConversation.subject || "Conversație nouă"}</h2>
                  <span className="ai-messenger__status">🟢 Online</span>
                </div>
                <div className="ai-messenger__header-actions">
                  {" "}
                  <button
                    className="ai-messenger__action-btn"
                    onClick={() => {
                      const newTitle = prompt(
                        "Introdu un titlu nou:",
                        activeConversation.subject
                      );
                      if (newTitle) {
                        renameConversation(activeConversation.id, newTitle);
                      }
                    }}
                    title="Redenumește conversația"
                  >
                    ✏️
                  </button>
                </div>
              </div>

              <div className="ai-messenger__messages">
                {activeConversation.messages.length === 0 ? (
                  <div className="ai-messenger__welcome">
                    <div className="ai-messenger__welcome-icon">🤖</div>
                    <h3>Bun venit la AI Messenger!</h3>
                    <p>
                      Începe o conversație cu asistentul AI. Întreabă orice
                      dorești!
                    </p>
                  </div>
                ) : (
                  activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`ai-messenger__message ai-messenger__message--${message.sender}`}
                    >
                      <div className="ai-messenger__message-content">
                        {message.content}
                      </div>{" "}
                      <div className="ai-messenger__message-time">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  ))
                )}

                {aiTyping && (
                  <div className="ai-messenger__message ai-messenger__message--ai">
                    <div className="ai-messenger__message-content ai-messenger__typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="ai-messenger__input">
                <div className="ai-messenger__input-container">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Scrie mesajul tău aici..."
                    className="ai-messenger__input-field"
                    rows={1}
                    disabled={aiTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || aiTyping}
                    className="ai-messenger__send-btn"
                    title="Trimite mesajul"
                  >
                    {aiTyping ? "⏳" : "📤"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="ai-messenger__no-conversation">
              <div className="ai-messenger__no-conversation-content">
                <div className="ai-messenger__no-conversation-icon">💬</div>
                <h3>Selectează o conversație</h3>
                <p>
                  Alege o conversație din sidebar sau creează una nouă pentru a
                  începe.
                </p>{" "}
                <button
                  className="ai-messenger__create-btn"
                  onClick={handleCreateConversation}
                >
                  Creează prima conversație
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIMessengerAdvanced;
