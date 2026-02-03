# Community AI Platform - System Design Document

## 1. Executive Summary

### 1.1 Project Overview
The Community AI Platform is a comprehensive digital solution designed to bridge the gap between underserved communities and essential services in India. This design document outlines the technical architecture, system design, and implementation strategy for building an enterprise-grade platform that democratizes access to government services, educational resources, and employment opportunities.

### 1.2 Design Principles
- **Accessibility First**: Designed for users with limited digital literacy
- **Multilingual Support**: Native support for English, Hindi, and regional languages
- **Performance Optimized**: Efficient operation in low-bandwidth environments
- **Scalable Architecture**: Built to handle growth from hundreds to hundreds of thousands of users
- **Security by Design**: Comprehensive security measures at every layer
- **Mobile-First**: Responsive design optimized for mobile devices
- **AI-Powered**: Intelligent assistance with multi-model fallback architecture

### 1.3 Technology Stack Overview
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL/SQLite
- **Frontend**: React 18 + Vite + React Router DOM
- **AI Integration**: Groq API + Google Gemini with 30+ model fallback
- **Authentication**: JWT + Google OAuth + Bcrypt
- **Deployment**: Vercel + Docker support
- **Real-time Features**: WebSocket support for live chat and forum updates

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Presentation Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (Vite Build)                                    │
│  ├── Pages (Landing, Dashboard, AI Assistant, Forum, etc.)      │
│  ├── Components (Navbar, Chat, Forms, Modals)                   │
│  ├── Contexts (Auth, Language, Theme)                           │
│  ├── Services (API Client, Voice Interface)                     │
│  └── Styles (Responsive CSS, Animations, Themes)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                         HTTPS/WebSocket
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Application Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI Backend                                                │
│  ├── API Routes (Auth, Users, AI, Resources, Forum, etc.)       │
│  ├── Services (AI Service, Market Scanner, Search)              │
│  ├── Core (Config, Security, Database, Middleware)              │
│  ├── Models (SQLAlchemy ORM Models)                             │
│  └── Middleware (CORS, Auth, Rate Limiting, Logging)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                         SQLAlchemy ORM
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database (Production) / SQLite (Development)        │
│  ├── Users & Authentication (JWT, OAuth, Profiles)              │
│  ├── Resources (Schemes, Learning Platforms, Jobs)              │
│  ├── Learning (Courses, Enrollments, Progress)                  │
│  ├── AI Interactions (Queries, Responses, Context)              │
│  ├── Forum System (Categories, Discussions, Replies)            │
│  ├── Activity Tracking (User Actions, Analytics)                │
│  └── Feedback & Analytics (Ratings, Comments, Stats)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                      External Integrations
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                              │
├─────────────────────────────────────────────────────────────────┤
│  ├── Groq API (Primary AI - 30+ Models)                        │
│  ├── Google Gemini (Secondary AI Fallback)                      │
│  ├── Google OAuth (Authentication)                              │
│  ├── Web Speech API (Voice Interface)                           │
│  ├── Market Scanner (Automated Data Collection)                 │
│  └── File Storage (Local/Cloud Storage)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture

#### 2.2.1 Frontend Architecture
```
src/
├── components/           # Reusable UI components
│   ├── Navbar.jsx       # Navigation with auth state
│   ├── SideChatBot.jsx  # Floating AI assistant
│   ├── ThemeToggle.jsx  # Dark/light mode toggle
│   ├── ProtectedRoute.jsx # Route protection wrapper
│   ├── ParticleCursor.jsx # Interactive cursor effects
│   ├── ThreeBackground.jsx # 3D background animations
│   └── LiveChat.jsx     # Real-time chat component
├── pages/               # Page-level components
│   ├── Landing.jsx      # Landing page with hero section
│   ├── Dashboard.jsx    # User dashboard with stats
│   ├── AIAssistant.jsx  # AI chat interface
│   ├── Forum.jsx        # Community forum
│   ├── Profile.jsx      # User profile management
│   ├── Resources.jsx    # Government schemes & resources
│   ├── LearningHub.jsx  # Courses and learning platforms
│   ├── AdminDashboard.jsx # Admin panel
│   └── NotFound.jsx     # 404 error page
├── contexts/            # React contexts for state management
│   ├── AuthContext.jsx  # Authentication state & methods
│   └── LanguageContext.jsx # Language preferences
├── services/            # API and external services
│   └── api.js          # Axios-based API client
└── styles/             # Component-specific styles
    ├── Landing.css     # Landing page styles
    ├── Dashboard.css   # Dashboard styles
    ├── AIAssistant.css # AI chat styles
    ├── Forum.css       # Forum styles
    └── Mobile.css      # Mobile-responsive styles
```
#### 2.2.2 Backend Architecture
```
app/
├── api/                 # API route handlers
│   ├── auth.py         # Authentication endpoints (login, register, OAuth)
│   ├── users.py        # User management (profile, stats, uploads)
│   ├── ai.py           # AI chat endpoints (chat, recommendations)
│   ├── resources.py    # Resource management (schemes, jobs)
│   ├── learning.py     # Learning system (courses, enrollments)
│   ├── admin.py        # Admin panel endpoints
│   ├── agent.py        # Agent system for automation
│   ├── feedback.py     # Feedback and rating system
│   ├── tracking.py     # Activity tracking endpoints
│   ├── forum.py        # Forum system (discussions, replies)
│   ├── chat.py         # Live chat functionality
│   └── aws_services.py # Cloud services integration
├── core/               # Core functionality
│   ├── config.py       # Configuration management
│   ├── database.py     # Database connection & session
│   └── security.py     # Security utilities (JWT, hashing)
├── models/             # Database models
│   └── models.py       # SQLAlchemy models for all entities
├── services/           # Business logic services
│   ├── ai_service.py   # AI integration with multi-model support
│   ├── market_scanner.py # Automated data collection
│   └── search_service.py # Search and filtering logic
└── main.py            # FastAPI application entry point
```

### 2.3 Database Architecture

#### 2.3.1 Entity Relationship Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Users       │    │   Enrollments   │    │    Courses      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄──►│ id (PK)         │◄──►│ id (PK)         │
│ name            │1:N │ user_id (FK)    │N:1 │ title           │
│ email (UNIQUE)  │    │ course_id (FK)  │    │ description     │
│ password_hash   │    │ progress        │    │ level           │
│ phone           │    │ completed       │    │ duration        │
│ location        │    │ enrolled_at     │    │ lessons         │
│ language        │    │ completed_at    │    │ thumbnail       │
│ community_type  │    └─────────────────┘    │ created_at      │
│ is_admin        │                           └─────────────────┘
│ profile_image   │
│ google_otp      │    ┌─────────────────┐    ┌─────────────────┐
│ last_login      │    │    Queries      │    │   Resources     │
│ created_at      │    ├─────────────────┤    ├─────────────────┤
│ updated_at      │◄──►│ id (PK)         │    │ id (PK)         │
└─────────────────┘1:N │ user_id (FK)    │    │ title           │
         │              │ message         │    │ description     │
         │              │ response        │    │ category        │
         │ 1:N          │ language        │    │ eligibility     │
         ▼              │ created_at      │    │ provider        │
