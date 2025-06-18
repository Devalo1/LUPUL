import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import ReadingAnalyticsAdmin from "./ReadingAnalyticsAdmin";

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Line: vi.fn(() => <div data-testid="line-chart">Line Chart</div>),
  Bar: vi.fn(() => <div data-testid="bar-chart">Bar Chart</div>),
  Doughnut: vi.fn(() => <div data-testid="doughnut-chart">Doughnut Chart</div>),
}));

// Mock Firebase
vi.mock("../services/firebase", () => ({
  db: {},
  auth: {
    currentUser: { uid: "test-user-id" },
  },
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(() =>
    Promise.resolve({
      docs: [],
    })
  ),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1640995200, nanoseconds: 0 })),
    fromDate: vi.fn((date: Date) => ({
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })),
  },
}));

// Mock userBehaviorAnalytics
vi.mock("../services/userBehaviorAnalytics", () => ({
  userBehaviorAnalytics: {
    getAdminDashboardData: vi.fn(() =>
      Promise.resolve({
        totalSessions: 100,
        averageReadingTime: 180,
        averageScrollPercentage: 75,
        totalUsers: 25,
        engagementDistribution: {
          "Very High": 10,
          High: 20,
          Medium: 30,
          Low: 25,
          "Very Low": 15,
        },
        topArticles: [
          {
            articleId: "article-1",
            title: "Test Article 1",
            totalSessions: 50,
            averageReadingTime: 200,
            averageScrollPercentage: 80,
          },
        ],
        dailyEngagement: [
          {
            date: "2023-01-01",
            sessions: 10,
            averageReadingTime: 180,
            averageScrollPercentage: 75,
          },
        ],
      })
    ),
    exportAnalyticsData: vi.fn(() => Promise.resolve()),
    getUserReadingProfile: vi.fn(() =>
      Promise.resolve({
        userId: "test-user",
        totalReadingTime: 3600,
        totalSessions: 10,
        averageSessionTime: 360,
        favoriteTopics: ["technology", "science"],
        readingStreak: 5,
        engagementScore: 85,
        lastActiveDate: new Date(),
        preferences: {
          preferredReadingTime: 300,
          topics: ["technology"],
        },
      })
    ),
  },
}));

describe("ReadingAnalyticsAdmin", () => {
  it("should render analytics dashboard", async () => {
    render(<ReadingAnalyticsAdmin isAdmin={true} />);

    // Check for main title
    expect(screen.getByText("Reading Analytics Dashboard")).toBeInTheDocument();

    // Check for summary cards section
    expect(screen.getByText("Summary")).toBeInTheDocument();

    // Check for charts section
    expect(screen.getByText("Engagement Trends")).toBeInTheDocument();
  });

  it("should render charts", async () => {
    render(<ReadingAnalyticsAdmin isAdmin={true} />);

    // Wait for charts to be rendered
    await screen.findByTestId("line-chart");
    await screen.findByTestId("bar-chart");
    await screen.findByTestId("doughnut-chart");

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
  });

  it("should have date range filters", () => {
    render(<ReadingAnalyticsAdmin isAdmin={true} />);

    expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
  });

  it("should have export functionality", () => {
    render(<ReadingAnalyticsAdmin isAdmin={true} />);

    expect(screen.getByText("Export Data")).toBeInTheDocument();
  });
});
