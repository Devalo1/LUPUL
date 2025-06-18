import React from "react";

const TestWidget: React.FC = () => {
  console.log("[TestWidget] Widget de test se renderează");

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        backgroundColor: "#ff4444",
        borderRadius: "50%",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "24px",
      }}
    >
      🔴
    </div>
  );
};

export default TestWidget;
