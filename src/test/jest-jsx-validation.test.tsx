/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";

// Simple test component without external dependencies
const SimpleComponent = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="simple-component">{children}</div>;
};

describe("Simple Jest JSX Test", () => {
  test("renders JSX successfully", () => {
    render(<SimpleComponent>Hello Jest with JSX!</SimpleComponent>);
    expect(screen.getByTestId("simple-component")).toBeInTheDocument();
    expect(screen.getByText("Hello Jest with JSX!")).toBeInTheDocument();
  });

  test("handles React props correctly", () => {
    render(<SimpleComponent>Test content</SimpleComponent>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });
});
