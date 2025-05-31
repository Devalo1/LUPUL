/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ReadingAnalyticsAdmin from "./ReadingAnalyticsAdmin";

// Mock Chart.js
jest.mock("react-chartjs-2", () => ({
  Line: jest.fn(() => <div data-testid="line-chart">Line Chart</div>),
  Bar: jest.fn(() => <div data-testid="bar-chart">Bar Chart</div>),
  Doughnut: jest.fn(() => (
    <div data-testid="doughnut-chart">Doughnut Chart</div>
  )),
}));

// Mock Firebase
jest.mock("./firebase", () => ({
  db: {},
  auth: {
    currentUser: { uid: "test-user-id" },
  },
}));

// Mock analytics service
jest.mock("../services/userBehaviorAnalytics", () => ({
  userBehaviorAnalytics: {
    getReadingPatterns: jest.fn(),
    getEngagementMetrics: jest.fn(),
    getTimeSpentAnalytics: jest.fn(),
  },
}));

describe("ReadingAnalyticsAdmin component (Jest)", () => {
  test("renders component without crashing", () => {
    render(<ReadingAnalyticsAdmin isAdmin={true} />);
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
  });

  test("displays chart components", () => {
    render(<ReadingAnalyticsAdmin isAdmin={true} />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
  });
});
