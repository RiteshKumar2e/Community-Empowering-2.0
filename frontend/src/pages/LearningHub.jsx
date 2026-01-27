import { useState, useEffect } from 'react'
import { BookOpen, Play, ExternalLink, Clock, Award, Users, GraduationCap, Code, Briefcase, Languages, Heart } from 'lucide-react'
import api from '../services/api'
import '../styles/LearningHub.css'

const LearningHub = () => {
    const [platforms, setPlatforms] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedSubCategory, setSelectedSubCategory] = useState('all')
    const [selectedSkillSubCategory, setSelectedSkillSubCategory] = useState('all')
    const [showAll, setShowAll] = useState(false)
    const [loading, setLoading] = useState(true)

    // Track platform visit
    const trackPlatformVisit = async (platform) => {
        try {
            await api.post('/tracking/log/platform-visit', {
                platform_name: platform.title,
                platform_url: platform.link
            })
        } catch (error) {
            console.log('Tracking error:', error)
        }
    }

    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                setLoading(true)
                const response = await api.get('/learning/platforms')
                const dbPlatforms = response.data || []

                const combined = [...learningPlatforms]
                dbPlatforms.forEach(dbP => {
                    if (!combined.find(h => h.title === dbP.title)) {
                        combined.unshift(dbP)
                    }
                })

                setPlatforms(combined)
            } catch (error) {
                console.error('Error fetching platforms:', error)
                setPlatforms(learningPlatforms)
            } finally {
                setLoading(false)
            }
        }
        fetchPlatforms()
    }, [])

    const categories = [
        { value: 'all', label: 'All Courses', icon: <BookOpen size={18} /> },
        { value: 'digital', label: 'Digital Skills', icon: <Code size={18} /> },
        { value: 'professional', label: 'Professional/Vocational', icon: <Briefcase size={18} /> },
        { value: 'language', label: 'Languages', icon: <Languages size={18} /> },
        { value: 'exams', label: 'Competitive Exams', icon: <GraduationCap size={18} /> },
        { value: 'startup', label: 'Entrepreneurship', icon: <Award size={18} /> },
        { value: 'school', label: 'School (K-12)', icon: <BookOpen size={18} /> },
        { value: 'health', label: 'Health & Wellness', icon: <Heart size={18} /> },
        { value: 'skills', label: 'Skill Development', icon: <Award size={18} /> },
        { value: 'internship', label: 'Real-time Internships', icon: <Briefcase size={18} /> }
    ]

    const internshipSubCategories = [
        { value: 'all', label: 'All Internships' },
        { value: 'govt', label: 'Govt & PSUs' },
        { value: 'tech', label: 'Technology / IT' },
        { value: 'finance', label: 'Banking & Finance' },
        { value: 'social', label: 'NGO & Social Impact' },
        { value: 'platforms', label: 'Top Platforms' }
    ]

    const skillSubCategories = [
        { value: 'all', label: 'All Skills' },
        { value: 'cloud', label: 'Cloud & Infra' },
        { value: 'data', label: 'Data & AI' },
        { value: 'dev', label: 'Software Dev' },
        { value: 'security', label: 'Cybersecurity' },
        { value: 'design', label: 'Design & Creative' },
        { value: 'business', label: 'Marketing & Biz' }
    ]

    // Real Government and Curated Free Learning Platforms - 60+ Items
    const learningPlatforms = [
        // --- DIGITAL SKILLS ---
        {
            title: "SWAYAM - NPTEL",
            description: "Free online courses from IITs, IIMs, and IISc. Master computer science, AI, and data science with valid certificates.",
            category: "digital",
            provider: "Ministry of Education",
            duration: "4-16 weeks",
            students: "10M+",
            level: "Intermediate",
            link: "https://swayam.gov.in/",
            features: ["IIT Certs", "Assignments", "Free Access"],
            isOfficial: true
        },
        {
            title: "National Digital Literacy Mission",
            description: "Training in basic computer usage, internet, email, and digital payments for rural and urban citizens.",
            category: "digital",
            provider: "MeitY",
            duration: "20 hours",
            students: "6M+",
            level: "Beginner",
            link: "https://www.digitalindia.gov.in/",
            features: ["Free Training", "Govt Certificate", "Rural Focused"],
            isOfficial: true
        },
        {
            title: "NIELIT Digital Courses",
            description: "Official certifications like CCC (Course on Computer Concepts) and O/A Level IT training.",
            category: "digital",
            provider: "NIELIT",
            duration: "80 hours",
            students: "5M+",
            level: "Beginner",
            link: "https://www.nielit.gov.in/",
            features: ["Govt Job Ready", "Official Exams", "Vast Centers"],
            isOfficial: true
        },
        {
            title: "FutureSkills Prime",
            description: "Build skills in emerging technologies like AI, Blockchain, Cybersecurity, and Cloud Computing.",
            category: "digital",
            provider: "NASSCOM & MeitY",
            duration: "Flexible",
            students: "1.5M+",
            level: "Intermediate",
            link: "https://futureskillsprime.in/",
            features: ["NASSCOM Standard", "Badges", "Tech Careers"],
            isOfficial: true
        },
        {
            title: "Google Cloud Skills Boost",
            description: "Free path to learn Cloud Architecture, Data Analytics, and Gen AI using Google Cloud labs.",
            category: "digital",
            provider: "Google",
            duration: "Self-paced",
            students: "Global",
            level: "Advanced",
            link: "https://www.cloudskillsboost.google/",
            features: ["Real Labs", "Free Tier", "Badges"],
            isOfficial: false
        },
        {
            title: "Microsoft Student Hub",
            description: "Learn Azure, C#, and software engineering with interactive modules and free sandbox environments.",
            category: "digital",
            provider: "Microsoft",
            duration: "Modular",
            students: "Global",
            level: "All Levels",
            link: "https://learn.microsoft.com/",
            features: ["Free Tools", "Global Creds", "Student Path"],
            isOfficial: false
        },
        {
            title: "AWS Educate",
            description: "Cloud computing fundamentals. Get direct access to training modules and job board for cloud roles.",
            category: "digital",
            provider: "Amazon",
            duration: "Self-paced",
            students: "1M+",
            level: "Technical",
            link: "https://aws.amazon.com/education/awseducate/",
            features: ["No-cost labs", "Job Portal", "Intro to Tech"],
            isOfficial: false
        },
        {
            title: "IBM SkillsBuild",
            description: "Focus on Cybersecurity, Data Science, and workplace skills with personalized learning paths.",
            category: "digital",
            provider: "IBM",
            duration: "Variable",
            students: "2M+",
            level: "Professional",
            link: "https://skillsbuild.org/",
            features: ["IBM Badges", "Career Mentoring", "Project Focus"],
            isOfficial: false
        },
        {
            title: "Spoken Tutorial (IIT-B)",
            description: "Learn Linux, Python, LaTeX, and more through audio-video tutorials in various Indian languages.",
            category: "digital",
            provider: "IIT Bombay",
            duration: "Self-paced",
            students: "5M+",
            level: "Beginner",
            link: "https://spoken-tutorial.org/",
            features: ["Regional Langs", "IT Training", "Open Source"],
            isOfficial: true
        },
        {
            title: "FOSSEE",
            description: "Training in Free and Open Source Software (Scilab, Python, eSim) for engineering students.",
            category: "digital",
            provider: "IIT Bombay",
            duration: "Ongoing",
            students: "1M+",
            level: "Technical",
            link: "https://fossee.in/",
            features: ["Tech Support", "Textbooks", "Workshop"],
            isOfficial: true
        },

        // --- PROFESSIONAL & VOCATIONAL ---
        {
            title: "Skill India Digital",
            description: "One-stop shop for all skill development initiatives across India. Connect with training centers nationwide.",
            category: "professional",
            provider: "MSDE / NSDC",
            duration: "1-6 months",
            students: "20M+",
            level: "Beginner",
            link: "https://www.skillindiadigital.gov.in/",
            features: ["Job Matching", "Apprenticeships", "Govt ID"],
            isOfficial: true
        },
        {
            title: "Bharat Skills (ITI)",
            description: "LMS for ITI students. Study mechanical, electrical, electronics, and construction trades digitally.",
            category: "professional",
            provider: "DGT",
            duration: "Trade Aligned",
            students: "2M+",
            level: "Vocational",
            link: "https://bharatskills.gov.in/",
            features: ["Trade Videos", "Mock Tests", "Multilingual"],
            isOfficial: true
        },
        {
            title: "NATS Apprenticeship",
            description: "Official portal for fresh graduates and diploma holders to find paid training in big industries.",
            category: "professional",
            provider: "Ministry of Education",
            duration: "1 year",
            students: "1.5M+",
            level: "Graduate",
            link: "http://www.mhrdnats.gov.in/",
            features: ["Paid Training", "Exp Certificate", "Industry Tie-ups"],
            isOfficial: true
        },
        {
            title: "Tata STRIVE",
            description: "Vocational education focused on youth employability in hospitality, retail, and sales.",
            category: "professional",
            provider: "Tata Community",
            duration: "3 months",
            students: "1M+",
            level: "Beginner",
            link: "https://www.tatastrive.com/",
            features: ["Quality Prep", "Soft Skills", "Direct Placement"],
            isOfficial: false
        },
        {
            title: "Infosys Springboard",
            description: "Comprehensive reskilling for students from 6th grade to professionals. Corporate readiness programs.",
            category: "professional",
            provider: "Infosys",
            duration: "Flexible",
            students: "5M+",
            level: "All Levels",
            link: "https://infyspringboard.onwingspan.com/",
            features: ["Corporate training", "Certificates", "Free"],
            isOfficial: false
        },
        {
            title: "TCS iON Career Edge",
            description: "Free certification on Soft Skills, Interview prep, and Industry orientation for job seekers.",
            category: "professional",
            provider: "TCS iON",
            duration: "15 days",
            students: "3M+",
            level: "Beginner",
            link: "https://learning.tcsionhub.in/",
            features: ["Digital Cert", "Short Duration", "Employability"],
            isOfficial: false
        },
        {
            title: "Lighthouse Communities",
            description: "Livelihood training for underprivileged youth. Centers in urban slums providing skill pathways.",
            category: "professional",
            provider: "Lighthouse Foundation",
            duration: "3-4 months",
            students: "500K+",
            level: "Beginner",
            link: "https://lighthousecommunities.org/",
            features: ["Slum Reach", "Empowerment", "Direct Support"],
            isOfficial: false
        },
        {
            title: "DDU-GKY Program",
            description: "Placement-linked skill training for rural poor youth. Focus on market-led skills.",
            category: "professional",
            provider: "MoRD",
            duration: "3-12 months",
            students: "2.5M+",
            level: "Beginner",
            link: "https://ddugky.gov.in/",
            features: ["Free Boarding", "Placement", "Rural Target"],
            isOfficial: true
        },
        {
            title: "NIRDPR Rural Skills",
            description: "Development courses for rural professionals and panchayati raj officials.",
            category: "professional",
            provider: "NIRDPR",
            duration: "Modular",
            students: "100K+",
            level: "Professional",
            link: "http://nirdpr.org.in/",
            features: ["Govt Policy", "Rural Tech", "Leadership"],
            isOfficial: true
        },

        // --- LANGUAGE LEARNING ---
        {
            title: "Bhasha Sangam",
            description: "Learn more than 100 sentences in 22 different Indian languages. Perfect for cultural integration.",
            category: "language",
            provider: "NCERT",
            duration: "Self-paced",
            students: "1M+",
            level: "Beginner",
            link: "https://www.bhashasangam.in/",
            features: ["22 Langs", "Daily Use", "Audio Support"],
            isOfficial: true
        },
        {
            title: "English Helper",
            description: "AI-powered English literacy tool. Helps students read, speak and write English effectively.",
            category: "language",
            provider: "Public-Private",
            duration: "Self-paced",
            students: "3M+",
            level: "All Levels",
            link: "https://www.englishhelper.com/",
            features: ["AI Tutor", "Free for Govt", "Mobile Ready"],
            isOfficial: false
        },
        {
            title: "Duolingo Indian Courses",
            description: "Master English, Hindi, and others through gamified short lessons. High retention learning.",
            category: "language",
            provider: "Duolingo",
            duration: "5 mins / day",
            students: "Global",
            level: "Beginner",
            link: "https://www.duolingo.com/",
            features: ["Gamified", "Free", "Streak Tracking"],
            isOfficial: false
        },
        {
            title: "Central Hindi Directorate",
            description: "Correspondence courses for learning Hindi through various regional languages.",
            category: "language",
            provider: "Education Ministry",
            duration: "1 year",
            students: "50K+",
            level: "Academic",
            link: "http://chd.nic.in/",
            features: ["Certificate", "Academic", "Postal support"],
            isOfficial: true
        },
        {
            title: "Swayam Sanskrit Hub",
            description: "Specialized courses in Sanskrit language and literature from veteran scholars.",
            category: "language",
            provider: "UGC",
            duration: "12 weeks",
            students: "20K+",
            level: "Classic",
            link: "https://swayam.gov.in/",
            features: ["Traditional", "Vedic Research", "Credits"],
            isOfficial: true
        },

        // --- COMPETITIVE EXAMS ---
        {
            title: "DIKSHA Portal",
            description: "Repository of teacher resources and student practice papers for Board and State exams.",
            category: "exams",
            provider: "Ministry of Education",
            duration: "Ongoing",
            students: "50M+",
            level: "School",
            link: "https://diksha.gov.in/",
            features: ["Practice tests", "QR Books", "Multilingual"],
            isOfficial: true
        },
        {
            title: "NTA Registration Hub",
            description: "Study resources links and mocks for exams like JEE, NEET, CUET provided by National Testing Agency.",
            category: "exams",
            provider: "NTA",
            duration: "Exam Based",
            students: "5M+",
            level: "Intermediate",
            link: "https://nta.ac.in/",
            features: ["Official Mocks", "Past Papers", "Circulars"],
            isOfficial: true
        },
        {
            title: "UPSC Official Prep Hub",
            description: "Syllabus, previous year questions and strategies directly from the commission.",
            category: "exams",
            provider: "UPSC",
            duration: "Long-term",
            students: "1M+",
            level: "Graduate",
            link: "https://www.upsc.gov.in/",
            features: ["Official Info", "PYQs", "Interview Guides"],
            isOfficial: true
        },
        {
            title: "Banking Guide (SBI/IBPS)",
            description: "Mock tests and pattern notifications for nationalized bank probationary officer and clerk exams.",
            category: "exams",
            provider: "Banks Hub",
            duration: "Study blocks",
            students: "2M+",
            level: "Graduate",
            link: "https://www.ibps.in/",
            features: ["Speed Tests", "Syllabus focus", "Exam Alerts"],
            isOfficial: true
        },
        {
            title: "SSC Preparation Portal",
            description: "Guide for CGL, CHSL, and GD Constable exams. Large collection of general awareness resources.",
            category: "exams",
            provider: "SSC",
            duration: "Flexible",
            students: "4M+",
            level: "10+2 / Graduate",
            link: "https://ssc.nic.in/",
            features: ["Exam Schedule", "Pattern Info", "Result portal"],
            isOfficial: true
        },

        // --- ENTREPRENEURSHIP ---
        {
            title: "Startup India Learning Program",
            description: "Free program to help you learn about starting your own business from idea to registration.",
            category: "startup",
            provider: "Invest India",
            duration: "4 weeks",
            students: "1M+",
            level: "Beginner",
            link: "https://www.startupindia.gov.in/",
            features: ["Upgrad Cert", "Free", "Business Plan Hub"],
            isOfficial: true
        },
        {
            title: "MSME Training Centers",
            description: "Hands-on training for setting up small manufacturing units and service businesses.",
            category: "startup",
            provider: "Ministry of MSME",
            duration: "2-4 weeks",
            students: "800K+",
            level: "Intermediate",
            link: "http://www.dcmsme.gov.in/",
            features: ["Incubation", "Govt Loans", "Technical Help"],
            isOfficial: true
        },
        {
            title: "EDI - Entrepreneurship Development",
            description: "Pioneer in Entrepreneurship education. Training for artisans, rural youth, and women.",
            category: "startup",
            provider: "EDII",
            duration: "Modular",
            students: "500K+",
            level: "All Levels",
            link: "http://www.ediindia.org/",
            features: ["Expert faculty", "Field work", "Funding help"],
            isOfficial: true
        },
        {
            title: "SIDBI Startup Portal",
            description: "Resources for financing and mentorship. Learn how to pitch to investors.",
            category: "startup",
            provider: "SIDBI",
            duration: "Variable",
            students: "100K+",
            level: "Professional",
            link: "https://www.sidbi.in/",
            features: ["Loan guidance", "Incubator search", "Guides"],
            isOfficial: true
        },
        {
            title: "Self Employment for Women",
            description: "Specialized startup tracks for women in rural areas looking to start MSMEs.",
            category: "startup",
            provider: "Ministry of WCD",
            duration: "Ongoing",
            students: "1.2M+",
            level: "Beginner",
            link: "https://wcd.nic.in/",
            features: ["Grants", "Marketing Help", "SHG Link"],
            isOfficial: true
        },

        // --- SCHOOL K-12 ---
        {
            title: "e-Pathshala",
            description: "Complete NCERT book digital collection and video content for every school grade.",
            category: "school",
            provider: "NCERT",
            duration: "School Tier",
            students: "20M+",
            level: "K-12",
            link: "https://epathshala.nic.in/",
            features: ["Textbooks", "E-Books", "Audio Hub"],
            isOfficial: true
        },
        {
            title: "PM e-Vidya",
            description: "Top 100 universities allowed to offer online courses. Unified school access via TV and Internet.",
            category: "school",
            provider: "Education Ministry",
            duration: "Daily",
            students: "Millions",
            level: "School",
            link: "https://www.pm-evidya.education.gov.in/",
            features: ["TV Lessons", "Online exams", "Integrated"],
            isOfficial: true
        },
        {
            title: "Khan Academy Kids",
            description: "World class learning for early childhood. Interactive stories, math and logic.",
            category: "school",
            provider: "Khan Academy",
            duration: "Self-paced",
            students: "10M+",
            level: "Pre-School",
            link: "https://www.khanacademy.org/kids",
            features: ["Ad-free", "Fun characters", "Expert led"],
            isOfficial: false
        },
        {
            title: "CBSE Academic Hub",
            description: "Curriculum materials, sample papers, and value-added resources for CBSE board students.",
            category: "school",
            provider: "CBSE",
            duration: "Yearly",
            students: "20M+",
            level: "Secondary",
            link: "https://cbseacademic.nic.in/",
            features: ["Official Info", "Exam Prep", "Teacher Support"],
            isOfficial: true
        },
        {
            title: "NIOS Virtual Open School",
            description: "Innovative schooling using virtual classrooms and recorded labs for those who cannot attend school.",
            category: "school",
            provider: "NIOS",
            duration: "Flexible",
            students: "3M+",
            level: "10th & 12th",
            link: "https://vos.nios.ac.in/",
            features: ["Virtual Labs", "Recorded class", "Accredited"],
            isOfficial: true
        },

        // --- HEALTH & WELLNESS ---
        {
            title: "iGOT Karmayogi (Health)",
            description: "Specialized training for health workers and officials on pandemic management and generic health.",
            category: "health",
            provider: "Government of India",
            duration: "Short courses",
            students: "1.5M+",
            level: "Professional",
            link: "https://igotkarmayogi.gov.in/",
            features: ["Frontline Focus", "Quick learning", "Official"],
            isOfficial: true
        },
        {
            title: "Yoga & Wellness Portal",
            description: "Introduction to Yoga practices, mental health awareness, and traditional Indian medicine (AYUSH).",
            category: "health",
            provider: "Ministry of AYUSH",
            duration: "Self-paced",
            students: "5M+",
            level: "Beginner",
            link: "https://www.ayush.gov.in/",
            features: ["Traditional Tech", "Daily Routine", "Wellness Guide"],
            isOfficial: true
        },
        {
            title: "Coursera Community Health",
            description: "Free tracks for understanding public health, epidemiology, and first aid basics.",
            category: "health",
            provider: "Global Univs",
            duration: "4-6 weeks",
            students: "Global",
            level: "Beginner",
            link: "https://www.coursera.org/",
            features: ["Scientific", "Free Audit", "Peer Help"],
            isOfficial: false
        },
        {
            title: "WHO Learning Hub",
            description: "Global standard health certifications for individuals and community leaders.",
            category: "health",
            provider: "WHO",
            duration: "Modular",
            students: "Global",
            level: "All Levels",
            link: "https://openwho.org/",
            features: ["Global standard", "Multilingual", "Badges"],
            isOfficial: false
        },
        {
            title: "Nimhans Mental Health Hub",
            description: "Guidelines and awareness modules on mental well-being and psychological support.",
            category: "health",
            provider: "NIMHANS",
            duration: "Flexible",
            students: "1M+",
            level: "Awareness",
            link: "https://nimhans.ac.in/",
            features: ["Psychological", "Support Info", "Guides"],
            isOfficial: true
        },

        // Remaining items added to fill up to 60+ (adding more to specific categories)
        {
            title: "Red Cross First Aid",
            description: "Basic life support and disaster management training modules.",
            category: "health",
            provider: "Red Cross",
            duration: "5 hours",
            students: "Global",
            level: "Beginner",
            link: "https://www.redcross.org/",
            features: ["Life Saving", "Practical", "Free Guides"],
            isOfficial: false
        },

        {
            title: "Internshala",
            description: "India's largest internship platform. 10,000+ new verified internships in Tech, Design, Marketing, and more.",
            category: "internship",
            subCategory: "platforms",
            provider: "Internshala",
            duration: "1-6 Months",
            students: "5M+",
            level: "Beginner",
            link: "https://internshala.com/internships",
            features: ["Verified Items", "Paid Stiped", "WFH Options"],
            isOfficial: false
        },
        {
            title: "LinkedIn Internships",
            description: "Real-time global and local internship listings. Filter by top companies and location.",
            category: "internship",
            subCategory: "platforms",
            provider: "LinkedIn",
            duration: "Flexible",
            students: "Global",
            level: "All Levels",
            link: "https://www.linkedin.com/jobs/internship-jobs/",
            features: ["Direct Apply", "Top Companies", "Networking"],
            isOfficial: false
        },
        {
            title: "NATS (National Apprenticeship)",
            description: "Official Govt portal for Engineering and Diploma graduates to find 1-year paid apprenticeship in top PSUs.",
            category: "internship",
            subCategory: "govt",
            provider: "Ministry of Education",
            duration: "1 Year",
            students: "1M+",
            level: "Graduate",
            link: "https://nats.education.gov.in/",
            features: ["Govt Stipend", "Official Exp", "National Reach"],
            isOfficial: true
        },
        {
            title: "Startup India Internships",
            description: "Work with high-growth startups in India. Direct access to early-stage company opportunities.",
            category: "internship",
            subCategory: "platforms",
            provider: "Startup India",
            duration: "2-6 Months",
            students: "500K+",
            level: "Enthusiast",
            link: "https://www.startupindia.gov.in/",
            features: ["Innovation", "Fast Growth", "Govt Support"],
            isOfficial: true
        },
        {
            title: "NITI Aayog Internship",
            description: "Prestigious internship for students to understand policy making and governance at the highest level.",
            category: "internship",
            subCategory: "govt",
            provider: "NITI Aayog",
            duration: "6-12 Weeks",
            students: "10K+",
            level: "Graduate/PG",
            link: "https://niti.gov.in/internship",
            features: ["Policy Research", "Official Cert", "New Delhi"],
            isOfficial: true
        },
        {
            title: "RBI Internship Scheme",
            description: "Summer and regular internships with the Reserve Bank of India for economics and finance students.",
            category: "internship",
            subCategory: "govt",
            provider: "RBI",
            duration: "3 Months",
            students: "5K+",
            level: "Post-Graduate",
            link: "https://opportunities.rbi.org.in/",
            features: ["Banking Focus", "High Prestige", "Paid"],
            isOfficial: true
        },
        {
            title: "ISRO Internship",
            description: "Opportunities for students to work on space technology projects and research.",
            category: "internship",
            subCategory: "govt",
            provider: "ISRO",
            duration: "Flexible",
            students: "2K+",
            level: "Technical",
            link: "https://www.isro.gov.in/",
            features: ["Space Tech", "Research", "Scientific"],
            isOfficial: true
        },
        {
            title: "Google STEP Internship",
            description: "Student Training in Engineering Program for 1st and 2nd year CS students.",
            category: "internship",
            subCategory: "tech",
            provider: "Google",
            duration: "10-12 Weeks",
            students: "Global",
            level: "Freshman/Sophomore",
            link: "https://careers.google.com/students/",
            features: ["Mentorship", "Elite Tech", "Diversity"],
            isOfficial: false
        },
        {
            title: "Microsoft Explore Program",
            description: "12-week internship for freshman and sophomore students to explore software engineering.",
            category: "internship",
            subCategory: "tech",
            provider: "Microsoft",
            duration: "12 Weeks",
            students: "Global",
            level: "Early College",
            link: "https://careers.microsoft.com/students/",
            features: ["SW Engineering", "PM exposure", "Global"],
            isOfficial: false
        },
        {
            title: "Teach For India",
            description: "Volunteer or intern with the movement to end educational inequity in India.",
            category: "internship",
            subCategory: "social",
            provider: "Teach For India",
            duration: "2-6 Months",
            students: "20K+",
            level: "Youth League",
            link: "https://www.teachforindia.org/",
            features: ["Social Impact", "Leadership", "Education"],
            isOfficial: false
        },
        {
            title: "IAS Research Fellowship",
            description: "Prestigious fellowship to work with academy fellows at top research labs in India.",
            category: "internship",
            subCategory: "govt",
            provider: "Indian Academy of Sciences",
            duration: "8 Weeks",
            students: "2K+",
            level: "Science/Eng",
            link: "https://www.ias.ac.in/",
            features: ["Research Fellowship", "Stipend", "Prestigious"],
            isOfficial: true
        },
        {
            title: "NHRC Internship",
            description: "Human rights education and research internships with the National Human Rights Commission.",
            category: "internship",
            subCategory: "govt",
            provider: "NHRC",
            duration: "1 Month",
            students: "1K+",
            level: "Law/Social",
            link: "https://nhrc.nic.in/",
            features: ["Human Rights", "Field Visits", "Exposure"],
            isOfficial: true
        },
        {
            title: "DRDO Internships",
            description: "Training and project work at various DRDO laboratories across India.",
            category: "internship",
            subCategory: "govt",
            provider: "DRDO",
            duration: "Variable",
            students: "5K+",
            level: "Science/Eng",
            link: "https://drdo.gov.in/",
            features: ["Defense R&D", "Lab Access", "Govt Official"],
            isOfficial: true
        },
        {
            title: "CCI Internship Program",
            description: "Legal and Economics internships with the Competition Commission of India.",
            category: "internship",
            subCategory: "govt",
            provider: "CCI India",
            duration: "1 Month",
            students: "500+",
            level: "Law/Economics",
            link: "https://www.cci.gov.in/",
            features: ["Corporate Law", "Financial Reg", "Official"],
            isOfficial: true
        },
        {
            title: "UNICEF India",
            description: "Work with the United Nations for children's rights and well-being in India.",
            category: "internship",
            subCategory: "social",
            provider: "UNICEF",
            duration: "2-6 Months",
            students: "Global",
            level: "Global Citizen",
            link: "https://www.unicef.org/india/",
            features: ["UN Exposure", "Social Policy", "Global"],
            isOfficial: false
        },
        {
            title: "WWF India Internship",
            description: "Conservation and environment-focused internships across various departments.",
            category: "internship",
            subCategory: "social",
            provider: "WWF India",
            duration: "2-6 Months",
            students: "1K+",
            level: "Environmental",
            link: "https://www.wwfindia.org/",
            features: ["Sustainability", "Nature", "Wildlife"],
            isOfficial: false
        },
        {
            title: "Infosys InStep",
            description: "Global internship program for students to work on real-world IT projects.",
            category: "internship",
            subCategory: "tech",
            provider: "Infosys",
            duration: "8-24 Weeks",
            students: "2K+",
            level: "Intermediate",
            link: "https://www.infosys.com/instep.html",
            features: ["International", "Live Projects", "Paid"],
            isOfficial: false
        },
        {
            title: "TCS Internship",
            description: "Opportunities for students to work with TCS on cutting-edge IT projects.",
            category: "internship",
            subCategory: "tech",
            provider: "TCS",
            duration: "6-12 Weeks",
            students: "5K+",
            level: "Engineering",
            link: "https://www.tcs.com/",
            features: ["Industry Leader", "Training", "Careers"],
            isOfficial: false
        },
        {
            title: "Reliance Internships",
            description: "Work with India's largest private sector company across diverse business units.",
            category: "internship",
            subCategory: "corporate",
            provider: "Reliance",
            duration: "8 Weeks",
            students: "3K+",
            level: "MBA/Eng",
            link: "https://www.ril.com/",
            features: ["Conglomerate", "Strategic Projects", "Diverse"],
            isOfficial: false
        },
        {
            title: "Goldman Sachs Analyst",
            description: "Intensive summer program for students interested in finance and technology.",
            category: "internship",
            subCategory: "finance",
            provider: "Goldman Sachs",
            duration: "8-10 Weeks",
            students: "Global",
            level: "Advanced",
            link: "https://www.goldmansachs.com/",
            features: ["Investment Banking", "Top Tier", "Global"],
            isOfficial: false
        },
        {
            title: "Standard Chartered",
            description: "Find your path in banking with internships across high-performing teams.",
            category: "internship",
            subCategory: "finance",
            provider: "StanChart",
            duration: "10 Weeks",
            students: "Global",
            level: "Graduate",
            link: "https://www.sc.com/en/careers/students-graduates/",
            features: ["Global Bank", "Professional", "Finance"],
            isOfficial: false
        },
        {
            title: "Indeed Internship Hub",
            description: "Aggregated live internship listings from thousands of companies in India.",
            category: "internship",
            subCategory: "platforms",
            provider: "Indeed",
            duration: "Flexible",
            students: "Global",
            level: "All Levels",
            link: "https://in.indeed.com/Internship-jobs",
            features: ["Real-time", "Easy Search", "Massive reach"],
            isOfficial: false
        },
        {
            title: "TIFR Research Program",
            description: "Visiting Student Research Programme (VSRP) at Tata Institute of Fundamental Research.",
            category: "internship",
            subCategory: "govt",
            provider: "TIFR",
            duration: "2 Months",
            students: "500+",
            level: "Science",
            link: "https://www.tifr.res.in/",
            features: ["Pure Science", "Top Faculty", "Elite"],
            isOfficial: true
        },
        {
            title: "NAPS Apprenticeship",
            description: "Official National Apprenticeship Promotion Scheme for industrial training.",
            category: "internship",
            subCategory: "govt",
            provider: "Govt of India",
            duration: "1 Year",
            students: "2M+",
            level: "Technical",
            link: "https://www.apprenticeshipindia.gov.in/",
            features: ["On-job training", "Stipend", "Certification"],
            isOfficial: true
        },
        {
            title: "MEA Internship",
            description: "Internship with the Ministry of External Affairs for exposure to foreign policy.",
            category: "internship",
            subCategory: "govt",
            provider: "MEA Govt",
            duration: "3 Months",
            students: "200+",
            level: "Graduate",
            link: "https://www.internship.mea.gov.in/",
            features: ["Diplomacy", "Foreign Policy", "Prestigious"],
            isOfficial: true
        },
        {
            title: "Digital India Hub",
            description: "Software Technology Parks of India (STPI) internships for tech students.",
            category: "internship",
            subCategory: "govt",
            provider: "MeitY",
            duration: "3 Months",
            students: "1K+",
            level: "IT/CS",
            link: "https://www.stpi.in/",
            features: ["Govt Tech", "Digital Hub", "Training"],
            isOfficial: true
        },
        {
            title: "NABARD Rural Program",
            description: "Summer internships focusing on rural development and agri-banking.",
            category: "internship",
            subCategory: "finance",
            provider: "NABARD bank",
            duration: "3 Months",
            students: "300+",
            level: "Post-Graduate",
            link: "https://www.nabard.org/",
            features: ["Agri-Finance", "Rural Project", "Stipend"],
            isOfficial: true
        },
        {
            title: "SIDBI Internship",
            description: "Opportunities with the Small Industries Development Bank of India.",
            category: "internship",
            subCategory: "finance",
            provider: "SIDBI",
            duration: "3 Months",
            students: "200+",
            level: "Finance",
            link: "https://www.sidbi.in/",
            features: ["MSME Focus", "SME Banking", "Official"],
            isOfficial: true
        },
        {
            title: "IOCL Training",
            description: "Summer training and projects at Indian Oil Corporation units.",
            category: "internship",
            subCategory: "govt",
            provider: "Indian Oil",
            duration: "1-2 Months",
            students: "3K+",
            level: "Engineering",
            link: "https://www.iocl.com/",
            features: ["Oil Industry", "PSU Culture", "Operations"],
            isOfficial: true
        },
        {
            title: "ONGC Summer Training",
            description: "Professional training for tech students in the energy and oil sector.",
            category: "internship",
            subCategory: "govt",
            provider: "ONGC India",
            duration: "2 Months",
            students: "2K+",
            level: "Engineering",
            link: "https://www.ongcindia.com/",
            features: ["Energy Tech", "Industry exposure", "Official"],
            isOfficial: true
        },
        {
            title: "GAIL Training Hub",
            description: "Summer training opportunities in natural gas and petrochemicals.",
            category: "internship",
            subCategory: "govt",
            provider: "GAIL India",
            duration: "Variable",
            students: "1K+",
            level: "Technical",
            link: "https://gailonline.com/",
            features: ["Petrochemical", "Gas Sector", "PSU"],
            isOfficial: true
        },
        {
            title: "BPCL Industrial Training",
            description: "Opportunities for students to work on live industrial projects.",
            category: "internship",
            subCategory: "govt",
            provider: "BPCL",
            duration: "2 Months",
            students: "1K+",
            level: "Technical",
            link: "https://www.bharatpetroleum.in/",
            features: ["Industrial Ops", "Chemical Eng", "PSU"],
            isOfficial: true
        },
        {
            title: "NTPC Energy Interns",
            description: "Power sector internships at National Thermal Power Corporation units.",
            category: "internship",
            subCategory: "govt",
            provider: "NTPC India",
            duration: "2 Months",
            students: "2K+",
            level: "Electrical/Mech",
            link: "https://ntpc.co.in/",
            features: ["Power Gen", "Heavy Industry", "PSU"],
            isOfficial: true
        },
        {
            title: "Coal India Training",
            description: "Mining and management internships with the global coal giant.",
            category: "internship",
            subCategory: "govt",
            provider: "Coal India",
            duration: "Variable",
            students: "2K+",
            level: "Mining",
            link: "https://www.coalindia.in/",
            features: ["Mining Tech", "PSU Scale", "Expertise"],
            isOfficial: true
        },
        {
            title: "BHEL Technical",
            description: "Industrial training at Bharat Heavy Electricals Limited units.",
            category: "internship",
            subCategory: "govt",
            provider: "BHEL",
            duration: "Variable",
            students: "2K+",
            level: "Mech/Electrical",
            link: "https://www.bhel.com/",
            features: ["Manufacturing", "Heavy Equip", "PSU"],
            isOfficial: true
        },
        {
            title: "SAIL Vocational",
            description: "Vocational training at Steel Authority of India limited plants.",
            category: "internship",
            subCategory: "govt",
            provider: "SAIL India",
            duration: "Variable",
            students: "3K+",
            level: "Metallurgy",
            link: "https://sail.co.in/",
            features: ["Steel Industry", "Metallurgy", "Official"],
            isOfficial: true
        },
        {
            title: "HPCL Summer Analyst",
            description: "Projects in refining, marketing and corporate functions.",
            category: "internship",
            subCategory: "govt",
            provider: "HPCL India",
            duration: "2 Months",
            students: "1.5K+",
            level: "Graduate",
            link: "https://www.hindustanpetroleum.com/",
            features: ["Oil & Gas", "Corporate", "Official"],
            isOfficial: true
        },
        {
            title: "HAL Aerospace",
            description: "Aviation and aerospace training at Hindustan Aeronautics Limited.",
            category: "internship",
            subCategory: "govt",
            provider: "HAL",
            duration: "Variable",
            students: "1K+",
            level: "Aerospace",
            link: "https://hal-india.co.in/",
            features: ["Aviation Tech", "Aero Design", "PSU"],
            isOfficial: true
        },
        {
            title: "AAI Aviation Training",
            description: "Airports Authority of India internships for aviation students.",
            category: "internship",
            subCategory: "govt",
            provider: "AAI Govt",
            duration: "Variable",
            students: "1K+",
            level: "Aviation",
            link: "https://aai.aero/",
            features: ["Airport Ops", "Civil Aviation", "Official"],
            isOfficial: true
        },
        {
            title: "CRY Social Impact",
            description: "Internships in Child Rights and advocacy for social change.",
            category: "internship",
            subCategory: "social",
            provider: "CRY India",
            duration: "2 Months",
            students: "5K+",
            level: "Social",
            link: "https://www.cry.org/",
            features: ["Child Rights", "Field Work", "NGO"],
            isOfficial: false
        },
        {
            title: "Goonj Rural Dev",
            description: "Grassroots development internships with the award-winning NGO.",
            category: "internship",
            subCategory: "social",
            provider: "Goonj",
            duration: "1 Month",
            students: "2000+",
            level: "Volunteer",
            link: "https://goonj.org/",
            features: ["Rural Focus", "Sustainability", "Impact"],
            isOfficial: false
        },
        {
            title: "HDFC Bank Intern",
            description: "Summer internships for finance and management students.",
            category: "internship",
            subCategory: "finance",
            provider: "HDFC Bank",
            duration: "2 Months",
            students: "2K+",
            level: "Graduate",
            link: "https://www.hdfcbank.com/",
            features: ["Banking Ops", "Private Sector", "Finance"],
            isOfficial: false
        },
        {
            title: "ICICI Bank Program",
            description: "Summer internship in banking and digital finance roles.",
            category: "internship",
            subCategory: "finance",
            provider: "ICICI Bank",
            duration: "8-10 Weeks",
            students: "2K+",
            level: "MBA/Graduate",
            link: "https://www.icicicareers.com/",
            features: ["Financial Tech", "Banking", "Private"],
            isOfficial: false
        },
        {
            title: "Tata Motors Tech",
            description: "Engineering and R&D internships in the automotive sector.",
            category: "internship",
            subCategory: "corporate",
            provider: "Tata Motors",
            duration: "2 Months",
            students: "1.5K+",
            level: "Engineering",
            link: "https://www.tatamotors.com/",
            features: ["Auto Eng", "Innovation", "Top Brand"],
            isOfficial: false
        },
        {
            title: "Mahindra & Mahindra",
            description: "Work with one of India's top groups in manufacturing and farm tech.",
            category: "internship",
            subCategory: "corporate",
            provider: "Mahindra",
            duration: "2 Months",
            students: "1K+",
            level: "Technical",
            link: "https://www.mahindra.com/",
            features: ["Agri-Tech", "Manufacturing", "Corporate"],
            isOfficial: false
        },
        {
            title: "L&T ECC Training",
            description: "Civil and Electrical engineering on-site and office training.",
            category: "internship",
            subCategory: "corporate",
            provider: "L&T",
            duration: "2 Months",
            students: "2K+",
            level: "Engineering",
            link: "https://www.lntecc.com/",
            features: ["Construction", "Engineering", "Elite"],
            isOfficial: false
        },
        {
            title: "Standard Chartered Hub",
            description: "Technology and Operations internships at international global hubs.",
            category: "internship",
            subCategory: "finance",
            provider: "StanChart Hub",
            duration: "10 Weeks",
            students: "Global",
            level: "Corporate",
            link: "https://www.sc.com/",
            features: ["International", "FinTech", "Banking"],
            isOfficial: false
        },
        {
            title: "UNDP India",
            description: "Internship opportunities with United Nations Development Programme.",
            category: "internship",
            subCategory: "social",
            provider: "UNDP India",
            duration: "3-6 Months",
            students: "Global",
            level: "Social/Env",
            link: "https://www.undp.org/india",
            features: ["Sustainable Dev", "UN exposure", "Policy"],
            isOfficial: false
        },
        {
            title: "JNCASR Summer Fellow",
            description: "Fellowships in science and engineering at Jawaharlal Nehru Centre.",
            category: "internship",
            subCategory: "govt",
            provider: "JNCASR",
            duration: "2 Months",
            students: "300+",
            level: "Research",
            link: "http://www.jncasr.ac.in/",
            features: ["Science R&D", "Elite Labs", "Paid"],
            isOfficial: true
        },
        {
            title: "Wipro Star Program",
            description: "IT and consulting internships for graduates in top tech projects.",
            category: "internship",
            subCategory: "tech",
            provider: "Wipro",
            duration: "6 Months",
            students: "5K+",
            level: "Technical",
            link: "https://www.wipro.com/careers/",
            features: ["IT Services", "Mentorship", "Training"],
            isOfficial: false
        },
        {
            title: "MyGov Quiz learning",
            description: "Incentivized learning on various national subjects like Constitution, Geography through quizzes.",
            category: "exams",
            provider: "MyGov",
            duration: "Instant",
            students: "10M+",
            level: "Beginner",
            link: "https://quiz.mygov.in/",
            features: ["Gamified", "Rewards", "General Awareness"],
            isOfficial: true
        },
        {
            title: "IGNOU Study Hub",
            description: "Repository of study material for hundreds of distance degree programs.",
            category: "exams",
            provider: "IGNOU",
            duration: "Academic",
            students: "4M+",
            level: "Degree",
            link: "http://egyankosh.ac.in/",
            features: ["Vast E-books", "Degree Aligned", "Open access"],
            isOfficial: true
        },
        {
            title: "Saylor Academy",
            description: "Full college-level courses in English and Management for free with professional certs.",
            category: "professional",
            provider: "Saylor.org",
            duration: "40 hours+",
            students: "500K+",
            level: "Undergraduate",
            link: "https://www.saylor.org/",
            features: ["College level", "Zero cost", "US Standard"],
            isOfficial: false
        },
        {
            title: "Alison Workplace Skills",
            description: "Diverse vocational courses like Plumbing, Electrical work, and Retail Management.",
            category: "professional",
            provider: "Alison",
            duration: "Flexible",
            students: "20M+",
            level: "Vocational",
            link: "https://alison.com/",
            features: ["Self-paced", "Free Diploma", "Practical"],
            isOfficial: false
        },
        {
            title: "CEC-UGC E-Content",
            description: "Multi-media educational content for all undergraduate students managed by the UGC.",
            category: "exams",
            provider: "Consortium Educ Com",
            duration: "Full Course",
            students: "2M+",
            level: "College",
            link: "https://cec.nic.in/cec/",
            features: ["UGC syllabus", "Recorded lectures", "Free"],
            isOfficial: true
        },
        {
            title: "National Digital Library",
            description: "Access to millions of e-books and papers for students and researchers across India.",
            category: "school",
            provider: "IIT Kharagpur",
            duration: "Lifelong",
            students: "30M+",
            level: "PhD to School",
            link: "https://ndl.iitkgp.ac.in/",
            features: ["Single search", "Rare books", "Free"],
            isOfficial: true
        },
        {
            title: "Bhashini AI Hub",
            description: "Indian language technology platform. Tools to translate and learn through speech-to-speech.",
            category: "language",
            provider: "India Bhashini",
            duration: "Instant",
            students: "1M+",
            level: "Tech-support",
            link: "https://bhashini.gov.in/",
            features: ["AI Powered", "Cross-lingual", "Official"],
            isOfficial: true
        },
        {
            title: "Vigyan Prasar",
            description: "Science communication portal offering books and films to foster scientific temper.",
            category: "school",
            provider: "DST",
            duration: "Flexible",
            students: "2M+",
            level: "Kids & Youth",
            link: "https://vigyanprasar.gov.in/",
            features: ["Science Films", "Easy books", "National level"],
            isOfficial: true
        },
        {
            title: "Child Education Guide",
            description: "Parents resource for tracking childhood development and schooling metrics in India.",
            category: "school",
            provider: "Samagra Shiksha",
            duration: "Resource base",
            students: "5M+",
            level: "Parents/Students",
            link: "https://samagra.education.gov.in/",
            features: ["Policies", "Quality index", "Guides"],
            isOfficial: true
        },
        {
            title: "A-VIEW Virtual Class",
            description: "Advanced learning platform connecting students with experts and libraries virtually.",
            category: "digital",
            provider: "Amrita University",
            duration: "Session based",
            students: "1M+",
            level: "Academic",
            link: "http://aview.in/",
            features: ["Live sessions", "Collaborative", "Free soft"],
            isOfficial: true
        },
        {
            title: "Agri-Learning Hub",
            description: "Training in modern agriculture techniques, organic farming and drone usage in farming.",
            category: "professional",
            provider: "MANAGE India",
            duration: "Short term",
            students: "400K+",
            level: "Professional",
            link: "https://www.manage.gov.in/",
            features: ["Agriculture focus", "Agri-Biz", "Govt cert"],
            isOfficial: true
        },
        {
            title: "Invest India Modules",
            description: "Business modules for FDI, investment policies and operational setup in India.",
            category: "startup",
            provider: "Ministry of Commerce",
            duration: "Module based",
            students: "100K+",
            level: "Business",
            link: "https://www.investindia.gov.in/",
            features: ["Export info", "FDI rules", "Policy"],
            isOfficial: true
        },
        {
            title: "Yashasvi Scholarship Prep",
            description: "Study modules specifically designed for scholarship entrance exams for OBC/EBC students.",
            category: "exams",
            provider: "Social Justice Dept",
            duration: "Prep tier",
            students: "500K+",
            level: "School",
            link: "https://socialjustice.gov.in/",
            features: ["Grant focused", "Syllabus", "Direct help"],
            isOfficial: true
        },
        // --- SKILL DEVELOPMENT (100 Items Categorized) ---

        // Cloud & Infra
        {
            title: "Google Cloud Skills Boost",
            description: "Master Cloud architecture, Data Analytics, and Gen AI with hands-on labs.",
            category: "skills", subCategory: "cloud",
            provider: "Google Cloud", duration: "Self-paced", students: "Global", level: "Intermediate",
            link: "https://www.cloudskillsboost.google/",
            features: ["Cloud Labs", "Cert Prep", "Official Badges"], isOfficial: false
        },
        {
            title: "AWS Educate",
            description: "Free cloud computing training, labs, and job board for students.",
            category: "skills", subCategory: "cloud",
            provider: "Amazon", duration: "Modular", students: "1M+", level: "Beginner",
            link: "https://aws.amazon.com/education/awseducate/",
            features: ["No-cost Labs", "Job Portal", "Cloud Path"], isOfficial: false
        },
        {
            title: "Microsoft Learn Azure",
            description: "Official interactive modules for Azure and Cloud Development.",
            category: "skills", subCategory: "cloud",
            provider: "Microsoft", duration: "Variable", students: "Millions", level: "All Levels",
            link: "https://learn.microsoft.com/azure",
            features: ["Free Sandbox", "Global Creds", "Tech Career"], isOfficial: false
        },
        {
            title: "Oracle Cloud Infrastructure",
            description: "Official training for OCI including Architect and Operations certs.",
            category: "skills", subCategory: "cloud",
            provider: "Oracle", duration: "40 hours+", students: "500K+", level: "Advanced",
            link: "https://education.oracle.com/learning-explorer",
            features: ["Exam Prep", "Free Training", "Official Cert"], isOfficial: false
        },
        {
            title: "Linux Foundation Training",
            description: "Professional training in Linux, Kubernetes, and Node.js.",
            category: "skills", subCategory: "cloud",
            provider: "Linux Foundation", duration: "Modular", students: "2M+", level: "System Admin",
            link: "https://training.linuxfoundation.org/",
            features: ["Open Source", "Industry Standard"], isOfficial: false
        },
        {
            title: "VMware Customer Connect",
            description: "Virtualization training covering vSphere, NSX, and Cloud Foundation.",
            category: "skills", subCategory: "cloud",
            provider: "VMware", duration: "Modular", students: "800K+", level: "IT Admin",
            link: "https://customerconnect.vmware.com/learning",
            features: ["Virtualization", "IT Infra", "Workshops"], isOfficial: false
        },
        {
            title: "Red Hat Training",
            description: "Enterprise Linux, OpenShift, and Automation training leader.",
            category: "skills", subCategory: "cloud",
            provider: "Red Hat", duration: "Variable", students: "1M+", level: "Enterprise Tech",
            link: "https://www.redhat.com/en/services/training",
            features: ["RHEL Mastery", "DevOps Skills"], isOfficial: false
        },
        {
            title: "DigitalOcean Community",
            description: "Comprehensive tutorials and labs for server management and cloud apps.",
            category: "skills", subCategory: "cloud",
            provider: "DigitalOcean", duration: "Self-paced", students: "5M+", level: "Beginner",
            link: "https://www.digitalocean.com/community",
            features: ["Droplets", "Linux Config", "Free Guides"], isOfficial: false
        },
        {
            title: "HashiCorp Learn",
            description: "Master Infrastructure as Code (IaC) with Terraform, Vault, and Consul.",
            category: "skills", subCategory: "cloud",
            provider: "HashiCorp", duration: "Modular", students: "500K+", level: "Intermediate",
            link: "https://learn.hashicorp.com/",
            features: ["Terraform", "Security", "DevOps"], isOfficial: false
        },
        {
            title: "Docker Training",
            description: "Official guide to containerization, images, and Docker Compose.",
            category: "skills", subCategory: "cloud",
            provider: "Docker", duration: "Variable", students: "2M+", level: "Intermediate",
            link: "https://docs.docker.com/get-started/",
            features: ["Containers", "Images", "Registry"], isOfficial: false
        },
        {
            title: "Cloudflare Workers",
            description: "Learn to build and deploy serverless functions at the edge.",
            category: "skills", subCategory: "cloud",
            provider: "Cloudflare", duration: "Project based", students: "300K+", level: "Advanced",
            link: "https://developers.cloudflare.com/workers/get-started/guide/",
            features: ["Wasm", "Edge JS", "Serverless"], isOfficial: false
        },
        {
            title: "Netlify Learn",
            description: "Master modern web deployment and serverless functions.",
            category: "skills", subCategory: "cloud",
            provider: "Netlify", duration: "Flex", students: "1M+", level: "Beginner",
            link: "https://www.netlify.com/blog/tags/tutorial/",
            features: ["JAMstack", "Functions", "Forms"], isOfficial: false
        },
        {
            title: "Vercel Guides",
            description: "Deployment and optimization guides for Next.js and frontend frameworks.",
            category: "skills", subCategory: "cloud",
            provider: "Vercel", duration: "Modular", students: "1M+", level: "Intermediate",
            link: "https://vercel.com/guides",
            features: ["Next.js", "Edge Config", "Deployment"], isOfficial: false
        },
        {
            title: "K8s.io Learning",
            description: "Official documentation and tutorials for Kubernetes orchestration.",
            category: "skills", subCategory: "cloud",
            provider: "Kubernetes", duration: "Self-paced", students: "5M+", level: "Advanced",
            link: "https://kubernetes.io/docs/tutorials/",
            features: ["Orchestration", "Kubectl", "Pods"], isOfficial: false
        },
        {
            title: "Cloudinary Academy",
            description: "Optimize digital media and images using Cloudinary's powerful API.",
            category: "skills", subCategory: "cloud",
            provider: "Cloudinary", duration: "Modular", students: "100K+", level: "All Levels",
            link: "https://training.cloudinary.com/",
            features: ["Media Mgmt", "API Video", "SEO Images"], isOfficial: false
        },

        // Data & AI
        {
            title: "MongoDB University",
            description: "Master NoSQL databases and MongoDB with official courses.",
            category: "skills", subCategory: "data",
            provider: "MongoDB", duration: "Flex", students: "1.5M+", level: "Developer",
            link: "https://university.mongodb.com/",
            features: ["Database Skills", "Free Courses"], isOfficial: false
        },
        {
            title: "Redis University",
            description: "Expert-led courses for Redis data structures and applications.",
            category: "skills", subCategory: "data",
            provider: "Redis", duration: "5 weeks", students: "100K+", level: "Developer",
            link: "https://university.redis.com/",
            features: ["NoSQL Mastery", "Memory Cache"], isOfficial: false
        },
        {
            title: "Databricks Academy",
            description: "Training in Data Engineering and Machine Learning using Apache Spark.",
            category: "skills", subCategory: "data",
            provider: "Databricks", duration: "Variable", students: "200K+", level: "Data Pro",
            link: "https://www.databricks.com/learn/training/login",
            features: ["Big Data", "Spark AI"], isOfficial: false
        },
        {
            title: "Snowflake University",
            description: "Learn cloud data warehousing and sharing on the Snowflake platform.",
            category: "skills", subCategory: "data",
            provider: "Snowflake", duration: "Self-paced", students: "100K+", level: "Data Pro",
            link: "https://learn.snowflake.com/",
            features: ["Cloud Data", "Data Warehouse"], isOfficial: false
        },
        {
            title: "Kaggle Courses",
            description: "Practical micro-courses for Data Science, Machine Learning, and Python.",
            category: "skills", subCategory: "data",
            provider: "Google Kaggle", duration: "3-5 hours", students: "5M+", level: "Beginner",
            link: "https://www.kaggle.com/learn",
            features: ["Python", "Pandas", "Deep Learning"], isOfficial: false
        },
        {
            title: "Fast.ai",
            description: "Top-tier Deep Learning courses for coders. High-level focus on AI.",
            category: "skills", subCategory: "data",
            provider: "Fast.ai", duration: "Modular", students: "2M+", level: "Intermediate",
            link: "https://www.fast.ai/",
            features: ["Deep Learning", "CNNs", "NLP"], isOfficial: false
        },
        {
            title: "OpenAI Guides",
            description: "Learn to prompt, fine-tune, and integrate GPT models and Dall-E.",
            category: "skills", subCategory: "data",
            provider: "OpenAI", duration: "Project based", students: "Global", level: "All Levels",
            link: "https://platform.openai.com/docs/guides/prompt-engineering",
            features: ["Prompt Eng", "LLM APIs", "Fine-tuning"], isOfficial: false
        },
        {
            title: "Hugging Face Course",
            description: "Build NLP models and work with transformers from the community hub.",
            category: "skills", subCategory: "data",
            provider: "Hugging Face", duration: "Weeks", students: "1M+", level: "Advanced",
            link: "https://huggingface.co/learn/nlp-course/",
            features: ["Transformers", "Models Hub", "NLP"], isOfficial: false
        },
        {
            title: "TensorFlow Learn",
            description: "Official training for the TensorFlow ecosystem and production AI.",
            category: "skills", subCategory: "data",
            provider: "Google AI", duration: "Modular", students: "3M+", level: "Technical",
            link: "https://www.tensorflow.org/learn",
            features: ["AI Models", "Keras", "Model Deployment"], isOfficial: false
        },
        {
            title: "PyTorch Tutorials",
            description: "Learn the research-friendly AI framework through interactive tutorials.",
            category: "skills", subCategory: "data",
            provider: "Meta AI", duration: "Modular", students: "2M+", level: "Technical",
            link: "https://pytorch.org/tutorials/",
            features: ["Tensors", "Neural Nets", "PyTorch Live"], isOfficial: false
        },
        {
            title: "Neo4j Graph Academy",
            description: "Master graph databases and Cypher query language.",
            category: "skills", subCategory: "data",
            provider: "Neo4j", duration: "Flex", students: "500K+", level: "Intermediate",
            link: "https://graphacademy.neo4j.com/",
            features: ["Graph DB", "Cypher", "Relations"], isOfficial: false
        },
        {
            title: "Apache Spark Docs",
            description: "Official guide for building large-scale data processing engines.",
            category: "skills", subCategory: "data",
            provider: "Apache", duration: "Technical", students: "2M+", level: "Advanced",
            link: "https://spark.apache.org/docs/latest/",
            features: ["Big Data", "RDDs", "Spark SQL"], isOfficial: false
        },
        {
            title: "H2O.ai University",
            description: "Learn automated machine learning and professional AI platforms.",
            category: "skills", subCategory: "data",
            provider: "H2O.ai", duration: "Modular", students: "100K+", level: "Data Pro",
            link: "https://university.h2o.ai/",
            features: ["AutoML", "Explainable AI", "Data Pro"], isOfficial: false
        },
        {
            title: "Scikit-learn Learn",
            description: "Official documentation for machine learning in Python.",
            category: "skills", subCategory: "data",
            provider: "Scikit-community", duration: "Reference", students: "5M+", level: "Technical",
            link: "https://scikit-learn.org/stable/tutorial/",
            features: ["Algorithms", "Stats", "Python ML"], isOfficial: false
        },
        {
            title: "DeepLearning.AI Hub",
            description: "Free specialization modules and short courses on AI topics.",
            category: "skills", subCategory: "data",
            provider: "Andrew Ng", duration: "Variable", students: "10M+", level: "All Levels",
            link: "https://www.deeplearning.ai/short-courses/",
            features: ["AI Basics", "Future Tech", "Gen AI"], isOfficial: false
        },
        {
            title: "Elastic Training",
            description: "Official training for Elasticsearch, Logstash, and Kibana.",
            category: "skills", subCategory: "data",
            provider: "Elastic", duration: "Flex", students: "200K+", level: "Search Pro",
            link: "https://training.elastic.co/",
            features: ["ELK Stack", "Log Analysis", "Search"], isOfficial: false
        },
        {
            title: "Tableau E-Learning",
            description: "Learn data visualization and business intelligence.",
            category: "skills", subCategory: "data",
            provider: "Tableau", duration: "Modular", students: "1M+", level: "Data Analyst",
            link: "https://www.tableau.com/learn",
            features: ["Data Viz", "BI Skills"], isOfficial: false
        },
        {
            title: "Power BI Microsoft Hub",
            description: "Data analytics skills to transform data into insights.",
            category: "skills", subCategory: "data",
            provider: "Microsoft", duration: "Self-paced", students: "2M+", level: "Data Analyst",
            link: "https://learn.microsoft.com/power-bi/learning-catalog/",
            features: ["BI Dashboards", "Data Modeling"], isOfficial: false
        },

        // Software Development
        {
            title: "FreeCodeCamp",
            description: "World's most popular coding boot camp. Earn 10+ free certifications.",
            category: "skills", subCategory: "dev",
            provider: "Quincy Larson", duration: "300 hours/cert", students: "40M+", level: "Beginner",
            link: "https://www.freecodecamp.org/learn",
            features: ["Full Stack", "Python", "Certs"], isOfficial: false
        },
        {
            title: "MDN Web Docs Learning",
            description: "Official Mozilla guide to HTML, CSS, and JavaScript from scratch.",
            category: "skills", subCategory: "dev",
            provider: "Mozilla", duration: "Reference", students: "Global", level: "All Levels",
            link: "https://developer.mozilla.org/en-US/docs/Learn",
            features: ["Standards", "JavaScript", "HTML5"], isOfficial: false
        },
        {
            title: "The Odin Project",
            description: "Full stack curriculum specializing in Ruby on Rails and JavaScript.",
            category: "skills", subCategory: "dev",
            provider: "Community", duration: "Modular", students: "1M+", level: "Beginner-Intermediate",
            link: "https://www.theodinproject.com/",
            features: ["Project based", "Full Stack", "Free"], isOfficial: false
        },
        {
            title: "JavaScript.info",
            description: "The modern JavaScript tutorial, from basics to advanced topics.",
            category: "skills", subCategory: "dev",
            provider: "Ilya Kantor", duration: "Reference", students: "Global", level: "All Levels",
            link: "https://javascript.info/",
            features: ["ES6+", "Dom", "Patterns"], isOfficial: false
        },
        {
            title: "Python.org Tutorial",
            description: "The official standard library guide to Python programming.",
            category: "skills", subCategory: "dev",
            provider: "Python PSF", duration: "Reference", students: "Global", level: "Beginner",
            link: "https://docs.python.org/3/tutorial/",
            features: ["OOP", "Scripting", "Official"], isOfficial: false
        },
        {
            title: "Go Tour",
            description: "Interactive introduction to Google's Go programming language.",
            category: "skills", subCategory: "dev",
            provider: "Go Team", duration: "Hours", students: "500K+", level: "Freshman",
            link: "https://tour.golang.org/",
            features: ["Concurrency", "Types", "Interactive"], isOfficial: false
        },
        {
            title: "Rust Book",
            description: "The definitive guide to the Rust systems programming language.",
            category: "skills", subCategory: "dev",
            provider: "Rust Team", duration: "Books", students: "500K+", level: "Advanced",
            link: "https://doc.rust-lang.org/book/",
            features: ["Safety", "Memory", "Performant"], isOfficial: false
        },
        {
            title: "Unity Learn",
            description: "Journey in 3D and Game Development with official tutorials.",
            category: "skills", subCategory: "dev",
            provider: "Unity", duration: "Self-paced", students: "1M+", level: "Technical",
            link: "https://learn.unity.com/",
            features: ["Game Dev", "3D Skills"], isOfficial: false
        },
        {
            title: "Next.js Learning Path",
            description: "Master React for Production with official Vercel tracks.",
            category: "skills", subCategory: "dev",
            provider: "Vercel", duration: "Practical", students: "1M+", level: "Advanced Web",
            link: "https://nextjs.org/learn",
            features: ["SSR", "App Router"], isOfficial: false
        },
        {
            title: "Vite JS Training",
            description: "Next generation of frontend tooling for fast development.",
            category: "skills", subCategory: "dev",
            provider: "Community", duration: "Build blocks", students: "400K+", level: "Web Tools",
            link: "https://vitejs.dev/guide/",
            features: ["Fast builds", "Modern JS"], isOfficial: false
        },
        {
            title: "GitHub Skills Hub",
            description: "Learn Git and CI/CD through interactive repositories.",
            category: "skills", subCategory: "dev",
            provider: "GitHub", duration: "Lab based", students: "5M+", level: "All Levels",
            link: "https://skills.github.com/",
            features: ["Version Control", "DevOps"], isOfficial: false
        },
        {
            title: "React.dev Guides",
            description: "Official interactive documentation for React UI library.",
            category: "skills", subCategory: "dev",
            provider: "Meta", duration: "Reference", students: "10M+", level: "Intermediate",
            link: "https://react.dev/learn",
            features: ["Hooks", "State", "UI"], isOfficial: false
        },
        {
            title: "Vuejs.org Tutorial",
            description: "Interactive journey through the approachable Vue.js framework.",
            category: "skills", subCategory: "dev",
            provider: "Evan You", duration: "Reference", students: "3M+", level: "All Levels",
            link: "https://vuejs.org/tutorial/",
            features: ["Components", "Reactive", "Flex"], isOfficial: false
        },
        {
            title: "Svelte.dev Learn",
            description: "Learn Svelte's compiler-first approach to building web apps.",
            category: "skills", subCategory: "dev",
            provider: "Community", duration: "Interactive", students: "500K+", level: "Modern",
            link: "https://svelte.dev/tutorial",
            features: ["Fast UI", "Zero runtime", "Compiler"], isOfficial: false
        },
        {
            title: "Flutter.dev Labs",
            description: "Build beautiful cross-platform apps with Google's UI toolkit.",
            category: "skills", subCategory: "dev",
            provider: "Google Flutter", duration: "Project based", students: "2M+", level: "Technical",
            link: "https://flutter.dev/learn",
            features: ["Dart", "Widgets", "Mobile"], isOfficial: false
        },
        {
            title: "Postman Academy",
            description: "Official certification for API development and testing.",
            category: "skills", subCategory: "dev",
            provider: "Postman", duration: "Modular", students: "1M+", level: "QA/Dev",
            link: "https://academy.postman.com/",
            features: ["API Testing", "Automation", "REST"], isOfficial: false
        },
        {
            title: "GraphQL.org Learn",
            description: "Official guide to query language for your APIs and server-side runtimes.",
            category: "skills", subCategory: "dev",
            provider: "GraphQL Team", duration: "Variable", students: "1M+", level: "Backend",
            link: "https://graphql.org/learn/",
            features: ["Queries", "Schemas", "Mutations"], isOfficial: false
        },
        {
            title: "Supabase Docs",
            description: "Learn to build apps with PostgreSQL and real-time backend functionality.",
            category: "skills", subCategory: "dev",
            provider: "Supabase", duration: "Modular", students: "200K+", level: "Intermediate",
            link: "https://supabase.com/docs/guides/getting-started",
            features: ["PostgreSQL", "Auth", "Storage"], isOfficial: false
        },
        {
            title: "Unreal Engine Learn",
            description: "Official tutorials for high-end 3D and Game Development.",
            category: "skills", subCategory: "dev",
            provider: "Epic Games", duration: "Project based", students: "1M+", level: "Advanced",
            link: "https://dev.epicgames.com/community/learning",
            features: ["C++", "Blueprints", "VFX"], isOfficial: false
        },
        {
            title: "Tailwind CSS Docs",
            description: "Master utility-first CSS for rapid UI development.",
            category: "skills", subCategory: "dev",
            provider: "Tailwind Labs", duration: "Reference", students: "1M+", level: "Frontend",
            link: "https://tailwindcss.com/docs",
            features: ["Responsive", "Utility", "CSS"], isOfficial: false
        },
        {
            title: "TypeScript Lang",
            description: "Official handbook for typed JavaScript at scale.",
            category: "skills", subCategory: "dev",
            provider: "Microsoft TS", duration: "Reference", students: "5M+", level: "Intermediate",
            link: "https://www.typescriptlang.org/docs/",
            features: ["Types", "Interfaces", "Scale"], isOfficial: false
        },
        {
            title: "Laravel Guides",
            description: "PHP framework for web artisans. Official documentation and video paths.",
            category: "skills", subCategory: "dev",
            provider: "Taylor Otwell", duration: "Technical", students: "2M+", level: "Backend",
            link: "https://laravel.com/docs/",
            features: ["Eloquent", "Blade", "Routing"], isOfficial: false
        },
        {
            title: "Django Project Docs",
            description: "Python framework for rapid development and pragmatic design.",
            category: "skills", subCategory: "dev",
            provider: "DSF", duration: "Reference", students: "2M+", level: "Backend",
            link: "https://docs.djangoproject.com/en/stable/intro/",
            features: ["Admin panel", "ORM", "Pythonic"], isOfficial: false
        },
        {
            title: "Spring Guides",
            description: "Modern Java development with Spring Boot and Cloud modules.",
            category: "skills", subCategory: "dev",
            provider: "VMware / Tanzu", duration: "Coding labs", students: "5M+", level: "Advanced",
            link: "https://spring.io/guides",
            features: ["Java", "Microservices", "REST"], isOfficial: false
        },
        {
            title: "Kotlin Playground",
            description: "Interactive tutorials for JetBrains' modern language for JVM and Android.",
            category: "skills", subCategory: "dev",
            provider: "JetBrains", duration: "Interactive", students: "1M+", level: "Technical",
            link: "https://play.kotlinlang.org/byExample/overview",
            features: ["Null safety", "Android", "JVM"], isOfficial: false
        },
        {
            title: "Swift Playgrounds",
            description: "Apple's interactive lessons for building iOS and macOS apps.",
            category: "skills", subCategory: "dev",
            provider: "Apple", duration: "iPad/Mac app", students: "5M+", level: "Beginner",
            link: "https://www.apple.com/swift/playgrounds/",
            features: ["iOS Dev", "Swift", "Gamified"], isOfficial: false
        },
        {
            title: "Julia Academy",
            description: "Free courses for Julia programming in Data Science and Scientific computing.",
            category: "skills", subCategory: "dev",
            provider: "Julia Computing", duration: "Modular", students: "100K+", level: "Mathematical",
            link: "https://juliaacademy.com/",
            features: ["Julia", "Physics", "Computing"], isOfficial: false
        },

        // Cybersecurity
        {
            title: "Cisco Networking Academy",
            description: "Expert-led training in Networking, IoT, and Security.",
            category: "skills", subCategory: "security",
            provider: "Cisco", duration: "Modular", students: "15M+", level: "Technical",
            link: "https://www.netacad.com/",
            features: ["Virtual Labs", "Job Matching"], isOfficial: false
        },
        {
            title: "Palo Alto Networks Academy",
            description: "Cybersecurity training covering Cloud Security and SOC ops.",
            category: "skills", subCategory: "security",
            provider: "Palo Alto", duration: "Modular", students: "200K+", level: "Security",
            link: "https://www.paloaltonetworks.com/services/education/academy",
            features: ["Cyber Defense", "SOC Ops"], isOfficial: false
        },
        {
            title: "Fortinet Training",
            description: "Network security expert training and official NSE certs.",
            category: "skills", subCategory: "security",
            provider: "Fortinet", duration: "NSE 1-8", students: "1M+", level: "Security Pro",
            link: "https://training.fortinet.com/",
            features: ["NSE Certs", "Network Sec"], isOfficial: false
        },
        {
            title: "TryHackMe",
            description: "Hands-on cybersecurity labs for all skill levels. Gamified rooms.",
            category: "skills", subCategory: "security",
            provider: "THM", duration: "Infinite", students: "2M+", level: "All Levels",
            link: "https://tryhackme.com/",
            features: ["CTF", "Red Team", "Blue Team"], isOfficial: false
        },
        {
            title: "Hack The Box Labs",
            description: "Extreme hands-on labs to practice offensive security skills.",
            category: "skills", subCategory: "security",
            provider: "HTB", duration: "Infinite", students: "1M+", level: "Advanced",
            link: "https://www.hackthebox.com/",
            features: ["Pwn", "Reverse", "OSCP prep"], isOfficial: false
        },
        {
            title: "PortSwigger Web Academy",
            description: "Free web security training from the creators of Burp Suite.",
            category: "skills", subCategory: "security",
            provider: "PortSwigger", duration: "Project labs", students: "1M+", level: "Web Security",
            link: "https://portswigger.net/web-security",
            features: ["XSS", "SQLi", "Web labs"], isOfficial: false
        },
        {
            title: "Cybrary Free Tier",
            description: "Video-based training for CompTIA, CISSP, and more security paths.",
            category: "skills", subCategory: "security",
            provider: "Cybrary", duration: "Video", students: "3M+", level: "Certification",
            link: "https://www.cybrary.it/",
            features: ["InfoSec", "SOC", "CompTIA"], isOfficial: false
        },
        {
            title: "OWASP Top 10 Guides",
            description: "Community standards for web and mobile security awareness.",
            category: "skills", subCategory: "security",
            provider: "OWASP Foundation", duration: "Reference", students: "Global", level: "Developer",
            link: "https://owasp.org/www-project-top-ten/",
            features: ["Vulns", "Security Code", "Safety"], isOfficial: false
        },
        {
            title: "SANS Institute Webcasts",
            description: "Deep dive technical webcasts from the leading security training body.",
            category: "skills", subCategory: "security",
            provider: "SANS", duration: "1 hour each", students: "Millions", level: "Advanced",
            link: "https://www.sans.org/webcasts/",
            features: ["Analysis", "Threat Intel", "Live"], isOfficial: false
        },
        {
            title: "Metasploit Unleashed",
            description: "Free ethical hacking course by Offensive Security covering Metasploit.",
            category: "skills", subCategory: "security",
            provider: "OffSec", duration: "Self-paced", students: "500K+", level: "Advanced",
            link: "https://www.offensive-security.com/metasploit-unleashed/",
            features: ["Exploit", "Payloads", "Ethical"], isOfficial: false
        },
        {
            title: "Wireshark University",
            description: "Master packet analysis and network troubleshooting official guides.",
            category: "skills", subCategory: "security",
            provider: "Wireshark", duration: "Reference", students: "1M+", level: "Network Admin",
            link: "https://www.wireshark.org/docs/",
            features: ["Packet Sniffing", "Network Foren"], isOfficial: false
        },
        {
            title: "Splunk Education",
            description: "Official training for SIEM and log analysis with Splunk.",
            category: "skills", subCategory: "security",
            provider: "Splunk", duration: "Flex", students: "1M+", level: "SOC Analyst",
            link: "https://www.splunk.com/en_us/training/free-courses.html",
            features: ["Log Analysis", "Dashboards", "SIEM"], isOfficial: false
        },
        {
            title: "Sophos Training",
            description: "Official cybersecurity training for Sophos products and fundamentals.",
            category: "skills", subCategory: "security",
            provider: "Sophos", duration: "Video", students: "300K+", level: "Admin",
            link: "https://www.sophos.com/en-us/training",
            features: ["Firewall", "Endpoint", "XDR"], isOfficial: false
        },
        {
            title: "Kaspersky Academy",
            description: "Technical training and malware analysis whitepapers.",
            category: "skills", subCategory: "security",
            provider: "Kaspersky", duration: "Articles/Video", students: "200K+", level: "Researcher",
            link: "https://academy.kaspersky.com/",
            features: ["Malware", "Digital Forensics"], isOfficial: false
        },
        {
            title: "Malwarebytes Academy",
            description: "Security awareness and technical training for threat remediation.",
            category: "skills", subCategory: "security",
            provider: "Malwarebytes", duration: "Video", students: "100K+", level: "All Levels",
            link: "https://academy.malwarebytes.com/",
            features: ["Remediation", "Endpoint Sec"], isOfficial: false
        },

        // Design & Creative
        {
            title: "Adobe Creative Cloud Learn",
            description: "Master Photoshop, Illustrator, and Premiere Pro official tutorials.",
            category: "skills", subCategory: "design",
            provider: "Adobe", duration: "Modular", students: "Global", level: "Creative",
            link: "https://helpx.adobe.com/creative-cloud/tutorials-explore.html",
            features: ["Creative Skills", "Project based"], isOfficial: false
        },
        {
            title: "Figma Mastery Hub",
            description: "UI/UX design tools and professional prototyping strategies.",
            category: "skills", subCategory: "design",
            provider: "Figma", duration: "Modular", students: "Global", level: "Designer",
            link: "https://www.figma.com/resource-library/design-basics/",
            features: ["UI/UX", "Industry Standard"], isOfficial: false
        },
        {
            title: "Canva Design School",
            description: "Master graphic design, video, and presentations for business.",
            category: "skills", subCategory: "design",
            provider: "Canva", duration: "Short modules", students: "10M+", level: "Creative",
            link: "https://designschool.canva.com/",
            features: ["Quick Design", "Templates"], isOfficial: false
        },
        {
            title: "Dribbble Learn",
            description: "Design interactive workshops and tutorials from the world's best designers.",
            category: "skills", subCategory: "design",
            provider: "Dribbble", duration: "Project based", students: "1M+", level: "Professional",
            link: "https://dribbble.com/learn",
            features: ["Portfolios", "Aesthetics", "Logo Design"], isOfficial: false
        },
        {
            title: "Webflow University",
            description: "Master professional web design and build site structures visually.",
            category: "skills", subCategory: "design",
            provider: "Webflow", duration: "Video", students: "500K+", level: "Low-code Designer",
            link: "https://university.webflow.com/",
            features: ["No-code", "CMS", "Layouts"], isOfficial: false
        },
        {
            title: "Framer Academy",
            description: "Learn high-fidelity prototyping and interactive design for modern products.",
            category: "skills", subCategory: "design",
            provider: "Framer", duration: "Modular", students: "200K+", level: "Product Designer",
            link: "https://www.framer.com/academy/",
            features: ["Interaction", "Prototyping", "UI"], isOfficial: false
        },
        {
            title: "Behance Tutorials",
            description: "Inspiration and technique guides from world-class creative professionals.",
            category: "skills", subCategory: "design",
            provider: "Adobe Behance", duration: "Flex", students: "2M+", level: "Artist",
            link: "https://www.behance.net/live",
            features: ["Fine Arts", "Exhibition", "Photography"], isOfficial: false
        },
        {
            title: "Blender Guru Hub",
            description: "Master 3D modeling, rendering, and sculpting with Blender.",
            category: "skills", subCategory: "design",
            provider: "Andrew Price", duration: "Deep Tutorials", students: "5M+", level: "3D Artist",
            link: "https://www.blenderguru.com/",
            features: ["Modeling", "Render", "3D Basics"], isOfficial: false
        },
        {
            title: "Sketch Docs & Guides",
            description: "Master macOS app design with official Sketch resources.",
            category: "skills", subCategory: "design",
            provider: "Sketch", duration: "Reference", students: "2M+", level: "Designer",
            link: "https://www.sketch.com/docs/",
            features: ["macOS Design", "Vectors"], isOfficial: false
        },
        {
            title: "InVision Learn",
            description: "Best practices for product design and collaboration.",
            category: "skills", subCategory: "design",
            provider: "InVision", duration: "Library", students: "1M+", level: "UX/UI",
            link: "https://www.invisionapp.com/inside-design",
            features: ["Design Ops", "Collab"], isOfficial: false
        },

        // Marketing & Business
        {
            title: "HubSpot Academy",
            description: "Free certification for Inbound Marketing and Sales skills.",
            category: "skills", subCategory: "business",
            provider: "HubSpot", duration: "2-10 hours", students: "500K+", level: "Business",
            link: "https://academy.hubspot.com/",
            features: ["Marketing", "Sales", "HubSpot"], isOfficial: false
        },
        {
            title: "Salesforce Trailhead",
            description: "Gamified learning for Salesforce admin and developer skills.",
            category: "skills", subCategory: "business",
            provider: "Salesforce", duration: "Modular", students: "3M+", level: "Beginner",
            link: "https://trailhead.salesforce.com/",
            features: ["CRM Mastery", "Badges"], isOfficial: false
        },
        {
            title: "SAP Learning Hub",
            description: "Official training for ERP and business solution modules.",
            category: "skills", subCategory: "business",
            provider: "SAP", duration: "Long-term", students: "1.2M+", level: "Business Tech",
            link: "https://learning.sap.com/",
            features: ["ERP Skills", "S/4HANA"], isOfficial: false
        },
        {
            title: "Google Analytics Academy",
            description: "Official training for data analytics and measurement with GA4.",
            category: "skills", subCategory: "business",
            provider: "Google Marketing", duration: "Modular", students: "50M+", level: "Data/Digital",
            link: "https://analytics.google.com/analytics/academy/",
            features: ["GA4", "Analysis", "Tracking"], isOfficial: false
        },
        {
            title: "Meta Blueprint",
            description: "Official marketing training for Facebook, Instagram, and WhatsApp Ads.",
            category: "skills", subCategory: "business",
            provider: "Meta", duration: "Modular", students: "100M+", level: "Marketing Pro",
            link: "https://www.facebook.com/business/learn",
            features: ["Ads Manager", "Engagement", "Marketing"], isOfficial: false
        },
        {
            title: "Twitter Flight School",
            description: "Master advertising and campaigns on X (formerly Twitter).",
            category: "skills", subCategory: "business",
            provider: "Twitter / X", duration: "Flex", students: "5M+", level: "Marketing Ads",
            link: "https://www.twitterflightschool.com/",
            features: ["Campaigns", "Ads", "Social Media"], isOfficial: false
        },
        {
            title: "LinkedIn Learning Free Hub",
            description: "Selection of free professional certification paths for business skills.",
            category: "skills", subCategory: "business",
            provider: "LinkedIn", duration: "Video", students: "Global", level: "Professional",
            link: "https://www.linkedin.com/learning/free-courses",
            features: ["Leadership", "Management", "Business"], isOfficial: false
        },
        {
            title: "Moz Academy",
            description: "Master Search Engine Optimization and link building strategies.",
            category: "skills", subCategory: "business",
            provider: "Moz", duration: "Modular", students: "500K+", level: "SEO Specialist",
            link: "https://moz.com/training",
            features: ["SEO", "Keywords", "Backlinks"], isOfficial: false
        },
        {
            title: "Semrush Academy",
            description: "Practical digital marketing training with certs from SEO industry leader.",
            category: "skills", subCategory: "business",
            provider: "Semrush", duration: "Units", students: "1M+", level: "Digital Pro",
            link: "https://www.semrush.com/academy/",
            features: ["Content", "Market Analysis", "SEO"], isOfficial: false
        },
        {
            title: "Shopify School",
            description: "Learn to build and grow your own e-commerce business empire.",
            category: "skills", subCategory: "business",
            provider: "Shopify", duration: "Modular", students: "2M+", level: "Entrepreneur",
            link: "https://www.shopify.com/learn",
            features: ["E-commerce", "Dropshipping", "Sales"], isOfficial: false
        },
        {
            title: "MooC.org Free Courses",
            description: "Aggregator of free massive open online courses (MOOCs) for lifelong learners.",
            category: "digital",
            provider: "Global Community",
            duration: "Flexible",
            students: "Global",
            level: "Self-help",
            link: "https://mooc.org/",
            features: ["Global topics", "No entry bar", "Diversified"],
            isOfficial: false
        }
    ]


    const filteredPlatforms = platforms.filter(p => {
        if (selectedCategory === 'all') return true;
        if (p.category !== selectedCategory) return false;
        if (selectedCategory === 'internship' && selectedSubCategory !== 'all') {
            return p.subCategory === selectedSubCategory;
        }
        if (selectedCategory === 'skills' && selectedSkillSubCategory !== 'all') {
            return p.subCategory === selectedSkillSubCategory;
        }
        return true;
    })

    // Show only 4 platforms initially, then all on "View More"
    const displayedPlatforms = showAll ? filteredPlatforms : filteredPlatforms.slice(0, 4)

    return (
        <div className="learning-hub-page">
            <div className="container">
                <div className="page-header">
                    <h1>Learning & Skill Development</h1>
                    <p>Access free government-approved courses, certifications, and real-time internships to enhance your career</p>
                </div>

                {/* Stats Section */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Users size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{platforms.length}+</div>
                            <div className="stat-label">Active Portals</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Award size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">100%</div>
                            <div className="stat-label">Free Courses</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">1000+</div>
                            <div className="stat-label">Certifications</div>
                        </div>
                    </div>
                </div>

                {/* Category Filters */}
                <div className="category-filters">
                    {categories.map(category => (
                        <button
                            key={category.value}
                            className={`filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedCategory(category.value)
                                setShowAll(false) // Reset to show only 4 when changing category
                            }}
                        >
                            {category.icon}
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Internship Sub-Categories */}
                {selectedCategory === 'internship' && (
                    <div className="sub-category-filters">
                        {internshipSubCategories.map(sub => (
                            <button
                                key={sub.value}
                                className={`sub-filter-btn ${selectedSubCategory === sub.value ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedSubCategory(sub.value)
                                    setShowAll(false)
                                }}
                            >
                                {sub.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Skill Sub-Categories */}
                {selectedCategory === 'skills' && (
                    <div className="sub-category-filters">
                        {skillSubCategories.map(sub => (
                            <button
                                key={sub.value}
                                className={`sub-filter-btn ${selectedSkillSubCategory === sub.value ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedSkillSubCategory(sub.value)
                                    setShowAll(false)
                                }}
                            >
                                {sub.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Learning Platforms Grid */}
                <div className="platforms-grid">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading curated platforms...</p>
                        </div>
                    ) : displayedPlatforms.map((platform, index) => (
                        <div key={index} className="platform-card">
                            <div className="platform-header">
                                <div className="header-badges">
                                    <span className={`badge badge-${platform.level === 'Beginner' ? 'success' :
                                        platform.level === 'Intermediate' ? 'warning' :
                                            platform.level === 'Advanced' ? 'error' :
                                                'info'
                                        }`}>
                                        {platform.level}
                                    </span>
                                    {platform.isOfficial && (
                                        <span className="badge badge-primary">
                                            <Award size={14} />
                                            Official
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3>{platform.title}</h3>
                            <p className="platform-description">{platform.description}</p>

                            <div className="platform-meta">
                                <div className="meta-row">
                                    <div className="meta-item">
                                        <GraduationCap size={16} />
                                        <span>{platform.provider}</span>
                                    </div>
                                </div>
                                <div className="meta-row">
                                    <div className="meta-item">
                                        <Clock size={16} />
                                        <span>{platform.duration}</span>
                                    </div>
                                    <div className="meta-item">
                                        <Users size={16} />
                                        <span>{platform.students}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="platform-features">
                                {platform.features.map((feature, idx) => (
                                    <span key={idx} className="feature-tag">
                                        {feature}
                                    </span>
                                ))}
                            </div>

                            <div className="platform-actions">
                                <a
                                    href={platform.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => trackPlatformVisit(platform)}
                                >
                                    {platform.category === 'internship' ? (
                                        <>
                                            <Briefcase size={16} />
                                            Show Internship
                                        </>
                                    ) : (
                                        <>
                                            <Play size={16} />
                                            Start Learning
                                        </>
                                    )}
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View More Button */}
                {filteredPlatforms.length > 4 && (
                    <div className="view-more-section">
                        <button
                            className="view-more-btn"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? 'Show Less' : `View More (${filteredPlatforms.length - 4} more)`}
                        </button>
                    </div>
                )}

                {/* Additional Resources */}
                <div className="additional-resources">
                    <h2>More Learning Resources</h2>
                    <div className="resources-list">
                        <a href="https://www.coursera.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
                            <BookOpen size={20} />
                            <div>
                                <h4>Coursera</h4>
                                <p>Free courses from top universities worldwide</p>
                            </div>
                            <ExternalLink size={16} />
                        </a>
                        <a href="https://www.edx.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
                            <GraduationCap size={20} />
                            <div>
                                <h4>edX</h4>
                                <p>University-level courses in various subjects</p>
                            </div>
                            <ExternalLink size={16} />
                        </a>
                        <a href="https://www.khanacademy.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
                            <BookOpen size={20} />
                            <div>
                                <h4>Khan Academy</h4>
                                <p>Free education for anyone, anywhere</p>
                            </div>
                            <ExternalLink size={16} />
                        </a>
                        <a href="https://www.udemy.com/courses/free/" target="_blank" rel="noopener noreferrer" className="resource-link">
                            <Code size={20} />
                            <div>
                                <h4>Udemy Free Courses</h4>
                                <p>Thousands of free courses on various topics</p>
                            </div>
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LearningHub
