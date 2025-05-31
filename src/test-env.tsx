import React from "react";
import "./components/TestEnv.css";

const TestEnv: React.FC = () => {
  // eslint-disable-next-line no-console
  console.log("Test Environment Variables:");
  // eslint-disable-next-line no-console
  console.log("import.meta.env:", import.meta.env);
  // eslint-disable-next-line no-console
  console.log("VITE_OPENAI_API_KEY:", import.meta.env.VITE_OPENAI_API_KEY);

  return (
    <div className="test-env-container">
      <h2 className="test-env-title">Environment Variable Test</h2>
      <p className="test-env-info">
        OpenAI API Key present:{" "}
        {import.meta.env.VITE_OPENAI_API_KEY ? "YES" : "NO"}
      </p>
      <p className="test-env-info">
        Key length:{" "}
        {import.meta.env.VITE_OPENAI_API_KEY
          ? import.meta.env.VITE_OPENAI_API_KEY.length
          : "0"}
      </p>
      <div className="test-env-json">
        <strong>All environment variables:</strong>
        <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestEnv;
