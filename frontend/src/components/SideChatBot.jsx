import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Mic, MicOff, X, Bot, User, Hash, Tag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/SideChatBot.css';
import chatbotIcon from '../assets/chatbot.jpg';
import { useLanguage } from '../contexts/LanguageContext';

const SideChatBot = () => {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    // Mapping for Speech Recognition locales (matching AIAssistant)
    const langMap = {
        en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN',
        bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN'
    };

    const getGreeting = (lang) => {
        const greetings = {
            en: "Hi 👋 I'm the AI Support Agent. I can help you understand this website or take your complaint.",
            hi: "नमस्ते 👋 मैं AI सहायता एजेंट हूँ। मैं इस वेबसाइट को समझने বা आपकी शिकायत दर्ज करने में आपकी मदद कर सकता हूँ।",
            ta: "வணக்கம் 👋 நான் AI ஆதரவு முகவர். இந்த இணையதளத்தைப் புரிந்துகொள்ள அல்லது உங்கள் புகாரைப் பெற நான் உங்களுக்கு உதவ முடியும்.",
            te: "నమస్కారం 👋 నేను AI సపోర్ట్ ఏజెంట్. ఈ వెబ్‌సైట్‌ను అర్థం చేసుకోవడంలో లేదా మీ ఫిర్యాదును స్వీకరించడంలో నేను మీకు సహాయం చేయగలను.",
            kn: "ನಮಸ್ಕಾರ 👋 ನಾನು AI ಬೆಂಬಲ ಏಜೆಂಟ್. ಈ ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಅಥವಾ ನಿಮ್ಮ ದೂರನ್ನು ಸ್ವೀಕರಿಸಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
            bn: "নমস্কার 👋 আমি এআই সাপোর্ট এজেন্ট। আমি আপনাকে এই ওয়েবসাইটটি বুঝতে বা আপনার অভিযোগ জানাতে সাহায্য করতে পারি।",
            mr: "नमस्कार 👋 मी एआय सपोर्ट एजंट आहे. मी तुम्हाला ही वेबसाइट समजून घेण्यास किंवा तुमची तक्रार नोंदवण्यास मदत करू शकतो.",
            gu: "નમસ્તે 👋 હું AI સપોર્ટ એજન્ટ છું. હું તમને આ વેબસાઈટ સમજવામાં અથવા તમારી ફરિયાદ લેવામાં મદદ કરી શકું છું.",
            ml: "ഹലോ 👋 ഞാൻ AI സപ്പോർട്ട് ഏജന്റാണ്. ഈ വെബ്‌സൈറ്റ് മനസ്സിലാക്കാനോ നിങ്ങളുടെ പരാതി സ്വീകരിക്കാനോ എനിക്ക് നിങ്ങളെ സഹായിക്കാനാകും.",
            pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ 👋 ਮੈਂ AI ਸਹਾਇਤਾ ਏਜੰਟ ਹਾਂ। ਮੈਂ ਤੁਹਾਨੂੰ ਇਸ ਵੈੱਬਸਾਈਟ ਨੂੰ ਸਮਝਣ ਜਾਂ ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।",
            or: "ନମସ୍କାର 👋 ମୁଁ AI ସହାୟତା ଏଜେଣ୍ଟ | ମୁଁ ଆପଣଙ୍କୁ ଏହି ୱେବସାଇଟ୍ ବୁଝିବାରେ କିମ୍ବା ଆପଣଙ୍କର ଅଭିଯୋଗ ଗ୍ରହଣ କରିବାରେ ସାହାଯ୍ୟ କରିପାରିବି |"
        };
        return greetings[lang] || greetings.en;
    };

    const [messages, setMessages] = useState([
        {
            id: 1,
            text: getGreeting(language),
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            meta: { type: 'greeting', category: 'general', priority: 'low' }
        }
    ]);

    // Update greeting when language changes
    useEffect(() => {
        if (messages.length === 1 && messages[0].meta?.type === 'greeting') {
            setMessages([{
                ...messages[0],
                text: getGreeting(language)
            }]);
        }
    }, [language]);

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Base URL is managed by api service

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = useRef(null);

    useEffect(() => {
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = langMap[language] || 'en-IN';

            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                setIsRecording(false);
            };

            recognition.current.onerror = () => {
                setIsRecording(false);
            };

            recognition.current.onend = () => {
                setIsRecording(false);
            };
        }
    }, [language]);

    const toggleRecording = () => {
        if (!recognition.current) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }

        if (isRecording) {
            recognition.current.stop();
        } else {
            setIsRecording(true);
            recognition.current.start();
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
                language: 'auto'
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

                        <form
                            className="chatbot-input-area"
                            onSubmit={handleSendMessage}
                            onMouseEnter={() => {
                                if (isOpen && !isLoading) {
                                    inputRef.current?.focus();
                                }
                            }}
                        >
                            <div className="input-wrapper">
                                <input
                                    ref={inputRef}
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
