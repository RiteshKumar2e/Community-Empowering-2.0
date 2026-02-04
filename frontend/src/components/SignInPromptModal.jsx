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
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Only show modal if user is NOT logged in
        if (!isAuthenticated) {
            // Show modal after 100ms (near-instant)
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 20000);

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);



    const handleSignIn = () => {
        setIsVisible(false);
        navigate('/login');
    };

    const handleClose = () => {
        alert("Sign in is mandatory to access all features of Community AI!");
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
            description: "Access 350+ schemes tailored for you"
        },
        {
            icon: <Zap size={24} />,
            title: "Learning Hub",
            description: "250+ courses to boost your skills"
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
                        onClick={handleClose}
                    />

                    {/* Modal - Responsive Position */}
                    <motion.div
                        className="signin-prompt-modal"
                        style={{
                            position: 'fixed',
                            top: isMobile ? '50%' : '22%',
                            left: isMobile ? '50%' : '30%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 999999,
                            display: 'block',
                            maxWidth: '480px',
                            width: '88%',
                            maxHeight: '65vh',
                            overflowY: 'auto',
                            overflowX: 'hidden'
                        }}
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
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SignInPromptModal;
