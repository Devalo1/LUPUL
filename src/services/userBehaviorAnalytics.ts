// Enhanced User Behavior Analytics Service
// Tracks detailed reading time, engagement patterns, and user behavior

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit as limitQuery,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { trackEvent } from "./analytics";

export interface ReadingSession {
  id?: string;
  userId: string;
  articleId: string;
  articleTitle: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  totalTimeSpent: number; // in seconds
  readingProgress: number; // percentage (0-100)
  scrollEvents: ScrollEvent[];
  isCompleted: boolean;
  device: string;
  browser: string;
  screenSize: {
    width: number;
    height: number;
  };
  userAgent: string;
  createdAt: Timestamp;
}

export interface ScrollEvent {
  timestamp: Timestamp;
  scrollPosition: number; // percentage
  timeFromStart: number; // seconds from session start
}

export interface UserReadingProfile {
  userId: string;
  totalReadingTime: number; // total seconds spent reading
  articlesRead: number;
  averageReadingTime: number;
  completionRate: number; // percentage of articles completed
  preferredReadingTimes: string[]; // times of day when user reads most
  topCategories: string[];
  engagementScore: number;
  lastActivity: Timestamp;
  readingSessions: string[]; // session IDs
}

export interface ReadingAnalytics {
  totalUsers: number;
  totalReadingTime: number;
  averageSessionTime: number;
  topArticles: {
    articleId: string;
    title: string;
    totalReads: number;
    averageTime: number;
    completionRate: number;
  }[];
  userEngagement: {
    highlyEngaged: number;
    moderatelyEngaged: number;
    lowEngaged: number;
  };
  readingPatterns: {
    hourly: { [hour: string]: number };
    daily: { [day: string]: number };
  };
}

