
import React, { useState, useCallback } from 'react';
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

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      setEditedImage(null);
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
    setEditedImage(null);

    try {
      const newBase64Data = await editImageWithPrompt(
        originalImage.base64Data,
        originalImage.file.type,
        prompt
      );
      setEditedImage(`data:${originalImage.file.type};base64,${newBase64Data}`);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to edit image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage]);

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
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
