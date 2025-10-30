
import React, { useRef, useState, useCallback } from 'react';
import { ImageState } from '../App';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';

interface ImageUploaderProps {
  onImageUpload: (dataUrl: string) => void;
  images: ImageState[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  aspectRatioClass: string;
  imageStyle: React.CSSProperties;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onImageUpload, 
    images,
    selectedIndex,
    onSelectIndex,
    aspectRatioClass, 
    imageStyle 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.addEventListener('load', () => setSourceImg(reader.result?.toString() || ''));
        reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (file) {
        handleFileSelect(file);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
    
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
    
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCropImage = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop || !completedCrop.width || !completedCrop.height) {
        console.error('Crop details not available');
        return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }
    
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        completedCrop.width,
        completedCrop.height
    );
    
    const base64Image = canvas.toDataURL('image/png');
    onImageUpload(base64Image);
    setSourceImg(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, // 1:1 aspect ratio
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(crop);
  }

  const renderCropper = () => (
    <div className="w-full flex flex-col items-center gap-4">
        <p className="text-sm text-gray-400">Adjust the selection to crop your image.</p>
        <div className={`w-full ${aspectRatioClass} flex justify-center items-center`}>
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                className="max-w-full max-h-full"
            >
                <img ref={imgRef} src={sourceImg!} onLoad={onImageLoad} className="max-w-full max-h-full" />
            </ReactCrop>
        </div>
        <div className="flex gap-4">
            <button onClick={() => setSourceImg(null)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">
                Cancel
            </button>
            <button onClick={handleCropImage} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 transition-colors">
                Crop & Add Image
            </button>
        </div>
    </div>
  );

  const renderUploader = () => (
    <div 
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`w-full ${aspectRatioClass} border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-700/30'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        {images.length > 0 ? (
          <img 
            src={images[selectedIndex]?.dataUrl} 
            alt={`Preview ${selectedIndex + 1}`} 
            className="w-full h-full object-contain rounded-lg p-2" 
            style={imageStyle}
          />
        ) : (
          <div className="text-center">
            <UploadIcon />
            <p className="mt-2 font-semibold text-gray-400">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
          </div>
        )}
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {sourceImg ? renderCropper() : renderUploader()}
       {images.length > 1 && !sourceImg && (
       <div className="w-full">
         <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs text-gray-500">Uploaded Images</h3>
            <span className="text-xs text-gray-500">{selectedIndex + 1} / {images.length}</span>
         </div>
         <div className="flex gap-2 overflow-x-auto pb-2">
           {images.map((image, index) => (
             <div
               key={`${image.file.name}-${index}`}
               onClick={() => onSelectIndex(index)}
               className={`w-20 h-20 flex-shrink-0 rounded-md cursor-pointer overflow-hidden transition-all duration-200 ${
                 index === selectedIndex
                   ? 'ring-2 ring-cyan-400'
                   : 'ring-1 ring-gray-600 hover:ring-cyan-500'
               }`}
             >
               <img
                 src={image.dataUrl}
                 alt={`Thumbnail ${index + 1}`}
                 className="w-full h-full object-cover"
               />
             </div>
           ))}
         </div>
       </div>
     )}
    </div>
  );
};