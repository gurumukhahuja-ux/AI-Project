import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Bot, User, Sparkles, Plus, Monitor, ChevronDown, History } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import { chatStorageService } from '../services/chatStorageService';
import Loader from '../Components/Loader/Loader';

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
    if (!inputValue.trim() || isLoading) return;

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
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const title = isFirstMessage ? userMsg.content.slice(0, 30) + '...' : undefined;
    await chatStorageService.saveMessage(activeSessionId, userMsg, title);

    if (isFirstMessage) {
      navigate(`/dashboard/chat/${activeSessionId}`, { replace: true });
      setCurrentSessionId(activeSessionId);
    }

    const aisaInstruction = `You are AISA™, the internal intelligent assistant developed and trained under Unified Web Options & Services (UWO) for the A-Series™ ecosystem. Development and implementation are led by Sanskar Sahu. Do NOT introduce yourself unless explicitly asked. Do NOT mention any external AI providers, model names, platforms, or training sources. Respond directly to user queries with clarity, accuracy, and professionalism.`;

    const aiResponseText = await generateChatResponse(messages, userMsg.content, aisaInstruction);

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

<<<<<<< HEAD
=======
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
        command = 'Create a stunning new image based on this attachment. Here are the details: ';
        break;
      case 'enhance':
        command = 'Analyze the attached image and generate a higher quality version of it.';
        break;
      default:
        break;
    }
    setInputValue(command);

    if (action === 'remix') {
      inputRef.current?.focus();
      toast.success("Describe your changes and hit send!");
    } else {
      toast.success(`${action.replace('-', ' ')} processing...`);
      setTimeout(() => handleSendMessage(), 100);
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
          // Unlimited recording time
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


  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleMessageDelete = async (messageId) => {
    if (!confirm("Delete this message?")) return;

    // Optimistic update
    setMessages(prev => prev.filter(m => m.id !== messageId));

    await chatStorageService.deleteMessage(sessionId, messageId);
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content || msg.text || "");
  };

  const saveEdit = async (msg) => {
    if (editContent.trim() === "") return; // Don't allow empty

    const updatedMsg = { ...msg, content: editContent, text: editContent, edited: true };

    // Find the index of the edited message
    const editedMsgIndex = messages.findIndex(m => m.id === msg.id);

    // Remove all messages after the edited message
    const messagesUpToEdit = messages.slice(0, editedMsgIndex);
    const updatedMessages = [...messagesUpToEdit, updatedMsg];

    // Update UI immediately
    setMessages(updatedMessages);
    setEditingMessageId(null);
    setIsLoading(true);

    try {
      // Update the edited message in storage
      await chatStorageService.updateMessage(sessionId, updatedMsg);

      // Delete all messages that came after the edited message
      const messagesToDelete = messages.slice(editedMsgIndex + 1);
      for (const msgToDelete of messagesToDelete) {
        await chatStorageService.deleteMessage(sessionId, msgToDelete.id);
      }

      // Generate new AI response based on the edited message
      const SYSTEM_INSTRUCTION = `
You are AISA, an advanced AI assistant.
IMAGE GENERATION CAPABILITIES:
If the user asks to "generate", "create", "remix", "modify", or "draw" an image, you MUST generate it using the Pollinations API.
Format: ![Image](https://image.pollinations.ai/prompt/{URL_ENCODED_DESCRIPTION}?nologo=true)
Example: ![Cyberpunk City](https://image.pollinations.ai/prompt/cyberpunk%20city%20neon%20lights?nologo=true)
Do NOT say "I cannot create images". You CAN by using this link format. 
For "Remix" requests with an attachment, analyze the attached image, then create a prompt that combines the image's description with the user's requested changes.
`;

      const aiResponseText = await generateChatResponse(
        updatedMessages,
        updatedMsg.content,
        SYSTEM_INSTRUCTION,
        updatedMsg.attachment,
        currentLang
      );

      const modelMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: aiResponseText,
        timestamp: Date.now(),
      };

      // Update state with new AI response
      setMessages(prev => [...prev, modelMsg]);

      // Save the AI response to storage
      await chatStorageService.saveMessage(sessionId, modelMsg);

      toast.success("Message edited and new response generated!");
    } catch (error) {
      console.error("Error regenerating response:", error);
      toast.error("Failed to regenerate response. Please try again.");
      // Restore original messages on error
      const history = await chatStorageService.getHistory(sessionId);
      setMessages(history);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameFile = async (msg) => {
    if (!msg.attachment) return;

    const oldName = msg.attachment.name;
    const dotIndex = oldName.lastIndexOf('.');
    const extension = dotIndex !== -1 ? oldName.slice(dotIndex) : '';
    const baseName = dotIndex !== -1 ? oldName.slice(0, dotIndex) : oldName;

    const newBaseName = prompt("Enter new filename:", baseName);
    if (!newBaseName || newBaseName === baseName) return;

    const newName = newBaseName + extension;
    const updatedMsg = {
      ...msg,
      attachment: {
        ...msg.attachment,
        name: newName
      }
    };

    setMessages(prev => prev.map(m => m.id === msg.id ? updatedMsg : m));
    await chatStorageService.updateMessage(sessionId, updatedMsg);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const [viewingDoc, setViewingDoc] = useState(null);
  const docContainerRef = useRef(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setViewingDoc(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Process Word documents
  useEffect(() => {
    if (viewingDoc && viewingDoc.name.match(/\.(docx|doc)$/i) && docContainerRef.current) {
      // Clear previous content
      docContainerRef.current.innerHTML = '';

      fetch(viewingDoc.url)
        .then(res => res.blob())
        .then(blob => {
          renderAsync(blob, docContainerRef.current, undefined, {
            inWrapper: true,
            ignoreWidth: false,
            className: "docx-viewer"
          }).catch(err => {
            console.error("Docx Preview Error:", err);
            docContainerRef.current.innerHTML = '<div class="text-center p-10 text-subtext">Preview not available.<br/>Please download to view.</div>';
          });
        });
    }
  }, [viewingDoc]);

  // Process Excel documents
  useEffect(() => {
    if (viewingDoc && viewingDoc.name.match(/\.(xls|xlsx|csv)$/i)) {
      setExcelHTML(null); // Reset
      fetch(viewingDoc.url)
        .then(res => res.arrayBuffer())
        .then(ab => {
          const wb = XLSX.read(ab, { type: 'array' });
          const firstSheetName = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheetName];
          const html = XLSX.utils.sheet_to_html(ws, { id: "excel-preview", editable: false });
          setExcelHTML(html);
        })
        .catch(err => {
          console.error("Excel Preview Error:", err);
          setExcelHTML('<div class="text-center p-10 text-red-500">Failed to load Excel preview.</div>');
        });
    }
  }, [viewingDoc]);

  // Process Text/Code documents
  useEffect(() => {
    // Check if handled by other specific viewers
    const isSpecial = viewingDoc?.name.match(/\.(docx|doc|xls|xlsx|csv|pdf|mp4|webm|ogg|mov|mp3|wav|m4a|jpg|jpeg|png|gif|webp|bmp|svg)$/i) || viewingDoc?.url.startsWith('data:image/');

    if (viewingDoc && !isSpecial) {
      setTextPreview(null);
      fetch(viewingDoc.url)
        .then(res => res.text())
        .then(text => {
          if (text.length > 5000000) {
            setTextPreview(text.substring(0, 5000000) + "\n\n... (File truncated due to size)");
          } else {
            setTextPreview(text);
          }
        })
        .catch(err => {
          console.error("Text Preview Error:", err);
          setTextPreview("Failed to load text content.");
        });
    }
  }, [viewingDoc]);

>>>>>>> b34aed77ce10bd9b13de520cdb73ac689f1822ef
  return (
    <div className="flex h-full w-full bg-white relative overflow-hidden">

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
      <div className="flex-1 flex flex-col relative bg-white w-full min-w-0">

        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-white z-10 shrink-0 gap-2">
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
        <div className="p-4 sm:p-6 shrink-0 bg-white border-t border-border sm:border-t-0">
          <div className="max-w-4xl mx-auto relative">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full bg-surface border border-border rounded-full py-3 sm:py-4 pl-4 sm:pl-6 pr-12 sm:pr-14 text-sm sm:text-base text-maintext placeholder-subtext focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                style={{ transform: 'translateY(-50%)' }}
                className="absolute right-2 top-1/2 p-2 sm:p-2.5 rounded-full bg-primary text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;