┌─────────────────┐    └─────────────────┘    │ link            │
│ UserActivities  │                           │ is_new          │
├─────────────────┤    ┌─────────────────┐    │ created_at      │
│ id (PK)         │    │LearningPlatforms│    └─────────────────┘
│ user_id (FK)    │    ├─────────────────┤
│ activity_type   │    │ id (PK)         │    ┌─────────────────┐
│ activity_title  │    │ title           │    │    Feedback     │
│ description     │    │ description     │    ├─────────────────┤
│ extra_data      │    │ category        │    │ id (PK)         │
│ created_at      │    │ provider        │    │ user_id (FK)    │
└─────────────────┘    │ duration        │    │ rating          │
                       │ students        │    │ comment         │
                       │ level           │    │ category        │
                       │ link            │    │ created_at      │
                       │ features        │    └─────────────────┘
                       │ is_official     │
                       │ created_at      │
                       └─────────────────┘
```

#### 2.3.2 Forum System ERD
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ ForumCategories │    │ForumDiscussions │    │  ForumReplies   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄──►│ id (PK)         │◄──►│ id (PK)         │
│ name            │1:N │ title           │1:N │ discussion_id(FK)│
│ description     │    │ content         │    │ user_id (FK)    │
│ icon            │    │ category_id(FK) │    │ content         │
│ color           │    │ user_id (FK)    │    │ likes           │
│ created_at      │    │ tags (JSON)     │    │ views           │
└─────────────────┘    │ views           │    │ is_solution     │
                       │ likes           │    │ created_at      │
                       │ is_featured     │    │ updated_at      │
                       │ is_pinned       │    └─────────────────┘
                       │ status          │
                       │ created_at      │    ┌─────────────────┐
                       │ updated_at      │    │   ChatMessages  │
                       └─────────────────┘    ├─────────────────┤
                                              │ id (PK)         │
┌─────────────────┐    ┌─────────────────┐    │ sender_id (FK)  │
│   ForumLikes    │    │   ForumViews    │    │ receiver_id(FK) │
├─────────────────┤    ├─────────────────┤    │ message         │
│ id (PK)         │    │ id (PK)         │    │ is_private      │
│ discussion_id(FK)│    │ discussion_id(FK)│    │ created_at      │
│ user_id (FK)    │    │ user_id (FK)    │    └─────────────────┘
│ created_at      │    │ created_at      │
└─────────────────┘    └─────────────────┘
```

## 3. API Design

### 3.1 RESTful API Endpoints

#### 3.1.1 Authentication Endpoints
```
POST   /api/auth/register     # User registration with validation
POST   /api/auth/login        # User login with JWT token
POST   /api/auth/refresh      # Token refresh mechanism
POST   /api/auth/logout       # User logout and token invalidation
GET    /api/auth/me          # Get current authenticated user
POST   /api/auth/google      # Google OAuth integration
```

#### 3.1.2 User Management Endpoints
```
GET    /api/users/profile     # Get user profile with statistics
PUT    /api/users/profile     # Update user profile information
POST   /api/users/upload      # Upload profile picture (5MB limit)
GET    /api/users/stats       # Get detailed user statistics
GET    /api/users/activity    # Get user activity history
```

#### 3.1.3 AI Assistant Endpoints
```
POST   /api/ai/chat          # Send chat message to AI assistant
GET    /api/ai/history       # Get user's chat history
POST   /api/ai/voice         # Process voice input
GET    /api/ai/recommendations # Get personalized AI recommendations
POST   /api/ai/feedback      # Provide feedback on AI responses
```

#### 3.1.4 Resources Management Endpoints
```
GET    /api/resources        # Get all resources with filtering
GET    /api/resources/{id}   # Get specific resource details
GET    /api/resources/search # Search resources by query
GET    /api/resources/featured # Get featured resources
GET    /api/resources/categories # Get resource categories
```

#### 3.1.5 Learning Hub Endpoints
```
GET    /api/learning/courses     # Get all available courses
POST   /api/learning/enroll     # Enroll in a course
GET    /api/learning/enrolled   # Get user's enrolled courses
PUT    /api/learning/progress   # Update course progress
GET    /api/learning/platforms  # Get learning platforms
GET    /api/learning/stats      # Get learning statistics
```

#### 3.1.6 Forum System Endpoints
```
GET    /api/forum/categories        # Get forum categories
GET    /api/forum/discussions       # Get discussions with filtering
POST   /api/forum/discussions       # Create new discussion
GET    /api/forum/discussions/{id}  # Get discussion details
POST   /api/forum/discussions/{id}/like # Like/unlike discussion
GET    /api/forum/discussions/{id}/replies # Get discussion replies
POST   /api/forum/discussions/{id}/replies # Post reply
POST   /api/forum/replies/{id}/like # Like/unlike reply
POST   /api/forum/replies/{id}/pin  # Pin/unpin reply as solution
GET    /api/forum/stats            # Get forum statistics
GET    /api/forum/top-contributors # Get top forum contributors
```

#### 3.1.7 Live Chat Endpoints
```
GET    /api/chat/messages     # Get chat messages
POST   /api/chat/messages     # Send chat message
GET    /api/chat/online       # Get online users
```

#### 3.1.8 Admin Panel Endpoints
```
GET    /api/admin/users         # Get all users with pagination
GET    /api/admin/stats         # Get comprehensive system statistics
POST   /api/admin/resources     # Create new resource
PUT    /api/admin/resources/{id} # Update resource
DELETE /api/admin/resources/{id} # Delete resource
POST   /api/admin/courses       # Create new course
PUT    /api/admin/courses/{id}  # Update course
DELETE /api/admin/courses/{id}  # Delete course
GET    /api/admin/analytics     # Get detailed analytics
```

#### 3.1.9 Activity Tracking Endpoints
```
POST   /api/tracking/activity   # Track user activity
GET    /api/tracking/analytics  # Get activity analytics
GET    /api/tracking/insights   # Get user behavior insights
```

#### 3.1.10 Feedback System Endpoints
```
POST   /api/feedback           # Submit user feedback
GET    /api/feedback/stats     # Get feedback statistics
GET    /api/feedback/categories # Get feedback categories
```

### 3.2 Request/Response Formats

#### 3.2.1 Authentication Request/Response
```json
// Registration Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+919876543210",
  "location": "Mumbai, Maharashtra",
  "language": "en",
  "community_type": "student"
}

// Authentication Response
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 604800,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "language": "en",
    "community_type": "student",
    "is_admin": false
  }
}
```

#### 3.2.2 AI Chat Request/Response
```json
// Chat Request
{
  "message": "What government schemes are available for students in Delhi?",
  "language": "en",
  "context": {
    "location": "Delhi",
    "community_type": "student"
  }
}

// Chat Response
{
  "message": "Here are the key government schemes for students in Delhi...",
  "language": "en",
  "recommendations": [
    {
      "icon": "🎓",
      "title": "Delhi Student Scholarship",
      "description": "Financial assistance for meritorious students",
      "category": "Education"
    }
  ],
  "sources": ["PM Scholarship", "Delhi Education Dept"]
}
```

