import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Shield, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/ExploreModal.css';

const ExploreModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    // Close on Escape, and restore background scrolling when open.
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="signin-prompt-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="signin-prompt-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Explore Community AI"
                        initial={{ opacity: 0, scale: 0.97, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 8 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                    >
                        <button
                            className="signin-prompt-close"
                            onClick={onClose}
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

export default ExploreModal;
