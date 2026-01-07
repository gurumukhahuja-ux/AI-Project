import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Mic, MicOff, Camera, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import toast from 'react-hot-toast';

const LiveAI = ({ onClose, language }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState(null);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const [duration, setDuration] = useState(0);

    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    // Initialize Camera
    useEffect(() => {
        let stream = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera Error:", err);
                setError("Could not access camera. Please allow permissions.");
            }
        };
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Call Timer
    useEffect(() => {
        const timer = setInterval(() => setDuration(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Capture Frame
    const captureFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth / 2;
        canvas.height = video.videoHeight / 2;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL('image/jpeg', 0.7);
    }, []);

    // Text to Speech
    const speakResponse = (text) => {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
    };

    // Process Query
    const processQuery = async (text) => {
        if (!text.trim()) return;

        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);

        const imageBase64 = captureFrame();
        const attachment = imageBase64 ? { type: 'image', url: imageBase64 } : null;

        try {
            setAiResponse("Thinking...");
            const response = await generateChatResponse(
                [],
                text,
                `You are in a Video Call with the user. See what they see. Respond naturally in the user's language (${language}). Keep answers concise and conversational.`,
                attachment,
                language
            );

            setAiResponse(response);
            speakResponse(response);

        } catch (err) {
            console.error(err);
            setAiResponse("Connection error.");
        }
    };

    // Speech Recognition
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setError("Voice not supported.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];
            const text = lastResult[0].transcript;
            setTranscript(text);

            if (lastResult.isFinal) {
                processQuery(text);
            }
        };

        return () => recognition.stop();
    }, [captureFrame]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            if (synthRef.current.speaking) synthRef.current.cancel();

            setTranscript("");
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Sync Video State
    useEffect(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getVideoTracks().forEach(t => t.enabled = isVideoActive);
        }
    }, [isVideoActive]);

    const toggleVideo = () => setIsVideoActive(prev => !prev);

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col text-white">
            {/* Video Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="flex-1 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay UI */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-bold text-white tracking-widest">LIVE</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <span className="text-sm font-mono font-medium text-white/90">{formatDuration(duration)}</span>
                    </div>
                </div>
            </div>

            {/* Subtitles / Status */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center gap-6">

                {/* AI / User Text */}
                <div className="w-full max-w-lg text-center space-y-2 min-h-[60px]">
                    {transcript && (
                        <p className="text-lg font-medium text-white/90 animate-fade-in">
                            "{transcript}"
                        </p>
                    )}
                    {aiResponse && !isListening && (
                        <p className="text-base text-primary font-medium animate-fade-in">
                            AI: {aiResponse}
                        </p>
                    )}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>

                {/* Controls */}
                {/* Controls Bar */}
                <div className="flex items-center gap-4 pb-8">
                    {/* Video Toggle */}
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isVideoActive ? 'bg-white text-black hover:scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isVideoActive ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </button>

                    {/* Mic Toggle */}
                    <button
                        onClick={toggleListening}
                        className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isListening ? 'bg-white text-black hover:scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </button>

                    {/* End Call */}
                    <button
                        onClick={onClose}
                        className="p-4 rounded-full bg-red-600 text-white hover:scale-105 transition-all shadow-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveAI;
