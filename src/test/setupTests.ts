// Jest setup file
import "@testing-library/jest-dom";

// Mock CSS modules
jest.mock("*.module.css", () => ({}), { virtual: true });

// Mock static assets
jest.mock("*.svg", () => "svg-mock", { virtual: true });
jest.mock("*.png", () => "png-mock", { virtual: true });
jest.mock("*.jpg", () => "jpg-mock", { virtual: true });

// Mock Chart.js components to avoid canvas issues in tests
jest.mock("react-chartjs-2", () => ({
  Line: jest.fn(() => "Line Chart"),
  Bar: jest.fn(() => "Bar Chart"),
  Doughnut: jest.fn(() => "Doughnut Chart"),
  Pie: jest.fn(() => "Pie Chart"),
}));

// Mock Firebase to avoid initialization issues
jest.mock("../firebase", () => ({
  auth: {
    currentUser: { uid: "test-user-id" },
  },
  db: {},
  storage: {},
}));

// Mock Firebase services
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({ currentUser: { uid: "test-user-id" } })),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

// Suppress console warnings during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Warning:")) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
