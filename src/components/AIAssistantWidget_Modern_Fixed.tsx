import React, { useState, useRef, useEffect, useCallback } from "react";
import "./AIAssistantWidget_Modern.css";
import { useAssistantProfile } from "../contexts/useAssistantProfile";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getAIAssistantName } from "../utils/aiNameUtils";
import { useConversations } from "../hooks/useConversations";
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
  // State (redeclared după eliminarea dublurilor)
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [personalizedResponses, setPersonalizedResponses] = useState(
    QUICK_RESPONSES.slice(0, 6)
  );
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([]);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const [quickActions] = useState([
    "💡 Ajută-mă cu o idee creativă",
    "😊 Cum să mă simt mai bine astăzi",
    "🎯 Planuri cool pentru weekend",
    "📚 Vreau să învăț ceva nou și interesant",
    "🎵 Recomandă-mi muzică bună",
    "🎮 Ce activități fun pot face?",
  ]);
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  // Contexts & hooks
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
    addMessage,
  } = useConversations();

  // State management
  const [open, setOpen] = useState(false);
  // (state moved up, dublurile eliminate)

  // Refs

  // Creează automat o conversație nouă la deschiderea widgetului dacă nu există una activă
  useEffect(() => {
    if (open && !activeConversation?.id && user) {
      (async () => {
        const newId = await createConversation(`Chat ${new Date().toLocaleTimeString()}`);
        if (newId) setActiveConversationId(newId);
      })();
    }
  }, [open, activeConversation?.id, user, createConversation, setActiveConversationId]);


  // Refs


  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, aiTyping]);

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

    try {
      // Create conversation if needed
      let conversation = activeConversation;
      if (!conversation) {
        const newConversationId = await createConversation(
          `Chat ${new Date().toLocaleTimeString()}`
        );
        if (newConversationId) {
          setActiveConversationId(newConversationId);
          // Need to refetch the conversation - for now use a simple approach
          conversation = {
            id: newConversationId,
            subject: `Chat ${new Date().toLocaleTimeString()}`,
            messages: [],
            userId: user?.uid || "",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
        }
      }

      if (!conversation) {
        throw new Error("Nu am putut crea conversația");
      }

      // Add user message
      await addMessage({
        id: Date.now().toString(),
        content: userMessage,
        sender: "user",
        timestamp: Timestamp.now(),
      });

      console.log(
        `[AIWidget] Calling fetchAIResponse with userId: ${user?.uid}`
      );

      const aiReply = await fetchAIResponseSafe(
        userMessage,
        assistantProfile,
        user?.uid
      );

      // Add AI response
      await addMessage({
        id: (Date.now() + 1).toString(),
        content: aiReply,
        sender: "ai",
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error("Eroare la trimiterea mesajului:", error);

      // Add error message
      if (activeConversation) {
        await addMessage({
          id: (Date.now() + 1).toString(),
          content:
            "Îmi pare rău, am întâmpinat o problemă tehnică. Te rog să încerci din nou. 🤖",
          sender: "ai",
          timestamp: Timestamp.now(),
        });
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
      setTimeout(() => setVoiceRecording(false), 3000);
    }
  };

  // Navigate to full AI Messenger
  const handleExpandToMessenger = () => {
    if (location.pathname !== "/ai") {
      navigate("/ai");
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
  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
  };

  // Handle conversation creation
  const handleCreateConversation = async () => {
    const newConvId = await createConversation("Conversație nouă");
    if (newConvId) {
      setActiveConversationId(newConvId);
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
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

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
      }
    } else {
      setContextualSuggestions([]);
    }
  }, [activeConversation?.messages]);

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
            src={`/avatars/${assistantProfile.avatar}.png`}
            alt={assistantName}
            className="ai-modern-widget__button-img"
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
          <div className="ai-modern-widget__modal" ref={modalRef}>
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
                  src={`/avatars/${assistantProfile.avatar}.png`}
                  alt={assistantName}
                  className="ai-modern-widget__modal-title-avatar"
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
                        onClick={() => handleSelectConversation(conv.id)}
                      >
                        <div className="ai-modern-widget__conversation-title">
                          {conv.subject}
                        </div>
                        <div className="ai-modern-widget__conversation-meta">
                          {conv.messages?.length || 0} mesaje
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Chat Container */}
            <div className="ai-modern-widget__chat-container">
              {/* Messages */}
              <div className="ai-modern-widget__messages">
                {!activeConversation?.messages?.length ? (
                  <div className="ai-modern-widget__welcome-message">
                    <div className="ai-modern-widget__message ai-modern-widget__message--ai">
                      <div className="ai-modern-widget__message-content">
                        {getTimeBasedGreeting()} Sunt {assistantName}, AI-ul tău
                        personal. Sunt aici să te ajut cu orice ai nevoie - de
                        la sfaturi și idei, la conversații interesante. Ce te
                        preocupă astăzi? ✨
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
                      voiceRecording ? "Vorbește acum..." : "Scrie un mesaj..."
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
