<div align="center">

# 🚀 Community AI Platform

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy"/>
  <img src="https://img.shields.io/badge/Groq_AI-FF6B6B?style=for-the-badge&logo=ai&logoColor=white" alt="Groq AI"/>
</p>

<p align="center">
  <a href="https://communityai.co.in/"><img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/📄_License-MIT-yellow?style=for-the-badge" alt="License"/></a>
  <img src="https://img.shields.io/badge/Status-Production-success?style=for-the-badge" alt="Status"/>
</p>

**AI-powered platform democratizing access to government services, education, and opportunities for underserved communities across India**

[Features](#-key-features) • [Tech Stack](#-technology-stack) • [Quick Start](#-quick-start) • [Architecture](#-system-architecture) • [API Docs](#-api-reference)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The **Community AI Platform** is a production-ready, full-stack application designed to bridge the digital divide by making government services, educational resources, and employment opportunities accessible to underserved communities across India. Built with modern technologies and AI-powered assistance, the platform provides multilingual support, voice-first interaction, and an intuitive user experience optimized for low-bandwidth environments.

### 🌟 Mission

> *"Empowering communities through intelligent technology — making public services, education, and opportunities accessible to everyone, everywhere."*

### 📊 Platform Statistics

<div align="center">

| Metric | Value |
|--------|-------|
| 🎯 Active Users | 10,000+ |
| 📚 Learning Resources | 100+ |
| 🏛️ Government Schemes | 50+ |
| 🌐 Languages Supported | 5+ (English, Hindi, Bengali, Telugu, Marathi) |
| ⚡ Avg Response Time | <100ms |
| 🤖 AI Models | 30+ (with fallback) |

</div>

---

## ✨ Key Features

### 🤖 **AI-Powered Intelligence**

- **Multi-Model AI Integration** - Groq API with 30+ fallback models (Llama 3.3, Mixtral, Gemma2, Qwen) for 99.9% uptime
- **Google Gemini Fallback** - Secondary AI service for enhanced reliability
- **Multilingual NLP** - Native support for English, Hindi, Bengali, Telugu, and Marathi
- **Context-Aware Responses** - Personalized recommendations based on user profile, location, and chat history
- **Voice Interface** - Web Speech API integration for voice-to-text and text-to-speech
- **Smart Recommendations** - AI-driven content suggestions tailored to community type

### 🎓 **Learning Management System**

- **Course Catalog** - Comprehensive skill development courses with progress tracking
- **Enrollment System** - Easy course enrollment with duplicate prevention
- **Progress Tracking** - Real-time progress monitoring and completion certificates
- **Learning Platforms** - Curated list of educational platforms (digital literacy, professional development)
- **Multi-Level Content** - Beginner, intermediate, and advanced courses

### 🏛️ **Resource Management**

- **Government Schemes Database** - Comprehensive listing of schemes with eligibility criteria
- **Job Opportunities** - Employment listings and market access information
- **NGO Programs** - Community programs and social initiatives
- **Market Scanner** - Automated data collection and updates
- **Advanced Search & Filtering** - Category-based filtering and smart search

### 💬 **Community Forum System**

- **Discussion Categories** - Community Support, Social Impact, Local Resources, Skill Building, Success Stories
- **Real-time Engagement** - Likes, views, replies with live updates
- **Featured & Pinned Posts** - Highlight important discussions
- **Solution Marking** - Mark helpful replies as solutions
- **Tag System** - Organize discussions with custom tags
- **Top Contributors** - Recognition system for active community members

### 🔐 **Enterprise Security**

- **JWT Authentication** - Secure token-based auth with 30-day expiration
- **Google OAuth Integration** - Simplified registration with OTP verification
- **Bcrypt Password Hashing** - Industry-standard encryption
- **CORS Protection** - Configurable origin whitelisting
- **SQL Injection Prevention** - ORM-based parameterized queries
- **Input Validation** - Pydantic models with strict type checking

### 📊 **Analytics & Tracking**

- **User Activity Tracking** - Comprehensive logging of user interactions
- **Admin Dashboard** - Real-time analytics and system statistics
- **Feedback System** - User ratings and comments for continuous improvement
- **Performance Monitoring** - Health checks and system monitoring

### 🎨 **Modern User Experience**

- **Responsive Design** - Mobile-first approach with touch-optimized interfaces
- **Dark/Light Mode** - Theme toggle for user preference
- **3D Animations** - Three.js powered interactive backgrounds
- **Particle Effects** - Engaging cursor interactions
- **Progressive Web App** - Offline capabilities and app-like experience
- **Low-Bandwidth Optimization** - Efficient operation in limited connectivity

---

## 🛠️ Technology Stack

### **Backend**
```
FastAPI 0.110+          # Modern, high-performance web framework
Uvicorn                 # Lightning-fast ASGI server
SQLAlchemy 2.0+         # Powerful SQL toolkit and ORM
Pydantic 2.6+           # Data validation using Python type hints
Python-JOSE             # JWT token generation and validation
Passlib[bcrypt]         # Password hashing with bcrypt
Python-multipart        # Form data and file upload handling
```

### **Frontend**
```
React 18                # Modern UI library with hooks and context
Vite 5.0+               # Fast build tool and dev server
React Router DOM 6.20+  # Client-side routing
Axios 1.6+              # HTTP client with interceptors
Three.js                # 3D graphics and animations
React Three Fiber       # React renderer for Three.js
Framer Motion 10.16+    # Animation library
Lucide React            # Icon library
React Markdown          # Markdown rendering
```

### **AI & Machine Learning**
```
Groq API                # Primary AI service (30+ models)
Google Generative AI    # Secondary AI (Gemini models)
Web Speech API          # Browser-based voice interface
Multi-model fallback    # Llama 3.3, Mixtral, Gemma2, Qwen, DeepSeek
```

### **Database**
```
PostgreSQL              # Production database
SQLite                  # Development database
SQLAlchemy ORM          # Database abstraction layer
Alembic                 # Database migrations
```

### **Authentication & Security**
```
JWT (JSON Web Tokens)   # Stateless authentication
Google OAuth 2.0        # Third-party authentication
Bcrypt                  # Password hashing
CORS Middleware         # Cross-origin resource sharing
```

### **Development Tools**
```
Python 3.10+            # Backend runtime
Node.js 18+             # Frontend runtime
Git                     # Version control
Docker                  # Containerization (optional)
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Layer (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Pages      │  │  Components  │  │   Contexts           │  │
│  │ - Landing    │  │ - Navbar     │  │ - AuthContext        │  │
│  │ - Dashboard  │  │ - ChatBot    │  │ - LanguageContext    │  │
│  │ - AI Chat    │  │ - Forum      │  │                      │  │
│  │ - Forum      │  │ - Profile    │  │                      │  │
│  │ - Learning   │  │ - 3D Effects │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                         HTTPS/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Backend Layer (FastAPI)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  API Routes  │  │   Services   │  │   Core               │  │
│  │ - Auth       │  │ - AI Service │  │ - Config             │  │
│  │ - Users      │  │ - Market     │  │ - Database           │  │
│  │ - AI         │  │   Scanner    │  │ - Security           │  │
│  │ - Resources  │  │ - Search     │  │ - Middleware         │  │
│  │ - Learning   │  │ - Email      │  │                      │  │
│  │ - Forum      │  │              │  │                      │  │
│  │ - Admin      │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                         SQLAlchemy ORM
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Database Layer (PostgreSQL/SQLite)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    Users     │  │   Courses    │  │   Forum              │  │
│  │  Resources   │  │  Enrollments │  │   Discussions        │  │
│  │   Queries    │  │  Activities  │  │   Replies            │  │
│  │  Feedback    │  │  Platforms   │  │   Categories         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Groq AI    │  │ Google OAuth │  │   Web Speech API     │  │
│  │  (30+ models)│  │   Service    │  │   (Voice I/O)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Google Gemini│  │ Market Data  │  │   File Storage       │  │
│  │  (Fallback)  │  │   Sources    │  │   (Local/Cloud)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### **Key Architectural Patterns**

- **Three-Tier Architecture**: Presentation, Application, and Data layers
- **RESTful API Design**: Standard HTTP methods and status codes
- **ORM Pattern**: SQLAlchemy for database abstraction
- **Context API**: React contexts for global state management
- **Service Layer**: Business logic separation from API routes
- **Middleware Pattern**: CORS, authentication, and logging
- **Fallback Strategy**: Multi-model AI with automatic failover

---

## 🚀 Quick Start

### Prerequisites

```bash
✅ Python 3.10 or higher
✅ Node.js 18+ and npm
✅ Git
✅ Virtual environment tool (venv/virtualenv)
```

### Backend Setup

#### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/RiteshKumar2e/Community-Empowering.git
cd Community-Empowering/backend
```

#### 2️⃣ **Create Virtual Environment**

**Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 3️⃣ **Install Dependencies**

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 4️⃣ **Configure Environment Variables**

Create a `.env` file in the `backend` directory:

```env
# Security
SECRET_KEY=your-super-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200  # 30 days

# AI Services
GROQ_API_KEY=your-groq-api-key-here
GEMINI_API_KEY=your-google-gemini-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Email Service (Optional)
BREVO_API_KEY=your-brevo-api-key

# CORS Configuration
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Database (Optional - defaults to SQLite)
DATABASE_URL=sqlite:///./community_ai.db
# For PostgreSQL: DATABASE_URL=postgresql://user:password@localhost/dbname

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
```

#### 5️⃣ **Run the Backend Server**

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The backend will be available at:
- **API Base URL:** http://localhost:8000
- **Interactive Docs (Swagger):** http://localhost:8000/docs
- **Alternative Docs (ReDoc):** http://localhost:8000/redoc

### Frontend Setup

#### 1️⃣ **Navigate to Frontend Directory**

```bash
cd ../frontend
```

#### 2️⃣ **Install Dependencies**

```bash
npm install
```

#### 3️⃣ **Configure Environment Variables**

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

#### 4️⃣ **Run the Development Server**

```bash
npm run dev
```

The frontend will be available at: http://localhost:5173

#### 5️⃣ **Build for Production**

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
Community-Empowering/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── users.py       # User management
│   │   │   ├── ai.py          # AI chat endpoints
│   │   │   ├── resources.py   # Resource management
│   │   │   ├── learning.py    # Learning system
│   │   │   ├── forum.py       # Forum system
│   │   │   ├── admin.py       # Admin panel
│   │   │   ├── feedback.py    # Feedback system
│   │   │   ├── tracking.py    # Activity tracking
│   │   │   ├── chat.py        # Live chat
│   │   │   └── aws_services.py # Cloud services
│   │   ├── core/              # Core functionality
│   │   │   ├── config.py      # Configuration
│   │   │   ├── database.py    # Database connection
│   │   │   └── security.py    # Security utilities
│   │   ├── models/            # Database models
│   │   │   └── models.py      # SQLAlchemy models
│   │   └── services/          # Business logic
│   │       ├── ai_service.py  # AI integration
│   │       ├── market_scanner.py # Data collection
│   │       ├── email_service.py  # Email handling
│   │       └── search_service.py # Search logic
│   ├── main.py                # Application entry point
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── SideChatBot.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   ├── ThreeBackground.jsx
│   │   │   └── ParticleCursor.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Landing.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Forum.jsx
│   │   │   ├── LearningHub.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── styles/            # CSS files
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   └── .env                   # Environment variables
│
├── README.md                  # This file
├── design.md                  # System design document
└── requirements.md            # Requirements specification
```

---

## 📚 API Reference

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/google` | Google OAuth login | ❌ |
| POST | `/api/auth/verify-otp` | Verify Google OTP | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

<details>
<summary><b>Example: User Registration</b></summary>

**Request:**
```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+919876543210",
  "location": "Mumbai, Maharashtra",
  "language": "en",
  "community_type": "student"
}
```

**Response:** `201 Created`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "language": "en",
    "community_type": "student"
  }
}
```
</details>

### 👤 User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | ✅ |
| PUT | `/api/users/profile` | Update profile | ✅ |
| POST | `/api/users/upload` | Upload profile picture | ✅ |
| GET | `/api/users/stats` | Get user statistics | ✅ |
| GET | `/api/users/activity` | Get activity history | ✅ |

### 🤖 AI Assistant Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ai/chat` | Chat with AI assistant | ✅ |
| GET | `/api/ai/history` | Get chat history | ✅ |
| GET | `/api/ai/recommendations` | Get AI recommendations | ✅ |

