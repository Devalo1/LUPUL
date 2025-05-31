import React, { useState, useEffect } from "react";
import { getTherapyResponse } from "../../services/openaiService";
import { therapyConversationService } from "../../services/therapyConversationService";
import { userAIProfileService } from "../../services/userAIProfileService";
import { useAuth } from "../../contexts/AuthContext";
import "../../assets/styles/terapie-chat.css";

const Psihica: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "Se încarcă configurația personalizată...",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  // Load user AI profile and conversation history
  useEffect(() => {
    if (!user?.uid) return;

    const initializeSession = async () => {
      try {
        setLoadingProfile(true);

        // Load user AI profile configuration
        const profile = await userAIProfileService.getActiveProfileConfig(
          user.uid,
          "psihica"
        );
        if (profile) {
          setUserProfile(profile);

          // Generate personalized system prompt
          const defaultPrompt =
            "Ești un terapeut virtual specializat în consiliere psihologică. Oferă suport empatic, recomandări pentru gestionarea stresului, anxietății, depresiei și alte provocări emoționale. Fii blând, profesionist și confidențial.";
          const systemPrompt = userAIProfileService.generateSystemPrompt(
            profile,
            defaultPrompt
          );

          // Start a new conversation
          const newConversationId =
            await therapyConversationService.startConversation(
              user.uid,
              "psihica"
            );
          setConversationId(newConversationId);

          // Update messages with personalized system prompt
          setMessages([
            {
              role: "system",
              content: systemPrompt,
            },
          ]);
        } else {
          // Fallback for users without AI profile
          const newConversationId =
            await therapyConversationService.startConversation(
              user.uid,
              "psihica"
            );
          setConversationId(newConversationId);
        }
      } catch (err) {
        console.error("Error initializing therapy session:", err);
        setError("Eroare la inițializarea sesiunii. Încercați din nou.");

        // Fallback to default system message
        setMessages([
          {
            role: "system",
            content:
              "Ești un terapeut virtual specializat în consiliere psihologică. Oferă suport empatic, recomandări pentru gestionarea stresului, anxietății, depresiei și alte provocări emoționale. Fii blând, profesionist și confidențial.",
          },
        ]);
      } finally {
        setLoadingProfile(false);
      }
    };

    initializeSession();
  }, [user?.uid]);

  const handleSend = async () => {
    if (!input.trim() || !user?.uid || !conversationId) return;

    setLoading(true);
    setError(null);

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    try {
      // Add user message to conversation history
      await therapyConversationService.addMessage(conversationId, {
        role: "user",
        content: input,
      });

      // Get AI response using user's personalized profile
      const aiResponse = await getTherapyResponse(newMessages, "psihica");

      // Add AI response to messages
      const updatedMessages = [
        ...newMessages,
        { role: "assistant", content: aiResponse },
      ];
      setMessages(updatedMessages);

      // Save AI response to conversation history
      await therapyConversationService.addMessage(conversationId, {
        role: "assistant",
        content: aiResponse,
      });

      // Update user profile usage statistics
      await userAIProfileService.updateUsageStats(user.uid, "psihica");
    } catch (err) {
      console.error("OpenAI error:", err);
      setError("A apărut o eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="terapie-chat-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Se încarcă profilul personalizat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="therapy-chat-outer min-h-screen flex flex-col justify-center items-center pt-24 pb-16">
      <div className="therapy-chat-inner terapie-chat-container animated-therapy-bg w-full max-w-2xl flex flex-col justify-between relative">
        <div className="mb-4 pt-8">
          <h2 className="text-white text-2xl font-semibold text-center">
            Terapie psihică AI
          </h2>
        </div>
        {/* Animated eyes and chat bot avatar */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 z-10 w-full flex flex-col items-center mt-6 pointer-events-none select-none">
          {/* Animated eyes */}
          <div className="eyes-row">
            <div className="eye">
              <div className="eye-ball"></div>
              <div className="eye-pupil"></div>
              <div className="eye-lid"></div>
            </div>
            <div className="eye">
              <div className="eye-ball"></div>
              <div className="eye-pupil"></div>
              <div className="eye-lid delay-1"></div>
            </div>
          </div>
          {/* Animated robot greeting */}
          <div className="mt-2 flex flex-col items-center">
            <span className="text-4xl animate-wave">👋</span>
            <span className="text-xl font-bold text-white drop-shadow">
              Bună, Terapeut Psihic!
            </span>
            <span className="text-blue-100 text-base font-medium mt-1">
              Sunt aici să te ajut cu consiliere psihologică personalizată.
            </span>
            <span className="text-blue-200 text-xs font-semibold flex items-center gap-2 mt-1">
              Profil: {userProfile?.gender || "neutru"} <span className="mx-1">•</span> Stil: {userProfile?.expressionStyle || "prietenos"} <span className="mx-1">•</span> Conversații: {userProfile?.totalConversations || 0} <span className="mx-1">•</span>
              <a href="/terapie/psihica" className="underline hover:text-blue-300 transition">terapie psihică</a>
            </span>
          </div>
        </div>
        <div className="terapie-chat-box mt-40 mb-8">
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
                <b>
                  {msg.role === "user"
                    ? "Tu"
                    : `${userProfile?.name || "Terapeut"} AI`}
                :
                </b>{" "}
                {msg.content}
              </div>
            ))}
          {loading && (
            <div className="terapie-chat-msg ai">
              <div className="flex items-center">
                <div className="animate-pulse">
                  Se generează răspunsul personalizat...
                </div>
              </div>
            </div>
          )}
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
            disabled={loading || !conversationId}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || !conversationId}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            Trimite
          </button>
        </div>

        {conversationId && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Conversația este salvată automat în istoricul tău personal
          </div>
        )}

        <div className="pt-48" />
      </div>
    </div>
  );
};

export default Psihica;
