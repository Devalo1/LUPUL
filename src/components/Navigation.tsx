import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  /* FaBars, */ 
  FaCalendarAlt, 
  FaHome, 
  FaUserCog, 
  FaStethoscope, 
  /* FaBell */
} from "react-icons/fa";

const _Navigation: React.FC = () => {
  const location = useLocation();
  const _isSpecialistPage = location.pathname === "/specialist";
  
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">
          My App
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <FaHome className="mr-1 inline-block" /> Acasă
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/programari"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <FaCalendarAlt className="mr-1 inline-block" /> Programări
              </NavLink>
            </li>
            {/* Specialist button with enhanced visibility and prominence */}
            <li className="nav-item">
              <NavLink
                to="/specialist"
                className={({ isActive }) =>
                  isActive 
                    ? "nav-link active bg-blue-600 text-white font-medium rounded-md mx-1 px-3 shadow-md" 
                    : "nav-link bg-blue-500 text-white hover:bg-blue-700 rounded-md mx-1 px-3 shadow transition-all transform hover:scale-105"
                }
              >
                <FaStethoscope className="mr-1 inline-block animate-pulse" /> Panou Specialist
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <FaUserCog className="mr-1 inline-block" /> Admin
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default _Navigation;