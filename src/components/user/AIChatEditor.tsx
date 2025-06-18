// AI Chat Editor - Editor minimalist cu istoric conversații
import React, { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaCog,
  FaHistory,
  FaPlus,
  FaTimes,
  FaTrash,
  FaExpandArrowsAlt
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { conversationManagerService, Conversation, ConversationMessage } from "../../services/conversationManagerService";
import { userAIProfileService, UserAIProfile } from "../../services/userAIProfileService";
import { getTherapyResponse } from "../../services/openaiService";
import AIAdvancedSettingsPanel from "./AIAdvancedSettingsPanel";
import "./AIChatEditor.css";

interface AIChatEditorProps {
  aiType?: "psihica" | "fizica" | "general";
  initialPrompt?: string;
  onMinimize?: () => void;
}

const AIChatEditor: React.FC<AIChatEditorProps> = ({
  aiType = "general",
  initialPrompt,
  onMinimize
}) => {
  const { user } = useAuth();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState(initialPrompt || "");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState<UserAIProfile | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
      loadConversations();
    }
  }, [user?.uid, aiType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentConversation) {
      setMessages(currentConversation.messages);
      setBackgroundImage(currentConversation.backgroundImage || userProfile?.backgroundImage || "");
    }
  }, [currentConversation, userProfile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const loadUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const profile = await userAIProfileService.getActiveProfileConfig(
        user.uid, 
        aiType === "general" ? "psihica" : aiType
      );
      if (profile) {
        setUserProfile(profile);
        setBackgroundImage(profile.backgroundImage || "");
      }
    } catch (error) {
      console.error("Eroare la încărcarea profilului:", error);
    }
  };

  const loadConversations = async () => {
    if (!user?.uid) return;

    try {
      const userConversations = await conversationManagerService.getUserConversations(user.uid, 20);
      const filteredConversations = userConversations.filter(conv => conv.aiType === aiType);
      setConversations(filteredConversations);

      // Încarcă ultima conversație activă
      if (filteredConversations.length > 0) {
        setCurrentConversation(filteredConversations[0]);
      }
    } catch (error) {
      console.error("Eroare la încărcarea conversațiilor:", error);
    }
  };

  const createNewConversation = async () => {
    if (!user?.uid) return;

    try {
      const conversationId = await conversationManagerService.createConversation(
        user.uid,
        aiType,
        backgroundImage
      );
      
      const newConversation = await conversationManagerService.getConversation(conversationId);
      if (newConversation) {
        setCurrentConversation(newConversation);
        setMessages([]);
        await loadConversations();
      }
    } catch (error) {
      console.error("Eroare la crearea conversației:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation || loading) return;

    setLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage("");

    try {
      // Adaugă mesajul utilizatorului
      const userMsg: ConversationMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: new Date()
      };

      await conversationManagerService.addMessage(currentConversation.id, {
        role: userMsg.role,
        content: userMsg.content
      });

      // Actualizează mesajele local
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      // Generează răspunsul AI
      const messageHistory = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));      const aiResponse = await getTherapyResponse(
        messageHistory,
        aiType === "general" ? "psihica" : aiType,
        undefined,
        user?.uid
      );

      // Adaugă răspunsul AI
      const aiMsg: ConversationMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      };

      await conversationManagerService.addMessage(currentConversation.id, {
        role: aiMsg.role,
        content: aiMsg.content
      });

      setMessages([...updatedMessages, aiMsg]);
      
      // Reîncarcă conversațiile pentru a actualiza titlurile
      await loadConversations();
    } catch (error) {
      console.error("Eroare la trimiterea mesajului:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setShowHistory(false);
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Sigur vrei să ștergi această conversație?")) return;

    try {
      await conversationManagerService.deleteConversation(conversationId);
      await loadConversations();
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Eroare la ștergerea conversației:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleProfileUpdate = (updatedProfile: UserAIProfile) => {
    setUserProfile(updatedProfile);
    setBackgroundImage(updatedProfile.backgroundImage || "");
    setShowSettings(false);
  };

  if (isMinimized) {
    return (
      <div className="ai-chat-minimized">
        <button
          onClick={() => setIsMinimized(false)}
          className="minimize-button"
        >
          <FaExpandArrowsAlt />
          AI Chat
        </button>
      </div>
    );
  }  // Set CSS custom property for background image
  useEffect(() => {
    if (backgroundImage) {
      document.documentElement.style.setProperty("--chat-background-image", `url(${backgroundImage})`);
    } else {
      document.documentElement.style.removeProperty("--chat-background-image");
    }
  }, [backgroundImage]);

  return (
    <>
      <div 
        className={`ai-chat-editor ${backgroundImage ? "with-background" : ""}`}
      >
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`header-button ${showHistory ? "active" : ""}`}
              title="Istoric conversații"
            >
              <FaHistory />
            </button>
            <button
              onClick={createNewConversation}
              className="header-button"
              title="Conversație nouă"
            >
              <FaPlus />
            </button>
          </div>

          <div className="header-center">
            <h3>{currentConversation?.title || "AI Chat"}</h3>
            <span className="ai-type">{aiType === "psihica" ? "Psihic" : aiType === "fizica" ? "Fizic" : "General"}</span>
          </div>

          <div className="header-right">
            <button
              onClick={() => setShowSettings(true)}
              className="header-button"
              title="Setări AI"
            >
              <FaCog />
            </button>
            {onMinimize && (
              <button
                onClick={() => setIsMinimized(true)}
                className="header-button"
                title="Minimizează"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="history-sidebar">
            <div className="history-header">
              <h4>Istoric Conversații</h4>              <button
                onClick={() => setShowHistory(false)}
                className="close-history"
                title="Închide istoric"
              >
                <FaTimes />
              </button>
            </div>
            <div className="conversations-list">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${currentConversation?.id === conv.id ? "active" : ""}`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="conversation-title">{conv.title}</div>
                  <div className="conversation-date">
                    {new Date(
                      conv.updatedAt instanceof Date 
                        ? conv.updatedAt 
                        : conv.updatedAt.toDate()
                    ).toLocaleDateString("ro-RO")}
                  </div>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="delete-conversation"
                    title="Șterge conversația"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="no-conversations">
                  Nu există conversații încă
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="chat-messages">
          {!currentConversation ? (
            <div className="no-conversation">
              <div className="welcome-message">
                <h2>Bun venit la AI Chat!</h2>
                <p>Creează o conversație nouă pentru a începe să vorbești cu AI-ul.</p>
                <button
                  onClick={createNewConversation}
                  className="create-conversation-btn"
                >
                  <FaPlus />
                  Începe o conversație
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.role === "user" ? "user-message" : "ai-message"}`}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {new Date(
                      message.timestamp instanceof Date 
                        ? message.timestamp 
                        : message.timestamp.toDate()
                    ).toLocaleTimeString("ro-RO", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message ai-message">
                  <div className="message-content typing">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {currentConversation && (
          <div className="chat-input">
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Scrie un mesaj pentru AI-ul ${aiType}...`}
                className="message-input"
                rows={1}
                disabled={loading}
              />              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                className="send-button"
                title="Trimite mesaj"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <AIAdvancedSettingsPanel
          onClose={() => setShowSettings(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </>
  );
};

export default AIChatEditor;
