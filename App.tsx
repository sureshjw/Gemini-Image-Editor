
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { EditPanel } from './components/EditPanel';
import { fileToBase64, dataURLtoFile } from './utils/fileUtils';
import { editImageWithPrompt } from './services/geminiService';

export interface ImageState {
  file: File;
  base64Data: string;
  dataUrl: string;
}

export interface EditedImageState {
  url: string | null;
  error: string | null;
}

type FilterType = 'none' | 'grayscale' | 'sepia' | 'invert';

export const promptEnhancerPresets = [
  // 🧩 GENERAL QUALITY
  {
    label: "Standard Quality",
    value: "in high resolution, well-lit, balanced contrast and sharp detail",
    category: "General"
  },
  {
    label: "High Quality",
    value: "in ultra-high resolution, crisp detail, balanced lighting, and enhanced texture clarity",
    category: "General"
  },
  {
    label: "Ultra HD (4K)",
    value: "in 4K resolution, hyper-detailed, realistic lighting and shadows, fine material texture",
    category: "General"
  },
  {
    label: "8K Master Detail",
    value: "in 8K resolution, ultra-sharp textures, cinematic lighting, and professional post-processing quality",
    category: "General"
  },
  {
    label: "Photo-Realistic",
    value: "photo-realistic finish, realistic lighting and reflections, true-to-life color tones",
    category: "General"
  },
  {
    label: "HDR Realism",
    value: "high dynamic range lighting, enhanced contrast and depth, sharp detail preservation",
    category: "General"
  },

  // ✨ PRODUCT / COMMERCIAL
  {
    label: "Studio Lighting",
    value: "studio-quality lighting, soft shadows, perfect exposure, fine surface detail",
    category: "Product"
  },
  {
    label: "Luxury Product",
    value: "in ultra-high resolution, product photography lighting, clean reflections, and premium finish",
    category: "Product"
  },
  {
    label: "E-Commerce Ready",
    value: "studio-lit background, crisp edge definition, natural product colors, and optimized clarity",
    category: "Product"
  },
  {
    label: "Luxury Branding",
    value: "premium visual tone, glossy surface lighting, perfect exposure, luxury-grade realism",
    category: "Product"
  },
  {
    label: "Minimalist Aesthetic",
    value: "clean composition, soft natural lighting, balanced contrast, ultra-crisp edges",
    category: "Product"
  },
  {
    label: "Print Ready",
    value: "optimized for print, ultra-detailed resolution, accurate color calibration, fine surface texture",
    category: "Product"
  },

  // 👩‍💼 PORTRAIT / PEOPLE
  {
    label: "Portrait Soft Focus",
    value: "in high resolution, soft natural lighting, skin-smooth texture, subtle depth of field",
    category: "Portrait"
  },
  {
    label: "Professional Headshot",
    value: "studio-quality portrait lighting, sharp facial detail, neutral background, realistic tone",
    category: "Portrait"
  },
  {
    label: "Cinematic Glow",
    value: "cinematic lighting, film-grade tone mapping, ultra-detailed shadows and depth of field",
    category: "Portrait"
  },
  {
    label: "Cinematic Contrast",
    value: "film dynamic range, dramatic lighting, rich contrast, and 3D-like depth",
    category: "Portrait"
  },
  {
    label: "AI Enhanced Clarity",
    value: "AI-enhanced clarity, intelligent sharpening and denoising, realistic micro-textures",
    category: "Portrait"
  },
  {
    label: "Masterpiece Mode",
    value: "8K ultra detail, cinematic lighting, hyperreal color balance, and artist-grade finish",
    category: "Portrait"
  },

  // 🧃 BRAND / MARKETING
  {
    label: "Social Media Optimized",
    value: "high resolution, bright balanced colors, crisp contrast, optimized clarity for digital sharing",
    category: "Branding"
  },
  {
    label: "Vibrant Campaign",
    value: "bright, consistent color tone, balanced exposure, and eye-catching clarity for ad visuals",
    category: "Branding"
  },
  {
    label: "Product Hero Shot",
    value: "perfect studio lighting, shallow depth of field, product-centered composition, premium clarity",
    category: "Branding"
  },
  {
    label: "Ad Banner Ready",
    value: "enhanced clarity, balanced contrast, punchy tone mapping, and high legibility for overlay text",
    category: "Branding"
  },
  {
    label: "Brand Color Harmony",
    value: "consistent brand palette, subtle light flares, and even contrast for marketing use",
    category: "Branding"
  },

  // 🌆 ARCHITECTURAL / LANDSCAPE
  {
    label: "Architectural Precision",
    value: "in 8K resolution, sharp geometry, realistic reflections, detailed material rendering",
    category: "Architecture"
  },
  {
    label: "Landscape Realism",
    value: "high-resolution landscape lighting, balanced highlights, lifelike color grading, deep clarity",
    category: "Architecture"
  },
  {
    label: "Sunset Glow",
    value: "warm cinematic lighting, detailed shadows, soft atmospheric haze, natural tone balance",
    category: "Architecture"
  },
  {
    label: "Urban Night Scene",
    value: "in ultra-high resolution, neon reflections, rich shadows, crisp night-time clarity",
    category: "Architecture"
  },
  {
    label: "Macro Detail",
    value: "extreme close-up, microtexture precision, realistic depth of field, high contrast focus",
    category: "Architecture"
  },

  // 🎨 ARTISTIC / CREATIVE
  {
    label: "Artistic Masterpiece",
    value: "artist-grade detail and tone, digital matte painting quality, finely balanced color and texture",
    category: "Artistic"
  },
  {
    label: "Vintage Film Look",
    value: "film grain texture, muted tones, soft vignette, warm analog color balance",
    category: "Artistic"
  },
  {
    label: "Digital Painting",
    value: "high-resolution brush detail, rich painterly texture, balanced tone and depth",
    category: "Artistic"
  },
  {
    label: "Fantasy Illustration",
    value: "vibrant 8K detail, cinematic lighting, painterly texture, and ethereal glow effects",
    category: "Artistic"
  },
  {
    label: "3D Render Realism",
    value: "physically-based rendering, ray-traced reflections, soft global illumination, ultra-fine texture detail",
    category: "Artistic"
  }
];

