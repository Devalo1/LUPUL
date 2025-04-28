import React from "react";
import { FaLeaf, FaStar, FaAward } from "react-icons/fa";
import "../styles/ProductsPage.css";

const ProductsHeader: React.FC = () => {
  return (
    <div className="products-banner mb-8" style={{
      backgroundImage: "linear-gradient(135deg, rgba(226, 232, 240, 0.7) 0%, rgba(214, 222, 235, 0.7) 100%)",
      backgroundSize: "200% 200%"
    }}>
      <div className="banner-content" style={{
        backgroundColor: "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        animation: "subtlePulse 8s infinite alternate"
      }}>
        <div className="content-background" style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(120deg, rgba(240, 249, 255, 0.6) 0%, rgba(214, 232, 255, 0.6) 50%, rgba(225, 239, 254, 0.6) 100%)",
          backgroundSize: "200% 200%",
          animation: "gradientBg 15s ease infinite",
          zIndex: -1
        }}></div>
        <h1 className="page-title" style={{
          backgroundColor: "rgba(235, 245, 255, 0.7)",
          textShadow: "1px 1px 2px rgba(255, 255, 255, 0.8)"
        }}>
          Produse Tradiționale
        </h1>
        
        <p className="page-description" style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          border: "1px solid rgba(229, 231, 235, 0.5)"
        }}>
          Descoperă selecția noastră de produse autentice, create cu ingrediente naturale 
          și după rețete tradiționale transmise din generație în generație.
        </p>
        
        <div className="feature-points" style={{
          backgroundColor: "rgba(240, 249, 255, 0.8)",
          border: "1px solid rgba(191, 219, 254, 0.7)"
        }}>
          <span className="feature-point" style={{"--feature-index": "0"} as React.CSSProperties}>
            <FaLeaf />
            100% Natural
          </span>
          
          <span className="feature-point" style={{"--feature-index": "1"} as React.CSSProperties}>
            <FaAward />
            Calitate Premium
          </span>
          
          <span className="feature-point" style={{"--feature-index": "2"} as React.CSSProperties}>
            <FaStar />
            Produse Autentice
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductsHeader;
