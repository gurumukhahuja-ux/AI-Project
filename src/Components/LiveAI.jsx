import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Video, PhoneOff, Settings, Volume2, Globe, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LiveAI = ({ onClose, language }) => {
    const videoRef = useRef(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [audioLevel, setAudioLevel] = useState(0);

    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsConnecting(false);

                // Simulate audio levels
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.fftSize = 256;
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const updateAudio = () => {
                    if (!stream.active) return;
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    setAudioLevel(average / 128); // Normalize 0-2
                    requestAnimationFrame(updateAudio);
                };
                updateAudio();

            } catch (err) {
                console.error("Camera Error:", err);
                setIsConnecting(false);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-md">
                        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">AISA Live</h3>
                        <p className="text-xs text-white/50 flex items-center gap-1.5">
                            <Globe className="w-3 h-3" />
                            Speaking {language}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative">
                {/* Camera Feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* AI Overlay Layer */}
                <div className="absolute inset-0 bg-transparent flex flex-col justify-end pb-32 px-6">
                    <div className="w-full max-w-2xl mx-auto">
                        {/* AI Avatar / Status */}
                        <div className="flex justify-center mb-8">
                            <motion.div
                                animate={{
                                    scale: 1 + audioLevel * 0.2,
                                    boxShadow: `0 0 ${audioLevel * 50}px ${audioLevel * 10}px rgba(124, 58, 237, 0.5)`
                                }}
                                className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-400 p-1 shadow-2xl relative"
                            >
                                <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-xl flex items-center justify-center overflow-hidden border border-white/20">
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                                        <div className="w-full h-full bg-primary/20 rounded-full animate-ping absolute" />
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Dynamic Captions */}
                        <div className="text-center min-h-[80px]">
                            <AnimatePresence mode="wait">
                                {isConnecting ? (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xl sm:text-2xl font-light text-white/90"
                                    >
                                        Connecting to quantum servers...
                                    </motion.p>
                                ) : (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-2xl sm:text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 leading-relaxed"
                                    >
                                        "I'm listening. How can I help you with your project today?"
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center z-20">
                <div className="flex items-center gap-6">
                    <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md">
                        <Video className="w-6 h-6" />
                    </button>

                    <button
                        onClick={onClose}
                        className="p-6 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-xl shadow-red-500/30 scale-100 hover:scale-105 active:scale-95 ring-4 ring-black/20"
                    >
                        <PhoneOff className="w-8 h-8" />
                    </button>

                    <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md">
                        <Mic className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default LiveAI;