const getQualityEnhancerSuffix = (enhancerLabel: string): string => {
  const enhancer = promptEnhancerPresets.find(p => p.label === enhancerLabel);
  return enhancer ? enhancer.value : "";
};


const getAspectRatioClass = (ratio: string): string => {
  switch (ratio) {
    case '1:1':
      return 'aspect-square';
    case '16:9':
      return 'aspect-video';
    case '9:16':
      return 'aspect-[9/16]';
    case '4:3':
      return 'aspect-[4/3]';
    case '3:4':
      return 'aspect-[3/4]';
    default:
      if (ratio && ratio.includes(':')) {
        const [w, h] = ratio.split(':');
        return `aspect-[${w}/${h}]`;
      }
      return 'aspect-square';
  }
};


const App: React.FC = () => {
  const [originalImages, setOriginalImages] = useState<ImageState[]>([]);
  const [editedImages, setEditedImages] = useState<EditedImageState[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  
  const [filter, setFilter] = useState<FilterType>('none');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [qualityEnhancer, setQualityEnhancer] = useState<string>('Standard Quality');


  const handleImageUpload = useCallback(async (dataUrl: string) => {
    try {
      const isFirstImage = originalImages.length === 0;
      if (isFirstImage) {
        setError(null);
        setFilter('none');
        setBrightness(100);
        setContrast(100);
        setQualityEnhancer('Standard Quality');
      }
      
      const file = dataURLtoFile(dataUrl, `cropped-${Date.now()}.png`);
      const { base64Data } = await fileToBase64(file);
      const newImage: ImageState = { file, base64Data, dataUrl };

      const newImages = [...originalImages, newImage];
      setOriginalImages(newImages);
      setEditedImages(prev => [...prev, { url: null, error: null }]);
      setSelectedImageIndex(newImages.length - 1); // Select the new image
    } catch (err) {
      console.error(err);
      setError('Failed to process cropped image. Please try again.');
    }
  }, [originalImages]);

  const handleGenerate = useCallback(async (prompt: string) => {
    if (originalImages.length === 0 || !prompt) {
      setError('Please upload at least one image and enter a prompt.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const qualitySuffix = getQualityEnhancerSuffix(qualityEnhancer);
    const finalPrompt = `${prompt.trim()}${qualitySuffix ? `, ${qualitySuffix}` : ''}`;


    try {
      const promises = originalImages.map((image) => {
          return editImageWithPrompt(
            image.base64Data,
            image.file.type,
            finalPrompt
          ).catch(e => e); // Catch errors individually to not fail the whole batch
      });

      const results = await Promise.all(promises);
      
      const newEditedImages: EditedImageState[] = [];
      let anyError = false;

      results.forEach((result, index) => {
        if (typeof result === 'string') {
           newEditedImages[index] = {
            url: `data:${originalImages[index].file.type};base64,${result}`,
            error: null,
          };
        } else {
          console.error(`Error processing image ${index + 1}:`, result);
          newEditedImages[index] = {
            url: null,
            error: result.message || "An unknown error occurred during processing."
          };
          anyError = true;
        }
      });

      setEditedImages(newEditedImages);

      if (anyError) {
        setError("Some images could not be processed. Hover over failed thumbnails for details.");
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to edit image(s): ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, qualityEnhancer]);
  
  // History is disabled for batch mode for simplicity.
  const isBatchMode = originalImages.length > 1;
  const canUndo = !isBatchMode; 
  const canRedo = !isBatchMode;

  const aspectRatioClass = getAspectRatioClass(aspectRatio);
  
  const imageStyle: React.CSSProperties = {
    filter: `
      brightness(${brightness / 100})
      contrast(${contrast / 100})
      ${filter === 'grayscale' ? 'grayscale(100%)' : ''}
      ${filter === 'sepia' ? 'sepia(100%)' : ''}
      ${filter === 'invert' ? 'invert(100%)' : ''}
    `.trim(),
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">1. Upload & Crop</h2>
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              images={originalImages}
              selectedIndex={selectedImageIndex}
              onSelectIndex={setSelectedImageIndex}
              aspectRatioClass={aspectRatioClass}
              imageStyle={imageStyle}
            />
          </div>

          <div className="flex flex-col p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <EditPanel
              onGenerate={handleGenerate}
              editedImages={editedImages}
              selectedIndex={selectedImageIndex}
              onSelectIndex={setSelectedImageIndex}
              isLoading={isLoading}
              error={error}
              isReadyToEdit={originalImages.length > 0}
              onUndo={() => {}} // History disabled in batch mode
              onRedo={() => {}} // History disabled in batch mode
              canUndo={canUndo}
              canRedo={canRedo}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              aspectRatioClass={aspectRatioClass}
              filter={filter}
              onFilterChange={setFilter}
              brightness={brightness}
              onBrightnessChange={setBrightness}
              contrast={contrast}
              onContrastChange={setContrast}
              imageStyle={imageStyle}
              qualityEnhancer={qualityEnhancer}
              onQualityEnhancerChange={setQualityEnhancer}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
