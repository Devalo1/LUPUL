import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Button from "./Button";

describe("Button component", () => {
  test("renders hello world button", () => {
    render(<Button>Hello World</Button>);
    const buttonElement = screen.getByText(/hello world/i);
    expect(buttonElement).toBeInTheDocument();
  });
});
