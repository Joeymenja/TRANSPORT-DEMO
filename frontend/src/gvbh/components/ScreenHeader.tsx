
import React from 'react';
import { ArrowLeft, MoreVertical, LucideIcon } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightIcon?: LucideIcon;
  onRightAction?: () => void;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, onBack, rightIcon: RightIcon = MoreVertical, onRightAction }) => {
  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm z-30 sticky top-0">
      <button 
        onClick={onBack} 
        className="p-1.5 -ml-1 text-slate-500 hover:bg-slate-50 rounded-lg active:scale-90 transition-all"
      >
         <ArrowLeft size={20} strokeWidth={2.5} />
      </button>
      <div className="text-center flex-1 mx-2 min-w-0">
         {subtitle && (
            <p className="text-[8px] font-bold text-teal-500 uppercase tracking-widest mb-0.5 leading-tight">
               {subtitle}
            </p>
         )}
         <h1 className="block text-[14px] font-bold text-slate-900 uppercase tracking-tight leading-none truncate max-w-[200px] mx-auto">
            {title}
         </h1>
      </div>
      <button 
        onClick={onRightAction}
        className="p-1.5 -mr-1 text-slate-400 hover:text-slate-900 transition-all rounded-lg"
      >
         <RightIcon size={18}/>
      </button>
    </div>
  );
};

export default ScreenHeader;
