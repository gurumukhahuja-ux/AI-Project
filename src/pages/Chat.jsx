import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Send, Bot, User, Sparkles, Plus, Monitor, ChevronDown, History, Paperclip, X, FileText, Image as ImageIcon, Cloud, HardDrive, Edit2, Download, Mic, Wand2 } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import { chatStorageService } from '../services/chatStorageService';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loader from '../Components/Loader/Loader';
import toast from 'react-hot-toast';

const Chat = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const uploadInputRef = useRef(null);
  const driveInputRef = useRef(null);
  const photosInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Attachment Menu State
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listeningTime, setListeningTime] = useState(0);
  const timerRef = useRef(null);
  const attachBtnRef = useRef(null);
  const menuRef = useRef(null);
  const recognitionRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        attachBtnRef.current &&
        !attachBtnRef.current.contains(event.target)
      ) {
        setIsAttachMenuOpen(false);
      }
    };

    if (isAttachMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAttachMenuOpen]);

  const processFile = (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      'image/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    // Check if valid
    const isValid = validTypes.some(type => file.type.startsWith(type)) ||
      /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(file.name);

    if (!isValid) {
      toast.error('Only Images, PDFs, and Office Documents are supported');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);

    // Generate Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    processFile(e.target.files[0]);
  };

  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.items) {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1 || items[i].type === 'application/pdf') {
          const file = items[i].getAsFile();
          processFile(file);
          e.preventDefault(); // Prevent default paste behavior if file is found
          return;
        }
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (uploadInputRef.current) uploadInputRef.current.value = '';
    if (driveInputRef.current) driveInputRef.current.value = '';
    if (photosInputRef.current) photosInputRef.current.value = '';
  };

  const handleAttachmentSelect = (type) => {
    setIsAttachMenuOpen(false);
    if (type === 'upload') {
      uploadInputRef.current?.click();
    } else if (type === 'photos') {
      photosInputRef.current?.click();
    } else if (type === 'drive') {
      driveInputRef.current?.click();
    }
  };


  useEffect(() => {
    const loadSessions = async () => {
      const data = await chatStorageService.getSessions();
      setSessions(data);
      console.log(data);

    };
    loadSessions();
  }, [messages]);

  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const initChat = async () => {
      // If we just navigated from 'new' to a real ID in handleSendMessage,
      // don't clear the messages we already have in state.
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        return;
      }

      if (sessionId && sessionId !== 'new') {
        setCurrentSessionId(sessionId);
        const history = await chatStorageService.getHistory(sessionId);
        setMessages(history);
      } else {
        setCurrentSessionId('new');
        setMessages([]);
      }

      setShowHistory(false);
    };
    initChat();
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleNewChat = async () => {
    const newId = await chatStorageService.createSession();
    navigate(`/dashboard/chat/${newId}`);
    setShowHistory(false);
  };

  const { language: currentLang } = useLanguage();

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isLoading) return;

    let activeSessionId = currentSessionId;
    let isFirstMessage = false;

    // Stop listening if send is clicked
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      if (activeSessionId === 'new') {
        activeSessionId = await chatStorageService.createSession();
        isFirstMessage = true;
      }

      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: inputValue,
        timestamp: Date.now(),
        attachment: selectedFile ? {
          type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
          url: filePreview,
          name: selectedFile.name
        } : null
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInputValue('');
      handleRemoveFile(); // Clear file after sending
      setIsLoading(true);

      try {
        const title = isFirstMessage ? (userMsg.content ? userMsg.content.slice(0, 30) : 'File Attachment') + '...' : undefined;
        await chatStorageService.saveMessage(activeSessionId, userMsg, title);

        if (isFirstMessage) {
          isNavigatingRef.current = true;
          setCurrentSessionId(activeSessionId);
          navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
        }

        // Send to AI for response
        const aiResponseText = await generateChatResponse(updatedMessages, userMsg.content, undefined, userMsg.attachment, currentLang);

        const modelMsg = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: aiResponseText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, modelMsg]);
        await chatStorageService.saveMessage(activeSessionId, modelMsg);
      } catch (innerError) {
        console.error("Storage/API Error:", innerError);
        // Even if saving failed, we still have the local state
      }
    } catch (error) {
      console.error("Chat Error:", error);
      toast.error(`Error: ${error.message || "Failed to send message"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      await chatStorageService.deleteSession(id);
      const data = await chatStorageService.getSessions();
      setSessions(data);
      if (currentSessionId === id) {
        navigate('/dashboard/chat/new');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link if fetch fails
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
    }
  };

  const handleImageAction = (action) => {
    if (!selectedFile) return;

    let command = '';
    switch (action) {
      case 'remove-bg':
        command = 'Remove the background and clean up this image.';
        break;
      case 'remix':
        command = 'Add a creative remix or change to this image: ';
        break;
      case 'enhance':
        command = 'Enhance the quality and details of this image.';
        break;
      default:
        break;
    }
    setInputValue(command);
    toast.success(`${action.replace('-', ' ')} mode active`);

    // Auto-submit if it's a direct command
    if (command && action !== 'remix') {
      setTimeout(() => {
        handleSendMessage();
      }, 100);
    }
  };
  const inputRef = useRef(null);
  const manualStopRef = useRef(false);
  const isListeningRef = useRef(false);

  // Timer for voice recording (Max 5 minutes)
  useEffect(() => {
    if (isListening) {
      setListeningTime(0);
      isListeningRef.current = true;
      manualStopRef.current = false;
      timerRef.current = setInterval(() => {
        setListeningTime(prev => {
          if (prev >= 300) { // Limit to 5 minutes
            manualStopRef.current = true;
            isListeningRef.current = false;
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            toast.success("Max recording time reached (5m)");
            return 300;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setListeningTime(0);
      isListeningRef.current = false;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const textRef = useRef(inputValue);

  useEffect(() => {
    textRef.current = inputValue;
  }, [inputValue]);

  const handleVoiceInput = () => {
    if (isListening) {
      manualStopRef.current = true;
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    startSpeechRecognition();
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    const langMap = {
      'English': 'en-IN',
      'Hindi': 'hi-IN',
      'Urdu': 'ur-PK',
      'Tamil': 'ta-IN',
      'Telugu': 'te-IN',
      'Kannada': 'kn-IN',
      'Malayalam': 'ml-IN',
      'Bengali': 'bn-IN',
      'Marathi': 'mr-IN',
      'Mandarin Chinese': 'zh-CN',
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'German': 'de-DE',
      'Japanese': 'ja-JP',
      'Portuguese': 'pt-BR',
      'Arabic': 'ar-SA',
      'Korean': 'ko-KR',
      'Italian': 'it-IT',
      'Russian': 'ru-RU',
      'Turkish': 'tr-TR',
      'Dutch': 'nl-NL',
      'Swedish': 'sv-SE',
      'Norwegian': 'no-NO',
      'Danish': 'da-DK',
      'Finnish': 'fi-FI',
      'Afrikaans': 'af-ZA',
      'Zulu': 'zu-ZA',
      'Xhosa': 'xh-ZA'
    };

    recognition.lang = langMap[currentLang] || 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Capture current input to append to using Ref to avoid stale closures
    let sessionBaseText = textRef.current;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      manualStopRef.current = false;
      inputRef.current?.focus();
      if (listeningTime === 0) {
        toast.success(`Microphone On: Speaking in ${currentLang}`);
      }
    };

    recognition.onend = () => {
      // Auto-restart logic for the 8-second browser cutoff
      if (!manualStopRef.current && isListeningRef.current) {
        // console.log('Auto-restarting speech recognition...');
        setTimeout(() => {
          if (isListeningRef.current) startSpeechRecognition();
        }, 100);
      } else {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognition.onresult = (event) => {
      let speechToText = '';
      for (let i = 0; i < event.results.length; i++) {
        speechToText += event.results[i][0].transcript;
      }
      if (speechToText) {
        // Use the base text captured at start of THIS session chunk
        // Note: speechToText accumulates for the current session, so we append it to the base
        setInputValue(sessionBaseText + (sessionBaseText ? ' ' : '') + speechToText);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied.");
        setIsListening(false);
        isListeningRef.current = false;
        manualStopRef.current = true;
      } else if (event.error === 'no-speech') {
        // Ignore no-speech errors, just letting it restart via onend
        return;
      }
      console.error("Speech Error:", event.error);
    };

    recognition.start();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex h-full w-full bg-secondary relative overflow-hidden">

      {/* Mobile History Backdrop */}
      {showHistory && (
        <div
          className="absolute inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Sidebar History */}
      <div
        className={`
          w-64 bg-surface border-r border-border flex flex-col flex-shrink-0
          absolute inset-y-0 left-0 z-30 transition-transform duration-300
          md:relative md:translate-x-0
          ${showHistory ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <h3 className="px-4 py-2 text-xs font-semibold text-subtext uppercase tracking-wider">
            Recent
          </h3>

          {sessions.map((session) => (
            <div key={session.sessionId} className="group relative px-2">
              <button
                onClick={() => navigate(`/dashboard/chat/${session.sessionId}`)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors truncate
                  ${currentSessionId === session.sessionId
                    ? 'bg-card text-primary shadow-sm border border-border'
                    : 'text-subtext hover:bg-card hover:text-maintext'
                  }
                `}
              >
                <div className="font-medium truncate pr-6">{session.title}</div>
                <div className="text-[10px] text-subtext/70">
                  {new Date(session.lastModified).toLocaleDateString()}
                </div>
              </button>
              <button
                onClick={(e) => handleDeleteSession(e, session.sessionId)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-subtext hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Chat"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="px-4 text-xs text-subtext italic">No recent chats</div>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div
        className="flex-1 flex flex-col relative bg-secondary w-full min-w-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary flex flex-col items-center justify-center pointer-events-none">
            <Cloud className="w-16 h-16 text-primary mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-primary">Drop to Upload</h3>
          </div>
        )}

        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-secondary z-10 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">

            <button
              className="md:hidden p-2 -ml-2 text-subtext hover:text-maintext shrink-0"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-subtext min-w-0">
              <span className="text-sm hidden sm:inline shrink-0">Chatting with:</span>
              <div
                onClick={() => alert("Agent switching coming soon!")}
                className="flex items-center gap-2 text-maintext bg-surface px-3 py-1.5 rounded-lg border border-border cursor-pointer hover:bg-secondary transition-colors min-w-0"
              >
                <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium truncate">
                  AISA <sup>TM</sup>
                </span>
                <ChevronDown className="w-3 h-3 text-subtext shrink-0" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* <button className="flex items-center gap-2 text-subtext hover:text-maintext text-sm">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Device</span>
            </button> */}

          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70 px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              <h2 className="text-xl font-medium text-maintext mb-2">
                How can I help you today?
              </h2>
              <p className="text-subtext text-sm sm:text-base">
                Start a conversation with your AI agent.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 sm:gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user'
                      ? 'bg-primary'
                      : 'bg-surface border border-border'
                      }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>

                  <div
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'
                      } max-w-[85%] sm:max-w-[80%]`}
                  >
                    <div
                      className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-surface border border-border text-maintext rounded-tl-none'
                        }`}
                    >
                      {/* Attachment Display */}
                      {msg.attachment && (
                        <div className="mb-3 mt-1">
                          {msg.attachment.type === 'image' ? (
                            <div className="relative group/image overflow-hidden rounded-xl border border-white/20 shadow-lg transition-all hover:scale-[1.02]">
                              <img
                                src={msg.attachment.url}
                                alt="Attachment"
                                className="w-full max-w-[320px] max-h-[400px] object-contain bg-black/5"
                              />
                              <button
                                onClick={() => handleDownload(msg.attachment.url, msg.attachment.name)}
                                className="absolute top-2 right-2 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-all hover:bg-black/60 backdrop-blur-md border border-white/10"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${msg.role === 'user' ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-secondary/30 border-border hover:bg-secondary/50'}`}>
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                                <FileText className="w-6 h-6" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold truncate text-xs mb-0.5">{msg.attachment.name}</p>
                                <p className="text-[10px] opacity-70 uppercase tracking-tight font-medium">
                                  {(() => {
                                    const name = msg.attachment.name.toLowerCase();
                                    if (name.match(/\.(doc|docx)$/)) return 'Word Document';
                                    if (name.match(/\.(xls|xlsx)$/)) return 'Excel Sheet';
                                    if (name.match(/\.(ppt|pptx)$/)) return 'Presentation';
                                    if (name.endsWith('.pdf')) return 'PDF Document';
                                    return 'Document';
                                  })()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDownload(msg.attachment.url, msg.attachment.name)}
                                className={`p-2 rounded-lg transition-colors ${msg.role === 'user' ? 'hover:bg-white/20' : 'hover:bg-primary/10 text-primary'}`}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.content && (
                        <div className={`prose prose-invert max-w-none ${msg.role === 'user' ? 'text-white' : 'text-maintext'}`}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-0">{children}</p>,
                              img: ({ node, ...props }) => (
                                <div className="relative group/generated mt-4 mb-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.01] bg-surface/50 backdrop-blur-sm">
                                  <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-0 group-hover/generated:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Generated Asset</span>
                                    </div>
                                  </div>
                                  <img
                                    {...props}
                                    className="w-full max-w-full h-auto rounded-xl bg-black/5"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.src = 'https://placehold.co/600x400?text=Image+Generating...';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/generated:opacity-100 transition-opacity pointer-events-none" />
                                  <button
                                    onClick={() => handleDownload(props.src, 'aisa-generated.png')}
                                    className="absolute bottom-3 right-3 p-2.5 bg-primary text-white rounded-xl opacity-0 group-hover/generated:opacity-100 transition-all hover:bg-primary/90 shadow-lg border border-white/20 scale-90 group-hover/generated:scale-100"
                                    title="Download High-Res"
                                  >
                                    <div className="flex items-center gap-2 px-1">
                                      <Download className="w-4 h-4" />
                                      <span className="text-[10px] font-bold uppercase">Download</span>
                                    </div>
                                  </button>
                                </div>
                              )
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-subtext mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-4 max-w-4xl mx-auto">
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <Loader />

                  </div>
                  <div className="px-5 py-3 rounded-2xl rounded-tl-none bg-surface border border-border flex items-center gap-2">
                    <span
                      className="w-2 h-2 bg-subtext/50 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-subtext/50 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-subtext/50 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></span>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 sm:p-6 shrink-0 bg-secondary border-t border-border sm:border-t-0">
          <div className="max-w-4xl mx-auto relative">

            {/* File Preview Area */}
            {selectedFile && (
              <div className="absolute bottom-full left-0 mb-4 w-full animate-in slide-in-from-bottom-2 fade-in z-20">
                <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl p-3 shadow-xl flex items-center gap-4 max-w-sm mx-auto sm:mx-0 sm:max-w-md ring-1 ring-black/5">
                  <div className="relative group shrink-0">
                    {selectedFile.type.startsWith('image/') ? (
                      <div className="relative overflow-hidden rounded-lg border border-white/10 shadow-sm w-16 h-16 sm:w-20 sm:h-20 bg-black/5">
                        <img src={filePreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />

                        {/* Magic AI Tools Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 gap-1">
                          <button
                            onClick={() => handleImageAction('remove-bg')}
                            className="text-[8px] bg-primary text-white w-full py-0.5 rounded font-bold uppercase transition-transform active:scale-95"
                          >
                            No BG
                          </button>
                          <button
                            onClick={() => handleImageAction('remix')}
                            className="text-[8px] bg-sky-400 text-white w-full py-0.5 rounded font-bold uppercase transition-transform active:scale-95"
                          >
                            Remix
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shadow-sm">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                    )}

                    <div className="absolute -top-2 -right-2 flex gap-1">
                      <button
                        onClick={() => toast.success('Image Editor coming soon! You can currently ask the AI about this image.')}
                        className="p-1.5 bg-surface border border-border text-subtext hover:text-primary rounded-full hover:bg-primary/10 transition-colors shadow-sm"
                        title="Edit image"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleRemoveFile}
                        className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg hover:scale-110 active:scale-95"
                        title="Remove file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 py-1">
                    <p className="text-sm font-semibold text-maintext truncate">{selectedFile.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-subtext bg-surface border border-border px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">{selectedFile.type.split('/')[1] || 'FILE'}</span>
                      <span className="text-xs text-subtext">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
              <input
                id="file-upload"
                type="file"
                ref={uploadInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
              <input
                id="drive-upload"
                type="file"
                ref={driveInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf"
              />
              <input
                id="photos-upload"
                type="file"
                ref={photosInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
              />

              <AnimatePresence>
                {isAttachMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    ref={menuRef}
                    className="absolute bottom-full left-0 mb-3 w-60 bg-surface border border-border/50 rounded-2xl shadow-xl overflow-hidden z-30 backdrop-blur-md ring-1 ring-black/5"
                  >
                    <div className="p-1.5 space-y-0.5">
                      <label
                        htmlFor="file-upload"
                        onClick={() => setIsAttachMenuOpen(false)}
                        className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-primary/5 rounded-xl transition-all group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors shrink-0">
                          <Paperclip className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-maintext group-hover:text-primary transition-colors">Upload files</span>
                      </label>

                      <label
                        htmlFor="drive-upload"
                        onClick={() => setIsAttachMenuOpen(false)}
                        className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-primary/5 rounded-xl transition-all group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors shrink-0">
                          <Cloud className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-maintext group-hover:text-primary transition-colors">Add from Drive</span>
                      </label>

                      <label
                        htmlFor="photos-upload"
                        onClick={() => setIsAttachMenuOpen(false)}
                        className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-primary/5 rounded-xl transition-all group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors shrink-0">
                          <ImageIcon className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-maintext group-hover:text-primary transition-colors">Photos</span>
                      </label>


                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                ref={attachBtnRef}
                onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                className={`p-3 sm:p-4 rounded-full border transition-all duration-300 shadow-sm shrink-0 flex items-center justify-center
                  ${isAttachMenuOpen
                    ? 'bg-primary text-white border-primary rotate-45 shadow-primary/20 shadow-lg'
                    : 'bg-surface border-border text-subtext hover:text-primary hover:bg-primary/5'
                  }`}
                title="Add to chat"
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder="Type a message or paste an image..."
                  className="w-full bg-surface border border-border rounded-full py-3 sm:py-4 pl-4 sm:pl-6 pr-24 sm:pr-28 text-sm sm:text-base text-maintext placeholder-subtext focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
                <div className="absolute right-2 inset-y-0 flex items-center gap-2 z-10">
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={handleVoiceInput}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-tight">STOP</span>
                      <div className="w-[1px] h-3 bg-primary/20 mx-1" />
                      <span className="text-[10px] font-mono font-bold text-primary">{formatTime(listeningTime)}</span>
                    </motion.div>
                  )}
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 sm:p-2.5 rounded-full transition-all flex items-center justify-center border border-transparent ${isListening ? 'bg-primary text-white animate-pulse shadow-md shadow-primary/30' : 'text-primary hover:bg-primary/10 hover:border-primary/20'}`}
                    title="Voice Input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                    className="p-2 sm:p-2.5 rounded-full bg-primary text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;