'use client';

import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#3B3B2B]/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl border border-[#E5E5E5] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full ${danger ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center mb-4`}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#434343] mb-2">{title}</h3>
          <p className="text-sm text-[#717171] leading-relaxed mb-8">{message}</p>
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 bg-white text-[#434343] border border-[#E5E5E5] py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#F5F5F5] transition-all"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3B3B2B] hover:bg-primary-dark'} text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
