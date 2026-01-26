import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { ArrowRight, MessageSquare, BookOpen, Search, Mic, Globe, Zap, Target, Heart, Award, CheckCircle, Star, ArrowUp, Github, Linkedin, Mail } from 'lucide-react'
import ThreeBackground from '../components/ThreeBackground'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/Landing.css'
import '../styles/Cursor.css'
import '../styles/MiniFeatures.css'

const Landing = () => {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const { t } = useLanguage()
    const [selectedFeature, setSelectedFeature] = useState(null)
    const [showScrollTop, setShowScrollTop] = useState(false)
    // Scroll to Top Logic
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };


    const FeatureModal = ({ feature, onClose }) => {
        if (!feature) return null;

        return (
            <div className="feature-modal-overlay" onClick={onClose}>
                <motion.div
                    className="feature-modal-content"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div className="modal-icon-wrapper" style={{ background: feature.color }}>
                            <span className="modal-icon">{feature.icon}</span>
                        </div>
                        <button className="modal-close-btn" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div className="modal-body">
                        <h2 className="modal-title">{feature.title}</h2>
                        <p className="modal-description">{feature.description}</p>

                        <div className="modal-details-grid">
                            {(feature.details || []).map((detail, idx) => (
                                <div key={idx} className="modal-detail-item">
                                    <div className="detail-check">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <span>{detail}</span>
                                </div>
                            ))}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modal-action" onClick={onClose}>
                                Got it, Awesome!
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    const features = [
        {
            icon: <MessageSquare size={32} />,
            title: t('civicAssistant'),
            description: t('civicDesc'),
            color: 'var(--primary-500)',
            details: [
                '24/7 Citizen Support',
                'Government Scheme Guidance',
                'Application Assistance',
                'Instant Query Resolution'
            ]
        },
        {
            icon: <BookOpen size={32} />,
            title: t('education'),
            description: t('educationDesc'),
            color: 'var(--secondary-500)',
            details: [
                'Free Learning Modules',
                'Skill Development Courses',
                'Expert Webinars',
                'Resource Downloads'
            ]
        },
        {
            icon: <Search size={32} />,
            title: t('resourceFinder'),
            description: t('resourceDesc'),
            color: 'var(--success-500)',
            details: [
                'Local Facility Search',
                'Service Mapping',
                'Emergency Contacts',
                'Community Directory'
            ]
        },
        {
            icon: <Mic size={32} />,
            title: t('voiceFirst'),
            description: t('voiceDesc'),
            color: 'var(--primary-400)',
            details: [
                'Natural Language Understanding',
                'Vernacular Speech Support',
                'Hands-free Interaction',
                'Accessible to Non-literate Users'
            ]
        }
    ]

    const stats = [
        { value: '10K+', label: 'Active Users' },
        { value: '50+', label: 'Government Schemes' },
        { value: '100+', label: 'Learning Resources' },
        { value: '5+', label: 'Languages Supported' }
    ]

    const goals = [
        {
            icon: <Target size={32} />,
            title: 'Accessibility',
            description: 'Make government services accessible to everyone, regardless of location or literacy level'
        },
        {
            icon: <Heart size={32} />,
            title: 'Empowerment',
            description: 'Empower communities with knowledge and resources to improve their lives'
        },
        {
            icon: <Globe size={32} />,
            title: 'Inclusion',
            description: 'Bridge the digital divide with multilingual, voice-first technology'
        },
        {
            icon: <Award size={32} />,
            title: 'Impact',
            description: 'Create measurable social impact in underserved communities across India'
        }
    ]


    const testimonials = [
        {
            name: 'Rajesh Kumar',
            role: 'Farmer, Punjab',
            text: 'This platform helped me discover PM-KISAN scheme. The voice feature in Punjabi made it so easy!',
            rating: 5
        },
        {
            name: 'Priya Sharma',
            role: 'Student, Mumbai',
            text: 'Found amazing scholarship opportunities through this platform. The AI assistant is very helpful!',
            rating: 5
        },
        {
            name: 'Mohammed Ali',
            role: 'Small Business Owner, Delhi',
            text: 'Got information about MUDRA loan scheme. Started my business with government support!',
            rating: 5
        }
    ]

    return (
        <div className="landing">
            <ThreeBackground />

            {/* Hero Section */}
            <section id="home" className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge badge-primary">
                                <span className="badge-icon">✨</span>
                                AI-Powered Innovation
                            </span>
                        </div>

                        <h1 className="hero-title">
                            <span className="title-white">Community AI -</span>{' '}
                            <span className="title-purple-light">Empowering</span>
                            <br />
                            <span className="title-purple-light">Communities Through AI</span>
                        </h1>

                        <p className="hero-subtitle">
                            Access government schemes, education, and opportunities through voice-first AI assistance in your language
                        </p>

                        <div className="hero-actions">
                            {isAuthenticated ? (
                                <button onClick={() => navigate('/dashboard')} className="btn btn-explore" style={{ background: 'var(--primary-500)', border: 'none' }}>
                                    Dashboard
                                    <ArrowRight size={20} />
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => scrollToSection('features')} className="btn btn-explore">
                                        Explore Solutions
                                        <ArrowRight size={20} />
                                    </button>
                                    <button onClick={() => scrollToSection('about')} className="btn btn-learn">
                                        Learn More
                                        <ArrowRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section id="mission" className="mission-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Our Mission</h2>
                        <p>Empowering communities through accessible AI technology</p>
                    </div>

                    <div className="mission-content">
                        <div className="mission-card">
                            <div className="mission-icon">🎯</div>
                            <h3>Bridge the Digital Divide</h3>
                            <p>We're committed to making technology accessible to everyone, especially underserved communities across India.</p>
                        </div>
                        <div className="mission-card">
                            <div className="mission-icon">🌟</div>
                            <h3>Simplify Access to Services</h3>
                            <p>Breaking down barriers to government schemes, education, and opportunities with AI-powered assistance.</p>
                        </div>
                        <div className="mission-card">
                            <div className="mission-icon">💡</div>
                            <h3>Enable Growth</h3>
                            <p>Providing tools and resources that help individuals and communities thrive in the digital age.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-content">
                            <h2>About Community AI</h2>
                            <p className="about-lead">
                                We are building India's most inclusive AI platform that brings public services, education, and opportunities directly to communities.
                            </p>
                            <p>
                                Our platform leverages cutting-edge AI technology to break down language barriers, simplify complex processes, and make critical information accessible to everyone.
                            </p>
                            <p>
                                With support for multiple Indian languages, voice-first interaction, and low-bandwidth optimization, we ensure that no one is left behind in the digital revolution.
                            </p>
                            <div className="about-features">
                                <div className="about-feature">
                                    <CheckCircle size={20} />
                                    <span>Multilingual Support</span>
                                </div>
                                <div className="about-feature">
                                    <CheckCircle size={20} />
                                    <span>Voice-First Design</span>
                                </div>
                                <div className="about-feature">
                                    <CheckCircle size={20} />
                                    <span>AI-Powered Assistance</span>
                                </div>
                                <div className="about-feature">
                                    <CheckCircle size={20} />
                                    <span>Free for All</span>
                                </div>
                            </div>
                        </div>
                        <div className="about-visual">
                            <div className="about-stats-card">
                                <h3>Making Real Impact</h3>
                                <div className="impact-stat">
                                    <div className="impact-number">10,000+</div>
                                    <div className="impact-label">Users Helped</div>
                                </div>
                                <div className="impact-stat">
                                    <div className="impact-number">50+</div>
                                    <div className="impact-label">Schemes Listed</div>
                                </div>
                                <div className="impact-stat">
                                    <div className="impact-number">5+</div>
                                    <div className="impact-label">Languages</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Goals Section */}
            <section id="goals" className="goals-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Our Goals</h2>
                        <p>What we aim to achieve for communities</p>
                    </div>

                    <div className="goals-grid">
                        {goals.map((goal, index) => (
                            <div key={index} className="goal-card">
                                <div className="goal-icon">{goal.icon}</div>
                                <h3>{goal.title}</h3>
                                <p>{goal.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('features')}</h2>
                        <p>Comprehensive tools to empower communities</p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card clickable" onClick={() => setSelectedFeature(feature)}>
                                <div className="feature-icon" style={{ color: feature.color }}>
                                    {feature.icon}
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                                <div className="feature-glow" style={{ background: feature.color }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>





            {/* Team Section */}
            <section id="team" className="team-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Our Team</h2>
                        <p>The dedicated innovators behind Community AI</p>
                    </div>

                    <div className="team-grid">
                        <div className="team-card premium-member-card">
                            <div className="member-avatar-wrapper">
                                <div className="member-avatar">
                                    <span className="avatar-icon">👨‍💻</span>
                                </div>
                            </div>
                            <h3 className="member-name">Ritesh Kumar</h3>
                            <p className="member-role">PROJECT LEAD</p>
                            <p className="member-bio">
                                <span>AI & ML Enthusiast</span>
                                <span>React & SQL Developer</span>
                                <span>Passionate about Full-Stack Innovation</span>
                            </p>
                            <div className="member-social">
                                <a href="https://linkedin.com/in/ritesh-kumar-b3a654253" target="_blank" rel="noopener noreferrer" className="social-btn linkedin">
                                    <Linkedin size={20} />
                                </a>
                                <a href="https://github.com/RiteshKumar2e" target="_blank" rel="noopener noreferrer" className="social-btn github">
                                    <Github size={20} />
                                </a>
                            </div>
                        </div>

                        <div className="team-card premium-member-card">
                            <div className="member-avatar-wrapper">
                                <div className="member-avatar" style={{ background: 'var(--secondary-500)' }}>
                                    <span className="avatar-icon">🧑‍💻</span>
                                </div>
                            </div>
                            <h3 className="member-name">Ankit</h3>
                            <p className="member-role">PROJECT CO-LEAD</p>
                            <p className="member-bio">
                                <span>Full Stack Architect</span>
                                <span>Modern Web Architect</span>
                                <span>Community-Driven Tech Solutions</span>
                            </p>
                            <div className="member-social">
                                <a href="https://www.linkedin.com/in/dev-ankit29/" target="_blank" rel="noopener noreferrer" className="social-btn linkedin">
                                    <Linkedin size={20} />
                                </a>
                                <a href="https://github.com/Ankitkr-ak007/" target="_blank" rel="noopener noreferrer" className="social-btn github">
                                    <Github size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials-section">
                <div className="container">
                    <div className="section-header">
                        <h2>What Users Say</h2>
                        <p>Real stories from real people</p>
                    </div>

                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card">
                                <div className="testimonial-rating">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="var(--secondary-500)" color="var(--secondary-500)" />
                                    ))}
                                </div>
                                <p className="testimonial-text">"{testimonial.text}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{testimonial.name[0]}</div>
                                    <div>
                                        <div className="author-name">{testimonial.name}</div>
                                        <div className="author-role">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Get started in three simple steps</p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h4>Create Account</h4>
                            <p>Sign up with your details and select your preferred language</p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h4>Choose Your Needs</h4>
                            <p>Tell us what you're looking for - schemes, education, or resources</p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h4>Get AI Assistance</h4>
                            <p>Interact with our AI assistant via text or voice in your language</p>
                        </div>
                    </div>
                </div>
            </section>



            {/* Footer */}
            <footer id="contact" className="landing-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-column brand-column">
                            <div className="footer-brand-header">
                                <div className="logo-icon">🌟</div>
                                <span className="logo-text">Community AI</span>
                            </div>
                            <h5 className="connect-title">Connect With Us</h5>
                            <div className="footer-social-links">
                                <a href="https://github.com/RiteshKumar2e" target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                    <Github size={24} />
                                </a>
                                <a href="https://www.linkedin.com/in/ritesh-kumar-b3a654253" target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                    <Linkedin size={24} />
                                </a>
                                <a href="mailto:riteshkumar90359@gmail.com" className="social-icon-link">
                                    <Mail size={24} />
                                </a>
                            </div>
                        </div>

                        <div className="footer-column">
                            <h5>Ecosystem</h5>
                            <button onClick={() => scrollToSection('about')} className="footer-scroll-link">About</button>
                            <button onClick={() => scrollToSection('team')} className="footer-scroll-link">The Team</button>
                            <button onClick={() => scrollToSection('goals')} className="footer-scroll-link">Goals</button>
                        </div>

                        <div className="footer-column">
                            <h5>Legal</h5>
                            <a href="#privacy">Privacy Policy</a>
                            <a href="#terms">Terms</a>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2026 Community AI. Built with ❤️ for communities across India</p>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            <button
                className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <ArrowUp size={24} />
            </button>

            {/* Modals */}
            <AnimatePresence>
                {selectedFeature && (
                    <FeatureModal
                        feature={selectedFeature}
                        onClose={() => setSelectedFeature(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default Landing
