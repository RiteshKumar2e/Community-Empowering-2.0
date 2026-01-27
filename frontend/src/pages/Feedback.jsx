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
    MessageSquare,
    Bug,
    Wand2,
    Target
} from 'lucide-react'
import '../styles/Feedback.css'

const Feedback = () => {
    const [name, setName] = useState('')
    const [category, setCategory] = useState('Experience')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [message, setMessage] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const categories = [
        {
            id: 'Experience',
            icon: <MessageSquare size={20} />,
            label: 'General Experience',
            desc: 'Overall usability and feel'
        },
        {
            id: 'Features',
            icon: <Wand2 size={20} />,
            label: 'New Features',
            desc: 'Ideas for improvement'
        },
        {
            id: 'Performance',
            icon: <Zap size={20} />,
            label: 'Performance',
            desc: 'Speed and stability'
        },
        {
            id: 'Bugs',
            icon: <Bug size={20} />,
            label: 'Bug Report',
            desc: 'Technical issues'
        }
    ]

    const features = [
        { icon: <ShieldCheck />, text: "Help us build a safer community" },
        { icon: <Users />, text: "Your voice shapes our roadmap" },
        { icon: <Target />, text: "Focus on what matters to you" }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/feedback`, {
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
                alert(errorData.detail || 'Failed to submit feedback. Please try again.');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            alert('Connection error. Please check if the backend is running.');
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
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    if (submitted) {
        return (
            <div className="feedback-page">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="feedback-card success-card"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            className="success-blob"
                        >
                            <CheckCircle size={40} />
                        </motion.div>
                        <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '16px' }}>Impact Delivered</h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px', margin: '0 auto 32px' }}>
                            Your insights have been logged. Our team reviews every piece of feedback to make Community AI better for everyone.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ padding: '16px 32px' }}
                            onClick={() => setSubmitted(false)}
                        >
                            Submit Another Response
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
                    {/* Left Column: Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="feedback-info"
                    >
                        <motion.h1 variants={itemVariants}>
                            Shape the Future <br />
                            <span>of Community AI</span>
                        </motion.h1>
                        <motion.p variants={itemVariants}>
                            We're building this for you. Your feedback is the catalyst for our evolution.
                            Share your thoughts on how we can make our tools more impactful for your community.
                        </motion.p>

                        <div className="feature-list">
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    className="feature-item"
                                >
                                    <div className="feature-icon">{f.icon}</div>
                                    <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{f.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="feedback-card"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="rating-section">
                                <span className="rating-label">Rate your experience</span>
                                <div className="stars-row">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.button
                                            key={star}
                                            type="button"
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star size={32} fill={(hoverRating || rating) >= star ? "currentColor" : "none"} />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div className="category-tabs">
                                {categories.map((cat) => (
                                    <motion.div
                                        key={cat.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`category-tab ${category === cat.id ? 'active' : ''}`}
                                        onClick={() => setCategory(cat.id)}
                                    >
                                        <div style={{ color: category === cat.id ? '#818cf8' : 'rgba(255,255,255,0.4)' }}>
                                            {cat.icon}
                                        </div>
                                        <span>{cat.label}</span>
                                        <small>{cat.desc}</small>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="modern-input-group">
                                <textarea
                                    className="modern-textarea"
                                    placeholder="What's on your mind? Be as specific as you'd like..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="fancy-submit"
                                disabled={loading || rating === 0}
                            >
                                {loading ? (
                                    <div className="spinner-small" />
                                ) : (
                                    <>
                                        Submit Feedback
                                        <ArrowRight size={20} />
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
