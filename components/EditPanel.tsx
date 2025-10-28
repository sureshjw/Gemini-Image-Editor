
import React, { useState } from 'react';

interface EditPanelProps {
  onGenerate: (prompt: string) => void;
  editedImageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  isReadyToEdit: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
        <p className="mt-4 text-gray-400">Gemini is thinking...</p>
    </div>
);

const ResultPlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900/50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15l4-4 4 4 6-6" />
        </svg>
        <p className="mt-4 text-gray-500">Your edited image will appear here</p>
    </div>
);

const UndoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);

const RedoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
    </svg>
);

export const EditPanel: React.FC<EditPanelProps> = ({ 
    onGenerate, 
    editedImageUrl, 
    isLoading, 
    error, 
    isReadyToEdit,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}) => {
  const [prompt, setPrompt] = useState('');
  
  const examplePrompts = [
      "Remove the background",
      "Make the background white",
      "Add a retro filter",
      "Improve lighting and contrast",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-cyan-400">2. Describe Your Edit</h2>
      <p className="text-sm text-gray-400 mb-4">Type instructions to modify your image.</p>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Remove the person in the background and make the sky blue.'"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
          rows={3}
          disabled={!isReadyToEdit || isLoading}
        />
        <button
          type="submit"
          disabled={!isReadyToEdit || isLoading || !prompt.trim()}
          className="mt-2 w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
                </>
            ) : '✨ Generate Edit'}
        </button>
      </form>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Or try an example:</p>
        <div className="flex flex-wrap gap-2">
            {examplePrompts.map((p) => (
                <button 
                    key={p} 
                    onClick={() => setPrompt(p)}
                    disabled={!isReadyToEdit || isLoading}
                    className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {p}
                </button>
            ))}
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-300">Result</h3>
            <div className="flex items-center gap-2">
                <button
                    onClick={onUndo}
                    disabled={!canUndo || isLoading}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Undo"
                >
                    <UndoIcon />
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo || isLoading}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Redo"
                >
                    <RedoIcon />
                </button>
            </div>
        </div>
        <div className="w-full aspect-square bg-gray-900 rounded-lg flex justify-center items-center overflow-hidden">
            {isLoading && <LoadingSpinner />}
            {!isLoading && editedImageUrl && (
            <img src={editedImageUrl} alt="Edited result" className="w-full h-full object-contain" />
            )}
            {!isLoading && !editedImageUrl && <ResultPlaceholder />}
        </div>
      </div>
       {error && <p className="mt-2 text-sm text-red-400 text-center">{error}</p>}
    </div>
  );
};
