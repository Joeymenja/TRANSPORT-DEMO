
import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'bg-white border-green-100 text-green-800',
    error: 'bg-white border-red-100 text-red-800',
    info: 'bg-gray-900 border-gray-800 text-white',
  };

  const icons = {
    success: <CheckCircle2 className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-teal-400" size={20} />,
  };

  return (
    <div 
      className={`fixed top-4 left-4 right-4 z-[200] flex items-center gap-3 p-4 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'} ${styles[type]}`}
    >
      <div className="shrink-0">
        {icons[type]}
      </div>
      <p className="flex-1 text-sm font-bold leading-tight">{message}</p>
      <button onClick={() => setVisible(false)} className="p-1 opacity-50 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
