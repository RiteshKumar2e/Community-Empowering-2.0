import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, User, LogOut, Shield, ChevronDown, LayoutDashboard, FileText, MessageSquare } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import '../styles/Navbar.css'

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const profileMenuRef = useRef(null)

    const isActive = (path) => location.pathname === path
    const isAdmin = user?.email === 'riteshkumar90359@gmail.com'

    // Simplified view for Auth pages
    const isAuthPage = ['/login', '/register', '/admin-login'].includes(location.pathname)

    // Handle clicking outside of profile menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (isAuthPage) {
        return (
            <nav className="navbar">
                <div className="container navbar-container">
                    <Link to="/" className="navbar-logo">
                        <div className="logo-icon">🌟</div>
                        <span className="logo-text">Community AI</span>
                    </Link>
                    <div className="navbar-actions">
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        )
    }

    const scrollToSection = (sectionId) => {
        if (location.pathname !== '/') {
            navigate('/')
            setTimeout(() => {
                const element = document.getElementById(sectionId)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                }
            }, 100)
        } else {
            const element = document.getElementById(sectionId)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
        setMobileMenuOpen(false)
    }

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">🌟</div>
                    <span className="logo-text">Community AI</span>
                </Link>

                {/* Desktop Navigation Links */}
                <div className="navbar-links hide-mobile">
                    {isAuthenticated && location.pathname !== '/' ? (
                        <>
                            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                            <Link to="/assistant" className={`nav-link ${isActive('/assistant') ? 'active' : ''}`}>AI Assistant</Link>
                            <Link to="/resources" className={`nav-link ${isActive('/resources') ? 'active' : ''}`}>Resources</Link>
                            <Link to="/learning" className={`nav-link ${isActive('/learning') ? 'active' : ''}`}>Learning</Link>
                            {isAdmin && (
                                <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}>
                                    <Shield size={16} /> Admin
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <button onClick={() => scrollToSection('home')} className="nav-link">Home</button>
                            <button onClick={() => scrollToSection('mission')} className="nav-link">Mission</button>
                            <button onClick={() => scrollToSection('about')} className="nav-link">About</button>
                            <button onClick={() => scrollToSection('goals')} className="nav-link">Goals</button>
                            <button onClick={() => scrollToSection('testimonials')} className="nav-link">Testimonials</button>
                            <button onClick={() => scrollToSection('contact')} className="nav-link">Contact</button>
                        </>
                    )}
                </div>

                {/* Navbar Actions (Theme, Dashboard Btn, Profile) */}
                <div className="navbar-actions">
                    <ThemeToggle />

                    <div className="hide-mobile user-menu-container">
                        {isAuthenticated ? (
                            <>
                                {location.pathname === '/' ? (
                                    <Link to="/dashboard" className="btn btn-primary btn-sm">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="user-profile-dropdown" ref={profileMenuRef}>
                                        <button
                                            className={`profile-trigger ${profileMenuOpen ? 'active' : ''}`}
                                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        >
                                            <div className="user-avatar">
                                                {(user?.name || user?.email)?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <span className="user-display-name">
                                                {user?.name || user?.email?.split('@')[0] || 'User'}
                                            </span>
                                            <ChevronDown size={14} className={`chevron ${profileMenuOpen ? 'open' : ''}`} />
                                        </button>

                                        {profileMenuOpen && (
                                            <div className="profile-menu">
                                                <Link to="/profile" className="menu-item" onClick={() => setProfileMenuOpen(false)}>
                                                    <User size={18} /> My Profile
                                                </Link>
                                                <div className="menu-divider"></div>
                                                <Link to="/dashboard" className="menu-item" onClick={() => setProfileMenuOpen(false)}>
                                                    <LayoutDashboard size={18} /> Dashboard
                                                </Link>
                                                <Link to="/assistant" className="menu-item" onClick={() => setProfileMenuOpen(false)}>
                                                    <MessageSquare size={18} /> AI Assistant
                                                </Link>
                                                <Link to="/resources" className="menu-item" onClick={() => setProfileMenuOpen(false)}>
                                                    <FileText size={18} /> Resources
                                                </Link>
                                                <Link to="/learning" className="menu-item" onClick={() => setProfileMenuOpen(false)}>
                                                    <Shield size={18} /> Learning
                                                </Link>
                                                <div className="menu-divider"></div>
                                                <button onClick={() => { logout(); setProfileMenuOpen(false); }} className="menu-item logout">
                                                    <LogOut size={18} /> Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="auth-nav-buttons">
                                <Link to="/login" className="btn-signin">Sign In</Link>
                                <Link to="/admin-login" className="btn-admin">Admin Login</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle Button */}
                    <button
                        className="mobile-menu-btn hide-desktop"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Full Screen Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu hide-desktop full-screen-menu">
                    <div className="mobile-menu-header">
                        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
                            <div className="logo-icon">🌟</div>
                            <span className="logo-text">Community AI</span>
                        </Link>
                        <div className="mobile-menu-controls">
                            <ThemeToggle />
                            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="mobile-menu-content">
                        {isAuthenticated ? (
                            <>
                                <div className="mobile-user-info">
                                    <div className="user-avatar-large">
                                        {(user?.name || user?.email)?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="user-details-large">
                                        <span className="user-name-large">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
                                        <span className="user-email-large">{user?.email}</span>
                                    </div>
                                </div>
                                <div className="mobile-nav-links">
                                    <Link to="/dashboard" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                        <LayoutDashboard size={18} /> Dashboard
                                    </Link>
                                    <Link to="/assistant" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                        <MessageSquare size={18} /> AI Assistant
                                    </Link>
                                    <Link to="/resources" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                        <FileText size={18} /> Resources
                                    </Link>
                                    <Link to="/learning" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                        <Shield size={18} /> Learning
                                    </Link>
                                    <Link to="/profile" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                        <User size={18} /> My Profile
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                            <Shield size={18} /> Admin Panel
                                        </Link>
                                    )}
                                </div>
                                <div className="menu-divider"></div>
                                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="mobile-link logout-link">
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        ) : (
                            <div className="mobile-nav-links">
                                <button onClick={() => scrollToSection('home')} className="mobile-link">Home</button>
                                <button onClick={() => scrollToSection('mission')} className="mobile-link">Mission</button>
                                <button onClick={() => scrollToSection('about')} className="mobile-link">About</button>
                                <button onClick={() => scrollToSection('goals')} className="mobile-link">Goals</button>
                                <button onClick={() => scrollToSection('testimonials')} className="mobile-link">Testimonials</button>
                                <button onClick={() => scrollToSection('contact')} className="mobile-link">Contact</button>
                                <div className="menu-divider"></div>
                                <Link to="/login" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    <User size={18} /> Sign In
                                </Link>
                                <Link to="/admin-login" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    <Shield size={18} /> Admin Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