#### 3.2.3 Forum Discussion Request/Response
```json
// Create Discussion Request
{
  "title": "How to apply for PM-KISAN scheme?",
  "content": "I'm a small farmer looking to apply for the PM-KISAN scheme...",
  "category_id": 1,
  "tags": ["agriculture", "government-scheme", "pm-kisan"]
}

// Discussion Response
{
  "id": 123,
  "title": "How to apply for PM-KISAN scheme?",
  "content": "I'm a small farmer looking to apply...",
  "category": {
    "id": 1,
    "name": "Community Support",
    "icon": "🤝",
    "color": "#6366f1"
  },
  "user_name": "John Doe",
  "tags": ["agriculture", "government-scheme", "pm-kisan"],
  "views": 45,
  "likes": 12,
  "reply_count": 8,
  "is_featured": false,
  "is_pinned": false,
  "created_at": "2024-01-23T15:30:00Z",
  "latest_reply": {
    "user_name": "Expert User",
    "content": "You can apply online through the official portal...",
    "created_at": "2024-01-23T16:45:00Z"
  }
}
```

## 4. User Interface Design

### 4.1 Design System

#### 4.1.1 Color Palette
```css
:root {
  /* Primary Colors */
  --primary-blue: #3b82f6;
  --primary-dark: #1e40af;
  --primary-light: #93c5fd;
  
  /* Secondary Colors */
  --secondary-green: #10b981;
  --secondary-orange: #f59e0b;
  --secondary-purple: #8b5cf6;
  --secondary-red: #ef4444;
  
  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Theme Colors */
  --background-light: #ffffff;
  --background-dark: #0f172a;
  --text-light: #1f2937;
  --text-dark: #f1f5f9;
  
  /* Status Colors */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

#### 4.1.2 Typography System
```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### 4.1.3 Spacing System
```css
/* Spacing Scale (based on 4px grid) */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

### 4.2 Component Design Specifications

#### 4.2.1 Navigation Bar Component
```jsx
// Responsive navigation with authentication state
<Navbar className="navbar">
  <div className="navbar-brand">
    <Logo />
    <span className="brand-text">Community AI</span>
  </div>
  
  <nav className="navbar-menu">
    <NavLink to="/dashboard" icon={<BarChart3 />}>Dashboard</NavLink>
    <NavLink to="/assistant" icon={<MessageSquare />}>AI Assistant</NavLink>
    <NavLink to="/resources" icon={<BookOpen />}>Resources</NavLink>
    <NavLink to="/learning" icon={<GraduationCap />}>Learning</NavLink>
    <NavLink to="/forum" icon={<Users />}>Forum</NavLink>
  </nav>
  
  <div className="navbar-actions">
    <LanguageSelector />
    <ThemeToggle />
    <NotificationBell />
    <UserMenu user={user} />
  </div>
</Navbar>
```

#### 4.2.2 AI Chat Interface Component
```jsx
// AI chat interface with voice support and real-time updates
<ChatInterface className="chat-interface">
  <ChatHeader>
    <div className="chat-title">
      <MessageSquare className="chat-icon" />
      <h2>AI Assistant</h2>
    </div>
    <div className="chat-controls">
      <VoiceToggle isActive={voiceMode} onClick={toggleVoice} />
      <LanguageSelector value={language} onChange={setLanguage} />
    </div>
  </ChatHeader>
  
  <MessageHistory className="message-history">
    {messages.map(message => (
      <Message 
        key={message.id} 
        type={message.type}
        content={message.content}
        timestamp={message.timestamp}
        avatar={message.avatar}
      />
    ))}
    <TypingIndicator visible={isTyping} />
  </MessageHistory>
  
  <ChatInput className="chat-input">
    <TextArea 
      placeholder="Ask me anything about government schemes, jobs, or learning..."
      value={inputValue}
      onChange={setInputValue}
      onKeyPress={handleKeyPress}
    />
    <div className="input-actions">
      <VoiceButton 
        isRecording={isRecording}
        onClick={toggleVoiceRecording}
      />
      <SendButton 
        onClick={sendMessage}
        disabled={!inputValue.trim() || isLoading}
      />
    </div>
  </ChatInput>
</ChatInterface>
```

#### 4.2.3 Forum Discussion Card Component
```jsx
// Forum discussion card with engagement metrics
<DiscussionCard className="discussion-card">
  <div className="discussion-header">
    <CategoryBadge 
      category={discussion.category}
      color={discussion.category.color}
    />
    <div className="discussion-meta">
      <UserAvatar user={discussion.author} />
      <div className="author-info">
        <span className="author-name">{discussion.author.name}</span>
        <time className="post-time">{discussion.created_at}</time>
      </div>
    </div>
  </div>
  
  <div className="discussion-content">
    <h3 className="discussion-title">{discussion.title}</h3>
    <p className="discussion-excerpt">{discussion.excerpt}</p>
    
    <div className="discussion-tags">
      {discussion.tags.map(tag => (
        <Tag key={tag} variant="secondary">{tag}</Tag>
      ))}
    </div>
  </div>
  
  {discussion.latest_reply && (
    <div className="latest-reply-preview">
      <MessageCircle className="reply-icon" />
      <span>Latest reply from <strong>{discussion.latest_reply.author}</strong></span>
      <p className="reply-excerpt">{discussion.latest_reply.excerpt}</p>
    </div>
  )}
  
  <div className="discussion-footer">
    <div className="engagement-stats">
      <StatItem icon={<Eye />} count={discussion.views} label="views" />
      <StatItem icon={<MessageCircle />} count={discussion.replies} label="replies" />
      <LikeButton 
        count={discussion.likes}
        isLiked={discussion.is_liked}
        onClick={() => handleLike(discussion.id)}
      />
    </div>
    
    {discussion.is_featured && <FeaturedBadge />}
    {discussion.is_pinned && <PinnedBadge />}
  </div>
</DiscussionCard>
```

### 4.3 Responsive Design Strategy

#### 4.3.1 Breakpoint System
```css
/* Mobile First Approach */
/* Base styles: Mobile (320px+) */

@media (min-width: 480px) { 
  /* Small Mobile */ 
}

@media (min-width: 640px) { 
  /* Large Mobile / Small Tablet */ 
}

@media (min-width: 768px) { 
  /* Tablet */ 
}

@media (min-width: 1024px) { 
  /* Desktop */ 
}

@media (min-width: 1280px) { 
  /* Large Desktop */ 
}

@media (min-width: 1536px) { 
  /* Extra Large Desktop */ 
}
```

#### 4.3.2 Layout Patterns
- **Mobile (< 768px)**: Single column layout, collapsible navigation, bottom tab bar
- **Tablet (768px - 1024px)**: Two column layout, sidebar navigation, optimized touch targets
- **Desktop (> 1024px)**: Multi-column layout, persistent sidebar, hover interactions

#### 4.3.3 Component Adaptations
```css
/* Navigation adaptations */
.navbar {
  /* Mobile: Bottom navigation */
  @media (max-width: 767px) {
    position: fixed;
    bottom: 0;
    flex-direction: row;
    justify-content: space-around;
  }
  
  /* Desktop: Top navigation */
  @media (min-width: 768px) {
    position: sticky;
    top: 0;
    flex-direction: row;
    justify-content: space-between;
  }
}

