import React, { ReactNode } from "react";
import { isDebugMode } from "./debugUtils";

/**
 * Componenta pentru afișarea condițională a UI-ului de debugging
 * În producție, aceasta nu va afișa nimic
 */
export const DebugOnly: React.FC<{ children: ReactNode }> = ({ children }) => {
  if (!isDebugMode()) return null;
  return <>{children}</>;
};

/**
 * Wrapper pentru panoul de debugging
 * Această componentă înlocuiește DebugPanel și nu va afișa nimic în producție
 */
export const DebugPanel: React.FC<{ 
  title?: string;
  data?: unknown;
  visible?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}> = ({ title = "Debug Info", data, visible = true, position = "bottom-left", className = "" }) => {
  // Nu afișăm nimic în producție sau dacă debugging-ul este dezactivat
  if (!isDebugMode() || !visible) return null;
  
  // Determinăm clasa CSS pentru poziție
  const positionClass = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  }[position];
  
  return (
    <div 
      className={`fixed ${positionClass} z-50 p-3 m-4 max-w-sm bg-gray-900 bg-opacity-80 text-green-400 
        font-mono text-xs rounded-lg overflow-auto shadow-lg ${className}`}
      style={{ maxHeight: "50vh" }}
    >
      <div className="font-bold mb-2 border-b border-green-500 pb-1">{title}</div>
      <pre className="whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};