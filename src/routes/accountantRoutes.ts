import React, { createElement } from "react";
// Modificăm importul pentru a folosi calea corectă
import { AccountantPanel } from "../pages/accountant/AccountantPanel";

// Rutele pentru zona de contabilitate
const accountantRoutes = [
  {
    path: "/accountant",
    element: createElement(AccountantPanel)
  },
  {
    path: "/accountant/panel",
    element: createElement(AccountantPanel)
  },
  // Puteți adăuga și alte rute specifice contabilului aici
];

export default accountantRoutes;