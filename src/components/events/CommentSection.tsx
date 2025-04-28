import React from "react";

const CommentSection: React.FC = () => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4">Comentarii</h3>
      {/* Comentarii animate */}
      <div className="space-y-4">
        <div className="flex items-start">
          <img
            src="https://via.placeholder.com/40"
            alt="Avatar"
            className="w-10 h-10 rounded-full mr-4"
          />
          <div>
            <p className="text-sm font-bold">Utilizator</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Acesta este un comentariu de test.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
