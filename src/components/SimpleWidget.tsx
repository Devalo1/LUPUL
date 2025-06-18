import React from "react";

const SimpleWidget: React.FC = () => {
  console.log("[SimpleWidget] Rendering simple test widget");

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#007bff",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 1000,
        fontSize: "24px",
      }}
    >
      💬
    </div>
  );
};

export default SimpleWidget;