/* Chat interface adaptations */
.chat-interface {
  /* Mobile: Full screen */
  @media (max-width: 767px) {
    height: 100vh;
    padding-bottom: 60px; /* Account for bottom nav */
  }
  
  /* Desktop: Contained */
  @media (min-width: 768px) {
    max-width: 800px;
    margin: 0 auto;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
}

/* Forum layout adaptations */
.forum-layout {
  /* Mobile: Single column */
  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  /* Desktop: Three column */
  @media (min-width: 1024px) {
    grid-template-columns: 250px 1fr 300px;
    gap: var(--space-6);
  }
}
```
## 5. AI Integration Design

### 5.1 Multi-Model AI Architecture

The platform implements a sophisticated AI system with cascading fallback across multiple providers to ensure 99.9% uptime and optimal performance.

```python
# AI Service Architecture
class AIService:
    def __init__(self):
        # Primary AI Provider - Groq (Ultra-fast inference)
        self.groq_models = [
            "llama-3.3-70b-versatile",      # Latest high-performance model
            "llama-3.1-70b-versatile",      # Proven reliable model
            "llama-3.1-8b-instant",         # Fast lightweight model
            "llama-3.2-1b-preview",         # Ultra-fast preview model
            "llama-3.2-3b-preview",         # Balanced preview model
            "llama-3.2-11b-text-preview",   # Advanced text model
            "llama-3.2-90b-text-preview",   # Flagship text model
            "mixtral-8x7b-32768",           # Long context model
            "gemma2-9b-it",                 # Google's efficient model
            "qwen-2.5-72b-instruct",        # Alibaba's advanced model
            # ... 20+ additional models for complete fallback coverage
        ]
        
        # Secondary AI Provider - Google Gemini (Reliable fallback)
        self.gemini_models = [
            "gemini-2.0-flash-exp",         # Latest experimental model
            "gemini-2.5-pro",               # Professional grade model
            "gemini-2.5-flash",             # Fast response model
            "gemini-1.5-pro-latest",        # Proven stable model
            "gemini-pro",                   # Standard model
            # ... additional Gemini models
        ]
```

### 5.2 AI Conversation Flow

```
User Input → Language Detection → Intent Classification → Context Building → Response Generation → Output Formatting
     │              │                    │                     │                    │                  │
     │              ▼                    ▼                     ▼                    ▼                  ▼
     │         [en/hi/regional]    [query/greeting/help]  [user+history+db]    [groq_api_call]   [formatted_response]
     │              │                    │                     │                    │                  │
     └──────────────┴────────────────────┴─────────────────────┴────────────────────┴──────────────────┘
                                              Feedback Loop for Continuous Learning
```

### 5.3 Multilingual Support Implementation

#### 5.3.1 Language Detection and Processing
```python
async def process_multilingual_input(self, message: str, user_language: str = "en"):
    """Process user input with automatic language detection and response generation"""
    
    # 1. Detect input language if not specified
    detected_language = self.detect_language(message) if not user_language else user_language
    
    # 2. Build context-aware system prompt
    system_prompt = self.get_system_prompt(detected_language)
    
    # 3. Add user context for personalization
    context = self.build_user_context(user_profile, chat_history)
    
    # 4. Generate response with fallback mechanism
    response = await self.generate_response_with_fallback(
        message=message,
        system_prompt=system_prompt,
        context=context,
        target_language=detected_language
    )
    
    return {
        "response": response,
        "language": detected_language,
        "model_used": self.last_successful_model
    }
```

#### 5.3.2 System Prompts for Different Languages
```python
SYSTEM_PROMPTS = {
    "en": """You are the official AI assistant for the 'Community AI' platform.
    
    IDENTITY & PURPOSE:
    - This website is 'Community AI', an AI-powered platform designed to empower community members.
    - Features include: Dashboard (overview), AI Assistant (voice/chat help), Resources (government schemes), 
      Learning Hub (skill courses), Community Forum, and Live Chat.
    - The goal is to provide easy access to government schemes, market insights, and localized resources.
    
    GUIDELINES:
    - Always respond in English.
    - Provide clear information about government schemes, markets, and resources.
    - IMPORTANT: Do NOT use stars (*) or markdown. Use plain text only.
    - For lists, use plain numbers (1., 2.) or simple dashes (-).
    - Be friendly and concise. No special symbols allowed. Clear text for voice reading.
    - Focus on actionable advice and specific resources when possible.
    """,
    
    "hi": """आप 'Community AI' प्लेटफॉर्म के आधिकारिक AI सहायक हैं।
    
    पहचान और उद्देश्य:
    - यह वेबसाइट 'Community AI' है, जो एक AI-आधारित प्लेटफॉर्म है जिसे सामुदायिक सदस्यों को सशक्त बनाने के लिए बनाया गया है।
    - इसमें शामिल हैं: डैशबोर्ड, AI असिस्टेंट, रिसोर्स (सरकारी योजनाएं), लर्निंग हब (कोर्स), 
      कम्युनिटी फोरम, और लाइव चैट।
    - इसका उद्देश्य सरकारी योजनाओं, बाजार की जानकारी और स्थानीय संसाधनों तक आसान पहुंच प्रदान करना है।

    नियम:
    - हमेशा हिंदी में उत्तर दें।
    - सरकारी योजनाओं, बाज़ार और संसाधनों के बारे में स्पष्ट जानकारी दें।
    - महत्वपूर्ण: स्टार (*) या markdown का उपयोग न करें। केवल plain text का उपयोग करें।
    - लिस्ट के लिए सादे नंबरों या डैश (-) का उपयोग करें।
    - मित्रवत रहें और जवाब संक्षिप्त रखें। आवाज़ में पढ़ने के लिए टेक्स्ट बिल्कुल सादा होना चाहिए।
    - जब भी संभव हो, व्यावहारिक सलाह और विशिष्ट संसाधनों पर ध्यान दें।
    """
}
```

### 5.4 Personalized Recommendation Engine

#### 5.4.1 User Profile-Based Recommendations
```python
async def get_personalized_recommendations(self, user_profile: dict) -> List[dict]:
    """Generate personalized recommendations based on user profile and community type"""
    
    community_type = user_profile.get("community_type", "general")
    location = user_profile.get("location", "")
    language = user_profile.get("language", "en")
    
    recommendations = []
    
    # Community-specific recommendations
    if community_type == "farmer":
        recommendations.extend([
            {
                "icon": "🌾",
                "title": "PM-KISAN Scheme" if language == "en" else "पीएम-किसान योजना",
                "description": "Direct income support of ₹6000 per year for farmers" if language == "en" 
                             else "किसानों के लिए प्रति वर्ष ₹6000 की प्रत्यक्ष आय सहायता",
                "category": "Government Scheme",
                "relevance_score": 0.95,
                "action_url": "/resources?category=agriculture"
            },
            {
                "icon": "🚜",
                "title": "e-NAM Market Access" if language == "en" else "ई-नाम बाजार पहुंच",
                "description": "Connect your farm produce to national markets for better pricing" if language == "en"
                             else "बेहतर मूल्य के लिए अपनी कृषि उपज को राष्ट्रीय बाजारों से जोड़ें",
                "category": "Market Access",
                "relevance_score": 0.90,
                "action_url": "/resources?category=market-access"
            }
        ])
    
    elif community_type == "student":
        recommendations.extend([
            {
                "icon": "🎓",
                "title": "Scholarship Programs" if language == "en" else "छात्रवृत्ति कार्यक्रम",
                "description": "Explore various scholarship opportunities for students" if language == "en"
                             else "छात्रों के लिए विभिन्न छात्रवृत्ति अवसरों का अन्वेषण करें",
                "category": "Education",
                "relevance_score": 0.92,
                "action_url": "/resources?category=education"
            },
            {
                "icon": "💼",
                "title": "Skill Development Courses" if language == "en" else "कौशल विकास पाठ्यक्रम",
                "description": "Free courses to enhance your employability" if language == "en"
                             else "आपकी रोजगार क्षमता बढ़ाने के लिए मुफ्त पाठ्यक्रम",
                "category": "Learning",
                "relevance_score": 0.88,
                "action_url": "/learning"
            }
        ])
    
    elif community_type == "business":
        recommendations.extend([
            {
                "icon": "💰",
                "title": "MUDRA Loan Scheme" if language == "en" else "मुद्रा ऋण योजना",
                "description": "Loans up to ₹10 lakhs for small businesses" if language == "en"
                             else "छोटे व्यवसायों के लिए ₹10 लाख तक का ऋण",
                "category": "Government Scheme",
                "relevance_score": 0.94,
                "action_url": "/resources?category=finance"
            }
        ])
    
    # Location-based recommendations
    if location:
        location_specific = await self.get_location_based_recommendations(location, language)
        recommendations.extend(location_specific)
    
    # Sort by relevance score and return top recommendations
    return sorted(recommendations, key=lambda x: x["relevance_score"], reverse=True)[:6]
```

### 5.5 Voice Interface Integration

#### 5.5.1 Speech-to-Text Processing
```javascript
// Voice input handling with Web Speech API
class VoiceInterface {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.synthesis = window.speechSynthesis;
        this.setupRecognition();
    }
    
    setupRecognition() {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.getCurrentLanguage();
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.handleVoiceInput(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.handleVoiceError(event.error);
        };
    }
    
    async handleVoiceInput(transcript) {
        // Send voice input to AI service
        const response = await this.sendToAI({
            message: transcript,
            language: this.getCurrentLanguage(),
            input_type: 'voice'
        });
        
        // Speak the response back to user
        this.speakResponse(response.message);
    }
    
    speakResponse(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getCurrentLanguage();
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        this.synthesis.speak(utterance);
    }
    
    getCurrentLanguage() {
        const languageMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'bn': 'bn-IN',
            'te': 'te-IN',
            'ta': 'ta-IN'
        };
        
        const userLang = localStorage.getItem('user_language') || 'en';
        return languageMap[userLang] || 'en-US';
    }
}
```

## 6. Security Architecture

### 6.1 Authentication and Authorization

#### 6.1.1 JWT Token Implementation
```python
# JWT token configuration and management
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

