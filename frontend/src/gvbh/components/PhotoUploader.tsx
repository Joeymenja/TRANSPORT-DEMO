import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon, Upload, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface PhotoUploaderProps {
  label: string;
  onImageSelect: (dataUrl: string) => void;
  aspectRatio?: string; // e.g., 'aspect-video', 'aspect-square'
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ label, onImageSelect, aspectRatio = 'aspect-video' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityWarning, setQualityWarning] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      setQualityWarning(false);
      setPreview(null); // Clear previous preview while analyzing

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // Simulate Quality Check
        setTimeout(() => {
           // Mock logic: 10% chance of "blurry" photo for demo purposes
           const isBlurry = Math.random() > 0.9;
           
           if (isBlurry) {
             setQualityWarning(true);
             setIsAnalyzing(false);
             // Still allow it, but warn
             setPreview(result);
             onImageSelect(result);
           } else {
             setPreview(result);
             setIsAnalyzing(false);
             onImageSelect(result);
           }
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setQualityWarning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onClick={triggerSelect}
      className={`relative w-full ${aspectRatio} bg-gray-50 border-2 border-dashed rounded-[28px] overflow-hidden cursor-pointer transition-all group ${preview ? (qualityWarning ? 'border-amber-400 bg-amber-50' : 'border-teal-500 bg-teal-50') : 'border-gray-200 hover:border-sky-300 hover:bg-white'}`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment"
        className="hidden" 
      />

      {isAnalyzing ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10">
           <Loader2 className="animate-spin text-teal-500 mb-2" size={24} />
           <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Checking Quality...</span>
        </div>
      ) : preview ? (
        <>
          <img src={preview} alt="Upload preview" className={`w-full h-full object-cover ${qualityWarning ? 'opacity-80 blur-[1px]' : ''}`} />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          
          <div className="absolute top-3 right-3 flex gap-2">
             <button 
              onClick={handleClear}
              className="p-2 bg-white/90 text-gray-500 rounded-full shadow-lg hover:text-red-500 hover:bg-white transition-all backdrop-blur-sm"
            >
              <X size={16} />
            </button>
          </div>

          <div className={`absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm ${qualityWarning ? 'bg-amber-500/90 text-white' : 'bg-green-500/90 text-white'}`}>
             {qualityWarning ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
             <span className="text-[10px] font-black uppercase tracking-widest">{qualityWarning ? 'Blurry' : 'Verified'}</span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-teal-500 transition-colors">
          <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:shadow-md transition-all">
             <Camera size={28} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
          <span className="text-[9px] font-medium mt-1 opacity-60">Tap to Capture</span>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;