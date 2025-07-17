import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useConversations } from "../../hooks/useConversations";
import { useAssistantProfile } from "../../contexts/useAssistantProfile";
import { fetchAIResponseSafe } from "../../utils/aiApiUtils";
import { getTherapyResponse } from "../../services/openaiService";
import { VoiceRecorder } from "../../components/VoiceRecorder";
import { MockSpeechToTextService } from "../../services/speechToTextService";
import { Timestamp } from "firebase/firestore";
import "./AIMessenger.css";
import "../../components/VoiceRecorder.css";

const fetchAIResponse = fetchAIResponseSafe;

const AIMessengerAdvanced: React.FC = () => {
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
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [autoSendVoice, setAutoSendVoice] = useState(false);
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
    console.log(
      "[AIMessengerAdvanced] Messages changed, scrolling to bottom. Messages count:",
      activeConversation?.messages?.length
    );

    // Immediate scroll without delay for better responsiveness
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [activeConversation?.messages, aiTyping, forceUpdate]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.uid) return;

    const userMessage = input.trim();
    console.log("[AIMessengerAdvanced] 🚀 ÎNCEPE TRIMITEREA:", userMessage);

    // PRIORITATE MAXIMĂ: Clear input IMEDIAT pentru feedback instant
    setInput("");

    // Force re-render IMEDIAT pentru a arăta că input-ul s-a golit
    setForceUpdate((prev) => prev + 1);

    try {
      let convId = activeConversation?.id;

      // Create new conversation if none exists
      if (!convId) {
        console.log("[AIMessengerAdvanced] Creating new conversation...");
        convId = await createConversation("");
        if (!convId) {
          console.error("Nu s-a putut crea conversația");
          setInput(userMessage); // Restore input on error
          return;
        }
        setActiveConversationId(convId);
        console.log("[AIMessengerAdvanced] New conversation created:", convId);

        // Wait a bit for conversation to be set as active
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Create message object
      const userMsg = {
        id: Date.now().toString(),
        sender: "user" as const,
        content: userMessage,
        timestamp: Timestamp.now(),
      };

      console.log("[AIMessengerAdvanced] 📨 Adding user message...");

      // Add user message with immediate UI update
      await addMessage(userMsg);

      // Force another re-render pentru mesajul adăugat
      setForceUpdate((prev) => prev + 1);

      console.log("[AIMessengerAdvanced] 🤖 Getting AI response...");

      // Set typing indicator AFTER user message is visible
      setAiTyping(true);

      try {
        const aiReply = await fetchAIResponse(
          userMessage,
          assistantProfile,
          user?.uid
        );

        console.log("[AIMessengerAdvanced] ✅ AI response received");

        // Add AI response
        await addMessage({
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content: aiReply,
          timestamp: Timestamp.now(),
        });

        // Final re-render pentru răspunsul AI
        setForceUpdate((prev) => prev + 1);
      } finally {
        setAiTyping(false);
      }

      // Generate title if needed
      if (
        activeConversation &&
        (!activeConversation.subject || activeConversation.subject === "")
      ) {
        const titleMessages = [
          {
            role: "system",
            content:
              "Creează un titlu scurt (maxim 4 cuvinte) pentru această conversație în română.",
          },
          {
            role: "user",
            content: `Titlu pentru: "${userMessage}"`,
          },
        ];

        try {
          const generatedTitle = await getTherapyResponse(
            titleMessages,
            "general"
          );
          const cleanTitle =
            generatedTitle?.replace(/['"]/g, "").trim() || "Conversație";
          await renameConversation(convId, cleanTitle);
        } catch (err) {
          console.error("Eroare la generarea titlului:", err);
        }
      }
    } catch (error) {
      console.error("Eroare la trimiterea mesajului:", error);
      setAiTyping(false);
      setInput(userMessage); // Restore input on error
    }
  };

  const handleAudioRecording = async (audioBlob: Blob) => {
    console.log("🎤 Audio recording received:", audioBlob);
    setIsProcessingAudio(true);

    try {
      console.log("🔄 Processing speech-to-text...");

      // Folosim serviciul mock Speech-to-Text
      const transcriptionResult =
        await MockSpeechToTextService.transcribeAudio(audioBlob);

      console.log("✅ Transcription received:", transcriptionResult);

      if (transcriptionResult.text.trim()) {
        // Setăm textul transcris în input
        setInput(transcriptionResult.text);

        // Afișăm informații despre încrederea transcrierii
        if (transcriptionResult.confidence < 0.9) {
          console.log(
            `⚠️ Low confidence transcription: ${transcriptionResult.confidence}`
          );
        }

        // Opțional: trimite automat mesajul vocal transcris
        if (autoSendVoice && transcriptionResult.confidence > 0.8) {
          // Trimitem automat doar dacă avem încredere mare în transcriere
          setTimeout(() => handleSendMessage(), 1000);
        }
      } else {
        console.warn("🔇 Empty transcription received");
        setInput("[Înregistrare vocală - nu s-a putut transcrie]");
      }
    } catch (error) {
      console.error("❌ Error processing audio:", error);
      const errorMessage = MockSpeechToTextService.getErrorMessage(error);

      // Afișăm eroarea în input pentru feedback utilizator
      setInput(`[Eroare înregistrare: ${errorMessage}]`);

      // Sau poți afișa o notificare
      // alert(errorMessage);
    } finally {
      setIsProcessingAudio(false);
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

            <div className="ai-messenger__header-controls">
              <label className="ai-messenger__auto-send-toggle">
                <input
                  type="checkbox"
                  checked={autoSendVoice}
                  onChange={(e) => setAutoSendVoice(e.target.checked)}
                />
                <span className="ai-messenger__toggle-text">
                  🎤 Trimite automat mesajele vocale
                </span>
              </label>
            </div>
          </div>

          <div
            className="ai-messenger__messages"
            key={`messages-${forceUpdate}`}
          >
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
              <>
                {activeConversation?.messages?.map((message) => {
                  return (
                    <div
                      key={`${message.id}-${forceUpdate}`}
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
                  );
                })}
                {aiTyping && (
                  <div className="ai-messenger__message ai-messenger__message--ai">
                    <div className="ai-messenger__typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-messenger__input-area">
            <div className="ai-messenger__input-container">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isProcessingAudio
                    ? "🔄 Se procesează înregistrarea vocală..."
                    : `Scrie un mesaj pentru ${assistantName}...`
                }
                className="ai-messenger__input"
                rows={1}
                disabled={aiTyping || isProcessingAudio}
              />
              <div className="ai-messenger__controls">
                <VoiceRecorder
                  onRecordingComplete={handleAudioRecording}
                  disabled={aiTyping || isProcessingAudio}
                  className="ai-messenger__voice-recorder"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || aiTyping || isProcessingAudio}
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
    </div>
  );
};

export default AIMessengerAdvanced;
