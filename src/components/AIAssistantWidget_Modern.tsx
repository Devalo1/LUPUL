import React, { useState, useRef, useEffect, useCallback } from "react";
import "./AIAssistantWidget_Modern.css";
import { useAssistantProfile } from "../contexts/useAssistantProfile";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getAIAssistantName } from "../utils/aiNameUtils";
import { useConversations } from "../hooks/useConversations";
import { conversationService } from "../services/conversationService";
import { Timestamp } from "firebase/firestore";
import { fetchAIResponseSafe } from "../utils/aiApiUtils";
import {
  getMoodHistory,
  getPersonalizedQuickResponses,
  MOOD_OPTIONS,
  QUICK_RESPONSES,
  getTimeBasedGreeting,
  getContextualSuggestions,
  generatePersonalizedInsights,
  type MoodEntry,
} from "../utils/advancedAIFeatures";

// Modern AI Assistant Widget with Gen Z/Millennial appeal
const AIAssistantWidget: React.FC = () => {
  const { profileState } = useAssistantProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    refreshConversations,
  } = useConversations();

  // State management
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);

  // Enhanced state for modern features
  const [unreadCount, setUnreadCount] = useState(0);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [personalizedResponses, setPersonalizedResponses] = useState(
    QUICK_RESPONSES.slice(0, 6)
  );
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>(
    []
  );
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  // Conversations sidebar state
  const [showConversations, setShowConversations] = useState(false);
  const [renamingConvId, setRenamingConvId] = useState<string | null>(null);
  const [quickActions] = useState([
    "💡 Ajută-mă cu o idee creativă",
    "😊 Cum să mă simt mai bine astăzi",
    "🎯 Planuri cool pentru weekend",
    "📚 Vreau să învăț ceva nou și interesant",
    "🎵 Recomandă-mi muzică bună",
    "🎮 Ce activități fun pot face?",
  ]);

  // NEW: Widget positioning and minimization state
  const [isMinimized, setIsMinimized] = useState(false);

  // State pentru loading conversation
  const [loadingConversation, setLoadingConversation] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Minimize/Maximize handlers
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [
    activeConversation?.messages,
    activeConversation?.id,
    aiTyping,
    scrollToBottom,
  ]);

  // Handle input changes with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 100) + "px";
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Enhanced send message with better UX
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setAiTyping(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    let conversationId: string | undefined;

    try {
      // Ensure we have a conversation
      conversationId = activeConversation?.id;

      if (!conversationId) {
        // Create new conversation for first message
        console.log("[AIWidget] Creating new conversation for first message");
        conversationId = await createConversation(
          `Chat ${new Date().toLocaleTimeString()}`
        );

        if (!conversationId) {
          throw new Error("Nu am putut crea conversația");
        }

        console.log(
          `[AIWidget] Conversation created with ID: ${conversationId}`
        );

        // Wait for the context to update
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Verify that activeConversation is set by polling
        let retries = 0;
        let currentActiveConv = activeConversation;
        while (!currentActiveConv?.id && retries < 5) {
          console.log(
            `[AIWidget] Waiting for activeConversation to be set, retry ${retries}`
          );
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Re-fetch conversations to ensure we have the latest state
          await refreshConversations();
          retries++;
        }
      }

      console.log(
        `[AIWidget] Using conversation ID: ${conversationId}, activeConversation exists: ${!!activeConversation}`
      );

      // Add user message directly to the service to ensure it goes to the right conversation
      if (conversationId && user?.uid) {
        await conversationService.addMessage(
          conversationId,
          {
            id: Date.now().toString(),
            content: userMessage,
            sender: "user",
            timestamp: Timestamp.now(),
          },
          user.uid
        );

        console.log(
          `[AIWidget] User message added directly, calling AI with userId: ${user?.uid}`
        );

        const aiReply = await fetchAIResponseSafe(
          userMessage,
          assistantProfile,
          user?.uid
        );

        console.log(`[AIWidget] AI reply received: ${aiReply.slice(0, 50)}...`);

        // Add AI response directly to the service
        await conversationService.addMessage(
          conversationId,
          {
            id: (Date.now() + 1).toString(),
            content: aiReply,
            sender: "ai",
            timestamp: Timestamp.now(),
          },
          user.uid
        );

        // Refresh the conversation in the context
        await refreshConversations();

        console.log("[AIWidget] Messages added successfully");
      } else {
        throw new Error("Nu s-a putut identifica conversația activă");
      }
    } catch (error) {
      console.error("Eroare la trimiterea mesajului:", error);

      // Add error message if we have a conversation
      if (conversationId && user?.uid) {
        try {
          await conversationService.addMessage(
            conversationId,
            {
              id: (Date.now() + 2).toString(),
              content:
                "Îmi pare rău, am întâmpinat o problemă tehnică. Te rog să încerci din nou. 🤖",
              sender: "ai",
              timestamp: Timestamp.now(),
            },
            user.uid
          );
          await refreshConversations();
        } catch (errorMsgError) {
          console.error("Could not add error message:", errorMsgError);
        }
      }
    } finally {
      setLoading(false);
      setAiTyping(false);
    }
  };

  // Handle quick action clicks
  const handleQuickAction = (action: string) => {
    const cleanAction = action.replace(/^[^\s]+\s/, ""); // Remove emoji
    setInput(cleanAction);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle mood selection
  const handleMoodSelect = async (mood: string) => {
    if (user?.uid) {
      setCurrentMood(mood);
      const newMoodEntry: MoodEntry = {
        mood: mood as MoodEntry["mood"],
        timestamp: new Date(),
        intensity: 3, // default intensity
      };

      const updatedHistory = [newMoodEntry, ...moodHistory.slice(0, 6)]; // Keep last 7 entries
      setMoodHistory(updatedHistory);

      // Save to localStorage for persistence
      localStorage.setItem(`moods_${user.uid}`, JSON.stringify(updatedHistory));
    }
  };

  // Handle voice recording (placeholder)
  const handleVoiceToggle = () => {
    setVoiceRecording(!voiceRecording);
    // TODO: Implement actual voice recording
    if (!voiceRecording) {
      // Start recording feedback
      setInput("🎤 Înregistrez...");
      setTimeout(() => {
        setVoiceRecording(false);
        setInput(""); // Clear after recording
      }, 3000);
    } else {
      // Stop recording
      setInput("");
    }
  };

  // Navigate to full AI Messenger
  const handleExpandToMessenger = () => {
    if (location.pathname !== "/ai-messenger") {
      navigate("/ai-messenger");
    }
    setOpen(false);
  };

  // Handle modal toggle
  const toggleModal = () => {
    setOpen(!open);
    if (!open) {
      setUnreadCount(0);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = async (convId: string) => {
    setLoadingConversation(true);

    try {
      // Clear current contextual suggestions when switching conversations
      setContextualSuggestions([]);

      // Clear any pending input
      setInput("");

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      // Set the active conversation
      setActiveConversationId(convId);
      setShowConversations(false); // Close dropdown after selection

      // Force scroll to bottom after a brief delay to ensure messages are loaded
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } finally {
      setLoadingConversation(false);
    }
  };

  // Handle conversation creation
  const handleCreateConversation = async () => {
    // Clear current state when creating new conversation
    setContextualSuggestions([]);
    setInput("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const newConvId = await createConversation("Conversație nouă");
    if (newConvId) {
      setActiveConversationId(newConvId);
      setShowConversations(false); // Close dropdown after creation

      // Scroll to bottom for new conversation
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  // Handle conversation rename
  const handleRenameConversation = async (convId: string, newName: string) => {
    await renameConversation(convId, newName);
    setRenamingConvId(null);
  };

  // Handle conversation delete
  const handleDeleteConversation = async (convId: string) => {
    if (confirm("Sigur vrei să ștergi această conversație?")) {
      await deleteConversation(convId);
    }
  };

  // Show insights periodically
  const handleShowInsights = () => {
    if (moodHistory.length > 0 && activeConversation?.messages) {
      const generatedInsights = generatePersonalizedInsights(
        moodHistory,
        activeConversation.messages.length
      );
      setInsights(generatedInsights);
      setShowInsights(true);

      // Auto-hide after 10 seconds
      setTimeout(() => setShowInsights(false), 10000);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setShowConversations(false); // Also close conversations dropdown
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Auto-hide conversations dropdown when clicking outside widget
  useEffect(() => {
    const handleConversationsClickOutside = (event: MouseEvent) => {
      // Only handle if conversations dropdown is open
      if (showConversations && modalRef.current) {
        const conversationsDropdown = modalRef.current.querySelector(
          ".ai-modern-widget__conversations-dropdown"
        );
        const conversationsToggle = modalRef.current.querySelector(
          ".ai-modern-widget__conversations-toggle"
        );

        // If click is outside both dropdown and toggle button, close dropdown
        if (
          conversationsDropdown &&
          conversationsToggle &&
          !conversationsDropdown.contains(event.target as Node) &&
          !conversationsToggle.contains(event.target as Node)
        ) {
          setShowConversations(false);
        }
      }
    };

    if (open && showConversations) {
      document.addEventListener("mousedown", handleConversationsClickOutside);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleConversationsClickOutside
      );
    };
  }, [open, showConversations]);

  // Simulate notification for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open && unreadCount === 0) {
        setUnreadCount(1);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [open, unreadCount]);

  // Mood tracking effect
  useEffect(() => {
    const fetchMoodHistory = async () => {
      if (user?.uid) {
        const history = getMoodHistory(user.uid);
        setMoodHistory(history);
        if (history && history.length > 0) {
          const latestMood = history[0];
          setCurrentMood(latestMood.mood);
        }
      }
    };

    fetchMoodHistory();
  }, [user?.uid]);

  // Personalized responses effect
  useEffect(() => {
    if (moodHistory.length > 0) {
      const personalized = getPersonalizedQuickResponses(moodHistory);
      setPersonalizedResponses(personalized);
    } else {
      setPersonalizedResponses(QUICK_RESPONSES.slice(0, 6));
    }
  }, [moodHistory]);

  // Contextual suggestions effect - based on last user message
  useEffect(() => {
    if (
      activeConversation?.messages &&
      activeConversation.messages.length > 0
    ) {
      const lastUserMessage = activeConversation.messages
        .filter((msg) => msg.sender === "user")
        .pop();

      if (lastUserMessage) {
        const suggestions = getContextualSuggestions(lastUserMessage.content);
        setContextualSuggestions(suggestions);
      } else {
        setContextualSuggestions([]);
      }
    } else {
      setContextualSuggestions([]);
    }
  }, [activeConversation?.messages, activeConversation?.id]);

  // Reset UI state when modal opens
  useEffect(() => {
    if (open) {
      // Force scroll to bottom when modal opens
      setTimeout(() => {
        scrollToBottom();
      }, 100);

      // Reset any pending rename state
      setRenamingConvId(null);

      // Clear any stale contextual suggestions if no active conversation
      if (!activeConversation) {
        setContextualSuggestions([]);
      }
    }
  }, [open, activeConversation, scrollToBottom]);

  // Don't render widget if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        className="ai-modern-widget__button"
        onClick={toggleModal}
        title={`Chat cu ${assistantName}`}
      >
        <div className="ai-modern-widget__button-content">
          <img
            src={assistantProfile.avatar || "/avatars/ai-assistant.svg"}
            alt={assistantName}
            className="ai-modern-widget__button-img"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiM2NjdlZWEiLz4KPHR4dCB4PSIyMCIgeT0iMjYiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUk8L3R4dD4KPC9zdmc+";
            }}
          />
          {unreadCount > 0 && (
            <div className="ai-modern-widget__notification-badge">
              {unreadCount}
            </div>
          )}
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div className="ai-modern-widget__modal-overlay">
          <div
            className={`ai-modern-widget__modal ${isMinimized ? "minimized" : ""}`}
            ref={modalRef}
          >
            {/* Header */}
            <div className="ai-modern-widget__modal-header">
              <div className="ai-modern-widget__modal-title">
                <button
                  className="ai-modern-widget__conversations-toggle"
                  onClick={() => setShowConversations(!showConversations)}
                  title="Conversații"
                >
                  ☰
                </button>
                <img
                  src={assistantProfile.avatar || "/avatars/ai-assistant.svg"}
                  alt={assistantName}
                  className="ai-modern-widget__modal-title-avatar"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiM2NjdlZWEiLz4KPHR4dCB4PSIyMCIgeT0iMjYiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUk8L3R4dD4KPC9zdmc+";
                  }}
                />
                <div className="ai-modern-widget__modal-title-text">
                  <div className="ai-modern-widget__modal-title-name">
                    {assistantName}
                  </div>
                  <div className="ai-modern-widget__modal-title-status">
                    {aiTyping ? "scrie..." : "online"}
                  </div>
                </div>
              </div>

              <div className="ai-modern-widget__modal-actions">
                {/* Insights Button */}
                {moodHistory.length > 2 && (
                  <button
                    className="ai-modern-widget__action-button ai-modern-widget__insights-button"
                    onClick={handleShowInsights}
                    title="Vezi insights personalizate"
                  >
                    📊
                  </button>
                )}

                {/* Mood Selector */}
                <div className="ai-modern-widget__mood-selector">
                  {MOOD_OPTIONS.slice(0, 4).map((mood) => (
                    <button
                      key={mood.emoji}
                      className={`ai-modern-widget__mood-button ${currentMood === mood.emoji ? "active" : ""}`}
                      onClick={() => handleMoodSelect(mood.emoji)}
                      title={`Mă simt ${mood.label}`}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>

                <button
                  className="ai-modern-widget__action-button"
                  onClick={handleExpandToMessenger}
                  title="Deschide în modul complet"
                >
                  ↗️
                </button>
                <button
                  className="ai-modern-widget__action-button"
                  onClick={handleMinimize}
                  title={isMinimized ? "Expandează" : "Minimizează"}
                >
                  {isMinimized ? "⬆️" : "⬇️"}
                </button>
                <button
                  className="ai-modern-widget__action-button"
                  onClick={() => setOpen(false)}
                  title="Închide"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Conversations Dropdown */}
            {showConversations && (
              <div className="ai-modern-widget__conversations-dropdown">
                <div className="ai-modern-widget__conversations-header">
                  <h4>Conversații</h4>
                  <button
                    className="ai-modern-widget__new-conversation"
                    onClick={handleCreateConversation}
                    title="Conversație nouă"
                  >
                    ➕
                  </button>
                </div>
                <div className="ai-modern-widget__conversations-list">
                  {conversations.length === 0 ? (
                    <div className="ai-modern-widget__no-conversations">
                      <p>Încă nu ai conversații</p>
                      <button
                        className="ai-modern-widget__first-conversation"
                        onClick={handleCreateConversation}
                      >
                        Începe prima conversație
                      </button>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`ai-modern-widget__conversation-item ${
                          activeConversation?.id === conv.id ? "active" : ""
                        }`}
                      >
                        {renamingConvId === conv.id ? (
                          <input
                            type="text"
                            defaultValue={conv.subject}
                            className="ai-modern-widget__rename-input"
                            placeholder="Numele conversației"
                            title="Redenumește conversația"
                            onBlur={(e) =>
                              handleRenameConversation(conv.id, e.target.value)
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleRenameConversation(
                                  conv.id,
                                  e.currentTarget.value
                                );
                              }
                              if (e.key === "Escape") {
                                setRenamingConvId(null);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div
                            className="ai-modern-widget__conversation-content"
                            onClick={() => handleSelectConversation(conv.id)}
                          >
                            <div className="ai-modern-widget__conversation-title">
                              {conv.subject}
                            </div>
                            <div className="ai-modern-widget__conversation-meta">
                              {conv.messages?.length || 0} mesaje
                            </div>
                          </div>
                        )}
                        <div className="ai-modern-widget__conversation-actions">
                          <button
                            className="ai-modern-widget__conversation-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingConvId(conv.id);
                            }}
                            title="Redenumește"
                          >
                            ✏️
                          </button>
                          <button
                            className="ai-modern-widget__conversation-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv.id);
                            }}
                            title="Șterge"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Chat Container - Hidden when minimized */}
            {!isMinimized && (
              <div className="ai-modern-widget__chat-container">
                {/* Loading State */}
                {loadingConversation && (
                  <div className="ai-modern-widget__loading-conversation">
                    <div className="ai-modern-widget__loading-spinner"></div>
                    <span>Se încarcă conversația...</span>
                  </div>
                )}

                {/* Messages */}
                <div className="ai-modern-widget__messages">
                  {!activeConversation?.messages?.length ? (
                    <div className="ai-modern-widget__welcome-message">
                      <div className="ai-modern-widget__message ai-modern-widget__message--ai">
                        <div className="ai-modern-widget__message-content">
                          {getTimeBasedGreeting()} Sunt {assistantName}, AI-ul
                          tău personal. Sunt aici să te ajut cu orice ai nevoie
                          - de la sfaturi și idei, la conversații interesante.
                          Ce te preocupă astăzi? ✨
                        </div>
                      </div>
                    </div>
                  ) : (
                    activeConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`ai-modern-widget__message ai-modern-widget__message--${message.sender}`}
                      >
                        <div className="ai-modern-widget__message-content">
                          {message.content}
                        </div>
                      </div>
                    ))
                  )}

                  {/* AI Typing Indicator */}
                  {aiTyping && (
                    <div className="ai-modern-widget__message ai-modern-widget__message--ai">
                      <div className="ai-modern-widget__typing">
                        <div className="ai-modern-widget__typing-dots">
                          <div className="ai-modern-widget__typing-dot"></div>
                          <div className="ai-modern-widget__typing-dot"></div>
                          <div className="ai-modern-widget__typing-dot"></div>
                        </div>
                        <span>Scriu un răspuns...</span>
                      </div>
                    </div>
                  )}

                  {/* Contextual Suggestions */}
                  {contextualSuggestions.length > 0 &&
                    activeConversation?.messages &&
                    activeConversation.messages.length > 0 && (
                      <div className="ai-modern-widget__suggestions">
                        <div className="ai-modern-widget__suggestions-title">
                          💡 Sugestii:
                        </div>
                        {contextualSuggestions
                          .slice(0, 3)
                          .map((suggestion, index) => (
                            <button
                              key={index}
                              className="ai-modern-widget__suggestion"
                              onClick={() => setInput(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                      </div>
                    )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="ai-modern-widget__input-container">
                  {/* Quick Actions */}
                  {(!activeConversation?.messages?.length ||
                    activeConversation.messages.length < 2) && (
                    <div className="ai-modern-widget__quick-actions">
                      {/* Show personalized responses if available, otherwise default */}
                      {(personalizedResponses.length > 0
                        ? personalizedResponses
                        : quickActions
                      )
                        .slice(0, 6)
                        .map((action, index) => (
                          <button
                            key={index}
                            className="ai-modern-widget__quick-action"
                            onClick={() =>
                              handleQuickAction(
                                typeof action === "string"
                                  ? action
                                  : `${action.emoji} ${action.text}`
                              )
                            }
                          >
                            {typeof action === "string"
                              ? action
                              : `${action.emoji} ${action.text}`}
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Mood Selector */}
                  {currentMood && (
                    <div className="ai-modern-widget__mood-display">
                      <span>Mood-ul tău: {currentMood}</span>
                    </div>
                  )}

                  {/* Input Wrapper */}
                  <div className="ai-modern-widget__input-wrapper">
                    <button
                      className={`ai-modern-widget__voice-button ${voiceRecording ? "ai-modern-widget__voice-button--recording" : ""}`}
                      onClick={handleVoiceToggle}
                      title={
                        voiceRecording
                          ? "Oprește înregistrarea"
                          : "Înregistrează mesaj vocal"
                      }
                    >
                      🎤
                    </button>

                    <textarea
                      ref={inputRef}
                      className="ai-modern-widget__input"
                      value={input}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        voiceRecording
                          ? "Vorbește acum..."
                          : "Scrie un mesaj..."
                      }
                      disabled={loading || voiceRecording}
                      rows={1}
                    />

                    <button
                      className="ai-modern-widget__send-button"
                      onClick={handleSendMessage}
                      disabled={!input.trim() || loading || voiceRecording}
                      title="Trimite mesaj"
                    >
                      {loading ? "..." : "➤"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights Modal */}
      {showInsights && insights.length > 0 && (
        <div className="ai-modern-widget__insights-overlay">
          <div className="ai-modern-widget__insights-modal">
            <div className="ai-modern-widget__insights-header">
              <h3>📊 Insights Personalizate</h3>
              <button
                className="ai-modern-widget__action-button"
                onClick={() => setShowInsights(false)}
              >
                ✕
              </button>
            </div>
            <div className="ai-modern-widget__insights-content">
              {insights.map((insight, index) => (
                <div key={index} className="ai-modern-widget__insight">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantWidget;
