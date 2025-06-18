import React, { useState, useEffect } from "react";
import {
  therapyConversationService,
  TherapyConversation,
} from "../../services/therapyConversationService";
import { useAuth } from "../../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import "./ConversationSidebar.css";

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversation: TherapyConversation) => void;
  currentTherapyType: "psihica" | "fizica" | "general";
  currentConversationId?: string;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  currentTherapyType,
  currentConversationId,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<TherapyConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations when sidebar opens
  useEffect(() => {
    if (isOpen && user?.uid) {
      loadConversations();
    }
  }, [isOpen, user?.uid, currentTherapyType]);

  const loadConversations = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      const userConversations =
        await therapyConversationService.getUserConversations(
          user.uid,
          currentTherapyType
        );

      setConversations(userConversations);
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Eroare la încărcarea conversațiilor");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | Timestamp) => {
    let jsDate: Date;

    if (date instanceof Timestamp) {
      jsDate = date.toDate();
    } else {
      jsDate = date;
    }

    const now = new Date();
    const diffMs = now.getTime() - jsDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Acum";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}z`;

    return jsDate.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getLastMessage = (conversation: TherapyConversation): string => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return "Conversație fără mesaje";
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const content = lastMessage.content;

    // Truncate long messages
    if (content.length > 50) {
      return content.substring(0, 47) + "...";
    }

    return content;
  };

  const getConversationTitle = (conversation: TherapyConversation): string => {
    if (conversation.title) {
      return conversation.title;
    }

    // Fallback: generate title from first user message
    const firstUserMessage = conversation.messages?.find(
      (msg) => msg.role === "user"
    );
    if (firstUserMessage) {
      const words = firstUserMessage.content.split(" ").slice(0, 2);
      return words.join(" ") || "Conversație nouă";
    }

    return "Conversație nouă";
  };

  const getTherapyTypeLabel = (
    type: "psihica" | "fizica" | "general"
  ): string => {
    const labels = {
      psihica: "Terapie psihică",
      fizica: "Terapie fizică",
      general: "Conversație generală",
    };
    return labels[type];
  };

  if (!isOpen) return null;

  return (
    <div className="conversation-sidebar-overlay">
      <div className="conversation-sidebar">
        {/* Header */}
        <div className="conversation-sidebar-header">
          <h3 className="conversation-sidebar-title">
            Conversații salvate
            <span className="conversation-sidebar-subtitle">
              {getTherapyTypeLabel(currentTherapyType)}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="conversation-sidebar-close"
            aria-label="Închide lista conversații"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="conversation-sidebar-content">
          {loading && (
            <div className="conversation-sidebar-loading">
              <div className="spinner"></div>
              <p>Se încarcă conversațiile...</p>
            </div>
          )}

          {error && (
            <div className="conversation-sidebar-error">
              <p>{error}</p>
              <button onClick={loadConversations} className="retry-button">
                Încearcă din nou
              </button>
            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="conversation-sidebar-empty">
              <p>
                Nu ai încă conversații salvate pentru{" "}
                {getTherapyTypeLabel(currentTherapyType).toLowerCase()}.
              </p>
              <p>Începe o conversație nouă pentru a o vedea aici!</p>
            </div>
          )}

          {!loading && !error && conversations.length > 0 && (
            <div className="conversation-list">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${
                    conversation.id === currentConversationId ? "active" : ""
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="conversation-item-header">
                    <h4 className="conversation-item-title">
                      {getConversationTitle(conversation)}
                    </h4>
                    <span className="conversation-item-date">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>

                  <p className="conversation-item-preview">
                    {getLastMessage(conversation)}
                  </p>

                  <div className="conversation-item-meta">
                    <span className="message-count">
                      {conversation.messages?.length || 0} mesaje
                    </span>
                    {conversation.aiName && (
                      <span className="ai-name">cu {conversation.aiName}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="conversation-sidebar-footer">
          <p className="conversation-count">
            {conversations.length} conversații găsite
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationSidebar;