class SecurityManager:
    def __init__(self):
        self.SECRET_KEY = settings.SECRET_KEY
        self.ALGORITHM = settings.ALGORITHM
        self.ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token with expiration"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "iat": datetime.utcnow()})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        
        return encoded_jwt
    
    def verify_token(self, token: str):
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            email: str = payload.get("sub")
            
            if email is None:
                raise JWTError("Invalid token payload")
            
            return payload
        except JWTError:
            return None
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
```

#### 6.1.2 Google OAuth Integration
```python
# Google OAuth implementation
from google.auth.transport import requests
from google.oauth2 import id_token

class GoogleOAuthHandler:
    def __init__(self):
        self.GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
    
    async def verify_google_token(self, token: str) -> dict:
        """Verify Google OAuth token and extract user info"""
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), self.GOOGLE_CLIENT_ID
            )
            
            # Extract user information
            user_info = {
                "email": idinfo.get("email"),
                "name": idinfo.get("name"),
                "picture": idinfo.get("picture"),
                "email_verified": idinfo.get("email_verified", False)
            }
            
            return user_info
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")
    
    async def create_or_update_user(self, user_info: dict, db: Session) -> User:
        """Create new user or update existing user from Google OAuth"""
        existing_user = db.query(User).filter(User.email == user_info["email"]).first()
        
        if existing_user:
            # Update existing user
            existing_user.name = user_info["name"]
            existing_user.profile_image = user_info["picture"]
            existing_user.google_email_verified = user_info["email_verified"]
            existing_user.last_login = datetime.utcnow()
            db.commit()
            return existing_user
        else:
            # Create new user
            new_user = User(
                name=user_info["name"],
                email=user_info["email"],
                profile_image=user_info["picture"],
                google_email_verified=user_info["email_verified"],
                password_hash="",  # No password for OAuth users
                last_login=datetime.utcnow()
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return new_user
```

### 6.2 Input Validation and Sanitization

#### 6.2.1 Pydantic Models for Request Validation
```python
# Comprehensive input validation using Pydantic
from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
import re

class UserRegistrationRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    phone: Optional[str] = Field(None, regex=r'^\+?[1-9]\d{1,14}$')
    location: Optional[str] = Field(None, max_length=200)
    language: str = Field(default="en", regex=r'^[a-z]{2}$')
    community_type: Optional[str] = Field(None, max_length=50)
    
    @validator('password')
    def validate_password_strength(cls, v):
        """Validate password strength requirements"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        
        return v
    
    @validator('name')
    def validate_name(cls, v):
        """Validate name format"""
        if not re.match(r'^[a-zA-Z\s]+$', v):
            raise ValueError('Name can only contain letters and spaces')
        return v.strip()

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    language: str = Field(default="en", regex=r'^[a-z]{2}$')
    context: Optional[dict] = None
    
    @validator('message')
    def sanitize_message(cls, v):
        """Sanitize chat message input"""
        # Remove potentially harmful characters
        sanitized = re.sub(r'[<>"\']', '', v)
        return sanitized.strip()

class ForumDiscussionRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    content: str = Field(..., min_length=10, max_length=5000)
    category_id: int = Field(..., gt=0)
    tags: Optional[List[str]] = Field(default=[], max_items=10)
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate and sanitize tags"""
        if not v:
            return []
        
        sanitized_tags = []
        for tag in v:
            # Remove special characters and limit length
            clean_tag = re.sub(r'[^a-zA-Z0-9\s-]', '', tag).strip()[:30]
            if clean_tag:
                sanitized_tags.append(clean_tag.lower())
        
        return list(set(sanitized_tags))  # Remove duplicates
```

### 6.3 Rate Limiting and Abuse Prevention

#### 6.3.1 API Rate Limiting Implementation
```python
# Rate limiting middleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Rate limiting decorators for different endpoints
@app.post("/api/auth/login")
@limiter.limit("5/minute")  # 5 login attempts per minute
async def login(request: Request, user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Login logic here
    pass

@app.post("/api/ai/chat")
@limiter.limit("30/minute")  # 30 AI queries per minute
async def chat(request: Request, chat_request: ChatMessageRequest, 
               current_user: User = Depends(get_current_user)):
    # AI chat logic here
    pass

@app.post("/api/forum/discussions")
@limiter.limit("10/hour")  # 10 new discussions per hour
async def create_discussion(request: Request, discussion: ForumDiscussionRequest,
                          current_user: User = Depends(get_current_user)):
    # Forum discussion creation logic here
    pass

@app.post("/api/users/upload")
@limiter.limit("5/hour")  # 5 file uploads per hour
async def upload_file(request: Request, file: UploadFile = File(...),
                     current_user: User = Depends(get_current_user)):
    # File upload logic here
    pass
```

### 6.4 CORS and Security Headers

#### 6.4.1 CORS Configuration
```python
# CORS middleware configuration
from fastapi.middleware.cors import CORSMiddleware

# Configure CORS with environment-specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # ["http://localhost:5173", "https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    
    return response
```

## 7. Database Design

### 7.1 Complete Database Schema

#### 7.1.1 Core User Management Tables
```sql
-- Users table with comprehensive profile information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    community_type VARCHAR(50) DEFAULT 'general',
    profile_image VARCHAR(500),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Google OAuth fields
    google_otp VARCHAR(255),
    google_otp_expiry TIMESTAMP WITH TIME ZONE,
    google_email_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_community_type ON users(community_type);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 7.1.2 Resource Management Tables
```sql
-- Resources table for government schemes and opportunities
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    eligibility TEXT,
    provider VARCHAR(255),
    link VARCHAR(500),
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_is_new ON resources(is_new);
CREATE INDEX idx_resources_created_at ON resources(created_at);

-- Learning platforms table
CREATE TABLE learning_platforms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    provider VARCHAR(255),
    duration VARCHAR(100),
    students VARCHAR(50),
    level VARCHAR(50),
    link VARCHAR(500),
    features TEXT, -- JSON string of features
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_platforms_category ON learning_platforms(category);
CREATE INDEX idx_learning_platforms_level ON learning_platforms(level);
```

#### 7.1.3 Learning Management Tables
```sql
-- Courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) DEFAULT 'beginner',
    duration VARCHAR(100),
    lessons INTEGER DEFAULT 0,
    thumbnail VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_created_at ON courses(created_at);

-- Enrollments table with progress tracking
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN DEFAULT FALSE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Prevent duplicate enrollments
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_completed ON enrollments(completed);
```

#### 7.1.4 AI and Communication Tables
```sql
-- Queries table for AI chat history
CREATE TABLE queries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_queries_user_id ON queries(user_id);
CREATE INDEX idx_queries_language ON queries(language);
CREATE INDEX idx_queries_created_at ON queries(created_at);

-- Chat messages for live chat functionality
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_is_private ON chat_messages(is_private);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

#### 7.1.5 Forum System Tables
```sql
-- Forum categories
CREATE TABLE forum_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Forum discussions
CREATE TABLE forum_discussions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES forum_categories(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tags TEXT, -- JSON array of tags
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active', -- active, closed, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forum_discussions_category_id ON forum_discussions(category_id);
CREATE INDEX idx_forum_discussions_user_id ON forum_discussions(user_id);
CREATE INDEX idx_forum_discussions_status ON forum_discussions(status);
CREATE INDEX idx_forum_discussions_is_featured ON forum_discussions(is_featured);
CREATE INDEX idx_forum_discussions_created_at ON forum_discussions(created_at);

-- Forum replies
CREATE TABLE forum_replies (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES forum_discussions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forum_replies_discussion_id ON forum_replies(discussion_id);
CREATE INDEX idx_forum_replies_user_id ON forum_replies(user_id);
CREATE INDEX idx_forum_replies_is_solution ON forum_replies(is_solution);
CREATE INDEX idx_forum_replies_created_at ON forum_replies(created_at);

-- Forum engagement tracking tables
CREATE TABLE forum_likes (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES forum_discussions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(discussion_id, user_id)
);

CREATE TABLE forum_views (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES forum_discussions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(discussion_id, user_id)
);

CREATE TABLE forum_reply_likes (
    id SERIAL PRIMARY KEY,
    reply_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reply_id, user_id)
);
```

#### 7.1.6 Analytics and Feedback Tables
```sql
-- User activity tracking
CREATE TABLE user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'course_enroll', 'resource_view', 'ai_query', 'platform_visit'
    activity_title VARCHAR(255),
    activity_description TEXT,
    extra_data TEXT, -- JSON string for additional data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- Feedback system
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_category ON feedback(category);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
```

### 7.2 Database Optimization Strategies

#### 7.2.1 Indexing Strategy
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_enrollments_user_completed ON enrollments(user_id, completed);
CREATE INDEX idx_queries_user_language_date ON queries(user_id, language, created_at DESC);
CREATE INDEX idx_forum_discussions_category_status ON forum_discussions(category_id, status);
CREATE INDEX idx_user_activities_user_type_date ON user_activities(user_id, activity_type, created_at DESC);

-- Full-text search indexes
CREATE INDEX idx_resources_title_description ON resources USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_forum_discussions_search ON forum_discussions USING gin(to_tsvector('english', title || ' ' || content));
```

#### 7.2.2 Database Performance Configuration
```python
# SQLAlchemy configuration for optimal performance
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Database engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,          # Number of connections to maintain
    max_overflow=30,       # Additional connections when pool is full
    pool_pre_ping=True,    # Validate connections before use
    pool_recycle=3600,     # Recycle connections every hour
    echo=False,            # Set to True for SQL debugging
    future=True            # Use SQLAlchemy 2.0 style
)

# Session configuration
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False  # Keep objects accessible after commit
)
```
## 8. Performance Optimization

### 8.1 Backend Performance Strategies

#### 8.1.1 Async Operations and Concurrency
```python
# Async database operations for high concurrency
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from concurrent.futures import ThreadPoolExecutor

class PerformanceOptimizedService:
    def __init__(self):
        self.thread_pool = ThreadPoolExecutor(max_workers=10)
    
    async def get_user_dashboard_data(self, user_id: int, db: AsyncSession):
        """Fetch dashboard data with parallel queries"""
        
        # Execute multiple queries concurrently
        tasks = [
            self.get_user_stats(user_id, db),
            self.get_enrolled_courses(user_id, db),
            self.get_recent_queries(user_id, db),
            self.get_recommendations(user_id, db),
            self.get_forum_activity(user_id, db)
        ]
        
        # Wait for all queries to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            "stats": results[0],
            "courses": results[1],
            "queries": results[2],
            "recommendations": results[3],
            "forum_activity": results[4]
        }
    
    async def process_ai_request_async(self, message: str, user_context: dict):
        """Process AI request with non-blocking I/O"""
        loop = asyncio.get_event_loop()
        
        # Run AI processing in thread pool to avoid blocking
        response = await loop.run_in_executor(
            self.thread_pool,
            self.ai_service.get_chat_response,
            message,
            user_context.get("language", "en"),
            user_context
        )
        
        return response
```

#### 8.1.2 Database Query Optimization
```python
# Optimized database queries with eager loading
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select, func

class OptimizedQueries:
    
    async def get_forum_discussions_optimized(self, db: AsyncSession, category_id: int = None):
        """Optimized forum discussions query with eager loading"""
        
        query = select(ForumDiscussion).options(
            joinedload(ForumDiscussion.category),
            joinedload(ForumDiscussion.user),
            selectinload(ForumDiscussion.replies).options(
                joinedload(ForumReply.user)
            )
        )
        
        if category_id:
            query = query.where(ForumDiscussion.category_id == category_id)
        
        # Add subquery for reply count to avoid N+1 queries
        reply_count_subquery = (
            select(func.count(ForumReply.id))
            .where(ForumReply.discussion_id == ForumDiscussion.id)
            .scalar_subquery()
        )
        
        query = query.add_columns(reply_count_subquery.label('reply_count'))
        
        result = await db.execute(query)
        return result.unique().scalars().all()
    
    async def get_user_learning_progress(self, user_id: int, db: AsyncSession):
        """Optimized query for user learning progress"""
        
        query = (
            select(Enrollment, Course)
            .join(Course, Enrollment.course_id == Course.id)
            .where(Enrollment.user_id == user_id)
            .options(joinedload(Enrollment.course))
        )
        
        result = await db.execute(query)
        return result.unique().scalars().all()
```

#### 8.1.3 Caching Implementation
```python
# Redis caching for frequently accessed data
import redis
import json
from functools import wraps
from typing import Optional, Any

class CacheManager:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )
    
    def cache_result(self, key_prefix: str, ttl: int = 3600):
        """Decorator for caching function results"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = f"{key_prefix}:{hash(str(args) + str(kwargs))}"
                
                # Try to get from cache
                cached_result = self.redis_client.get(cache_key)
                if cached_result:
                    return json.loads(cached_result)
                
                # Execute function and cache result
                result = await func(*args, **kwargs)
                self.redis_client.setex(
                    cache_key, 
                    ttl, 
                    json.dumps(result, default=str)
                )
                
                return result
            return wrapper
        return decorator
    
    @cache_result("popular_resources", ttl=1800)  # Cache for 30 minutes
    async def get_popular_resources(self, db: AsyncSession):
        """Get popular resources with caching"""
        query = select(Resource).where(Resource.is_new == True).limit(10)
        result = await db.execute(query)
        return [resource.dict() for resource in result.scalars().all()]
    
    @cache_result("forum_stats", ttl=600)  # Cache for 10 minutes
    async def get_forum_statistics(self, db: AsyncSession):
        """Get forum statistics with caching"""
        stats = {
            "total_discussions": await db.scalar(select(func.count(ForumDiscussion.id))),
            "total_replies": await db.scalar(select(func.count(ForumReply.id))),
            "total_views": await db.scalar(select(func.sum(ForumDiscussion.views))),
            "active_discussions": await db.scalar(
                select(func.count(ForumDiscussion.id))
                .where(ForumDiscussion.status == "active")
            )
        }
        return stats
```

### 8.2 Frontend Performance Optimization

#### 8.2.1 Code Splitting and Lazy Loading
```javascript
// React lazy loading for optimal bundle splitting
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Forum = lazy(() => import('./pages/Forum'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const LearningHub = lazy(() => import('./pages/LearningHub'));

// Component with suspense boundary
function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/learning" element={<LearningHub />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

// Vite configuration for optimal bundling
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          
          // Feature chunks
          'forum': ['./src/pages/Forum.jsx', './src/components/LiveChat.jsx'],
          'ai': ['./src/pages/AIAssistant.jsx', './src/services/ai_service.js'],
          'admin': ['./src/pages/AdminDashboard.jsx']
        }
      }
    },
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}
```

#### 8.2.2 API Request Optimization
```javascript
// Optimized API client with request deduplication and caching
import axios from 'axios';

class OptimizedAPIClient {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
    });
    
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // Request interceptor for auth and deduplication
    this.client.interceptors.request.use((config) => {
      // Add auth token
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Request deduplication
      const requestKey = this.getRequestKey(config);
      if (this.pendingRequests.has(requestKey)) {
        // Return existing promise for duplicate request
        return this.pendingRequests.get(requestKey);
      }
      
      return config;
    });
    
    // Response interceptor for caching
    this.client.interceptors.response.use(
      (response) => {
        const requestKey = this.getRequestKey(response.config);
        this.pendingRequests.delete(requestKey);
        
        // Cache GET requests
        if (response.config.method === 'get') {
          this.cache.set(requestKey, {
            data: response.data,
            timestamp: Date.now()
          });
        }
        
        return response;
      },
      (error) => {
        const requestKey = this.getRequestKey(error.config);
        this.pendingRequests.delete(requestKey);
        return Promise.reject(error);
      }
    );
  }
  
  async get(url, config = {}) {
    const requestKey = this.getRequestKey({ url, method: 'get', ...config });
    
    // Check cache first
    const cached = this.cache.get(requestKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return { data: cached.data };
    }
    
    return this.client.get(url, config);
  }
  
  // Batch API requests
  async batchRequests(requests) {
    const promises = requests.map(req => 
      this.client.request(req).catch(error => ({ error, request: req }))
    );
    
    return Promise.all(promises);
  }
  
  getRequestKey(config) {
    return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
  }
}

export const api = new OptimizedAPIClient();
```

#### 8.2.3 Virtual Scrolling for Large Lists
```javascript
// Virtual scrolling component for forum discussions
import { FixedSizeList as List } from 'react-window';
import { useMemo, useState, useEffect } from 'react';

const VirtualizedDiscussionList = ({ discussions, onDiscussionClick }) => {
  const [containerHeight, setContainerHeight] = useState(600);
  
  useEffect(() => {
    const updateHeight = () => {
      const availableHeight = window.innerHeight - 200; // Account for header/footer
      setContainerHeight(Math.min(availableHeight, 800));
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  const DiscussionItem = ({ index, style }) => {
    const discussion = discussions[index];
    
    return (
      <div style={style} className="discussion-item-wrapper">
        <DiscussionCard 
          discussion={discussion}
          onClick={() => onDiscussionClick(discussion)}
        />
      </div>
    );
  };
  
  return (
    <List
      height={containerHeight}
      itemCount={discussions.length}
      itemSize={200} // Height of each discussion card
      overscanCount={5} // Render 5 extra items for smooth scrolling
    >
      {DiscussionItem}
    </List>
  );
};

// Infinite scrolling hook
const useInfiniteScroll = (fetchMore, hasMore) => {
  const [isFetching, setIsFetching] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== 
          document.documentElement.offsetHeight || isFetching) return;
      
      if (hasMore) {
        setIsFetching(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);
  
  useEffect(() => {
    if (!isFetching) return;
    
    fetchMore().then(() => {
      setIsFetching(false);
    });
  }, [isFetching, fetchMore]);
  
  return [isFetching, setIsFetching];
};
```

### 8.3 Real-time Performance Monitoring

#### 8.3.1 Performance Metrics Collection
```python
# Performance monitoring middleware
import time
from fastapi import Request
from prometheus_client import Counter, Histogram, generate_latest

# Metrics collectors
REQUEST_COUNT = Counter(
    'http_requests_total', 
    'Total HTTP requests', 
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds', 
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

DATABASE_QUERY_DURATION = Histogram(
    'database_query_duration_seconds',
    'Database query duration in seconds',
    ['query_type']
)

AI_REQUEST_DURATION = Histogram(
    'ai_request_duration_seconds',
    'AI request duration in seconds',
    ['model', 'language']
)

@app.middleware("http")
async def performance_monitoring_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    # Record metrics
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    REQUEST_DURATION.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    # Add performance headers
    response.headers["X-Response-Time"] = f"{duration:.3f}s"
    
    return response

@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type="text/plain")
```

#### 8.3.2 Health Check System
```python
# Comprehensive health check system
from datetime import datetime
import psutil
import asyncio

class HealthChecker:
    def __init__(self):
        self.checks = {
            "database": self.check_database,
            "ai_service": self.check_ai_service,
            "redis": self.check_redis,
            "disk_space": self.check_disk_space,
            "memory": self.check_memory
        }
    
    async def check_database(self):
        """Check database connectivity and performance"""
        try:
            start_time = time.time()
            async with get_db() as db:
                await db.execute(text("SELECT 1"))
            
            response_time = time.time() - start_time
            
            return {
                "status": "healthy" if response_time < 1.0 else "degraded",
                "response_time": f"{response_time:.3f}s",
                "details": "Database connection successful"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "details": "Database connection failed"
            }
    
    async def check_ai_service(self):
        """Check AI service availability"""
        try:
            start_time = time.time()
            response = await self.ai_service.get_chat_response(
                "Health check", "en", {}
            )
            response_time = time.time() - start_time
            
            return {
                "status": "healthy" if response_time < 5.0 else "degraded",
                "response_time": f"{response_time:.3f}s",
                "model": self.ai_service.last_successful_model,
                "details": "AI service responding"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "details": "AI service unavailable"
            }
    
    async def check_system_resources(self):
        """Check system resource usage"""
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        cpu = psutil.cpu_percent(interval=1)
        
        return {
            "memory": {
                "used_percent": memory.percent,
                "available_gb": round(memory.available / (1024**3), 2),
                "status": "healthy" if memory.percent < 80 else "warning"
            },
            "disk": {
                "used_percent": disk.percent,
                "free_gb": round(disk.free / (1024**3), 2),
                "status": "healthy" if disk.percent < 85 else "warning"
            },
            "cpu": {
                "usage_percent": cpu,
                "status": "healthy" if cpu < 80 else "warning"
            }
        }
    
    async def get_comprehensive_health(self):
        """Get comprehensive health status"""
        health_results = {}
        overall_status = "healthy"
        
        # Run all health checks concurrently
        tasks = {name: check() for name, check in self.checks.items()}
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)
        
        for (name, _), result in zip(tasks.items(), results):
            if isinstance(result, Exception):
                health_results[name] = {
                    "status": "unhealthy",
                    "error": str(result)
                }
                overall_status = "unhealthy"
            else:
                health_results[name] = result
                if result.get("status") in ["unhealthy", "degraded"]:
                    overall_status = "degraded" if overall_status == "healthy" else "unhealthy"
        
        # Add system resources
        health_results["system"] = await self.check_system_resources()
        
        return {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "checks": health_results
        }

health_checker = HealthChecker()

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return await health_checker.get_comprehensive_health()

@app.get("/health/simple")
async def simple_health_check():
    """Simple health check for load balancers"""
    try:
        # Quick database check
        async with get_db() as db:
            await db.execute(text("SELECT 1"))
        return {"status": "healthy"}
    except:
        return {"status": "unhealthy"}, 503
```

## 9. Deployment Architecture

### 9.1 Production Deployment Strategy

#### 9.1.1 Vercel Deployment Configuration
```json
{
  "version": 2,
  "name": "community-ai-platform",
  "builds": [
    {
      "src": "backend/main.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "50mb",
        "runtime": "python3.9"
      }
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist",
        "buildCommand": "npm run build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/main.py"
    },
    {
      "src": "/health",
      "dest": "backend/main.py"
    },
    {
      "src": "/metrics",
      "dest": "backend/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.9"
  },
  "functions": {
    "backend/main.py": {
      "maxDuration": 30
    }
  }
}
```

#### 9.1.2 Environment Configuration
```bash
# Production Environment Variables
# Security
SECRET_KEY=your-super-secret-key-min-32-characters-long-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI Services
GROQ_API_KEY=your-production-groq-api-key
GOOGLE_API_KEY=your-production-google-gemini-key

# Database
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# CORS Configuration
ALLOWED_ORIGINS=["https://communityai.co.in","https://www.communityai.co.in"]

# Redis (if using caching)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_DB=0

# File Upload
MAX_UPLOAD_SIZE=5242880
UPLOAD_DIR=./uploads

# Monitoring
SENTRY_DSN=your-sentry-dsn-for-error-tracking
LOG_LEVEL=INFO

# Performance
ENABLE_GZIP=true
ENABLE_CORS=true
```

#### 9.1.3 Docker Configuration
```dockerfile
# Multi-stage Dockerfile for production
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

FROM python:3.9-slim AS backend-builder

WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.9-slim AS production

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python dependencies
COPY --from=backend-builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy application code
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create uploads directory
RUN mkdir -p uploads/profiles

# Set environment variables
ENV PYTHONPATH=/app/backend
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### 9.1.4 Docker Compose for Development
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/community_ai
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: community_ai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 9.2 CI/CD Pipeline

#### 9.2.1 GitHub Actions Workflow
```yaml
name: Deploy Community AI Platform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install backend dependencies
      run: |
        cd backend
        pip install -r requirements.txt
        pip install pytest pytest-asyncio pytest-cov
    
    - name: Run backend tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        SECRET_KEY: test-secret-key-for-ci-cd-pipeline
      run: |
        cd backend
        pytest --cov=app --cov-report=xml
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Build frontend
      run: |
        cd frontend
        npm run build
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage.xml

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

### 9.3 Monitoring and Logging

#### 9.3.1 Application Logging Configuration
```python
# Comprehensive logging setup
import logging
import sys
from datetime import datetime
import json

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, 'user_id'):
            log_entry["user_id"] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry["request_id"] = record.request_id
        
        return json.dumps(log_entry)

# Configure logging
def setup_logging():
    """Setup application logging"""
    
    # Create logger
    logger = logging.getLogger("community_ai")
    logger.setLevel(logging.INFO)
    
    # Create handlers
    console_handler = logging.StreamHandler(sys.stdout)
    file_handler = logging.FileHandler("app.log")
    
    # Create formatters
    json_formatter = JSONFormatter()
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Set formatters
    console_handler.setFormatter(console_formatter)
    file_handler.setFormatter(json_formatter)
    
    # Add handlers to logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger

# Request logging middleware
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Log request
    logger.info(
        f"Request started: {request.method} {request.url}",
        extra={
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "user_agent": request.headers.get("user-agent")
        }
    )
    
    # Process request
    response = await call_next(request)
    
    # Log response
    duration = time.time() - start_time
    logger.info(
        f"Request completed: {response.status_code} in {duration:.3f}s",
        extra={
            "request_id": request_id,
            "status_code": response.status_code,
            "duration": duration
        }
    )
    
    response.headers["X-Request-ID"] = request_id
    return response
```

This comprehensive design document provides a complete blueprint for the Community AI Platform, covering all aspects from system architecture to deployment strategies. The design emphasizes scalability, performance, security, and user experience while maintaining the platform's core mission of empowering underserved communities through intelligent technology.