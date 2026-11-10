import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, User, LogOut, Shield, ChevronDown, LayoutDashboard, FileText, MessageSquare, Star } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import FontSizeControl from './FontSizeControl'
import LanguageToggle from './LanguageToggle'
import '../styles/Navbar.css'
import { warmUpGoogleSignIn } from '../utils/googleSignIn'
import BrandMark from './BrandMark'
import { useText } from '../i18n/appText'

const Navbar = () => {
    const t = useText()
    const { isAuthenticated, user, logout } = useAuth()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const profileMenuRef = useRef(null)

    // Close the menus on any route change, including the browser Back button.
    useEffect(() => {
        setMobileMenuOpen(false)
        setProfileMenuOpen(false)
    }, [location.pathname])

    const isActive = (path) => location.pathname === path
    const isAdmin = user?.email === 'riteshkumar90359@gmail.com'

    // Simplified view for Auth pages
    const isAuthPage = ['/login', '/register', '/forgot-password', '/admin-login'].includes(location.pathname)

    // Handle clicking outside of profile menu and language menu to close them
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
                        <BrandMark className="logo-icon" />
                        <span className="logo-text">Community AI</span>
                    </Link>
                    <div className="navbar-actions">
                        <LanguageToggle />
                        <FontSizeControl className="hide-xs" />
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    <BrandMark className="logo-icon" />
                    <span className="logo-text">Community AI</span>
                </Link>

                {/* Desktop Navigation Links */}
                <div className="navbar-links hide-mobile">
                    {isAuthenticated && location.pathname !== '/' ? (
                        <>
                            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>{t('nav_dashboard')}</Link>
                            <Link to="/schemes" className={`nav-link ${location.pathname.startsWith('/schemes') ? 'active' : ''}`}>{t('nav_schemes')}</Link>
                            <Link to="/assistant" className={`nav-link ${isActive('/assistant') ? 'active' : ''}`}>{t('nav_assistant')}</Link>
                            <Link to="/resources" className={`nav-link ${isActive('/resources') ? 'active' : ''}`}>{t('nav_resources')}</Link>
                            <Link to="/learning" className={`nav-link ${isActive('/learning') ? 'active' : ''}`}>{t('nav_learning')}</Link>
                            <Link to="/forum" className={`nav-link ${isActive('/forum') ? 'active' : ''}`}>{t('nav_forum')}</Link>
                            {isAdmin && (
                                <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}>
                                    <Shield size={16} /> Admin
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>{t('nav_home')}</Link>
                            <Link to="/schemes" className={`nav-link ${location.pathname.startsWith('/schemes') ? 'active' : ''}`}>{t('nav_schemes')}</Link>
                            <Link to="/eligibility" className={`nav-link ${isActive('/eligibility') ? 'active' : ''}`}>{t('nav_eligibility')}</Link>
                            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>{t('nav_about')}</Link>
                            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>{t('nav_contact')}</Link>
                        </>
                    )}
                </div>

                <div className="navbar-actions">
                    <LanguageToggle className="hide-mobile" />
                    <FontSizeControl className="hide-mobile" />
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
                                                <Link to="/feedback" className="menu-item" onClick={() => setProfileMenuOpen(false)}>
                                                    <Star size={18} /> Feedback
                                                </Link>
                                                <Link to="/forum" className="menu-item" onClick={() => setProfileMenuOpen(false)}>
                                                    <MessageSquare size={18} /> Forum
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
                                <Link to="/login" className="btn-signin" onMouseEnter={warmUpGoogleSignIn} onFocus={warmUpGoogleSignIn} onTouchStart={warmUpGoogleSignIn}>Sign In</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle Button */}
                    <button
                        className="mobile-menu-btn hide-desktop"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? t('nav_close_menu') : t('nav_open_menu')}
                        aria-expanded={mobileMenuOpen}
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
                            <BrandMark className="logo-icon" />
                            <span className="logo-text">Community AI</span>
                        </Link>
                        <div className="mobile-menu-controls">
                            <ThemeToggle />
                            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(false)} aria-label={t('nav_close_menu')}>
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="mobile-menu-content">
                        {/* Display settings get their own row: they don't fit in the header on phones. */}
                        <div className="mobile-display-settings">
                            <div className="mobile-setting">
                                <span>Language</span>
                                <LanguageToggle />
                            </div>
                            <div className="mobile-setting">
                                <span>Text size</span>
                                <FontSizeControl />
                            </div>
                        </div>
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
                                    <Link to="/schemes" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                        <FileText size={18} /> Government Schemes
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
                                    <Link to="/feedback" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                        <Star size={18} /> Feedback
                                    </Link>
                                    <Link to="/forum" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                        <MessageSquare size={18} /> Forum
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
                                <div className="mobile-auth-actions">
                                    <Link to="/login" className="btn-signin mobile-auth-btn" onTouchStart={warmUpGoogleSignIn} onClick={() => setMobileMenuOpen(false)}>
                                        <User size={18} /> Sign In
                                    </Link>
                                </div>
                                <div className="menu-divider"></div>
                                <Link to="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>{t('nav_home')}</Link>
                                <Link to="/schemes" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>{t('nav_schemes')}</Link>
                                <Link to="/eligibility" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>{t('nav_eligibility')}</Link>
                                <Link to="/about" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>{t('nav_about')}</Link>
                                <Link to="/contact" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>{t('nav_contact')}</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
