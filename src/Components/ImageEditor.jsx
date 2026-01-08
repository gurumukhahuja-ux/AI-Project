import React, { useState, useRef, useEffect } from 'react';
import { X, Check, RotateCw, RotateCcw, Sliders, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ImageEditor = ({ file, onClose, onSave }) => {
    const [image, setImage] = useState(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [grayscale, setGrayscale] = useState(0);
    const canvasRef = useRef(null);

    useEffect(() => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => setImage(img);
    }, [file]);

    useEffect(() => {
        if (image && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Swap width/height if rotated 90 or 270 degrees
            if (rotation % 180 !== 0) {
                canvas.width = image.height;
                canvas.height = image.width;
            } else {
                canvas.width = image.width;
                canvas.height = image.height;
            }

            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)`;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(image, -image.width / 2, -image.height / 2);
        }
    }, [image, brightness, contrast, rotation, grayscale]);

    const handleSave = () => {
        if (canvasRef.current) {
            canvasRef.current.toBlob((blob) => {
                const newFile = new File([blob], file.name, { type: file.type });
                onSave(newFile);
            }, file.type);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
            <div className="w-full max-w-5xl h-full max-h-[90vh] flex flex-col md:flex-row gap-6">

                {/* Editor Area */}
                <div className="flex-1 min-h-0 bg-[#1e1e1e] rounded-2xl border border-white/10 flex items-center justify-center p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                    {image ? (
                        <canvas
                            ref={canvasRef}
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg transition-all duration-300"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-white/30 animate-pulse">
                            <ImageIcon className="w-12 h-12" />
                            <span className="text-sm font-medium">Loading Image...</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="w-full md:w-80 shrink-0 bg-[#252526] rounded-2xl border border-white/10 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">

                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-primary" />
                            Editor
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Adjustments</label>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-white/70">
                                    <span>Brightness</span>
                                    <span>{brightness}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={brightness}
                                    onChange={(e) => setBrightness(e.target.value)}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-white/70">
                                    <span>Contrast</span>
                                    <span>{contrast}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={contrast}
                                    onChange={(e) => setContrast(e.target.value)}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-white/70">
                                    <span>Grayscale</span>
                                    <span>{grayscale}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={grayscale}
                                    onChange={(e) => setGrayscale(e.target.value)}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Transform</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setRotation(prev => prev - 90)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors flex flex-col items-center gap-1 group/btn"
                                >
                                    <RotateCcw className="w-5 h-5 group-hover/btn:-rotate-90 transition-transform" />
                                    <span className="text-[10px]">Rotate Left</span>
                                </button>
                                <button
                                    onClick={() => setRotation(prev => prev + 90)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors flex flex-col items-center gap-1 group/btn"
                                >
                                    <RotateCw className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                                    <span className="text-[10px]">Rotate Right</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 rounded-xl bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 transition-all font-bold text-sm flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Save Changes
                        </button>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default ImageEditor;
