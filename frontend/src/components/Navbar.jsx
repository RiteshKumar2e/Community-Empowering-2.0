import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, User, LogOut, Shield, Sun } from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import '../styles/Navbar.css'

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isActive = (path) => location.pathname === path
    const isAdmin = user?.email === 'riteshkumar90359@gmail.com'

    // Simplified view for Auth pages
    const isAuthPage = ['/login', '/register', '/admin-login'].includes(location.pathname)

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
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        } else {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
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

                {/* Desktop Navigation */}
                <div className="navbar-links hide-mobile">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/assistant"
                                className={`nav-link ${isActive('/assistant') ? 'active' : ''}`}
                            >
                                AI Assistant
                            </Link>
                            <Link
                                to="/resources"
                                className={`nav-link ${isActive('/resources') ? 'active' : ''}`}
                            >
                                Resources
                            </Link>
                            <Link
                                to="/learning"
                                className={`nav-link ${isActive('/learning') ? 'active' : ''}`}
                            >
                                Learning
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
                                >
                                    <Shield size={16} />
                                    Admin
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <button onClick={() => scrollToSection('home')} className="nav-link">
                                Home
                            </button>
                            <button onClick={() => scrollToSection('mission')} className="nav-link">
                                Mission
                            </button>
                            <button onClick={() => scrollToSection('about')} className="nav-link">
                                About
                            </button>
                            <button onClick={() => scrollToSection('goals')} className="nav-link">
                                Goals
                            </button>
                            <button onClick={() => scrollToSection('testimonials')} className="nav-link">
                                Testimonials
                            </button>
                            <button onClick={() => scrollToSection('contact')} className="nav-link">
                                Contact
                            </button>
                        </>
                    )}
                </div>

                {/* Right Side Actions */}
                <div className="navbar-actions">
                    <ThemeToggle />
                    <div className="hide-mobile user-menu-container">
                        {isAuthenticated ? (
                            <div className="user-menu">
                                <Link to="/profile" className="btn btn-ghost btn-sm">
                                    <User size={18} />
                                    {user?.name}
                                </Link>
                                <button onClick={logout} className="btn btn-outline btn-sm">
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="btn-signin">
                                    Sign In
                                </Link>
                                <Link to="/admin-login" className="btn-admin">
                                    Admin Login
                                </Link>
                            </>
                        )}
                    </div>
                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn hide-desktop"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu hide-desktop full-screen-menu">
                    <div className="mobile-menu-header">
                        <div className="navbar-logo">
                            <div className="logo-icon">🌟</div>
                            <span className="logo-text">Community AI</span>
                        </div>
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
                                        <User size={32} />
                                    </div>
                                    <span className="user-name-large">{user?.name}</span>
                                </div>
                                <Link to="/dashboard" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                                <Link to="/assistant" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>AI Assistant</Link>
                                <Link to="/resources" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
                                <Link to="/learning" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Learning</Link>
                                <Link to="/profile" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                                {isAdmin && (
                                    <Link to="/admin" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                                )}
                                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="mobile-link logout-link">
                                    <LogOut size={20} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="mobile-auth-actions">
                                    <Link to="/login" className="mobile-auth-btn btn-signin-mobile" onClick={() => setMobileMenuOpen(false)}>
                                        Sign In
                                    </Link>
                                    <Link to="/admin-login" className="mobile-auth-btn btn-admin-mobile" onClick={() => setMobileMenuOpen(false)}>
                                        Admin Login
                                    </Link>
                                </div>

                                <div className="mobile-nav-links">
                                    <button onClick={() => scrollToSection('home')} className="mobile-link">Home</button>
                                    <button onClick={() => scrollToSection('mission')} className="mobile-link">Mission</button>
                                    <button onClick={() => scrollToSection('about')} className="mobile-link">About</button>
                                    <button onClick={() => scrollToSection('goals')} className="mobile-link">Goals</button>
                                    <button onClick={() => scrollToSection('team')} className="mobile-link">Team</button>
                                    <button onClick={() => scrollToSection('testimonials')} className="mobile-link">Testimonials</button>
                                    <button onClick={() => scrollToSection('contact')} className="mobile-link">Contact</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
