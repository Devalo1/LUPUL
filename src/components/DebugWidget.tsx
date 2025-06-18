import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useConversations } from "../hooks/useConversations";
import { useAssistantProfile } from "../contexts/useAssistantProfile";

const DebugWidget: React.FC = () => {
  console.log("[DebugWidget] Rendering debug widget");

  try {
    const { user } = useAuth();
    console.log("[DebugWidget] Auth user:", user);
  } catch (error) {
    console.error("[DebugWidget] Auth context error:", error);
  }

  try {
    const { conversations } = useConversations();
    console.log("[DebugWidget] Conversations:", conversations);
  } catch (error) {
    console.error("[DebugWidget] Conversations context error:", error);
  }

  try {
    const { profileState } = useAssistantProfile();
    console.log("[DebugWidget] Profile state:", profileState);
  } catch (error) {
    console.error("[DebugWidget] Assistant profile context error:", error);
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
      }}
    >
      <div>Debug Widget Active</div>
      <div>Check console for details</div>
    </div>
  );
};

export default DebugWidget;
