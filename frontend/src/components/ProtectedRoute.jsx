import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Only for personal, signed-in features (dashboard, assistant, profile, forum…).
// Public scheme information (/schemes, /eligibility) must never be wrapped in
// this. Hiding a page here is a UX choice; the API enforces access separately.
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, justLoggedOut } = useAuth()

    if (!isAuthenticated) {
        // After a deliberate logout go to the homepage; otherwise ask to sign in.
        return <Navigate to={justLoggedOut ? '/' : '/login'} replace />
    }

    return children
}

export default ProtectedRoute
