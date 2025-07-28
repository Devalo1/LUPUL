import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { emblemService } from "../../services/emblemService";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

const EmblemPaymentSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      processPaymentSuccess();
    }
  }, [user]);

  const processPaymentSuccess = async () => {
    try {
      // Wait for callback processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if emblem was minted
      const userEmblem = await emblemService.getUserEmblem(user!.uid);

      if (userEmblem) {
        setSuccess(true);
        localStorage.removeItem("pendingEmblemPurchase");
      }

      setIsProcessing(false);
    } catch (error) {
      console.error("Error:", error);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <FaSpinner
          style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }}
        />
        <h1>🔮 Crearea emblemei tale NFT...</h1>
        <p>Plata ta a fost procesată cu succes!</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <FaCheckCircle style={{ fontSize: "4rem", color: "green" }} />
      <h1>🎉 Felicitări!</h1>
      <p>Emblema ta NFT a fost creată cu succes!</p>
      <button
        onClick={() => navigate("/emblems/dashboard")}
        style={{
          padding: "15px 30px",
          fontSize: "1.2rem",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          margin: "20px",
        }}
      >
        Vezi Dashboard-ul Tău
      </button>
    </div>
  );
};

export default EmblemPaymentSuccess;
