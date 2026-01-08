import React, { useState, useRef, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Send, Bot, User, Sparkles, Plus, Monitor, ChevronDown, History, Paperclip, X, FileText, Image as ImageIcon, Cloud, HardDrive, Edit2, Download, Mic, Wand2, Eye, FileSpreadsheet, Presentation, File, MoreVertical, Trash2, Check, Camera, Video, Copy, ThumbsUp, ThumbsDown, Share } from 'lucide-react';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { generateChatResponse } from '../services/geminiService';
import { chatStorageService } from '../services/chatStorageService';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loader from '../Components/Loader/Loader';
import toast from 'react-hot-toast';
import LiveAI from '../Components/LiveAI';

import ImageEditor from '../Components/ImageEditor';
import axios from 'axios';
import { apis } from '../types';

const Chat = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [excelHTML, setExcelHTML] = useState(null);
  const [textPreview, setTextPreview] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
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

    // All file types updated to be accepted

    // Unlimited file size allowed

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
    // Handle files pasted from file system
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      processFile(e.clipboardData.files[0]);
      return;
    }

    // Handle pasted data items
    if (e.clipboardData.items) {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            return;
          }
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

  const handleDriveClick = () => {
    setIsAttachMenuOpen(false);
    // Simulating Drive Integration via Link
    const link = prompt("Paste your Google Drive File Link:");
    if (link) {
      const driveFile = {
        name: "Google Drive File",
        type: "application/vnd.google-apps.file",
        size: 0,
        isLink: true
      };
      setSelectedFile(driveFile);
      setFilePreview(link);
    }
  };

  const handleSendMessage = async (e, overrideContent) => {
    if (e) e.preventDefault();

    // Use overrideContent if provided (for instant voice sending), otherwise fallback to state
    const contentToSend = typeof overrideContent === 'string' ? overrideContent : inputValue.trim();

    if ((!contentToSend && !selectedFile) || isLoading) return;

    let activeSessionId = currentSessionId;
    let isFirstMessage = false;

    // Stop listening if send is clicked (or auto-sent)
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
        content: contentToSend || (selectedFile ? "Describe this image" : ""),
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
        const SYSTEM_INSTRUCTION = `
You are AISA, an advanced AI assistant.

### RESPONSE FORMATTING RULES (STRICT):
1.  **Structure**: ALWAYS use **Bold Headings** and **Bullet Points**. Avoid long paragraphs.
2.  **Point-wise Answers**: Break down complex topics into simple points.
3.  **Highlights**: Bold key terms and important concepts (e.g., **RAM**, **CPU**).
4.  **Summary**: Include a "One-line summary" or "Simple definition" at the start or end where appropriate.
5.  **Emojis**: Use relevant emojis to make the content engaging (e.g., 💡, 🚀, 👉).
6.  **Clarity**: Keep sentences short and clear.

IMAGE GENERATION CAPABILITIES:
If the user asks for an image (e.g., "generate", "create", "draw", "show me a pic", "image dikhao", "photo bhejo", "pic do"), you MUST generate it using the Pollinations API.
Format: ![Image](https://image.pollinations.ai/prompt/{URL_ENCODED_DESCRIPTION}?nologo=true)
Example: ![Cyberpunk City](https://image.pollinations.ai/prompt/cyberpunk%20city%20neon%20lights?nologo=true)
Do NOT say "I cannot create images". You CAN by using this link format. 
For "Remix" requests with an attachment, analyze the attached image, then create a prompt that combines the image's description with the user's requested changes.
`;
        const aiResponseText = await generateChatResponse(messages, userMsg.content, SYSTEM_INSTRUCTION, userMsg.attachment, currentLang);

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

      const lowerTranscript = speechToText.toLowerCase();
      // Auto-send triggers
      const triggers = ['yes send it', 'send message', 'bhej do', 'send it', 'yes send', 'ok send it', 'ok send'];
      const matchedTrigger = triggers.find(t => lowerTranscript.includes(t));

      if (matchedTrigger) {
        // Stop listening immediately
        manualStopRef.current = true;
        isListeningRef.current = false;
        recognition.stop();
        setIsListening(false);

        // Remove the trigger phrase from the final text
        // Remove the trigger phrase (and any trailing punctuation) from the final text
        // We create a regex that matches the trigger, optionally followed by non-word chars (like punctuation)
        const cleanupRegex = new RegExp(`${matchedTrigger}[\\s.!?]*`, 'gi');
        let finalText = (sessionBaseText + (sessionBaseText ? ' ' : '') + speechToText).replace(cleanupRegex, '').trim();

        // Update state (visual feedback)
        setInputValue(finalText);

        // Send IMMEDIATELY with explicit content, bypassing state delay
        handleSendMessage(null, finalText);

      } else {
        if (speechToText) {
          setInputValue(sessionBaseText + (sessionBaseText ? ' ' : '') + speechToText);
        }
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

  // Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMsgId, setFeedbackMsgId] = useState(null);
  const [feedbackCategory, setFeedbackCategory] = useState([]);
  const [feedbackDetails, setFeedbackDetails] = useState("");

  const handleThumbsDown = (msgId) => {
    setFeedbackMsgId(msgId);
    setFeedbackOpen(true);
    setFeedbackCategory([]);
    setFeedbackDetails("");
  };

  const handleThumbsUp = async (msgId) => {
    try {
      await axios.post(apis.feedback, {
        sessionId: sessionId || 'unknown',
        messageId: msgId,
        type: 'thumbs_up'
      });
      toast.success("Thanks for the positive feedback!", {
        icon: '👍',
      });
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const handleShare = async (content) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Assistant Response',
          text: content,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyMessage(content);
      toast("Content copied to clipboard", { icon: '📋' });
    }
  };

  const submitFeedback = async () => {
    try {
      await axios.post(apis.feedback, {
        sessionId: sessionId || 'unknown',
        messageId: feedbackMsgId,
        type: 'thumbs_down',
        categories: feedbackCategory,
        details: feedbackDetails
      });
      toast.success("Feedback submitted. Thank you!");
      setFeedbackOpen(false);
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const toggleFeedbackCategory = (cat) => {
    setFeedbackCategory(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleMessageDelete = async (messageId) => {
    if (!confirm("Delete this message?")) return;

    // Find the message index
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const msgsToDelete = [messageId];

    // Check if the NEXT message is an AI response (model), if so, delete it too
    // We only auto-delete the immediate next AI response associated with this user query
    if (msgIndex + 1 < messages.length) {
      const nextMsg = messages[msgIndex + 1];
      if (nextMsg.role === 'model') {
        msgsToDelete.push(nextMsg.id);
      }
    }

    // Optimistic update
    setMessages(prev => prev.filter(m => !msgsToDelete.includes(m.id)));

    // Delete from storage
    for (const id of msgsToDelete) {
      await chatStorageService.deleteMessage(sessionId, id);
    }
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
If the user asks for an image (e.g., "generate", "create", "draw", "show me a pic", "image dikhao", "photo bhejo", "pic do"), you MUST generate it using the Pollinations API.
Format: ![Image](https://image.pollinations.ai/prompt/{URL_ENCODED_DESCRIPTION}?nologo=true)
Example: ![Cyberpunk City](https://image.pollinations.ai/prompt/cyberpunk%20city%20neon%20lights?nologo=true)
Do NOT say "I cannot create images". You CAN by using this link format. 
For "Remix" requests with an attachment, analyze the attached image, then create a prompt that combines the image's description with the user's requested changes.
`;

      const aiResponseText = await generateChatResponse(
        messagesUpToEdit,
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

  return (
    <div className="flex h-full w-full bg-secondary relative overflow-hidden">

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-maintext truncate max-w-md">{viewingDoc.name}</h3>
                    <p className="text-xs text-subtext">
                      {viewingDoc.type === 'image' || viewingDoc.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
                        ? 'Image Preview'
                        : 'File Preview'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(viewingDoc.url, viewingDoc.name)}
                    className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-subtext"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-subtext"
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Viewer Content */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative flex items-center justify-center overflow-hidden">
                {viewingDoc.type === 'image' || viewingDoc.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) || viewingDoc.url.startsWith('data:image/') ? (
                  <img
                    src={viewingDoc.url}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain p-2"
                  />
                ) : viewingDoc.name.match(/\.(docx|doc)$/i) ? (
                  <div
                    ref={docContainerRef}
                    className="bg-gray-100 w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center py-8"
                  />
                ) : viewingDoc.name.match(/\.(xls|xlsx|csv)$/i) ? (
                  <div
                    className="bg-white w-full h-full overflow-auto p-4 custom-scrollbar text-black text-sm"
                    dangerouslySetInnerHTML={{ __html: excelHTML || '<div class="flex items-center justify-center h-full"><div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>' }}
                  />
                ) : viewingDoc.name.endsWith('.pdf') || viewingDoc.url.startsWith('data:application/pdf') ? (
                  <iframe
                    src={viewingDoc.url}
                    className="w-full h-full border-0"
                    title="Document Viewer"
                  />
                ) : viewingDoc.name.match(/\.(mp4|webm|ogg|mov)$/i) || viewingDoc.type.startsWith('video/') ? (
                  <video controls className="max-w-full max-h-full rounded-lg shadow-lg" src={viewingDoc.url}>
                    Your browser does not support the video tag.
                  </video>
                ) : viewingDoc.name.match(/\.(mp3|wav|ogg|m4a)$/i) || viewingDoc.type.startsWith('audio/') ? (
                  <div className="p-10 bg-surface rounded-2xl flex flex-col items-center gap-6 shadow-md border border-border">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse-slow">
                      <div className="w-12 h-12 border-2 border-primary rounded-full flex items-center justify-center">
                        <Mic className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-lg mb-1">{viewingDoc.name}</h3>
                      <p className="text-xs text-subtext">Audio File Player</p>
                    </div>
                    <audio controls className="w-full min-w-[300px]" src={viewingDoc.url}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#1e1e1e] p-0 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42] shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#cccccc] uppercase tracking-wider">
                          {viewingDoc.name.match(/\.(rar|zip|exe|dll|bin|iso|7z)$/i) ? 'BINARY CONTENT' : 'CODE READER'}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0e639c] text-white font-mono shadow-sm">
                        {viewingDoc.name.split('.').pop().toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar p-4">
                      <code className="text-xs font-mono whitespace-pre-wrap text-[#9cdcfe] break-all leading-relaxed tab-4 block">
                        {textPreview || "Reading file stream..."}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Editor */}
      <AnimatePresence>
        {isEditingImage && selectedFile && (
          <ImageEditor
            file={selectedFile}
            onClose={() => setIsEditingImage(false)}
            onSave={(newFile) => {
              processFile(newFile);
              setIsEditingImage(false);
              toast.success("Image updated!");
            }}
          />
        )}
      </AnimatePresence>

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
                  className={`group relative flex items-start gap-3 sm:gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                >
                  {/* Actions Menu (Always visible for discoverability) */}

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

                      className={`group/bubble relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm w-fit max-w-full ${msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-surface border border-border text-maintext rounded-tl-none'
                        }`}
                    >

                      {/* Attachment Display */}
                      {msg.attachment && (
                        <div className="mb-3 mt-1">
                          {msg.attachment.type === 'image' ? (
                            <div
                              className="relative group/image overflow-hidden rounded-xl border border-white/20 shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                              onClick={() => setViewingDoc(msg.attachment)}
                            >
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
                              <div
                                className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer p-1.5 -ml-1.5 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                onClick={() => setViewingDoc(msg.attachment)}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${(() => {
                                  const name = msg.attachment.name.toLowerCase();
                                  if (msg.role === 'user') return 'bg-white shadow-sm';

                                  if (name.endsWith('.pdf')) return 'bg-red-50 dark:bg-red-900/20';
                                  if (name.match(/\.(doc|docx)$/)) return 'bg-blue-50 dark:bg-blue-900/20';
                                  if (name.match(/\.(xls|xlsx|csv)$/)) return 'bg-emerald-50 dark:bg-emerald-900/20';
                                  if (name.match(/\.(ppt|pptx)$/)) return 'bg-orange-50 dark:bg-orange-900/20';
                                  return 'bg-secondary';
                                })()
                                  }`}>
                                  {(() => {
                                    const name = msg.attachment.name.toLowerCase();
                                    const baseClass = "w-6 h-6";

                                    if (name.match(/\.(xls|xlsx|csv)$/)) {
                                      return <FileSpreadsheet className={`${baseClass} text-emerald-600`} />;
                                    }
                                    if (name.match(/\.(ppt|pptx)$/)) {
                                      return <Presentation className={`${baseClass} text-orange-600`} />;
                                    }
                                    if (name.endsWith('.pdf')) {
                                      return <FileText className={`${baseClass} text-red-600`} />;
                                    }
                                    if (name.match(/\.(doc|docx)$/)) {
                                      return <File className={`${baseClass} text-blue-600`} />;
                                    }
                                    return <File className={`${baseClass} text-primary`} />;
                                  })()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold truncate text-xs mb-0.5">{msg.attachment.name}</p>
                                  <p className="text-[10px] opacity-70 uppercase tracking-tight font-medium">
                                    {(() => {
                                      const name = msg.attachment.name.toLowerCase();
                                      if (name.endsWith('.pdf')) return 'PDF • Preview';
                                      if (name.match(/\.(doc|docx)$/)) return 'WORD • Preview';
                                      if (name.match(/\.(xls|xlsx|csv)$/)) return 'EXCEL';
                                      if (name.match(/\.(ppt|pptx)$/)) return 'SLIDES';
                                      return 'DOCUMENT';
                                    })()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(msg.attachment.url, msg.attachment.name);
                                }}
                                className={`p-2 rounded-lg transition-colors shrink-0 ${msg.role === 'user' ? 'hover:bg-white/20' : 'hover:bg-primary/10 text-primary'}`}
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-3 min-w-[200px] w-full">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-white/10 text-white rounded-xl p-3 text-sm focus:outline-none resize-none border border-white/20 placeholder-white/50"
                            rows={2}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                saveEdit(msg);
                              }
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <div className="flex gap-3 justify-end items-center">
                            <button
                              onClick={cancelEdit}
                              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEdit(msg)}
                              className="bg-white text-primary px-6 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-colors shadow-sm"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        msg.content && (
                          <div className={`prose prose-invert max-w-full break-words ${msg.role === 'user' ? 'text-white' : 'text-maintext'}`}>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                code: ({ node, inline, className, children, ...props }) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const lang = match ? match[1] : '';

                                  if (!inline && match) {
                                    return (
                                      <div className="rounded-xl overflow-hidden my-4 border border-border bg-[#1e1e1e] shadow-md w-full max-w-full">
                                        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
                                          <span className="text-xs font-mono text-gray-300 lowercase">{lang}</span>
                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                              toast.success("Code copied!");
                                            }}
                                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy code
                                          </button>
                                        </div>
                                        <div className="p-4 overflow-x-auto custom-scrollbar bg-[#1e1e1e]">
                                          <code className={`${className} font-mono text-sm leading-relaxed text-[#d4d4d4] block min-w-full`} {...props}>
                                            {children}
                                          </code>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-primary font-bold mx-0.5" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
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
                        )
                      )}

                      {/* AI Feedback Actions */}
                      {msg.role !== 'user' && (
                        <div className="mt-1 pt-2 border-t border-transparent">
                          <p className="text-sm text-maintext mb-2 flex items-center gap-1">Just tell me <span className="text-base">😊</span></p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleCopyMessage(msg.content)}
                              className="text-subtext hover:text-maintext transition-colors"
                              title="Copy"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleThumbsUp(msg.id)}
                              className="text-subtext hover:text-primary transition-colors"
                              title="Helpful"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleThumbsDown(msg.id)}
                              className="text-subtext hover:text-red-500 transition-colors"
                              title="Not Helpful"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleShare(msg.content)}
                              className="text-subtext hover:text-primary transition-colors"
                              title="Share"
                            >
                              <Share className="w-4 h-4" />
                            </button>
                          </div>
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

                  {/* Hover Actions - User Only (AI has footer) */}
                  {msg.role === 'user' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-start mt-2 mr-0 flex-row-reverse">
                      <button
                        onClick={() => handleCopyMessage(msg.content || msg.text)}
                        className="p-1.5 text-subtext hover:text-primary hover:bg-surface rounded-full transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {!msg.attachment && (
                        <button
                          onClick={() => startEditing(msg)}
                          className="p-1.5 text-subtext hover:text-primary hover:bg-surface rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {msg.attachment && (
                        <button
                          onClick={() => handleRenameFile(msg)}
                          className="p-1.5 text-subtext hover:text-primary hover:bg-surface rounded-full transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleMessageDelete(msg.id)}
                        className="p-1.5 text-subtext hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
                        onClick={() => setIsEditingImage(true)}
                        className="p-1.5 bg-surface border border-border text-subtext hover:text-primary rounded-full hover:bg-primary/10 transition-colors shadow-sm"
                        title="Edit image"
                      >
                        <Wand2 className="w-3 h-3" />
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
              />
              <input
                id="drive-upload"
                type="file"
                ref={driveInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                id="photos-upload"
                type="file"
                ref={photosInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
              />
              <input
                id="camera-upload"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
                capture="environment"
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
                        htmlFor="camera-upload"
                        onClick={() => setTimeout(() => setIsAttachMenuOpen(false), 500)}
                        className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-primary/5 rounded-xl transition-all group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors shrink-0">
                          <Camera className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-maintext group-hover:text-primary transition-colors">Camera & Scan</span>
                      </label>

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


                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                ref={attachBtnRef}
                onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                className={`p-3 sm:p-4 rounded-full border border-primary bg-primary text-white transition-all duration-300 shadow-lg shadow-primary/20 shrink-0 flex items-center justify-center hover:opacity-90
                  ${isAttachMenuOpen ? 'rotate-45' : ''}`}
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
                    onClick={() => setIsLiveMode(true)}
                    className="p-2 sm:p-2.5 rounded-full text-primary hover:bg-primary/10 hover:border-primary/20 transition-all flex items-center justify-center mr-1 border border-transparent"
                    title="Live Video Call"
                  >
                    <Video className="w-5 h-5" />
                  </button>

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
      {/* Live AI Modal */}
      <AnimatePresence>
        {isLiveMode && (
          <LiveAI
            onClose={() => setIsLiveMode(false)}
            language={currentLang}
          />
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <Transition appear show={feedbackOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setFeedbackOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-xl transition-all border border-border">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-maintext flex justify-between items-center"
                  >
                    Share feedback
                    <button onClick={() => setFeedbackOpen(false)} className="text-subtext hover:text-maintext">
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Incorrect or incomplete", "Not what I asked for", "Slow or buggy", "Style or tone", "Safety or legal concern", "Other"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleFeedbackCategory(cat)}
                        className={`text-xs px-3 py-2 rounded-full border transition-colors ${feedbackCategory.includes(cat)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-transparent text-subtext border-border hover:border-maintext'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4">
                    <textarea
                      className="w-full bg-black/5 dark:bg-white/5 rounded-xl p-3 text-sm focus:outline-none border border-transparent focus:border-border text-maintext placeholder-subtext resize-none"
                      rows={3}
                      placeholder="Share details (optional)"
                      value={feedbackDetails}
                      onChange={(e) => setFeedbackDetails(e.target.value)}
                    />
                  </div>

                  <div className="mt-4 text-[10px] text-subtext leading-tight">
                    Your conversation will be included with your feedback to help improve the AI.
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/75"
                      onClick={submitFeedback}
                    >
                      Submit
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Chat;
