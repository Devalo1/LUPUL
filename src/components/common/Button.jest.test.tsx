/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import Button from "./Button";

describe("Button component (Jest)", () => {
  test("renders hello world button", () => {
    render(<Button>Hello World</Button>);
    const buttonElement = screen.getByText(/hello world/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const buttonElement = screen.getByText(/click me/i);
    buttonElement.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
