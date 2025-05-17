/**
 * Acest fișier este un hack direct pentru a înlocui conținutul
 * modulului problematic iconContext.mjs din react-icons
 * 
 * Va fi servit prin Vite alias pentru a înlocui modulul original
 */

// Importăm React pentru a crea un context real
import React from 'react';

// Creăm un nou context explicit
const IconContext = React.createContext({
  color: "currentColor",
  size: "1em",
  className: "",
  style: {},
  attr: {}
});

// Exportăm Provider și Consumer pentru a putea fi folosite
export const IconProvider = IconContext.Provider;
export const IconConsumer = IconContext.Consumer;

// Export default pentru a înlocui complet modulul original
export default IconContext;
