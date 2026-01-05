import React from 'react';
import { X } from 'lucide-react';

const LandingLiveDemoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4">Live Demo</h2>
                <p className="text-gray-600">
                    This component was missing and has been restored as a placeholder.
                </p>
            </div>
        </div>
    );
};

export default LandingLiveDemoModal;
