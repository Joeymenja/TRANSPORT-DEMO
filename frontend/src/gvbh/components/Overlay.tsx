
import React from 'react';
import { X, LucideIcon, ArrowLeft } from 'lucide-react';
import ScreenHeader from './ScreenHeader';

interface OverlayProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  icon?: LucideIcon;
  bgColor?: string;
  showPadding?: boolean;
}

const Overlay: React.FC<OverlayProps> = ({ 
  title, 
  subtitle, 
  onClose, 
  children, 
  bgColor = 'bg-white',
  showPadding = true 
}) => {
  return (
    <div className={`fixed inset-0 z-[60] ${bgColor} flex flex-col max-w-md mx-auto h-screen shadow-4xl overflow-hidden font-sans animate-in slide-in-from-bottom duration-500 ease-out`}>
      <ScreenHeader 
        title={title} 
        subtitle={subtitle} 
        onBack={onClose} 
      />
      <div className={`flex-1 overflow-y-auto no-scrollbar ${showPadding ? 'p-8 pb-32' : 'pb-32'}`}>
        {children}
      </div>
    </div>
  );
};

export default Overlay;
