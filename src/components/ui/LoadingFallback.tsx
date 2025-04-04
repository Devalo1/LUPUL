import React from 'react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Se încarcă...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
