-- Community AI Platform Database Schema

-- Create database
CREATE DATABASE community_ai;

-- Connect to database
\c community_ai;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    community_type VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Resources table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    eligibility TEXT,
    location VARCHAR(255),
    deadline VARCHAR(100),
    link VARCHAR(500),
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

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
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Enrollments table
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Queries table (AI interactions)
CREATE TABLE queries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_queries_user_id ON queries(user_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);

-- Insert sample resources
INSERT INTO resources (title, description, category, eligibility, location, link, is_new) VALUES
('Pradhan Mantri Awas Yojana', 'Housing scheme for economically weaker sections', 'schemes', 'Annual income less than ₹3 lakhs', 'All India', 'https://pmaymis.gov.in/', true),
('Ayushman Bharat', 'Health insurance scheme covering up to ₹5 lakhs', 'schemes', 'Families below poverty line', 'All India', 'https://pmjay.gov.in/', false),
('PM-KISAN', 'Direct income support of ₹6000 per year for farmers', 'schemes', 'Small and marginal farmers', 'All India', 'https://pmkisan.gov.in/', false),
('Digital India Jobs', 'IT and digital sector job opportunities', 'jobs', 'Basic computer skills required', 'All India', 'https://digitalindia.gov.in/', true),
('Skill India Mission', 'Free vocational training programs', 'ngos', 'Youth aged 15-45', 'All India', 'https://www.skillindia.gov.in/', false);

-- Insert sample courses
INSERT INTO courses (title, description, level, duration, lessons, thumbnail) VALUES
('Digital Literacy Basics', 'Learn essential computer and internet skills', 'beginner', '4 weeks', 12, '/images/digital-literacy.jpg'),
('Financial Planning for Families', 'Manage your finances effectively', 'beginner', '3 weeks', 10, '/images/financial-planning.jpg'),
('Modern Farming Techniques', 'Sustainable agriculture practices', 'intermediate', '6 weeks', 15, '/images/farming.jpg'),
('Small Business Management', 'Start and grow your business', 'intermediate', '8 weeks', 20, '/images/business.jpg'),
('Healthcare Awareness', 'Basic health and hygiene practices', 'beginner', '2 weeks', 8, '/images/healthcare.jpg');

-- Grant permissions (adjust username as needed)
GRANT ALL PRIVILEGES ON DATABASE community_ai TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
