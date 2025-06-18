import React, { useState, useEffect } from "react";
import {
  therapyConversationService,
  TherapyConversation,
} from "../../services/therapyConversationService";
import { useAuth } from "../../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import "./ConversationHistory.css";

interface ConversationHistoryProps {
  onSelectConversation: (conversation: TherapyConversation) => void;
  onNewConversation: () => void;
  currentTherapyType: "psihica" | "fizica" | "general";
  currentConversationId?: string;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onSelectConversation,
  onNewConversation,
  currentTherapyType,
  currentConversationId,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<TherapyConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // Back to normal default

  // Load conversations when component mounts or therapy type changes
  useEffect(() => {
    if (user?.uid) {
      loadConversations();
    }
  }, [user?.uid, currentTherapyType]);

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
    if (content.length > 40) {
      return content.substring(0, 37) + "...";
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
  return (
    <div
      className={`conversation-history ${isExpanded ? "expanded" : "collapsed"}`}
    >
      {/* Always show toggle button */}
      <button
        className="conversation-history-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Minimizează istoricul" : "Expandează istoricul"}
      >
        {!isExpanded ? (
          // Chat icon when collapsed
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        ) : (
          // Close/minimize icon when expanded
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7"
              />
            </svg>
            <span className="toggle-text">Minimizează</span>
          </>
        )}{" "}
      </button>

      {/* Conversation count indicator when collapsed */}
      {!isExpanded && conversations.length > 0 && (
        <div className="conversation-count-badge">{conversations.length}</div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="conversation-history-content">
          {/* Header */}
          <div className="conversation-history-header">
            <h3 className="conversation-history-title">Conversații</h3>
            <button
              onClick={onNewConversation}
              className="new-conversation-btn"
              title="Conversație nouă"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="conversation-history-list">
            {loading && (
              <div className="conversation-history-loading">
                <div className="spinner"></div>
                <p>Se încarcă...</p>
              </div>
            )}
            {error && (
              <div className="conversation-history-error">
                <p>{error}</p>
                <button onClick={loadConversations} className="retry-button">
                  Încearcă din nou
                </button>
              </div>
            )}
            {!loading && !error && conversations.length === 0 && (
              <div className="conversation-history-empty">
                <p>Nu ai conversații salvate.</p>
              </div>
            )}{" "}
            {!loading && !error && conversations.length > 0 && (
              <div className="conversation-list">
                {conversations.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      conversation.id === currentConversationId ? "active" : ""
                    }`}
                    onClick={() => onSelectConversation(conversation)}
                  >
                    <div className="conversation-item-header">
                      <div className="conversation-number">#{index + 1}</div>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="conversation-history-footer">
            <p className="conversation-count">
              {conversations.length} conversații
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;
