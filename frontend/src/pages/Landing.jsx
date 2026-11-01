import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { ArrowRight, MessageSquare, BookOpen, Search, Mic, Globe, Zap, Target, Heart, Award, CheckCircle, ArrowUp, Github, Linkedin, Mail, UserPlus, SlidersHorizontal, Sparkles } from 'lucide-react'
import ExploreModal from '../components/ExploreModal'
import { SCHEMES } from '../data/schemes'
import LandingHero from '../components/LandingHero'
import CountUp from '../components/CountUp'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from 'framer-motion'
import '../styles/Landing.css'
import '../styles/LandingInteractive.css'
import { trackOnce } from '../utils/analytics'
import BrandMark from '../components/BrandMark'

const Landing = () => {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const { t } = useLanguage()
    const [selectedFeature, setSelectedFeature] = useState(null)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [showExploreModal, setShowExploreModal] = useState(false)
    const [activeStep, setActiveStep] = useState(0)
    const [stepsTouched, setStepsTouched] = useState(false)
    const landingRef = useRef(null)
    const reduceMotion = useReducedMotion()
    const { scrollYProgress } = useScroll()
    const progressScale = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

    // Fade sections in as they scroll into view.
    useEffect(() => {
        trackOnce('landing_page_view')
    }, [])

    useEffect(() => {
        const root = landingRef.current
        if (!root || reduceMotion || !('IntersectionObserver' in window)) return
        const sections = root.querySelectorAll('section:not(.hero)')
        root.classList.add('reveal-ready')
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view')
                    observer.unobserve(entry.target)
                }
            })
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
        sections.forEach((s) => observer.observe(s))
        return () => observer.disconnect()
    }, [reduceMotion])

    // "How it works" walks through its steps on its own until clicked.
    useEffect(() => {
        if (stepsTouched || reduceMotion) return
        const id = setInterval(() => setActiveStep((s) => (s + 1) % 3), 3500)
        return () => clearInterval(id)
    }, [stepsTouched, reduceMotion])

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

    // Only numbers we can back up from the app's own data (no user counts:
    // we don't publish figures we can't verify).
    const stats = [
        { value: `${SCHEMES.length}`, label: 'Detailed scheme guides' },
        { value: '200+', label: 'Government resources listed' },
        { value: '300+', label: 'Free learning platforms' },
        { value: '11', label: 'Languages in AI chat' }
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


    // Example questions (not reviews). Each links to the guide that answers it.
    const exampleQuestions = [
        { who: 'Farmer', text: 'How much money does PM-KISAN give, and how do I check my payment status?', to: '/schemes/pm-kisan' },
        { who: 'Student', text: 'Is there a scholarship for SC students in Class 11 and above if family income is under ₹2.5 lakh?', to: '/schemes/post-matric-scholarship-sc-students' },
        { who: 'Small business', text: 'How do I get a loan without collateral to start a small shop?', to: '/schemes/pm-mudra-yojana' }
    ]

    return (
        <div className="landing" ref={landingRef}>
            <motion.div className="scroll-progress" style={{ scaleX: progressScale }} aria-hidden="true" />

            {/* Hero Section */}
            <LandingHero isAuthenticated={isAuthenticated} />

            {/* Stats strip */}
            <section className="stats-strip" aria-label="Community AI in numbers">
                <div className="container stats-strip-grid">
                    {stats.map((stat) => (
                        <div key={stat.label} className="stats-strip-item">
                            <div className="stats-strip-value"><CountUp value={stat.value} /></div>
                            <div className="stats-strip-label">{stat.label}</div>
                        </div>
                    ))}
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
                                <h3>What's on Community AI</h3>
                                <div className="impact-stat">
                                    <div className="impact-number"><CountUp value={`${SCHEMES.length}`} /></div>
                                    <div className="impact-label">Scheme guides with official links</div>
                                </div>
                                <div className="impact-stat">
                                    <div className="impact-number"><CountUp value="200+" /></div>
                                    <div className="impact-label">Government resources listed</div>
                                </div>
                                <div className="impact-stat">
                                    <div className="impact-number"><CountUp value="11" /></div>
                                    <div className="impact-label">Languages in AI chat</div>
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

                    <div className="section-cta">
                        <button onClick={() => setShowExploreModal(true)} className="btn btn-learn">
                            Explore All Solutions
                            <ArrowRight size={18} />
                        </button>
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
                                <div className="member-avatar has-photo">
                                    <img src="/team/ritesh-kumar.webp" alt="Ritesh Kumar" width="96" height="96" loading="lazy" decoding="async" />
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
                                <a href="https://www.linkedin.com/in/riteshkumar-tech" target="_blank" rel="noopener noreferrer" className="social-btn linkedin" aria-label="Ritesh Kumar on LinkedIn" title="LinkedIn">
                                    <Linkedin size={20} />
                                </a>
                                <a href="https://github.com/RiteshKumar2e" target="_blank" rel="noopener noreferrer" className="social-btn github" aria-label="Ritesh Kumar on GitHub" title="GitHub">
                                    <Github size={20} />
                                </a>
                                <a href="https://riteshkr.info/" target="_blank" rel="noopener noreferrer" className="social-btn portfolio" aria-label="Ritesh Kumar's portfolio website" title="Portfolio">
                                    <Globe size={20} />
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
                        <h2>Questions people bring to Community AI</h2>
                        <p>Examples of what you can ask, with the guide that answers each one</p>
                    </div>

                    <div className="testimonials-grid">
                        {exampleQuestions.map((q) => (
                            <Link key={q.to} to={q.to} className="testimonial-card example-question">
                                <span className="example-who">{q.who}</span>
                                <p className="testimonial-text">“{q.text}”</p>
                                <span className="example-link">Read the answer <ArrowRight size={14} /></span>
                            </Link>
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

                    <div className="steps-track" aria-hidden="true">
                        <motion.div
                            className="steps-track-fill"
                            initial={false}
                            animate={{ width: `${(activeStep / 2) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 90, damping: 20 }}
                        />
                    </div>

                    <div className="steps-grid">
                        {[
                            { icon: <UserPlus size={22} />, title: 'Create Account', text: 'Sign up in about a minute with your name, mobile number and language.', time: '~1 min' },
                            { icon: <SlidersHorizontal size={22} />, title: 'Choose Your Needs', text: "Tell us who you are: student, farmer, worker, business owner or senior citizen.", time: '~20 sec' },
                            { icon: <Sparkles size={22} />, title: 'Get AI Assistance', text: 'Ask anything by text or voice and get answers and schemes picked for you.', time: 'Instant' },
                        ].map((s, i) => (
                            <button
                                key={s.title}
                                type="button"
                                className={`step-card interactive-step ${i === activeStep ? 'active' : ''} ${i < activeStep ? 'done' : ''}`}
                                onClick={() => { setStepsTouched(true); setActiveStep(i) }}
                                aria-pressed={i === activeStep}
                            >
                                <div className="step-number">{i < activeStep ? <CheckCircle size={20} /> : i + 1}</div>
                                <div className="step-icon">{s.icon}</div>
                                <h4>{s.title}</h4>
                                <p>{s.text}</p>
                                <span className="step-time">{s.time}</span>
                            </button>
                        ))}
                    </div>

                    <div className="section-cta">
                        <Link to={isAuthenticated ? '/assistant' : '/register'} className="btn btn-explore">
                            {isAuthenticated ? 'Open the AI Assistant' : 'Start Step 1 Now'}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Final call to action */}
            <section className="final-cta">
                <div className="container">
                    <div className="final-cta-card">
                        <div>
                            <h2>Your benefits are waiting. Don't leave them unclaimed.</h2>
                            <p>Check what you may qualify for in a minute, then save it to a free account. Official links for every scheme.</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn final-cta-btn">
                                {isAuthenticated ? 'Go to My Dashboard' : 'Create Free Account'}
                                <ArrowRight size={20} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>



            {/* Footer */}
            <footer id="contact" className="landing-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-column brand-column">
                            <div className="footer-brand-header">
                                <BrandMark className="logo-icon" />
                                <span className="logo-text">Community AI</span>
                            </div>
                            <h5 className="connect-title">Connect With Us</h5>
                            <div className="footer-social-links">
                                <a href="https://github.com/RiteshKumar2e" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="GitHub">
                                    <Github size={24} />
                                </a>
                                <a href="https://www.linkedin.com/in/riteshkumar-tech" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="LinkedIn">
                                    <Linkedin size={24} />
                                </a>
                                <a href="mailto:riteshkumar90359@gmail.com" className="social-icon-link" aria-label="Email us">
                                    <Mail size={24} />
                                </a>
                            </div>
                        </div>

                        <div className="footer-column">
                            <h5>Schemes</h5>
                            <Link to="/schemes">All Government Schemes</Link>
                            <Link to="/eligibility">Eligibility Checker</Link>
                            <Link to="/schemes/category/students">For Students</Link>
                            <Link to="/schemes/category/farmers">For Farmers</Link>
                            <Link to="/schemes/category/women">For Women</Link>
                        </div>

                        <div className="footer-column">
                            <h5>Ecosystem</h5>
                            <button onClick={() => scrollToSection('about')} className="footer-scroll-link">About</button>
                            <button onClick={() => scrollToSection('team')} className="footer-scroll-link">The Team</button>
                            <button onClick={() => scrollToSection('goals')} className="footer-scroll-link">Goals</button>
                        </div>

                        <div className="footer-column">
                            <h5>Legal</h5>
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms &amp; Conditions</Link>
                            <Link to="/about">About Us</Link>
                            <Link to="/editorial-policy">Editorial Policy</Link>
                            <a href="mailto:riteshkumar90359@gmail.com">riteshkumar90359@gmail.com</a>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p className="footer-disclaimer">
                            Community AI is an independent information platform and is not affiliated with the Government of India
                            or any state government. Always confirm scheme details on the official portal.
                        </p>
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

            {/* Explore Modal */}
            <ExploreModal
                isOpen={showExploreModal}
                onClose={() => setShowExploreModal(false)}
            />
        </div>
    )
}

export default Landing
