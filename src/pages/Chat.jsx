import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Send, Bot, User, Sparkles, Plus, Monitor, ChevronDown, History, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import { chatStorageService } from '../services/chatStorageService';
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
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Only Images and PDFs are supported');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  useEffect(() => {
    const initChat = async () => {
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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isLoading) return;

    let activeSessionId = currentSessionId;
    let isFirstMessage = false;

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
        type: selectedFile.type.startsWith('image/') ? 'image' : 'pdf',
        url: filePreview,
        name: selectedFile.name
      } : null
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    handleRemoveFile(); // Clear file after sending
    setIsLoading(true);

    const title = isFirstMessage ? (userMsg.content ? userMsg.content.slice(0, 30) : 'File Attachment') + '...' : undefined;
    await chatStorageService.saveMessage(activeSessionId, userMsg, title);

    if (isFirstMessage) {
      navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
      setCurrentSessionId(activeSessionId);
    }

    // Simulate AI analyzing file if present
    const prompt = inputValue; // Send raw input, let backend handle context with image

    const aiResponseText = await generateChatResponse(messages, prompt, undefined, userMsg.attachment);

    const modelMsg = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: aiResponseText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, modelMsg]);
    setIsLoading(false);

    await chatStorageService.saveMessage(activeSessionId, modelMsg);
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
                    ? 'bg-white text-primary shadow-sm border border-border'
                    : 'text-subtext hover:bg-white hover:text-maintext'
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
      <div className="flex-1 flex flex-col relative bg-secondary w-full min-w-0">

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
                className="flex items-center gap-2 text-maintext bg-surface px-3 py-1.5 rounded-lg border border-border cursor-pointer hover:bg-gray-100 transition-colors min-w-0"
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
                        <div className="mb-3">
                          {msg.attachment.type === 'image' ? (
                            <img
                              src={msg.attachment.url}
                              alt="Attachment"
                              className="w-full max-w-[200px] rounded-lg border border-white/20"
                            />
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20">
                              <FileText className="w-8 h-8 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium truncate text-xs">{msg.attachment.name}</p>
                                <p className="text-[10px] opacity-70">PDF Document</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.content}
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
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shadow-sm">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                    )}

                    <button
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg hover:scale-110 active:scale-95"
                      title="Remove file"
                    >
                      <X className="w-3 h-3" />
                    </button>
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
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 sm:p-4 rounded-full bg-surface border border-border text-subtext hover:text-primary hover:bg-primary/5 transition-colors shadow-sm shrink-0"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder="Type a message or paste an image..."
                  className="w-full bg-surface border border-border rounded-full py-3 sm:py-4 pl-4 sm:pl-6 pr-12 sm:pr-14 text-sm sm:text-base text-maintext placeholder-subtext focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                  style={{ transform: 'translateY(-50%)' }}
                  className="absolute right-2 top-1/2 p-2 sm:p-2.5 rounded-full bg-primary text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;