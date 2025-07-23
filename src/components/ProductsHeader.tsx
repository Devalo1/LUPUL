import React from "react";
import { FaLeaf, FaStar, FaAward } from "react-icons/fa";
import "../styles/ProductsPage.css";

const ProductsHeader: React.FC = () => {
  return (
    <div className="products-banner mb-8">
      <div className="banner-content">
        <div className="content-background"></div>
        <h1 className="page-title">Produse Tradiționale</h1>

        <p className="page-description">
          Descoperă selecția noastră de produse autentice, create cu ingrediente
          naturale și după rețete tradiționale transmise din generație în
          generație.
        </p>

        <div className="feature-points">
          <span className="feature-point feature-point-0">
            <FaLeaf />
            100% Natural
          </span>

          <span className="feature-point feature-point-1">
            <FaAward />
            Calitate Premium
          </span>

          <span className="feature-point feature-point-2">
            <FaStar />
            Produse Autentice
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductsHeader;
