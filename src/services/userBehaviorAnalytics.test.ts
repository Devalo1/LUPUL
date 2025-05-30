import { describe, it, expect, vi, beforeEach } from "vitest";
import { userBehaviorAnalytics } from "./userBehaviorAnalytics";

// Mock Firebase
vi.mock("./firebase", () => ({
  db: {},
  auth: {
    currentUser: { uid: "test-user-id" },
  },
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1640995200, nanoseconds: 0 })),
    fromDate: vi.fn((date: Date) => ({
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })),
  },
}));

describe("UserBehaviorAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("startReadingSession", () => {
    it("should start a reading session with correct data", () => {
      const articleId = "test-article-id";
      const articleTitle = "Test Article";
      const userId = "test-user-id";

      userBehaviorAnalytics.startReadingSession(userId, articleId, articleTitle);

      // Check that session is stored in memory
      expect(userBehaviorAnalytics.getCurrentSession()).toBeDefined();
      expect(userBehaviorAnalytics.getCurrentSession()?.articleId).toBe(
        articleId
      );
      expect(userBehaviorAnalytics.getCurrentSession()?.articleTitle).toBe(
        articleTitle
      );
    });
  });

  describe("trackScrollPosition", () => {
    it("should track scroll position for active session", () => {
      const articleId = "test-article-id";
      const articleTitle = "Test Article";
      const userId = "test-user-id";
      userBehaviorAnalytics.startReadingSession(userId, articleId, articleTitle);

      userBehaviorAnalytics.trackScrollPosition(50);

      const session = userBehaviorAnalytics.getCurrentSession();
      expect(session?.readingProgress).toBe(50);
    });

    it("should update max reading progress correctly", () => {
      const articleId = "test-article-id";
      const articleTitle = "Test Article";
      const userId = "test-user-id";
      userBehaviorAnalytics.startReadingSession(userId, articleId, articleTitle);

      userBehaviorAnalytics.trackScrollPosition(30);
      userBehaviorAnalytics.trackScrollPosition(70);
      userBehaviorAnalytics.trackScrollPosition(50); // Should not decrease

      const session = userBehaviorAnalytics.getCurrentSession();
      expect(session?.readingProgress).toBe(70);
    });
  });
});
