
import React, { useState, useMemo } from 'react';
import { EditedImageState, promptEnhancerPresets } from '../App';

type FilterType = 'none' | 'grayscale' | 'sepia' | 'invert';

interface EditPanelProps {
  onGenerate: (prompt: string) => void;
  editedImages: EditedImageState[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  isLoading: boolean;
  error: string | null;
  isReadyToEdit: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  aspectRatioClass: string;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
  contrast: number;
  onContrastChange: (value: number) => void;
  imageStyle: React.CSSProperties;
  qualityEnhancer: string;
  onQualityEnhancerChange: (enhancer: string) => void;
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1-1H5a1 1 0 01-1-1V5zM4 15l4-4 4 4 6-6" />
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

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const DownloadAllIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
);

const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const promptCategories = [
  {
    category: "✨ Product Photography",
    prompts: [
      { title: "Clean White BG", prompt: "Replace the background with a clean white (#ffffff) surface and a soft shadow beneath the product. Keep lighting even and reflections subtle." },
      { title: "Enhance Texture", prompt: "Enhance the product’s edges and texture with high clarity, maintaining true-to-life color accuracy and a professional studio look." },
      { title: "Natural Reflection", prompt: "Create a natural reflection beneath the product on a glossy surface, fading softly to white for a premium catalog aesthetic." },
      { title: "Diffused Lighting", prompt: "Add soft diffused lighting from both sides to eliminate harsh shadows and create a balanced, commercial-grade lighting setup." },
      { title: "Minimalist Gradient", prompt: "Change the background to a minimalist gradient backdrop in light beige tones (#f2f0ea to #e5e3dd) to match luxury product branding." },
      { title: "3D Shadow", prompt: "Generate a 3D shadow under the product consistent with a light source coming from top-left at 45°. Keep edges realistic and soft." },
    ],
  },
  {
    category: "👩‍💼 Professional Portraits",
    prompts: [
      { title: "Neutral BG", prompt: "Replace background with a neutral light grey or soft blurred office environment. Keep lighting flattering and skin tones natural." },
      { title: "Daylight Enhance", prompt: "Enhance lighting to resemble soft daylight from a window — gentle highlights, warm skin tones, and slight eye brightness enhancement." },
      { title: "Subtle Retouch", prompt: "Retouch skin subtly: remove blemishes, soften under-eye shadows, whiten teeth naturally, and preserve authentic skin texture." },
      { title: "Headshot Crop", prompt: "Adjust posture and crop for a professional headshot framing (shoulders to top of head). Center subject with balanced white space." },
      { title: "Cinematic Grade", prompt: "Apply a cinematic color grade with neutral contrast and natural tones — ideal for modern executive profiles." },
      { title: "Clarity Boost", prompt: "Remove any distracting reflections from glasses, balance shadows under chin, and sharpen eyes for crisp clarity." },
    ],
  },
  {
    category: "🧃 Brand / Marketing Design",
    prompts: [
      { title: "Branded BG", prompt: "Replace background with branded color gradient matching [brand color #HEX]. Add subtle light flares for energy." },
      { title: "Graphic Overlays", prompt: "Add minimal graphic overlays (e.g., circles, lines, or brand icons) that complement the layout and emphasize the product focus." },
      { title: "Add Tagline", prompt: "Insert product tagline text in clean sans-serif (e.g., Inter Bold) with balanced spacing and high legibility on mobile." },
      { title: "Vibrant Grade", prompt: "Apply a consistent color grade across all elements — bright, vibrant, and cohesive with modern campaign aesthetics." },
      { title: "Studio Lighting", prompt: "Add dynamic lighting that mimics studio strobes — directional highlights to create depth and emphasize product form." },
      { title: "Declutter", prompt: "Remove background clutter, maintain only essential composition elements, and enhance negative space for brand focus." },
    ],
  },
  {
    category: "🌆 Architectural or Landscape",
    prompts: [
      { title: "Enhance Sky", prompt: "Enhance sky with realistic detail — soft clouds, gradient blues, and warm sunset highlights without over-saturation." },
      { title: "Correct Perspective", prompt: "Correct vertical and horizontal perspective lines to achieve perfect architectural symmetry." },
      { title: "HDR Effect", prompt: "Boost dynamic range: brighten shadows and slightly desaturate highlights for a professional, balanced HDR effect." },
      { title: "Remove Distractions", prompt: "Remove any distracting elements (e.g., wires, cars, signage) for a clean architectural composition." },
      { title: "Golden Hour", prompt: "Add soft golden-hour lighting from the west, enhancing glass reflections and structure details naturally." },
      { title: "Nightscape Glow", prompt: "For nighttime cityscapes, enhance glow and reflections from artificial lights, keeping noise levels low and color grading cinematic." },
    ],
  },
  {
    category: "🎨 Artistic Transformations",
    prompts: [
      { title: "Oil Painting", prompt: "Transform the image into a semi-realistic oil painting with visible brush textures and warm lighting tones." },
      { title: "Watercolor Style", prompt: "Apply watercolor illustration style with soft edges, pastel hues, and visible paper texture background." },
      { title: "Cyberpunk Theme", prompt: "Reimagine the scene in a cyberpunk theme — neon lights, moody rain reflections, and cool magenta-teal grading." },
      { title: "Double Exposure", prompt: "Create a double-exposure effect blending the subject with a cityscape or forest silhouette — seamless integration." },
      { title: "Vintage Film", prompt: "Convert the image into a vintage film look: muted tones, subtle grain, and faded color edges for nostalgic warmth." },
      { title: "3D Clay Render", prompt: "Stylize the subject as a 3D clay render — matte textures, soft shadows, and pastel lighting setup for a playful aesthetic." },
    ],
  },
];

export const EditPanel: React.FC<EditPanelProps> = ({ 
    onGenerate, 
    editedImages,
    selectedIndex,
    onSelectIndex,
    isLoading, 
    error, 
    isReadyToEdit,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    aspectRatio,
    onAspectRatioChange,
    aspectRatioClass,
    filter,
    onFilterChange,
    brightness,
    onBrightnessChange,
    contrast,
    onContrastChange,
    imageStyle,
    qualityEnhancer,
    onQualityEnhancerChange
}) => {
  const [prompt, setPrompt] = useState('');

  const ratioPresets = ['1:1', '4:3', '3:4', '16:9', '9:16'];
  const filters: { name: string; value: FilterType }[] = [
    { name: 'None', value: 'none'},
    { name: 'Grayscale', value: 'grayscale' },
    { name: 'Sepia', value: 'sepia' },
    { name: 'Invert', value: 'invert' },
  ];

  const groupedEnhancers = useMemo(() => {
    return promptEnhancerPresets.reduce((acc, preset) => {
      const category = preset.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(preset);
      return acc;
    }, {} as Record<string, typeof promptEnhancerPresets>);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };
  
  const handleDownload = () => {
    const editedImageUrl = editedImages[selectedIndex]?.url;
    if (!editedImageUrl) return;
    const link = document.createElement('a');
    link.href = editedImageUrl;
    const fileType = editedImageUrl.split(';')[0].split('/')[1] || 'png';
    link.download = `edited-image-${selectedIndex + 1}.${fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    for (let i = 0; i < editedImages.length; i++) {
      const img = editedImages[i];
      if (img?.url) {
        const link = document.createElement('a');
        link.href = img.url;
        const fileType = img.url.split(';')[0].split('/')[1] || 'png';
        link.download = `edited-image-batch-${i + 1}.${fileType}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Add a small delay to prevent browser from blocking multiple downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };
  
  const handleEnhanceRealism = () => {
    const suffix = ' in high resolution, photo-realistic, consistent shadows, natural perspective';
    if (!prompt.trim().endsWith(suffix)) {
      setPrompt(prompt.trim() + suffix);
    }
  };

  const isBatchMode = editedImages.length > 1;
  const editedImage = editedImages[selectedIndex];

  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-cyan-400">2. Describe Your Edit</h2>
        <p className="text-sm text-gray-400 mb-4">Type instructions to modify your image{isBatchMode && 's'}.</p>
        
        <form onSubmit={handleSubmit}>
            <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Remove the person in the background and make the sky blue.'"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
            rows={2}
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
                ) : `✨ Generate Edit${isBatchMode ? 's' : ''}`}
            </button>
        </form>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Or try an example:</p>
        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
            {promptCategories.map((cat) => (
                <div key={cat.category}>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">{cat.category}</h4>
                    <div className="flex flex-wrap gap-2">
                        {cat.prompts.map((p) => (
                            <button 
                                key={p.title} 
                                onClick={() => setPrompt(p.prompt)}
                                disabled={!isReadyToEdit || isLoading}
                                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {p.title}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
         <button
            onClick={handleEnhanceRealism}
            disabled={!isReadyToEdit || isLoading || !prompt.trim()}
            className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            + Enhance Realism
          </button>
      </div>
      
      <div className="space-y-4">
        <div>
            <h3 className="text-xs text-gray-500 mb-1">Prompt Enhancer</h3>
            <select
              value={qualityEnhancer}
              onChange={(e) => onQualityEnhancerChange(e.target.value)}
              disabled={!isReadyToEdit}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 disabled:opacity-50"
            >
              {Object.entries(groupedEnhancers).map(([category, presets]) => (
                <optgroup key={category} label={category}>
                  {presets.map((p) => (
                    <option key={p.label} value={p.label}>{p.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1 h-6">
              Appends: "{promptEnhancerPresets.find(p => p.label === qualityEnhancer)?.value}"
            </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
              <h3 className="text-xs text-gray-500 mb-1">Aspect Ratio</h3>
              <div className="flex flex-wrap items-center gap-2">
              {ratioPresets.map((preset) => (
                  <button
                  key={preset}
                  onClick={() => onAspectRatioChange(preset)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      aspectRatio === preset
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  >
                  {preset}
                  </button>
              ))}
              </div>
          </div>
          <div>
              <h3 className="text-xs text-gray-500 mb-1">Filters</h3>
              <div className="flex flex-wrap items-center gap-2">
              {filters.map(f => (
                  <button
                  key={f.value}
                  onClick={() => onFilterChange(f.value)}
                  disabled={!isReadyToEdit}
                  className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      filter === f.value
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  >
                  {f.name}
                  </button>
              ))}
              </div>
          </div>
        </div>
      </div>
       
      <div>
        <h3 className="text-xs text-gray-500 mb-1">Adjustments</h3>
        <div className="space-y-2">
            <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2">
                <label htmlFor="brightness" className="text-sm font-medium text-gray-400">Brightness</label>
                <input id="brightness" type="range" min="0" max="200" value={brightness} onChange={(e) => onBrightnessChange(Number(e.target.value))} disabled={!isReadyToEdit} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:cursor-not-allowed" />
                <span className="text-sm text-gray-500 w-10 text-center">{brightness}%</span>
            </div>
             <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2">
                <label htmlFor="contrast" className="text-sm font-medium text-gray-400">Contrast</label>
                <input id="contrast" type="range" min="0" max="200" value={contrast} onChange={(e) => onContrastChange(Number(e.target.value))} disabled={!isReadyToEdit} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:cursor-not-allowed" />
                <span className="text-sm text-gray-500 w-10 text-center">{contrast}%</span>
            </div>
        </div>
      </div>


      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-300">
                Result
                {isBatchMode && <span className="text-sm font-normal text-gray-500 ml-2">{selectedIndex + 1} / {editedImages.length}</span>}
            </h3>
            <div className="flex items-center gap-2">
                 {isBatchMode && (
                  <button
                      onClick={handleDownloadAll}
                      disabled={editedImages.every(img => img.url === null) || isLoading}
                      className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Download All Images"
                      title="Download All"
                  >
                      <DownloadAllIcon />
                  </button>
                )}
                 <button
                    onClick={handleDownload}
                    disabled={!editedImage?.url || isLoading}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Download Image"
                    title="Download Selected"
                >
                    <DownloadIcon />
                </button>
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
        <div className={`w-full ${aspectRatioClass} bg-gray-900 rounded-lg flex justify-center items-center overflow-hidden transition-all duration-300`}>
            {isLoading && <LoadingSpinner />}
            {!isLoading && editedImage?.url && (
            <img src={editedImage.url} alt="Edited result" className="w-full h-full object-contain" style={imageStyle} />
            )}
            {!isLoading && !editedImage?.url && <ResultPlaceholder />}
        </div>
        {isBatchMode && (
         <div className="w-full mt-4">
           <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs text-gray-500">Edited Images</h3>
            <span className="text-xs text-gray-500">{selectedIndex + 1} / {editedImages.length}</span>
           </div>
           <div className="flex gap-2 overflow-x-auto pb-2">
             {editedImages.map(({url, error}, index) => (
               <div
                 key={index}
                 onClick={() => onSelectIndex(index)}
                 title={error ? `Error: ${error}` : `View result ${index + 1}`}
                 className={`relative w-20 h-20 flex-shrink-0 rounded-md cursor-pointer overflow-hidden transition-all duration-200 bg-gray-800 ${
                   index === selectedIndex
                     ? 'ring-2 ring-cyan-400'
                     : 'ring-1 ring-gray-600 hover:ring-cyan-500'
                 }`}
               >
                  {url ? (
                    <img
                      src={url}
                      alt={`Edited thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900/50 flex items-center justify-center">
                        {error ? <ErrorIcon/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1-1H5a1 1 0 01-1-1V5zM4 15l4-4 4 4 6-6" /></svg>}
                    </div>
                  )}
               </div>
             ))}
           </div>
         </div>
        )}
      </div>
       {error && <p className="mt-2 text-sm text-red-400 text-center">{error}</p>}
    </div>
  );
};
