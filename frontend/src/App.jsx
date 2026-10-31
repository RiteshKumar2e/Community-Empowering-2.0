import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import ProtectedRoute from './components/ProtectedRoute'
import SideChatBot from './components/SideChatBot'
import PageMeta from './components/PageMeta'
import './styles/AppPages.css'

// Every page except the landing page is loaded on demand, so first-time
// visitors only download the code for the page they open.
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AIAssistant = lazy(() => import('./pages/AIAssistant'))
const Resources = lazy(() => import('./pages/Resources'))
const LearningHub = lazy(() => import('./pages/LearningHub'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Feedback = lazy(() => import('./pages/Feedback'))
const Forum = lazy(() => import('./pages/Forum'))
const NotFound = lazy(() => import('./pages/NotFound'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Terms = lazy(() => import('./pages/Terms'))
const Schemes = lazy(() => import('./pages/Schemes'))
const SchemeDetail = lazy(() => import('./pages/SchemeDetail'))
const EligibilityChecker = lazy(() => import('./pages/EligibilityChecker'))
const EditorialPolicy = lazy(() => import('./pages/EditorialPolicy'))
const About = lazy(() => import('./pages/About'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const CookieConsent = lazy(() => import('./components/CookieConsent'))



const ChatBotCondition = () => {
    const location = useLocation();
    // Hide floating chatbot on assistant page and forum page (due to live chat)
    // and on login/register, where it would sit on top of the form's main button.
    if (['/assistant', '/forum', '/login', '/register', '/forgot-password'].includes(location.pathname)) return null;
    return <SideChatBot />;
};

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <LanguageProvider>
                    <div className="app">
                        <PageMeta />
                        <Navbar />
                        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/admin-login" element={<AdminLogin />} />
                            <Route path="/privacy" element={<PrivacyPolicy />} />
                            <Route path="/terms" element={<Terms />} />

                            {/* Public scheme information: no login required, indexable */}
                            <Route path="/schemes" element={<Schemes />} />
                            <Route path="/schemes/category/:category" element={<Schemes />} />
                            <Route path="/schemes/:slug" element={<SchemeDetail />} />
                            <Route path="/eligibility" element={<EligibilityChecker />} />
                            <Route path="/editorial-policy" element={<EditorialPolicy />} />
                            <Route path="/about" element={<About />} />

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
                            <Route path="/feedback" element={
                                <ProtectedRoute>
                                    <Feedback />
                                </ProtectedRoute>
                            } />
                            <Route path="/forum" element={
                                <ProtectedRoute>
                                    <Forum />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin" element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                        </Suspense>
                        <ChatBotCondition />
                        <Suspense fallback={null}>
                            <CookieConsent />
                        </Suspense>
                    </div>
                </LanguageProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
