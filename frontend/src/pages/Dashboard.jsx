import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { MessageSquare, BookOpen, Search, TrendingUp, Award, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import '../styles/Dashboard.css'

const Dashboard = () => {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [stats, setStats] = useState({
        queriesCount: 0,
        coursesEnrolled: 0,
        resourcesViewed: 0,
        achievementsEarned: 0
    })
    const [recentActivity, setRecentActivity] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activityRes, recommendationsRes] = await Promise.all([
                api.get('/users/stats'),
                api.get('/users/activity'),
                api.get('/ai/recommendations')
            ])

            setStats(statsRes.data)
            setRecentActivity(activityRes.data)
            setRecommendations(recommendationsRes.data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const quickActions = [
        {
            icon: <MessageSquare size={24} />,
            title: 'AI Assistant',
            description: 'Ask questions and get instant help',
            link: '/assistant',
            color: 'var(--primary-500)'
        },
        {
            icon: <Search size={24} />,
            title: 'Find Resources',
            description: 'Discover schemes and opportunities',
            link: '/resources',
            color: 'var(--secondary-500)'
        },
        {
            icon: <BookOpen size={24} />,
            title: 'Learning Hub',
            description: 'Explore courses and content',
            link: '/learning',
            color: 'var(--success-500)'
        }
    ]

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Welcome Section */}
                <div className="dashboard-header">
                    <div>
                        <h1>Welcome back, {user?.name}! 👋</h1>
                        <p>Here's what's happening with your community journey</p>
                    </div>
                    <div className="user-badge">
                        <span className="badge badge-primary">
                            {user?.communityType || 'General'} User
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-section">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-500)' }}>
                            <MessageSquare size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.queriesCount}</div>
                            <div className="stat-label">AI Queries</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-500)' }}>
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.coursesEnrolled}</div>
                            <div className="stat-label">Courses Enrolled</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--secondary-500)' }}>
                            <Search size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.resourcesViewed}</div>
                            <div className="stat-label">Resources Viewed</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                            <Award size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.achievementsEarned}</div>
                            <div className="stat-label">Achievements</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <Link to={action.link} key={index} className="quick-action-card">
                                <div className="action-icon" style={{ color: action.color }}>
                                    {action.icon}
                                </div>
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-content-grid">
                    {/* Recommendations */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>
                                <TrendingUp size={20} />
                                Recommended for You
                            </h2>
                        </div>
                        <div className="recommendations-list">
                            {recommendations.length > 0 ? (
                                recommendations.map((item, index) => (
                                    <div key={index} className="recommendation-card">
                                        <div className="recommendation-icon">{item.icon}</div>
                                        <div className="recommendation-content">
                                            <h4>{item.title}</h4>
                                            <p>{item.description}</p>
                                            <span className="badge badge-primary">{item.category}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <TrendingUp size={48} />
                                    <p>Start exploring to get personalized recommendations</p>
                                    <Link to="/assistant" className="btn btn-primary btn-sm">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>
                                <Users size={20} />
                                Recent Activity
                            </h2>
                        </div>
                        <div className="activity-list">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-dot"></div>
                                        <div className="activity-content">
                                            <p>{activity.description}</p>
                                            <span className="activity-time">{activity.timestamp}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <Users size={48} />
                                    <p>No recent activity yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