<details>
<summary><b>Example: AI Chat</b></summary>

**Request:**
```json
POST /api/ai/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "What government schemes are available for farmers?",
  "language": "en"
}
```

**Response:** `200 OK`
```json
{
  "response": "Here are the key government schemes for farmers...",
  "language": "en",
  "recommendations": [
    {
      "title": "PM-KISAN Scheme",
      "description": "Direct income support to farmers",
      "category": "Agriculture"
    }
  ]
}
```
</details>

### 📚 Resources Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/resources` | List all resources | ✅ |
| GET | `/api/resources/{id}` | Get resource details | ✅ |
| GET | `/api/resources/search` | Search resources | ✅ |
| GET | `/api/resources/featured` | Get featured resources | ✅ |

### 🎓 Learning Hub Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/learning/courses` | List all courses | ✅ |
| POST | `/api/learning/enroll` | Enroll in course | ✅ |
| GET | `/api/learning/enrolled` | Get enrolled courses | ✅ |
| PUT | `/api/learning/progress` | Update progress | ✅ |
| GET | `/api/learning/platforms` | Get learning platforms | ✅ |

### 💬 Forum Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/forum/categories` | Get forum categories | ✅ |
| GET | `/api/forum/discussions` | List discussions | ✅ |
| POST | `/api/forum/discussions` | Create discussion | ✅ |
| GET | `/api/forum/discussions/{id}` | Get discussion details | ✅ |
| POST | `/api/forum/discussions/{id}/like` | Like discussion | ✅ |
| GET | `/api/forum/discussions/{id}/replies` | Get replies | ✅ |
| POST | `/api/forum/discussions/{id}/replies` | Post reply | ✅ |
| POST | `/api/forum/replies/{id}/like` | Like reply | ✅ |

