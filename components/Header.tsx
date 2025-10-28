
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Gemini Image Editor
        </h1>
        <p className="mt-2 text-md text-gray-400">
          Clean up product photos and more with simple text instructions.
        </p>
      </div>
    </header>
  );
};
