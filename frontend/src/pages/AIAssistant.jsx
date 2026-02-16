import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Send, Mic, MicOff, Loader, Bot, User as UserIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import api from '../services/api'
import '../styles/AIAssistant.css'

const AIAssistant = () => {
    const { user } = useAuth()
    const { t, language, getLanguageName } = useLanguage()

    // Mapping for Speech Recognition and TTS locales
    const langMap = {
        en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN',
        bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN'
    }

    const getGreeting = (lang) => {
        const greetings = {
            en: `Hello ${user?.name || 'friend'}! I'm your AI assistant. I can help you with government schemes, market access, and community resources. How can I assist you today?`,
            hi: `नमस्ते ${user?.name || 'दोस्त'}! मैं आपका AI सहायक हूँ। मैं सरकारी योजनाओं, बाज़ार पहुँच और संसाधनों में आपकी मदद कर सकता हूँ।`,
            ta: `வணக்கம்! நான் உங்கள் AI உதவியாளர். அரசு திட்டங்கள் ಮತ್ತು சந்தை அணுகަލில் நான் உங்களுக்கு உதவ முடியும்.`,
            te: `నమస్కారం! నేను మీ AI అసిస్టెంట్. ప్రభుత్వ పథకాలు మరియు మార్కెట్ యాక్సెస్‌లో నేను మీకు సహాయం చేయగలను.`,
            kn: `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಸಹಾಯಕ. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಪ್ರವೇಶದಲ್ಲಿ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.`,
            bn: `নমস্কার! আমি আপনার AI সহকারী। আমি আপনাকে সরকারি প্রকল্প এবং বাজারে অ্যাক্সেস পেতে সাহায্য করতে পারি।`,
            mr: `नमस्कार! मी तुमचा AI सहाय्यक आहे. मी तुम्हाला सरकारी योजना आणि बाजारपेठेत मदत करू शकतो.`,
            gu: `નમસ્તે! હું તમારો AI સહાયક છું. હું તમને સરકારી યોજનાઓ અને બજારમાં મદદ કરી શકું છું.`,
            ml: `നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI അസിസ്റ്റൻ്റാണ്. സർക്കാർ പദ്ധതികളിലും വിപണിയിലും എനിക്ക് നിങ്ങളെ സഹായിക്കാനാകും.`,
            pa: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।`,
            or: `ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର AI ସହାୟକ | ମୁଁ ଆପଣଙ୍କୁ ସରକାରୀ ଯୋଜନାରେ ସାହାଯ୍ୟ କରିପାରିବି |`
        }
        return greetings[lang] || greetings.en
    }

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: getGreeting(language),
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const messagesEndRef = useRef(null)
    const recognitionRef = useRef(null)

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = false
            recognitionRef.current.lang = langMap[language] || 'en-US'

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                setInput(transcript)
                setIsListening(false)
            }

            recognitionRef.current.onerror = () => {
                setIsListening(false)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }
        }
    }, [language])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        const messageToSend = input
        setInput('')
        setLoading(true)

        try {
            const response = await api.post('/ai/chat', {
                message: messageToSend,
                language: 'auto', // Use auto detection
                context: {
                    communityType: user?.communityType,
                    location: user?.location
                }
            })

            const cleanContent = response.data.message.replaceAll('*', '')
            const assistantMessage = {
                role: 'assistant',
                content: cleanContent,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])

            // Text-to-speech for response
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(cleanContent)
                const targetLang = langMap[language] || 'en-US'
                utterance.lang = targetLang

                const voices = window.speechSynthesis.getVoices()
                let selectedVoice = voices.find(v => v.name.includes('Google') && v.lang.includes(targetLang))
                if (!selectedVoice) {
                    selectedVoice = voices.find(v => v.lang.includes(targetLang) && (v.name.includes('Premium') || v.name.includes('Enhanced')))
                }
                if (!selectedVoice) {
                    selectedVoice = voices.find(v => v.lang.includes(targetLang))
                }

                if (selectedVoice) {
                    utterance.voice = selectedVoice
                    utterance.rate = 0.95
                }

                window.speechSynthesis.speak(utterance)
            }
        } catch (error) {
            console.error('Error sending message:', error)
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert('Voice input is not supported in your browser')
            return
        }

        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            recognitionRef.current.start()
            setIsListening(true)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const suggestions = {
        en: [
            'Tell me about government schemes for farmers',
            'Where can I sell my local products?',
            'I need market pricing information',
            'What resources are available for help in my area?'
        ],
        hi: [
            'मुझे किसानों के लिए सरकारी योजनाओं के बारे में बताएं',
            'मैं अपने स्थानीय उत्पादों को कहां बेच सकता हूं?',
            'मुझे बाज़ार मूल्य निर्धारण की जानकारी चाहिए',
            'मेरे क्षेत्र में सहायता के लिए कौन से संसाधन उपलब्ध हैं?'
        ]
    }

    const currentSuggestions = suggestions[language] || suggestions.en

    return (
        <div className="ai-assistant-page">
            <div className="container">
                <div className="assistant-container">
                    {/* Header */}
                    <div className="assistant-header">
                        <div className="header-content">
                            <div className="bot-avatar">
                                <Bot size={32} />
                            </div>
                            <div>
                                <h1>{t('assistant')}</h1>
                                <p>{language === 'hi' ? 'मुझसे योजनाओं, बाज़ार और संसाधनों के बारे में कुछ भी पूछें' : language === 'en' ? 'Ask me anything about schemes, markets, and resources' : t('heroSubtitle')}</p>
                            </div>
                        </div>
                        <div className="language-indicator">
                            <span className="badge badge-primary">
                                {getLanguageName(language)}
                            </span>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="messages-area">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                            >
                                <div className="message-avatar">
                                    {message.role === 'user' ? (
                                        <UserIcon size={20} />
                                    ) : (
                                        <Bot size={20} />
                                    )}
                                </div>
                                <div className="message-content">
                                    <div className="markdown-content">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    <span className="message-time">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}


                        {loading && (
                            <div className="message assistant-message">
                                <div className="message-avatar">
                                    <Bot size={20} />
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length === 1 && (
                        <div className="suggestions">
                            <p className="suggestions-label">Try asking:</p>
                            <div className="suggestions-grid">
                                {currentSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="suggestion-chip"
                                        onClick={() => setInput(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="input-area">
                        <div className="input-container">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message or use voice input..."
                                className="message-input"
                                rows="1"
                            />
                            <div className="input-actions">
                                <button
                                    onClick={handleVoiceInput}
                                    className={`btn-icon ${isListening ? 'listening' : ''}`}
                                    title="Voice input"
                                >
                                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                <button
                                    onClick={handleSend}
                                    className="btn btn-primary"
                                    disabled={!input.trim() || loading}
                                >
                                    {loading ? <Loader className="spinner" size={20} /> : <Send size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIAssistant
