import { store } from "@/store";
import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

// Interface for custom render options
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  initialState?: any;
}

/**
 * Custom render function that includes global providers
 * 
 * @param ui - The React component to render
 * @param options - Custom render options including route and initialState
 * @returns The rendered component with testing-library utilities
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { route = "/", initialState, ...renderOptions } = options;
  
  // Set the initial route if provided
  window.history.pushState({}, "Test page", route);
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  };
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
