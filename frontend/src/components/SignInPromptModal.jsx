import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/SignInPromptModal.css';

const SignInPromptModal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // Only show modal if user is NOT logged in
        if (!isAuthenticated) {
            // Show modal after 5 seconds
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000); // 5 seconds

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    const handleSignIn = () => {
        setIsVisible(false);
        navigate('/login');
    };

    const handleClose = () => {
        setIsVisible(false);
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

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="signin-prompt-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="signin-prompt-modal"
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <button
                            className="signin-prompt-close"
                            onClick={handleClose}
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>

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
                                onClick={handleClose}
                            >
                                Maybe Later
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SignInPromptModal;
