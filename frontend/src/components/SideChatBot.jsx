import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Mic, MicOff, X, Bot, User, Hash, Tag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/SideChatBot.css';
import chatbotIcon from '../assets/chatbot.jpg';

const SideChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi 👋 I'm the AI Support Agent. I can help you understand this website or take your complaint.",
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            meta: { type: 'greeting', category: 'general', priority: 'low' }
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef(null);

    // Base URL is managed by api service

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
            setIsRecording(false);
        };

        recognition.onerror = () => {
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };
    }

    const toggleRecording = () => {
        if (!recognition) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }

        if (isRecording) {
            recognition.stop();
        } else {
            setIsRecording(true);
            recognition.start();
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await api.post('/agent/chat', {
                message: inputText,
                language: 'en'
            });

            const botMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                meta: response.data.meta
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="side-chatbot-wrapper">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chatbot-container"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", damping: 30, stiffness: 450, mass: 0.8 }}
                    >
                        <div className="chatbot-header">
                            <div className="bot-avatar" style={{ overflow: 'hidden' }}>
                                <img src={chatbotIcon} alt="AI Agent" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="bot-info">
                                <h3>AI Agent</h3>
                                <div className="bot-status">
                                    <span className="status-dot"></span>
                                    Online
                                </div>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setIsOpen(false)}
                                style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="chatbot-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message ${msg.sender}`}>
                                    <div className="message-content">
                                        {msg.sender === 'bot' ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                    <div className="message-time">
                                        {msg.timestamp}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="typing-indicator">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chatbot-input-area" onSubmit={handleSendMessage}>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={`voice-btn ${isRecording ? 'recording' : ''}`}
                                    onClick={toggleRecording}
                                    disabled={isLoading}
                                >
                                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                                </button>
                            </div>
                            <button className="send-btn" type="submit" disabled={!inputText.trim() || isLoading}>
                                Send
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <button
                    className="chatbot-toggle-btn"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Chatbot"
                    style={{ padding: '0', overflow: 'hidden' }}
                >
                    <img src={chatbotIcon} alt="Toggle Chat" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
            )}
        </div>
    );
};

export default SideChatBot;
