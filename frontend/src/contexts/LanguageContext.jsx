import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider')
    }
    return context
}

const translations = {
    en: {
        // Language names
        languageName: 'English',

        // Navigation
        home: 'Home',
        mission: 'Mission',
        about: 'About',
        goals: 'Goals',
        team: 'Team',
        testimonials: 'Testimonials',
        contact: 'Contact',
        dashboard: 'Dashboard',
        assistant: 'AI Assistant',
        resources: 'Resources',
        learning: 'Learning Hub',
        profile: 'Profile',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',

        // Hero Section
        heroTitle: 'Empowering Communities Through AI',
        heroSubtitle: 'Access government schemes, education, and opportunities through voice-first AI assistance in your language',
        getStarted: 'Get Started',
        learnMore: 'Learn More',

        // Features
        features: 'Features',
        civicAssistant: 'AI Assistant',
        civicDesc: 'Voice-first multilingual AI to help you navigate government services',
        education: 'Education & Skills',
        educationDesc: 'Free courses and resources for skill development',
        resourceFinder: 'Resource Finder',
        resourceDesc: 'Discover government schemes, jobs, and NGO programs',
        voiceFirst: 'Voice Interaction',
        voiceDesc: 'Speak in your language - Hindi, English, and more',

        // Buttons
        signIn: 'Sign In',
        adminLogin: 'Admin Login',

        // Common
        welcome: 'Welcome',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
    },
    hi: {
        // Language names
        languageName: 'हिंदी',

        // Navigation
        home: 'होम',
        mission: 'मिशन',
        about: 'हमारे बारे में',
        goals: 'लक्ष्य',
        team: 'टीम',
        testimonials: 'प्रशंसापत्र',
        contact: 'संपर्क',
        dashboard: 'डैशबोर्ड',
        assistant: 'AI सहायक',
        resources: 'संसाधन',
        learning: 'शिक्षा केंद्र',
        profile: 'प्रोफ़ाइल',
        login: 'लॉगिन',
        register: 'रजिस्टर',
        logout: 'लॉगआउट',

        // Hero Section
        heroTitle: 'AI के माध्यम से समुदायों को सशक्त बनाना',
        heroSubtitle: 'अपनी भाषा में वॉयस-फर्स्ट AI सहायता के माध्यम से सरकारी योजनाओं, शिक्षा और अवसरों तक पहुंच',
        getStarted: 'शुरू करें',
        learnMore: 'और जानें',

        // Features
        features: 'विशेषताएं',
        civicAssistant: 'AI सहायक',
        civicDesc: 'सरकारी सेवाओं में मदद के लिए बहुभाषी वॉयस AI',
        education: 'शिक्षा और कौशल',
        educationDesc: 'कौशल विकास के लिए मुफ्त पाठ्यक्रम और संसाधन',
        resourceFinder: 'संसाधन खोजक',
        resourceDesc: 'सरकारी योजनाएं, नौकरियां और NGO कार्यक्रम खोजें',
        voiceFirst: 'वॉयस इंटरैक्शन',
        voiceDesc: 'अपनी भाषा में बोलें - हिंदी, अंग्रेजी और अधिक',

        // Buttons
        signIn: 'साइन इन',
        adminLogin: 'एडमिन लॉगिन',

        // Common
        welcome: 'स्वागत है',
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        success: 'सफलता',
    }
}

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en')

    const changeLanguage = (lang) => {
        setLanguage(lang)
        localStorage.setItem('language', lang)
    }

    const t = (key) => {
        return translations[language][key] || key
    }

    const value = {
        language,
        changeLanguage,
        t,
        availableLanguages: ['en', 'hi'],
        getLanguageName: (lang) => translations[lang]?.languageName || lang.toUpperCase()
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}
