import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Star,
    Send,
    CheckCircle,
    Zap,
    ShieldCheck,
    Users,
    ArrowRight,
    Bot,
    Layout,
    Globe,
    Cpu,
    Sparkles
} from 'lucide-react'
import '../styles/Feedback.css'

const Feedback = () => {
    const [category, setCategory] = useState('Assistant')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [message, setMessage] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const categories = [
        {
            id: 'Assistant',
            icon: <Bot size={22} />,
            label: 'AI Assistant',
            desc: 'Response accuracy & quality'
        },
        {
            id: 'Platform',
            icon: <Layout size={22} />,
            label: 'Platform Design',
            desc: 'Ease of use & navigation'
        },
        {
            id: 'Resources',
            icon: <Globe size={22} />,
            label: 'Community Content',
            desc: 'Quality of resources provided'
        },
        {
            id: 'Technical',
            icon: <Cpu size={22} />,
            label: 'Technical Site',
            desc: 'Bugs or site performance'
        }
    ]

    const features = [
        { icon: <Sparkles />, text: "Enhancing AI-driven responses" },
        { icon: <ShieldCheck />, text: "Building a secure community hub" },
        { icon: <Users />, text: "Direct influence on site updates" }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            // Ensure we don't end up with /api/api if VITE_API_URL includes /api
            const endpoint = baseUrl.endsWith('/api') ? `${baseUrl}/feedback` : `${baseUrl}/api/feedback`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    category,
                    rating,
                    message
                })
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                const errorData = await response.json();
                alert(errorData.detail || 'Failed to submit feedback.');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            alert('Connection error. Please check your backend.');
        } finally {
            setLoading(false);
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0 }
    }

    if (submitted) {
        return (
            <div className="feedback-page">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="feedback-card success-card"
                    >
                        <motion.div
                            initial={{ rotate: -45, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="success-icon-wrap"
                        >
                            <CheckCircle size={50} />
                        </motion.div>
                        <h1 className="success-title">Insights Received!</h1>
                        <p className="success-text">
                            Thank you for helping us evolve. Your feedback is already on its way to our team for review.
                        </p>
                        <button
                            className="btn btn-primary mt-4"
                            style={{ padding: '16px 40px', borderRadius: '16px' }}
                            onClick={() => setSubmitted(false)}
                        >
                            Return to Feedback
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="feedback-page">
            <div className="container feedback-container">
                <div className="feedback-grid">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="feedback-info"
                    >
                        <motion.h1 variants={itemVariants}>
                            Level Up <br />
                            <span>Our Platform</span>
                        </motion.h1>
                        <motion.p variants={itemVariants}>
                            Community AI is constantly evolving. Your direct experiences help us
                            prioritize the next big feature or fix critical issues.
                        </motion.p>

                        <div className="feature-list">
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    className="feature-item"
                                >
                                    <div className="feature-icon">{f.icon}</div>
                                    <span style={{ fontWeight: 600 }}>{f.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="feedback-card"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="rating-section">
                                <span className="rating-label">How's the experience?</span>
                                <div className="stars-row">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.button
                                            key={star}
                                            type="button"
                                            whileHover={{ scale: 1.25 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star size={36} fill={(hoverRating || rating) >= star ? "currentColor" : "none"} />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div className="category-tabs">
                                {categories.map((cat) => (
                                    <motion.div
                                        key={cat.id}
                                        whileHover={{ y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`category-tab ${category === cat.id ? 'active' : ''}`}
                                        onClick={() => setCategory(cat.id)}
                                    >
                                        <div className="tab-icon-wrap" style={{ color: category === cat.id ? '#fff' : 'var(--primary-500)' }}>
                                            {cat.icon}
                                        </div>
                                        <span>{cat.label}</span>
                                        <small>{cat.desc}</small>
                                    </motion.div>
                                ))}
                            </div>

                            <textarea
                                className="modern-textarea"
                                placeholder="Describe your experience or suggest an improvement..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />

                            <button
                                type="submit"
                                className="fancy-submit"
                                disabled={loading || rating === 0}
                            >
                                {loading ? 'Transmitting Data...' : (
                                    <>
                                        Submit Feedback
                                        <Send size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Feedback
