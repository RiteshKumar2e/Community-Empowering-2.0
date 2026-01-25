import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Navbar from './components/Navbar'
import ParticleCursor from './components/ParticleCursor'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AIAssistant from './pages/AIAssistant'
import Resources from './pages/Resources'
import LearningHub from './pages/LearningHub'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import SideChatBot from './components/SideChatBot'
import NotFound from './pages/NotFound'

// Google OAuth Client ID - Replace with your actual client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "951248037202-st6tgbo07tjljditc95n7kuvgqr7a7mg.apps.googleusercontent.com"

function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AuthProvider>
                    <LanguageProvider>
                        <div className="app">
                            <ParticleCursor />
                            <Navbar />
                            <Routes>
                                <Route path="/" element={<Landing />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/admin-login" element={<AdminLogin />} />

                                {/* Protected Routes */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/assistant" element={
                                    <ProtectedRoute>
                                        <AIAssistant />
                                    </ProtectedRoute>
                                } />
                                <Route path="/resources" element={
                                    <ProtectedRoute>
                                        <Resources />
                                    </ProtectedRoute>
                                } />
                                <Route path="/learning" element={
                                    <ProtectedRoute>
                                        <LearningHub />
                                    </ProtectedRoute>
                                } />
                                <Route path="/profile" element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin" element={
                                    <ProtectedRoute>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                            <SideChatBot />
                        </div>
                    </LanguageProvider>
                </AuthProvider>
            </Router>
        </GoogleOAuthProvider>
    )
}

export default App