### ⚙️ Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List all users | ✅ Admin |
| GET | `/api/admin/stats` | Get system statistics | ✅ Admin |
| POST | `/api/admin/resources` | Create resource | ✅ Admin |
| PUT | `/api/admin/resources/{id}` | Update resource | ✅ Admin |
| DELETE | `/api/admin/resources/{id}` | Delete resource | ✅ Admin |
| GET | `/api/admin/analytics` | Get analytics | ✅ Admin |

### 📊 Tracking & Feedback Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/tracking/activity` | Track user activity | ✅ |
| GET | `/api/tracking/analytics` | Get activity analytics | ✅ |
| POST | `/api/feedback` | Submit feedback | ✅ |
| GET | `/api/feedback/stats` | Get feedback stats | ✅ Admin |

---

## 🗄️ Database Schema

### **Core Entities**

```sql
-- Users Table
users (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    phone VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL,
    location VARCHAR,
    language VARCHAR DEFAULT 'en',
    community_type VARCHAR DEFAULT 'general',
    profile_image VARCHAR,
    is_admin BOOLEAN DEFAULT FALSE,
    google_otp VARCHAR,
    google_otp_expiry TIMESTAMP,
    google_email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
)

-- Resources Table
resources (
    id INTEGER PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR NOT NULL,
    eligibility TEXT,
    provider VARCHAR,
    link VARCHAR,
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
)

-- Courses Table
courses (
    id INTEGER PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    level VARCHAR DEFAULT 'beginner',
    duration VARCHAR,
    lessons INTEGER DEFAULT 0,
    thumbnail VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
)

-- Enrollments Table
enrollments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    enrolled_at TIMESTAMP DEFAULT NOW()
)

-- Forum Categories Table
forum_categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    icon VARCHAR,
    color VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
)

-- Forum Discussions Table
forum_discussions (
    id INTEGER PRIMARY KEY,
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES forum_categories(id),
    user_id INTEGER REFERENCES users(id),
    tags TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    status VARCHAR DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
)

-- Forum Replies Table
forum_replies (
    id INTEGER PRIMARY KEY,
    discussion_id INTEGER REFERENCES forum_discussions(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
)

-- Queries Table (AI Chat History)
queries (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    response TEXT,
    language VARCHAR DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW()
)

-- User Activities Table
user_activities (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR NOT NULL,
    activity_title VARCHAR,
    activity_description TEXT,
    extra_data TEXT,
    created_at TIMESTAMP DEFAULT NOW()
)

-- Feedback Table
feedback (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    rating INTEGER,
    comment TEXT,
    category VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
)

-- Learning Platforms Table
learning_platforms (
    id INTEGER PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR,
    provider VARCHAR,
    duration VARCHAR,
    students VARCHAR,
    level VARCHAR,
    link VARCHAR,
    features TEXT,
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
)
```

