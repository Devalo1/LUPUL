/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import Button from "./Button";

describe("Button component", () => {
  test("renders hello world button", () => {
    render(<Button>Hello World</Button>);
    const buttonElement = screen.getByText(/hello world/i);
    expect(buttonElement).toBeInTheDocument();
  });
});
