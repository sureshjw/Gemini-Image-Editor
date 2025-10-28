
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { EditPanel } from './components/EditPanel';
import { fileToBase64 } from './utils/fileUtils';
import { editImageWithPrompt } from './services/geminiService';

export interface ImageState {
  file: File;
  base64Data: string;
  dataUrl: string;
}

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageState | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      setEditedImage(null);
      setHistory([]);
      setHistoryIndex(-1);
      const { base64Data, dataUrl } = await fileToBase64(file);
      setOriginalImage({ file, base64Data, dataUrl });
    } catch (err) {
      console.error(err);
      setError('Failed to load image. Please try another file.');
    }
  }, []);

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!originalImage || !prompt) {
      setError('Please upload an image and enter an editing prompt.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
       // Use the current image state for the edit (original or from history)
      const currentImageBase64 = historyIndex === -1 
        ? originalImage.base64Data 
        : history[historyIndex].split(',')[1];

      const newBase64Data = await editImageWithPrompt(
        currentImageBase64,
        originalImage.file.type,
        prompt
      );
      
      const newImageUrl = `data:${originalImage.file.type};base64,${newBase64Data}`;
      
      // Create new history from current point, discarding old "redo" states
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImageUrl);
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to edit image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, history, historyIndex]);
  
  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history]);
  
  // Effect to update the displayed image when history changes
  useEffect(() => {
    if (historyIndex === -1) {
        setEditedImage(null);
    } else if (history[historyIndex]) {
        setEditedImage(history[historyIndex]);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">1. Upload Your Image</h2>
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              previewUrl={originalImage?.dataUrl}
            />
          </div>

          <div className="flex flex-col p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <EditPanel
              onGenerate={handleGenerate}
              editedImageUrl={editedImage}
              isLoading={isLoading}
              error={error}
              isReadyToEdit={originalImage !== null}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