### **Entity Relationships**

```
Users (1) ──────< (N) Enrollments (N) ──────> (1) Courses
  │                                                  
  │ (1:N)                                           
  ├──────< Queries                                  
  │                                                  
  ├──────< User Activities                          
  │                                                  
  ├──────< Feedback                                 
  │                                                  
  └──────< Forum Discussions (1) ──────< (N) Forum Replies
                    │
                    │ (N:1)
                    └──────> (1) Forum Categories
```

---

## 🚀 Deployment

### **Vercel Deployment (Recommended)**

The platform is optimized for deployment on Vercel with both frontend and backend.

#### **Backend Deployment**

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect to Vercel**
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Import your GitHub repository
- Select the `backend` directory as the root

3. **Configure Environment Variables**

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
SECRET_KEY=your-production-secret-key-32-chars-min
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_CLIENT_ID=your-google-client-id
BREVO_API_KEY=your-brevo-api-key
ALLOWED_ORIGINS=["https://your-frontend.vercel.app"]
DATABASE_URL=your-postgresql-connection-string
```

4. **Deploy**
- Vercel will automatically detect FastAPI and deploy
- Your API will be available at `https://your-backend.vercel.app`

#### **Frontend Deployment**

1. **Update API URL**

Edit `frontend/.env`:
```env
VITE_API_URL=https://your-backend.vercel.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

2. **Deploy to Vercel**
- Import the repository again
- Select the `frontend` directory as the root
- Vercel will auto-detect Vite and build

3. **Configure Build Settings**
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **Docker Deployment**

#### **Backend Dockerfile**

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create uploads directory
RUN mkdir -p uploads/profiles

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### **Frontend Dockerfile**

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **Docker Compose**

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/community_ai
      - SECRET_KEY=${SECRET_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
    depends_on:
      - db
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=community_ai
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

### **Production Checklist**

- [ ] Set strong `SECRET_KEY` (32+ characters, random)
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domains only
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Enable database backups
- [ ] Configure CDN for static assets
- [ ] Set up CI/CD pipeline
- [ ] Enable error logging and tracking
- [ ] Configure rate limiting
- [ ] Set up health check monitoring
- [ ] Review and update security headers

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Ways to Contribute**

- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- 🌐 Add language translations
- ✨ Enhance UI/UX

### **Development Workflow**

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Community-Empowering.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend
   pytest

   # Frontend build test
   cd frontend
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Wait for review and feedback

### **Code Standards**

- **Python**: Follow PEP 8 style guide
- **JavaScript**: Use ES6+ features, consistent formatting
- **Type Hints**: Use type hints in Python code
- **Comments**: Write clear, concise comments
- **Documentation**: Update README for new features
- **Testing**: Add tests for new functionality

### **Commit Message Guidelines**

```
feat: Add new feature
fix: Fix bug in component
docs: Update documentation
style: Format code
refactor: Refactor code structure
test: Add tests
chore: Update dependencies
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Ritesh Kumar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