class UserBehaviorAnalyticsService {
  private activeSession: ReadingSession | null = null;
  private scrollTracker: ScrollEvent[] = [];
  private sessionStartTime: Date | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Start tracking a reading session for an article
   */
  async startReadingSession(
    userId: string,
    articleId: string,
    articleTitle: string
  ): Promise<string> {
    try {
      // End any existing session first
      if (this.activeSession) {
        await this.endReadingSession();
      }

      const session: ReadingSession = {
        userId,
        articleId,
        articleTitle,
        startTime: Timestamp.now(),
        totalTimeSpent: 0,
        readingProgress: 0,
        scrollEvents: [],
        isCompleted: false,
        device: this.getDeviceType(),
        browser: this.getBrowserInfo(),
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        userAgent: navigator.userAgent,
        createdAt: Timestamp.now(),
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, "readingSessions"), session);
      session.id = docRef.id;

      this.activeSession = session;
      this.sessionStartTime = new Date();
      this.scrollTracker = [];

      // Start heartbeat to track active reading time
      this.startHeartbeat();

      // Track analytics event
      await trackEvent("reading_session_started", {
        articleId,
        articleTitle,
        userId,
        sessionId: session.id,
      });

      return session.id;
    } catch (error) {
      console.error("Error starting reading session:", error);
      throw error;
    }
  }

  /**
   * Track scroll position during reading
   */
  trackScrollPosition(scrollPercentage: number): void {
    if (!this.activeSession || !this.sessionStartTime) return;

    const now = new Date();
    const timeFromStart = Math.floor(
      (now.getTime() - this.sessionStartTime.getTime()) / 1000
    );

    const scrollEvent: ScrollEvent = {
      timestamp: Timestamp.now(),
      scrollPosition: scrollPercentage,
      timeFromStart,
    };

    this.scrollTracker.push(scrollEvent);

    // Update reading progress
    this.activeSession.readingProgress = Math.max(
      this.activeSession.readingProgress,
      scrollPercentage
    );

    // Save scroll data every 10 events to avoid too many writes
    if (this.scrollTracker.length % 10 === 0) {
      this.saveScrollProgress();
    }
  }

  /**
   * End the current reading session
   */
  async endReadingSession(): Promise<void> {
    if (!this.activeSession || !this.sessionStartTime) return;

    try {
      const now = new Date();
      const totalTimeSpent = Math.floor(
        (now.getTime() - this.sessionStartTime.getTime()) / 1000
      );

      // Update session data
      this.activeSession.endTime = Timestamp.now();
      this.activeSession.totalTimeSpent = totalTimeSpent;
      this.activeSession.scrollEvents = this.scrollTracker;
      this.activeSession.isCompleted = this.activeSession.readingProgress >= 80; // Consider 80%+ as completed

      // Save final session data
      if (this.activeSession.id) {
        await updateDoc(doc(db, "readingSessions", this.activeSession.id), {
          endTime: this.activeSession.endTime,
          totalTimeSpent: this.activeSession.totalTimeSpent,
          readingProgress: this.activeSession.readingProgress,
          scrollEvents: this.activeSession.scrollEvents,
          isCompleted: this.activeSession.isCompleted,
        });
      }

      // Update user reading profile
      await this.updateUserReadingProfile(this.activeSession);

      // Track analytics event
      await trackEvent("reading_session_ended", {
        articleId: this.activeSession.articleId,
        articleTitle: this.activeSession.articleTitle,
        userId: this.activeSession.userId,
        sessionId: this.activeSession.id,
        totalTimeSpent,
        readingProgress: this.activeSession.readingProgress,
        isCompleted: this.activeSession.isCompleted,
      });

      // Stop heartbeat
      this.stopHeartbeat();

      // Clear session
      this.activeSession = null;
      this.sessionStartTime = null;
      this.scrollTracker = [];
    } catch (error) {
      console.error("Error ending reading session:", error);
    }
  }

  /**
   * Save scroll progress to Firestore
   */
  private async saveScrollProgress(): Promise<void> {
    if (!this.activeSession?.id) return;

    try {
      await updateDoc(doc(db, "readingSessions", this.activeSession.id), {
        readingProgress: this.activeSession.readingProgress,
        scrollEvents: this.scrollTracker,
      });
    } catch (error) {
      console.error("Error saving scroll progress:", error);
    }
  }

  /**
   * Start heartbeat to track active reading time
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.activeSession && document.hasFocus()) {
        // User is actively reading - update total time
        const now = new Date();
        if (this.sessionStartTime) {
          this.activeSession.totalTimeSpent = Math.floor(
            (now.getTime() - this.sessionStartTime.getTime()) / 1000
          );
        }
      }
    }, 5000); // Update every 5 seconds
  }

  /**
   * Stop heartbeat tracking
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Update user reading profile with session data
   */
  private async updateUserReadingProfile(
    session: ReadingSession
  ): Promise<void> {
    try {
      const profileQuery = query(
        collection(db, "userReadingProfiles"),
        where("userId", "==", session.userId),
        limitQuery(1)
      );

      const profileSnapshot = await getDocs(profileQuery);

      if (profileSnapshot.empty) {
        // Create new profile
        const newProfile: UserReadingProfile = {
          userId: session.userId,
          totalReadingTime: session.totalTimeSpent,
          articlesRead: 1,
          averageReadingTime: session.totalTimeSpent,
          completionRate: session.isCompleted ? 100 : 0,
          preferredReadingTimes: [this.getCurrentTimeSlot()],
          topCategories: [],
          engagementScore: this.calculateEngagementScore(session),
          lastActivity: Timestamp.now(),
          readingSessions: [session.id!],
        };

        await addDoc(collection(db, "userReadingProfiles"), newProfile);
      } else {
        // Update existing profile
        const profileDoc = profileSnapshot.docs[0];
        const profileData = profileDoc.data() as UserReadingProfile;

        const updatedTotalTime =
          profileData.totalReadingTime + session.totalTimeSpent;
        const updatedArticlesRead =
          profileData.articlesRead + (session.isCompleted ? 1 : 0);
        const updatedAverageTime =
          updatedTotalTime / Math.max(updatedArticlesRead, 1);

        // Calculate new completion rate
        const allSessions = [...profileData.readingSessions, session.id!];
        const completedSessions =
          profileData.completionRate *
          (profileData.readingSessions.length / 100);
        const newCompletionRate =
          ((completedSessions + (session.isCompleted ? 1 : 0)) /
            allSessions.length) *
          100;

        await updateDoc(profileDoc.ref, {
          totalReadingTime: updatedTotalTime,
          articlesRead: updatedArticlesRead,
          averageReadingTime: updatedAverageTime,
          completionRate: newCompletionRate,
          lastActivity: Timestamp.now(),
          readingSessions: allSessions,
          engagementScore: this.calculateEngagementScore(session),
        });
      }
    } catch (error) {
      console.error("Error updating user reading profile:", error);
    }
  }

  /**
   * Get reading analytics for admin dashboard
   */
  async getReadingAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<ReadingAnalytics> {
    try {
      let sessionsQuery = query(collection(db, "readingSessions"));

      if (startDate && endDate) {
        sessionsQuery = query(
          collection(db, "readingSessions"),
          where("createdAt", ">=", Timestamp.fromDate(startDate)),
          where("createdAt", "<=", Timestamp.fromDate(endDate))
        );
      }

      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ReadingSession[];

      // Calculate analytics
      const totalUsers = new Set(sessions.map((s) => s.userId)).size;
      const totalReadingTime = sessions.reduce(
        (sum, s) => sum + s.totalTimeSpent,
        0
      );
      const averageSessionTime =
        sessions.length > 0 ? totalReadingTime / sessions.length : 0;

      // Group by articles
      const articleStats = new Map();
      sessions.forEach((session) => {
        const key = session.articleId;
        if (!articleStats.has(key)) {
          articleStats.set(key, {
            articleId: session.articleId,
            title: session.articleTitle,
            sessions: [],
            totalTime: 0,
            completedSessions: 0,
          });
        }

        const stat = articleStats.get(key);
        stat.sessions.push(session);
        stat.totalTime += session.totalTimeSpent;
        if (session.isCompleted) stat.completedSessions++;
      });

      const topArticles = Array.from(articleStats.values())
        .map((stat) => ({
          articleId: stat.articleId,
          title: stat.title,
          totalReads: stat.sessions.length,
          averageTime:
            stat.sessions.length > 0
              ? stat.totalTime / stat.sessions.length
              : 0,
          completionRate:
            stat.sessions.length > 0
              ? (stat.completedSessions / stat.sessions.length) * 100
              : 0,
        }))
        .sort((a, b) => b.totalReads - a.totalReads)
        .slice(0, 10);

      // Calculate engagement levels
      const userProfiles = await getDocs(collection(db, "userReadingProfiles"));
      const profiles = userProfiles.docs.map(
        (doc) => doc.data() as UserReadingProfile
      );

      const userEngagement = {
        highlyEngaged: profiles.filter((p) => p.engagementScore >= 80).length,
        moderatelyEngaged: profiles.filter(
          (p) => p.engagementScore >= 50 && p.engagementScore < 80
        ).length,
        lowEngaged: profiles.filter((p) => p.engagementScore < 50).length,
      };

      // Calculate reading patterns
      const hourly: { [hour: string]: number } = {};
      const daily: { [day: string]: number } = {};

      sessions.forEach((session) => {
        const date = session.startTime.toDate();
        const hour = date.getHours().toString();
        const day = date.toLocaleDateString("en-US", { weekday: "long" });

        hourly[hour] = (hourly[hour] || 0) + 1;
        daily[day] = (daily[day] || 0) + 1;
      });

      return {
        totalUsers,
        totalReadingTime,
        averageSessionTime,
        topArticles,
        userEngagement,
        readingPatterns: { hourly, daily },
      };
    } catch (error) {
      console.error("Error getting reading analytics:", error);
      throw error;
    }
  }

  /**
   * Get user reading sessions
   */ async getUserReadingSessions(
    userId: string,
    limitCount: number = 50
  ): Promise<ReadingSession[]> {
    try {
      const sessionsQuery = query(
        collection(db, "readingSessions"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limitQuery(limitCount)
      );

      const snapshot = await getDocs(sessionsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ReadingSession[];
    } catch (error) {
      console.error("Error getting user reading sessions:", error);
      return [];
    }
  }

  /**
   * Get article reading statistics
   */
  async getArticleReadingStats(articleId: string): Promise<{
    totalSessions: number;
    uniqueReaders: number;
    averageReadingTime: number;
    completionRate: number;
    engagementScore: number;
  }> {
    try {
      const sessionsQuery = query(
        collection(db, "readingSessions"),
        where("articleId", "==", articleId)
      );

      const snapshot = await getDocs(sessionsQuery);
      const sessions = snapshot.docs.map((doc) =>
        doc.data()
      ) as ReadingSession[];

      const uniqueReaders = new Set(sessions.map((s) => s.userId)).size;
      const totalTime = sessions.reduce((sum, s) => sum + s.totalTimeSpent, 0);
      const averageReadingTime =
        sessions.length > 0 ? totalTime / sessions.length : 0;
      const completedSessions = sessions.filter((s) => s.isCompleted).length;
      const completionRate =
        sessions.length > 0 ? (completedSessions / sessions.length) * 100 : 0;

      // Calculate engagement score based on time spent and completion rate
      const engagementScore = Math.min(
        100,
        (averageReadingTime / 60) * 10 + completionRate
      );

      return {
        totalSessions: sessions.length,
        uniqueReaders,
        averageReadingTime,
        completionRate,
        engagementScore,
      };
    } catch (error) {
      console.error("Error getting article reading stats:", error);
      return {
        totalSessions: 0,
        uniqueReaders: 0,
        averageReadingTime: 0,
        completionRate: 0,
        engagementScore: 0,
      };
    }
  }

  /**
   * Calculate engagement score for a session
   */
  private calculateEngagementScore(session: ReadingSession): number {
    // Base score from reading progress
    let score = session.readingProgress;

    // Bonus for completing the article
    if (session.isCompleted) score += 20;

    // Bonus for longer reading times (up to 10 minutes)
    const timeBonus = Math.min(20, (session.totalTimeSpent / 600) * 20);
    score += timeBonus;

    // Bonus for scroll activity (engagement)
    const scrollBonus = Math.min(10, (session.scrollEvents.length / 50) * 10);
    score += scrollBonus;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get current time slot for reading patterns
   */
  private getCurrentTimeSlot(): string {
    const hour = new Date().getHours();
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }

  /**
   * Detect device type
   */
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "tablet";
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    )
      return "mobile";
    return "desktop";
  }

  /**
   * Get browser information
   */
  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  }

  /**
   * Get current active session
   */
  getCurrentSession(): ReadingSession | null {
    return this.activeSession;
  }

  /**
   * Force end session (for page unload)
   */
  async forceEndSession(): Promise<void> {
    if (this.activeSession) {
      await this.endReadingSession();
    }
  }

  /**
   * Get user reading profile
   */
  async getUserReadingProfile(
    userId: string
  ): Promise<UserReadingProfile | null> {
    try {
      const profileDoc = await getDoc(doc(db, "userReadingProfiles", userId));

      if (profileDoc.exists()) {
        return profileDoc.data() as UserReadingProfile;
      }

      return null;
    } catch (error) {
      console.error("Error getting user reading profile:", error);
      return null;
    }
  }
}

// Export singleton instance
export const userBehaviorAnalytics = new UserBehaviorAnalyticsService();
export default userBehaviorAnalytics;
