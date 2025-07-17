import { Timestamp } from "firebase/firestore";

// Interface pentru asistentul AI general inteligent
export interface AIAssistant {
  id: string;
  name: string;
  version: string;
  capabilities: AICapability[];
  knowledgeDomains: KnowledgeDomain[];
  personalityTraits: PersonalityTrait[];
  conversationContext: ConversationContext;
  learningData: LearningData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AICapability {
  type: CapabilityType;
  description: string;
  proficiencyLevel: 1 | 2 | 3 | 4 | 5; // 1-beginner, 5-expert
  enabled: boolean;
  lastUsed?: Timestamp;
}

export enum CapabilityType {
  MEDICAL_CONSULTATION = "medical_consultation",
  MEDICATION_ADVICE = "medication_advice",
  SYMPTOM_ANALYSIS = "symptom_analysis",
  DRUG_INTERACTION_CHECK = "drug_interaction_check",
  GENERAL_CONVERSATION = "general_conversation",
  EDUCATIONAL_CONTENT = "educational_content",
  EMOTIONAL_SUPPORT = "emotional_support",
  LIFESTYLE_ADVICE = "lifestyle_advice",
  NUTRITION_GUIDANCE = "nutrition_guidance",
  FITNESS_COACHING = "fitness_coaching",
  MENTAL_HEALTH_SUPPORT = "mental_health_support",
  EMERGENCY_GUIDANCE = "emergency_guidance",
  APPOINTMENT_SCHEDULING = "appointment_scheduling",
  REMINDER_MANAGEMENT = "reminder_management",
  HEALTH_TRACKING = "health_tracking",
  RESEARCH_ASSISTANCE = "research_assistance",
  LANGUAGE_TRANSLATION = "language_translation",
  CREATIVE_WRITING = "creative_writing",
  PROBLEM_SOLVING = "problem_solving",
  TECHNICAL_SUPPORT = "technical_support",
}

export interface KnowledgeDomain {
  domain: string;
  subDomains: string[];
  expertiseLevel: 1 | 2 | 3 | 4 | 5;
  lastUpdated: Timestamp;
  sources: KnowledgeSource[];
  confidence: number; // 0-100
}

export interface KnowledgeSource {
  type:
    | "medical_database"
    | "research_paper"
    | "clinical_guideline"
    | "user_feedback"
    | "training_data";
  name: string;
  url?: string;
  credibility: number; // 0-100
  lastVerified: Timestamp;
}

export interface PersonalityTrait {
  trait: PersonalityTraitType;
  intensity: 1 | 2 | 3 | 4 | 5;
  description: string;
  manifestation: string[];
}

export enum PersonalityTraitType {
  EMPATHETIC = "empathetic",
  ANALYTICAL = "analytical",
  PATIENT = "patient",
  ENCOURAGING = "encouraging",
  PROFESSIONAL = "professional",
  FRIENDLY = "friendly",
  CAUTIOUS = "cautious",
  THOROUGH = "thorough",
  ADAPTIVE = "adaptive",
  CURIOUS = "curious",
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  conversationHistory: ConversationEntry[];
  currentTopic: string;
  userPreferences: UserConversationPreferences;
  contextualMemory: ContextualMemory;
  activeCapabilities: CapabilityType[];
}

export interface ConversationEntry {
  id: string;
  timestamp: Timestamp;
  speaker: "user" | "ai";
  message: string;
  intent: ConversationIntent;
  entities: ExtractedEntity[];
  sentiment: SentimentAnalysis;
  confidence: number;
  responseTime?: number; // for AI messages
}

export interface ConversationIntent {
  primary: IntentType;
  secondary?: IntentType[];
  confidence: number;
  parameters: Record<string, any>;
}

export enum IntentType {
  GREETING = "greeting",
  QUESTION = "question",
  REQUEST_HELP = "request_help",
  SYMPTOM_REPORT = "symptom_report",
  MEDICATION_INQUIRY = "medication_inquiry",
  APPOINTMENT_REQUEST = "appointment_request",
  EMERGENCY = "emergency",
  FEEDBACK = "feedback",
  GOODBYE = "goodbye",
  CLARIFICATION = "clarification",
  COMPLAINT = "complaint",
  PRAISE = "praise",
  EDUCATION_REQUEST = "education_request",
  LIFESTYLE_QUESTION = "lifestyle_question",
  EMOTIONAL_SUPPORT_REQUEST = "emotional_support_request",
}

export interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export enum EntityType {
  SYMPTOM = "symptom",
  MEDICATION = "medication",
  BODY_PART = "body_part",
  DURATION = "duration",
  INTENSITY = "intensity",
  FREQUENCY = "frequency",
  DATE = "date",
  TIME = "time",
  PERSON = "person",
  LOCATION = "location",
  CONDITION = "condition",
  EMOTION = "emotion",
  AGE = "age",
  GENDER = "gender",
}

export interface SentimentAnalysis {
  polarity: "positive" | "negative" | "neutral";
  intensity: number; // 0-1
  emotions: DetectedEmotion[];
  confidence: number;
}

export interface DetectedEmotion {
  emotion: EmotionType;
  intensity: number; // 0-1
}

export enum EmotionType {
  JOY = "joy",
  SADNESS = "sadness",
  ANGER = "anger",
  FEAR = "fear",
  SURPRISE = "surprise",
  DISGUST = "disgust",
  ANXIETY = "anxiety",
  RELIEF = "relief",
  HOPE = "hope",
  FRUSTRATION = "frustration",
}

export interface UserConversationPreferences {
  communicationStyle: "formal" | "casual" | "medical_professional";
  responseLength: "brief" | "detailed" | "comprehensive";
  languagePreference: "ro" | "en" | "mixed";
  explanationLevel: "simple" | "intermediate" | "advanced";
  emotionalSupport: boolean;
  urgencyThreshold: "low" | "medium" | "high";
  reminderFrequency: "none" | "daily" | "weekly" | "monthly";
}

export interface ContextualMemory {
  shortTermMemory: MemoryEntry[];
  longTermMemory: MemoryEntry[];
  userProfile: UserMemoryProfile;
  conversationPatterns: ConversationPattern[];
  learningPoints: LearningPoint[];
}

export interface MemoryEntry {
  id: string;
  content: string;
  category: MemoryCategory;
  importance: 1 | 2 | 3 | 4 | 5;
  timestamp: Timestamp;
  expiryDate?: Timestamp;
  associatedEntities: string[];
  contextTags: string[];
}

export enum MemoryCategory {
  MEDICAL_HISTORY = "medical_history",
  PREFERENCES = "preferences",
  PERSONAL_INFO = "personal_info",
  CONVERSATION_CONTEXT = "conversation_context",
  LEARNING_PROGRESS = "learning_progress",
  EMOTIONAL_STATE = "emotional_state",
  GOALS = "goals",
  CONCERNS = "concerns",
}

export interface UserMemoryProfile {
  communicationPatterns: string[];
  preferredTopics: string[];
  avoidedTopics: string[];
  knowledgeLevel: Record<string, number>; // domain -> level (1-5)
  interactionHistory: InteractionSummary;
  personalMilestones: Milestone[];
}

export interface InteractionSummary {
  totalConversations: number;
  averageSessionLength: number;
  mostActiveTimeOfDay: string;
  preferredCapabilities: CapabilityType[];
  satisfactionRating: number; // 1-5
  lastInteraction: Timestamp;
}

export interface Milestone {
  id: string;
  type:
    | "health_goal"
    | "learning_achievement"
    | "behavioral_change"
    | "medical_milestone";
  title: string;
  description: string;
  achievedAt: Timestamp;
  significance: 1 | 2 | 3 | 4 | 5;
}

export interface ConversationPattern {
  pattern: string;
  frequency: number;
  context: string[];
  effectiveResponses: string[];
  lastObserved: Timestamp;
}

export interface LearningPoint {
  topic: string;
  learned: boolean;
  reinforcementNeeded: boolean;
  lastDiscussed: Timestamp;
  userComprehension: number; // 0-100
  notes: string;
}

export interface LearningData {
  userFeedback: UserFeedback[];
  performanceMetrics: PerformanceMetrics;
  adaptationRules: AdaptationRule[];
  continuousLearning: ContinuousLearningData;
}

export interface UserFeedback {
  id: string;
  conversationId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  category: FeedbackCategory;
  comment?: string;
  timestamp: Timestamp;
  improvementSuggestions?: string[];
}

export enum FeedbackCategory {
  ACCURACY = "accuracy",
  HELPFULNESS = "helpfulness",
  EMPATHY = "empathy",
  RESPONSE_TIME = "response_time",
  RELEVANCE = "relevance",
  CLARITY = "clarity",
  OVERALL_SATISFACTION = "overall_satisfaction",
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  accuracyRate: number;
  userSatisfactionScore: number;
  resolutionRate: number;
  escalationRate: number;
  retentionRate: number;
  engagementLevel: number;
  lastCalculated: Timestamp;
}

export interface AdaptationRule {
  id: string;
  condition: string;
  action: string;
  priority: 1 | 2 | 3 | 4 | 5;
  enabled: boolean;
  successRate: number;
  createdAt: Timestamp;
  lastTriggered?: Timestamp;
}

export interface ContinuousLearningData {
  newKnowledgeAcquired: KnowledgeUpdate[];
  behavioralPatterns: BehavioralPattern[];
  optimizationPoints: OptimizationPoint[];
  modelVersions: ModelVersion[];
}

export interface KnowledgeUpdate {
  domain: string;
  content: string;
  source: string;
  confidence: number;
  verified: boolean;
  timestamp: Timestamp;
}

export interface BehavioralPattern {
  pattern: string;
  frequency: number;
  effectiveness: number;
  context: string[];
  lastObserved: Timestamp;
}

export interface OptimizationPoint {
  area: string;
  currentPerformance: number;
  targetPerformance: number;
  improvementStrategy: string;
  priority: 1 | 2 | 3 | 4 | 5;
  deadline?: Timestamp;
}

export interface ModelVersion {
  version: string;
  description: string;
  improvements: string[];
  deployedAt: Timestamp;
  performanceGains: Record<string, number>;
}