Built with ❤️ for communities across India

### **Special Thanks**

- **FastAPI** - For the amazing Python web framework
- **React Team** - For the powerful UI library
- **Groq** - For lightning-fast AI inference
- **Google** - For Gemini AI and OAuth services
- **Vercel** - For seamless deployment platform
- **Open Source Community** - For the incredible tools and libraries

---

## 📞 Support & Contact

### **Get Help**

- 📧 **Email:** riteshkumar90359@gmail.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/RiteshKumar2e/Community-Empowering/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/RiteshKumar2e/Community-Empowering/discussions)

### **Links**

- 🌐 **Live Demo:** https://communityai.co.in/
- 💻 **GitHub:** https://github.com/RiteshKumar2e/Community-Empowering
- 👨‍💻 **Developer:** [Ritesh Kumar](https://github.com/RiteshKumar2e)
- 🤝 **Co-Lead:** [Ankit](https://github.com/Ankitkr-ak007/)

---

<div align="center">

### 🌟 Star this repository if you find it helpful!

**Made with 💙 by [Ritesh Kumar](https://github.com/RiteshKumar2e) & [Ankit](https://github.com/Ankitkr-ak007/)**

*Empowering Communities, One API Call at a Time* 🚀

---

[![GitHub Stars](https://img.shields.io/github/stars/RiteshKumar2e/Community-Empowering?style=social)](https://github.com/RiteshKumar2e/Community-Empowering)
[![GitHub Forks](https://img.shields.io/github/forks/RiteshKumar2e/Community-Empowering?style=social)](https://github.com/RiteshKumar2e/Community-Empowering/fork)
[![GitHub Issues](https://img.shields.io/github/issues/RiteshKumar2e/Community-Empowering)](https://github.com/RiteshKumar2e/Community-Empowering/issues)

</div>
