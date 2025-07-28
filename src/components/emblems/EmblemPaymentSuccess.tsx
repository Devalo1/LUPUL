import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { emblemService } from "../../services/emblemService";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import "./EmblemPaymentSuccess.css";

const EmblemPaymentSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

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
      <div className="payment-processing">
        <FaSpinner className="spinner-icon" />
        <h1 className="processing-title">🔮 Crearea emblemei tale NFT...</h1>
        <p className="processing-message">
          Plata ta a fost procesată cu succes!
        </p>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <FaCheckCircle className="success-icon" />
      <h1 className="success-title">🎉 Felicitări!</h1>
      <p className="success-message">Emblema ta NFT a fost creată cu succes!</p>
      <button
        onClick={() => navigate("/emblems/dashboard")}
        className="dashboard-button"
      >
        Vezi Dashboard-ul Tău
      </button>
    </div>
  );
};

export default EmblemPaymentSuccess;
