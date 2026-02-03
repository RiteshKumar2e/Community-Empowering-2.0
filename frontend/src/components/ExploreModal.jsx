import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignInPromptModal.css';

const ExploreModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleSignIn = () => {
        onClose();
        navigate('/login');
    };

    const handleExploreFeatures = () => {
        onClose();
        // Scroll to features section
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            const headerOffset = 80;
            const elementPosition = featuresSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const features = [
        {
            icon: <Sparkles size={24} />,
            title: "AI-Powered Assistant",
            description: "Get personalized help in your language"
        },
        {
            icon: <TrendingUp size={24} />,
            title: "Government Schemes",
            description: "Access 50+ schemes tailored for you"
        },
        {
            icon: <Zap size={24} />,
            title: "Free Learning",
            description: "100+ courses to boost your skills"
        },
        {
            icon: <Shield size={24} />,
            title: "Community Forum",
            description: "Connect and share with others"
        }
    ];

    // Check if light theme
    const isLightTheme = document.body.classList.contains('light-theme');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="signin-prompt-backdrop"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 999998,
                            display: 'block'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal - Theme Aware */}
                    <motion.div
                        className="signin-prompt-modal"
                        style={{
                            position: 'fixed',
                            top: '22%',
                            left: '30%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 999999,
                            display: 'block',
                            background: isLightTheme
                                ? 'linear-gradient(135deg, #ffffff 0%, #f9faff 100%)'
                                : 'rgba(26, 26, 36, 0.85)',
                            backdropFilter: isLightTheme ? 'none' : 'blur(20px)',
                            padding: '28px',
                            borderRadius: '24px',
                            maxWidth: '480px',
                            width: '88%',
                            maxHeight: '65vh',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            border: isLightTheme
                                ? '2px solid rgba(99, 102, 241, 0.2)'
                                : '2px solid rgba(99, 102, 241, 0.4)'
                        }}
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="signin-prompt-header">
                            <div className="signin-prompt-icon-wrapper">
                                <Sparkles className="signin-prompt-icon" size={40} />
                            </div>
                            <h2>Unlock Full Access</h2>
                            <p>Sign in to experience all the amazing features</p>
                        </div>

                        <div className="signin-prompt-features">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="signin-prompt-feature"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="feature-icon">
                                        {feature.icon}
                                    </div>
                                    <div className="feature-content">
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="signin-prompt-actions">
                            <button
                                className="btn-signin-primary"
                                onClick={handleSignIn}
                            >
                                Sign In Now
                            </button>
                            <button
                                className="btn-signin-secondary"
                                onClick={handleExploreFeatures}
                            >
                                Explore Features
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ExploreModal;
