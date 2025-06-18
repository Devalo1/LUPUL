/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import ReadingAnalyticsAdmin from "./ReadingAnalyticsAdmin";

// Mock the CSS module import
jest.mock("./ReadingAnalyticsAdmin.module.css", () => ({
  chartContainer: "chartContainer",
  adminContainer: "adminContainer",
  statsCard: "statsCard",
}));

// Mock Chart.js
jest.mock("react-chartjs-2", () => ({
  Line: jest.fn(() => <div data-testid="line-chart">Line Chart</div>),
  Bar: jest.fn(() => <div data-testid="bar-chart">Bar Chart</div>),
  Doughnut: jest.fn(() => (
    <div data-testid="doughnut-chart">Doughnut Chart</div>
  )),
}));

// Mock Firebase
jest.mock("../firebase", () => ({
  db: {},
  auth: {
    currentUser: { uid: "test-user-id" },
  },
}));

// Mock analytics service
jest.mock("../services/userBehaviorAnalytics", () => ({
  userBehaviorAnalytics: {
    getReadingPatterns: jest.fn().mockResolvedValue({
      dailyReadingTime: [1, 2, 3, 4, 5],
      weeklyReadingGoals: [10, 20, 30, 40, 50],
    }),
    getEngagementMetrics: jest.fn().mockResolvedValue({
      pageViews: 100,
      timeOnPage: 300,
      bounceRate: 0.3,
    }),
    getTimeSpentAnalytics: jest.fn().mockResolvedValue({
      averageSessionDuration: 250,
      totalTimeSpent: 1000,
    }),
    getReadingAnalytics: jest.fn().mockResolvedValue({
      totalReads: 50,
      averageReadTime: 5,
      topCategories: ["Technology", "Science"],
    }),
  },
}));

describe("ReadingAnalyticsAdmin component (Jest)", () => {
  test("renders component without crashing", () => {
    render(<ReadingAnalyticsAdmin isAdmin={true} />);
    // Use getAllByText to handle multiple matches
    const analyticsElements = screen.getAllByText(/analytics/i);
    expect(analyticsElements.length).toBeGreaterThan(0);
  });

  test("displays loading state initially", () => {
    render(<ReadingAnalyticsAdmin isAdmin={true} />);
    expect(
      screen.getByText("Loading reading analytics...")
    ).toBeInTheDocument();
  });
});
