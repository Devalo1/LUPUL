import { createContext } from "react";

export const NavigationContext = createContext({
  isSideNavOpen: false,
  openSideNav: () => {},
  closeSideNav: () => {},
  toggleSideNav: () => {},
});

export default NavigationContext;
