import React, { useState, useRef, useEffect, startTransition } from "react";
import "./AIAssistantWidget.css";
import { useAssistantProfile } from "../contexts/useAssistantProfile";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getAIAssistantName } from "../utils/aiNameUtils";
import { useConversations } from "../hooks/useConversations";
import { Timestamp } from "firebase/firestore";
import { fetchAIResponseSafe } from "../utils/aiApiUtils";
import { getTherapyResponse } from "../services/openaiService";
import { validateAvatarData } from "../utils/avatarUtils";

// Folosește funcția sigură pentru AI Response (adaptată pentru producție)
const fetchAIResponse = fetchAIResponseSafe;

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
    addMessage,
  } = useConversations();

  // Modal state
  const [open, setOpen] = useState(false);
  // Drag state
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [modalPos, setModalPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced drag handlers with improved mobile detection and constraints
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Enable dragging on desktop and large tablets (>900px)
    if (window.innerWidth <= 900) {
      console.log(
        `[AI Widget] Drag disabled - screen width: ${window.innerWidth}px`
      );
      return;
    }

    console.log(
      `[AI Widget] Drag started - screen width: ${window.innerWidth}px`
    );
    setDragging(true);

    // Add dragging class for visual feedback
    if (modalRef.current) {
      modalRef.current.classList.add("ai-assistant-widget__modal--dragging");
    }

    let clientX = 0,
      clientY = 0;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const rect = modalRef.current?.getBoundingClientRect();
    setDragOffset({
      x: clientX - (rect?.left || 0),
      y: clientY - (rect?.top || 0),
    });
    e.preventDefault();
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!dragging || window.innerWidth <= 900) return;

    // Throttle drag events for better performance
    const now = Date.now();
    const windowWithCache = window as typeof window & { lastDragTime?: number };
    if (now - (windowWithCache.lastDragTime || 0) < 16) return; // ~60fps
    windowWithCache.lastDragTime = now;

    let clientX = 0,
      clientY = 0;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    // Calculate new position with enhanced viewport constraints
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const modal = {
      width: modalDimensions.width,
      height: modalDimensions.height,
    };

    // Enhanced constraints with safety margins
    const minPadding = 10;
    const constrainedX = Math.max(
      minPadding,
      Math.min(newX, viewport.width - modal.width - minPadding)
    );
    const constrainedY = Math.max(
      minPadding,
      Math.min(newY, viewport.height - modal.height - minPadding)
    );

    setModalPos({ x: constrainedX, y: constrainedY });
  };
  const handleDragEnd = () => {
    setDragging(false);

    // Remove dragging class for visual feedback
    if (modalRef.current) {
      modalRef.current.classList.remove("ai-assistant-widget__modal--dragging");
    }
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDrag);
      window.addEventListener("touchend", handleDragEnd);
    } else {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDrag);
      window.removeEventListener("touchend", handleDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDrag);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [dragging, dragOffset]);
  // Enhanced body scroll management WITHOUT position fixed (care blurează)
  useEffect(() => {
    if (open) {
      // Prevent body scroll FĂRĂ position fixed
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      // Nu mai setăm position fixed și top - acestea blurează pagina
    } else {
      // Restore body scroll
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    }
    return () => {
      // Cleanup on unmount
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    };
  }, [open]); // Enhanced positioning logic with intelligent viewport adaptation
  const [modalDimensions, setModalDimensions] = useState({
    width: 450,
    height: 600,
  });

  // Initialize modal dimensions on component mount
  useEffect(() => {
    const initDimensions = () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Mobile/tablet specific dimensions
      if (viewport.width <= 768) {
        setModalDimensions({
          width: Math.min(viewport.width - 20, 420),
          height: Math.min(viewport.height - 20, viewport.height * 0.9),
        });
      } else if (viewport.width <= 1024) {
        setModalDimensions({
          width: Math.min(400, viewport.width - 40),
          height: Math.min(550, viewport.height - 40),
        });
      } else {
        // Desktop dimensions
        setModalDimensions({
          width: 450,
          height: 600,
        });
      }
    };

    initDimensions();
  }, []);

  // Intelligent positioning system with enhanced mobile support
  const calculateOptimalPosition = () => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const padding = 20;

    // Mobile positioning - optimized full screen overlay
    if (viewport.width <= 768) {
      return {
        x: 10,
        y: 10,
        width: Math.min(viewport.width - 20, 420),
        height: Math.min(viewport.height - 20, viewport.height * 0.9),
      };
    }

    // Tablet positioning
    if (viewport.width <= 1024) {
      const modal = {
        width: Math.min(400, viewport.width - 40),
        height: Math.min(550, viewport.height - 40),
      };

      return {
        x: viewport.width - modal.width - padding,
        y: Math.max(padding, viewport.height - modal.height - padding),
        width: modal.width,
        height: modal.height,
      };
    }

    // Desktop positioning - smart placement based on available space
    const modal = {
      width: modalDimensions.width,
      height: modalDimensions.height,
    };

    // Try bottom-right first (preferred)
    let preferredX = viewport.width - modal.width - padding;
    let preferredY = viewport.height - modal.height - padding;

    // If not enough space, try other corners
    if (preferredX < padding) {
      preferredX = padding; // Left side
    }
    if (preferredY < padding) {
      preferredY = padding; // Top side
    }

    // Final safety check - ensure modal stays within viewport
    const safeX = Math.max(
      padding,
      Math.min(preferredX, viewport.width - modal.width - padding)
    );
    const safeY = Math.max(
      padding,
      Math.min(preferredY, viewport.height - modal.height - padding)
    );

    return {
      x: safeX,
      y: safeY,
      width: modal.width,
      height: modal.height,
    };
  };
  // Auto-reposition on window resize with debouncing
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Clear previous timeout
      if (resizeTimeout) clearTimeout(resizeTimeout);

      // Debounce resize events for better performance
      resizeTimeout = setTimeout(() => {
        if (open) {
          const newPosition = calculateOptimalPosition();
          setModalPos({ x: newPosition.x, y: newPosition.y });
          setModalDimensions({
            width: newPosition.width,
            height: newPosition.height,
          });
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    // Handle orientation change on mobile
    window.addEventListener("orientationchange", () => {
      setTimeout(handleResize, 500); // Delay for orientation change
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [open, modalDimensions]);
  // Improved modal positioning on open with viewport check
  useEffect(() => {
    if (open && modalRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const optimalPosition = calculateOptimalPosition();
        setModalPos({ x: optimalPosition.x, y: optimalPosition.y });
        setModalDimensions({
          width: optimalPosition.width,
          height: optimalPosition.height,
        });

        // Add visual feedback for modal appearance
        if (modalRef.current) {
          modalRef.current.style.opacity = "0";
          modalRef.current.style.transform = "scale(0.9)";

          requestAnimationFrame(() => {
            if (modalRef.current) {
              modalRef.current.style.transition =
                "opacity 0.3s ease, transform 0.3s ease";
              modalRef.current.style.opacity = "1";
              modalRef.current.style.transform = "scale(1)";
            }
          });
        }
      }, 10);
    }
  }, [open]);

  // Apply positioning via direct inline styles pentru drag & drop stabil
  useEffect(() => {
    if (modalRef.current && open) {
      const modal = modalRef.current;
      modal.style.top = `${modalPos.y}px`;
      modal.style.left = `${modalPos.x}px`;
      modal.style.width = `${modalDimensions.width}px`;
      modal.style.height = `${modalDimensions.height}px`;
    }
  }, [modalPos, modalDimensions, open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages.length, aiTyping]);

  // DEBUG: log userId și conversațiile încărcate
  useEffect(() => {
    if (user?.uid) {
      console.log("[AIAssistantWidget] userId:", user.uid);
    }
  }, [user]);
  useEffect(() => {
    console.log("[AIAssistantWidget] conversations:", conversations);
  }, [conversations]);
  // Debug logs pentru a vedea starea
  console.log("[AIWidget] User:", user?.uid, "Location:", location.pathname);
  console.log("[AIWidget] User autentificat:", !!user);
  console.log(
    "[AIWidget] Conversations:",
    conversations.length,
    "Active:",
    activeConversation?.id
  );

  // Debug log pentru conversații
  useEffect(() => {
    console.log(`[AIWidget] User ID: ${user?.uid}`);
    console.log(
      `[AIWidget] Total conversations: ${conversations.length}`,
      conversations.map((c) => ({
        id: c.id,
        subject: c.subject,
        userId: c.userId,
      }))
    );
  }, [conversations, user?.uid]);

  // Nu afișa widget-ul dacă utilizatorul nu este autentificat
  if (!user) return null;
  // Nu afișa widget-ul pe pagina dedicată AI Messenger
  if (location.pathname === "/ai-messenger") return null;

  // Trimitere mesaj user + răspuns AI dummy cu indicator typing
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim(); // Salvează mesajul înainte de a reseta input-ul
    setLoading(true);
    setAiTyping(true);
    setInput(""); // Resetează input-ul imediat pentru UX mai bun

    try {
      let convId = activeConversation?.id;
      // Dacă nu există conversație activă, creez una nouă fără subiect
      if (!convId) {
        console.log(
          "[AIWidget] Creating new conversation for user:",
          user?.uid
        );
        convId = await createConversation("");
        if (convId) {
          setActiveConversationId(convId);
          console.log("[AIWidget] New conversation created:", convId);
        }
      }

      // Adaugă mesajul utilizatorului
      console.log("[AIWidget] Adding user message:", userMessage);
      await addMessage({
        id: Date.now().toString(),
        sender: "user",
        content: userMessage,
        timestamp: Timestamp.now(),
      });

      // Răspuns real AI via openaiService (ca la terapie)
      setTimeout(async () => {
        console.log(
          `[AIWidget] Calling fetchAIResponse with userId: ${user?.uid} and message: ${userMessage}`
        );
        const aiReply = await fetchAIResponse(
          userMessage, // Folosește mesajul salvat, nu input-ul resetat
          user?.uid,
          assistantProfile
        );

        console.log(
          "[AIWidget] AI response received:",
          aiReply?.substring(0, 100)
        );
        console.log(
          "[AIWidget] AI response received:",
          aiReply?.substring(0, 100)
        );

        await addMessage({
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content: aiReply,
          timestamp: Timestamp.now(),
        });

        // După primul mesaj, generează automat titlul conversației (ca la ChatGPT)
        const conv = conversations.find((c) => c.id === convId);
        console.log(
          "[AIWidget] Conversație găsită:",
          conv?.subject,
          "Mesaje:",
          conv?.messages?.length
        );

        // Generează titlu doar după primul schimb de mesaje (user + AI)
        if (
          convId &&
          conv &&
          (!conv.subject ||
            conv.subject === "" ||
            conv.subject === "Conversație nouă") &&
          conv.messages &&
          conv.messages.length >= 2
        ) {
          console.log(
            "[AIWidget] Generez titlu automat pentru conversația:",
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
              content: `Creează un titlu în română perfectă pentru această conversație:\nUtilizator: "${userMessage}"\nAsistent: "${aiReply}"\n\nTitlu:`,
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
            console.log("[AIWidget] Titlu generat:", cleanTitle);
            await renameConversation(convId, cleanTitle);
          } catch (err) {
            console.error("Eroare la generarea titlului:", err);
            // Fallback: folosește primele cuvinte din întrebarea utilizatorului
            const fallbackTitle =
              userMessage.split(" ").slice(0, 4).join(" ") ||
              "Conversație generală";
            await renameConversation(convId, fallbackTitle);
          }
        }
        setLoading(false);
        setAiTyping(false);
      }, 1200);
    } catch (e) {
      console.error("[AIWidget] Error in handleSendMessage:", e);
      setLoading(false);
      setAiTyping(false);
    }
  };
  // Afișează widgetul doar dacă utilizatorul este autentificat și nu e pe /ai-messenger
  if (!user || location.pathname === "/ai-messenger") {
    return null;
  }

  return (
    <>
      <div
        className="ai-assistant-widget__button"
        onClick={() => startTransition(() => setOpen(true))}
        title={`Deschide chatul cu ${assistantName}`}
      >
        <div className="ai-assistant-widget__button-content">
          <img
            src={validateAvatarData(assistantProfile.avatar)}
            alt="AI Assistant"
            className="ai-assistant-widget__button-img"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/default-ai-avatar.svg";
            }}
          />
        </div>
      </div>{" "}
      {open && (
        <div className="ai-assistant-widget__modal-overlay">
          {" "}
          <div
            className="ai-assistant-widget__modal ai-assistant-widget__modal--positioned"
            ref={modalRef}
          >
            {/* Header drag handle */}
            <div
              className="ai-assistant-widget__modal-header"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <div className="ai-assistant-widget__modal-title">
                <img
                  src={validateAvatarData(assistantProfile.avatar)}
                  alt="AI"
                  className="ai-assistant-widget__modal-avatar"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-ai-avatar.svg";
                  }}
                />
                <span>{assistantName}</span>
              </div>{" "}
              <div className="ai-assistant-widget__modal-actions">
                {/* Window controls for desktop */}
                <div className="ai-assistant-widget__window-controls">
                  <button
                    className="ai-assistant-widget__window-btn ai-assistant-widget__window-btn--minimize"
                    onClick={() => setOpen(false)}
                    title="Minimizează"
                  >
                    −
                  </button>
                  <button
                    className="ai-assistant-widget__window-btn ai-assistant-widget__window-btn--maximize"
                    onClick={() =>
                      startTransition(() => navigate("/ai-messenger"))
                    }
                    title="Deschide pe tot ecranul"
                  >
                    □
                  </button>
                  <button
                    className="ai-assistant-widget__window-btn ai-assistant-widget__window-btn--close"
                    onClick={() => setOpen(false)}
                    title="Închide"
                  >
                    ×
                  </button>
                </div>
                {/* Mobile close button */}
                <button
                  className="ai-assistant-widget__close ai-assistant-widget__close--mobile"
                  onClick={() => setOpen(false)}
                  title="Închide chatul"
                >
                  ✕
                </button>
              </div>
            </div>
            {/* Conținut modal: două coloane */}
            <div className="ai-assistant-widget__modal-content">
              <div className="ai-assistant-widget__sidebar-col">
                <div className="ai-assistant-widget__sidebar-header-row">
                  <h4 className="ai-assistant-widget__sidebar-title">
                    💬 Istoric conversații
                  </h4>{" "}
                  <button
                    className="ai-assistant-widget__new-btn ai-assistant-widget__button--background"
                    onClick={async () => {
                      console.log(
                        "[AIWidget] Creez conversație nouă pentru user:",
                        user?.uid
                      );
                      try {
                        const id = await createConversation("");
                        if (id) {
                          setActiveConversationId(id);
                          console.log(
                            "[AIWidget] Conversație nouă creată și selectată:",
                            id
                          );
                        } else {
                          console.error(
                            "[AIWidget] Nu s-a putut crea conversația"
                          );
                        }
                      } catch (error) {
                        console.error(
                          "[AIWidget] Eroare la crearea conversației:",
                          error
                        );
                      }
                    }}
                    title="Începe o conversație nouă"
                  >
                    + New
                  </button>
                </div>
                <div className="ai-assistant-widget__conversations-list">
                  {conversations.length === 0 ? (
                    <div className="ai-assistant-widget__empty-conversations">
                      <div className="ai-assistant-widget__empty-icon">💭</div>
                      <p>Nu ai conversații încă</p>
                      <small>Începe prima ta conversație!</small>{" "}
                      <button
                        className="ai-assistant-widget__new-btn ai-assistant-widget__margin-top"
                        onClick={async () => {
                          console.log(
                            "[AIWidget] Creez prima conversație pentru user:",
                            user?.uid
                          );
                          try {
                            const id = await createConversation("");
                            if (id) {
                              setActiveConversationId(id);
                              console.log(
                                "[AIWidget] Prima conversație creată și selectată:",
                                id
                              );
                            } else {
                              console.error(
                                "[AIWidget] Nu s-a putut crea prima conversația"
                              );
                            }
                          } catch (error) {
                            console.error(
                              "[AIWidget] Eroare la crearea primei conversații:",
                              error
                            );
                          }
                        }}
                      >
                        + New
                      </button>
                    </div>
                  ) : (
                    <div className="ai-assistant-widget__conversations-scroll">
                      {conversations.map((conv, idx) => (
                        <div
                          key={conv.id}
                          className={`ai-assistant-widget__conversation-item${
                            activeConversation?.id === conv.id ? " active" : ""
                          }`}
                        >
                          <button
                            className="ai-assistant-widget__conversation-btn"
                            onClick={() => setActiveConversationId(conv.id)}
                            title={conv.subject}
                          >
                            <div className="ai-assistant-widget__conversation-content">
                              <span className="ai-assistant-widget__conversation-number">
                                {idx + 1}.
                              </span>
                              <span className="ai-assistant-widget__conversation-title">
                                {conv.subject || `Conversație #${idx + 1}`}
                              </span>
                              <div className="ai-assistant-widget__conversation-meta">
                                {" "}
                                <span className="ai-assistant-widget__conversation-date">
                                  {new Date(
                                    conv.createdAt instanceof Timestamp
                                      ? conv.createdAt.toDate()
                                      : conv.createdAt || new Date()
                                  ).toLocaleDateString("ro-RO", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                                <span className="ai-assistant-widget__conversation-count">
                                  {conv.messages?.length || 0} mesaje
                                </span>
                              </div>
                            </div>
                          </button>
                          <div className="ai-assistant-widget__conversation-actions">
                            <button
                              className="ai-assistant-widget__fullscreen-btn"
                              onClick={() => {
                                const newSubject = prompt(
                                  "Redenumește conversația:",
                                  conv.subject
                                );
                                if (newSubject && newSubject.trim()) {
                                  renameConversation(
                                    conv.id,
                                    newSubject.trim()
                                  );
                                }
                              }}
                              title="Redenumește conversația"
                            >
                              ✏️
                            </button>
                            <button
                              className="ai-assistant-widget__close"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Sigur vrei să ștergi această conversație?"
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
              <div className="ai-assistant-widget__chat-col">
                {activeConversation ? (
                  <>
                    <div className="ai-assistant-widget__messages">
                      {activeConversation.messages.length === 0 ? (
                        <div className="ai-assistant-widget__welcome-message">
                          <div className="ai-assistant-widget__welcome-avatar">
                            <img
                              src={validateAvatarData(assistantProfile.avatar)}
                              alt="AI Assistant"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/default-ai-avatar.svg";
                              }}
                            />
                          </div>
                          <div className="ai-assistant-widget__welcome-content">
                            <h3>Salut! 👋</h3>
                            <p>
                              Sunt {assistantName}, asistentul tău AI personal.
                            </p>
                            <p>Cu ce te pot ajuta astăzi?</p>
                          </div>
                        </div>
                      ) : (
                        activeConversation.messages.map((message, index) => (
                          <div
                            key={message.id || index}
                            className={`ai-assistant-widget__message ${
                              message.sender === "ai"
                                ? "ai-assistant-widget__message--ai"
                                : "ai-assistant-widget__message--user"
                            }`}
                          >
                            <div className="ai-assistant-widget__message-avatar">
                              <img
                                src={
                                  message.sender === "ai"
                                    ? validateAvatarData(
                                        assistantProfile.avatar
                                      )
                                    : user?.photoURL || "/default-user.svg"
                                }
                                alt={message.sender}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src =
                                    message.sender === "ai"
                                      ? "/default-ai-avatar.svg"
                                      : "/default-user.svg";
                                }}
                              />
                            </div>
                            <div className="ai-assistant-widget__message-bubble">
                              <div className="ai-assistant-widget__message-content">
                                {message.content}
                              </div>{" "}
                              <div className="ai-assistant-widget__message-time">
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
                          </div>
                        ))
                      )}
                      {aiTyping && (
                        <div className="ai-assistant-widget__message ai-assistant-widget__message--ai">
                          <div className="ai-assistant-widget__message-avatar">
                            <img
                              src={validateAvatarData(assistantProfile.avatar)}
                              alt="AI Assistant"
                              onError={(e) => {
                                e.currentTarget.src = "/default-ai-avatar.svg";
                              }}
                            />
                          </div>
                          <div className="ai-assistant-widget__message-bubble">
                            <div className="ai-assistant-widget__typing-content">
                              <span>{assistantName} scrie...</span>
                              <div className="ai-assistant-widget__typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="ai-assistant-widget__input-area">
                      <div className="ai-assistant-widget__input-container">
                        <input
                          type="text"
                          className="ai-assistant-widget__input"
                          placeholder={`Scrie un mesaj pentru ${assistantName}...`}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendMessage();
                          }}
                          disabled={loading}
                        />
                        <button
                          className="ai-assistant-widget__send-btn"
                          onClick={handleSendMessage}
                          disabled={loading || !input.trim()}
                          title="Trimite mesajul"
                        >
                          {loading ? "⏳" : "🚀"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="ai-assistant-widget__no-conversation">
                    <div className="ai-assistant-widget__no-conversation-content">
                      <div className="ai-assistant-widget__no-conversation-icon">
                        💬
                      </div>
                      <h3>Selectează o conversație</h3>
                      <p>
                        Alege o conversație din listă sau începe una nouă pentru
                        a chata cu {assistantName}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantWidget;
