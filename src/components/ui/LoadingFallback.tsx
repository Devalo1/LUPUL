import React from 'react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"></div>
        <p className="mt-4 text-gray-600">Se încarcă...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
