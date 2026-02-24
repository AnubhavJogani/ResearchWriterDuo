import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">

                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <h3 className="text-[11px] font-black tracking-wider text-cyan-500 uppercase">
                        {title || 'System_Dialog'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto no-scrollbar text-sm text-slate-300 leading-relaxed">
                    {children}
                </div>

                {footer && (
                    <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;