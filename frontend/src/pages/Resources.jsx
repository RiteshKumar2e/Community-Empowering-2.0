import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { Search, Filter, ExternalLink, Building, Users, Briefcase, GraduationCap, Heart, Home, Leaf, BookOpen, Award, Baby, Accessibility, Rocket } from 'lucide-react'
import api from '../services/api'
import '../styles/Resources.css'

const Resources = () => {
    const { t } = useLanguage()
    const [resources, setResources] = useState([])
    const [filteredResources, setFilteredResources] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)
    const [selectedSubCategory, setSelectedSubCategory] = useState('all')

    const subCategories = [
        { value: 'all', label: 'All Education' },
        { value: 'higher', label: 'Higher Education' },
        { value: 'backward', label: 'Backward Classes' },
        { value: 'research', label: 'Research Purposes' },
        { value: 'scholarship', label: 'Scholarships' },
        { value: 'age', label: 'Age Group Schemes' }
    ]

    const categories = [
        { value: 'all', label: 'All Resources', icon: <Building size={18} /> },
        { value: 'schemes', label: 'Government Schemes', icon: <Building size={18} /> },
        { value: 'education', label: 'Education', icon: <GraduationCap size={18} /> },
        { value: 'healthcare', label: 'Healthcare', icon: <Heart size={18} /> },
        { value: 'housing', label: 'Housing', icon: <Home size={18} /> },
        { value: 'agriculture', label: 'Agriculture', icon: <Leaf size={18} /> },
        { value: 'jobs', label: 'Employment', icon: <Briefcase size={18} /> },
        { value: 'women', label: 'Women & Child', icon: <Baby size={18} /> },
        { value: 'disability', label: 'Disability Support', icon: <Accessibility size={18} /> },
        { value: 'startup', label: 'Startups & Business', icon: <Rocket size={18} /> }
    ]

    // Real Government Resources and Schemes - 60+ Verified Items
    const governmentResources = [
        // --- EDUCATION ---
        {
            title: "PM-YASASVI Scheme",
            description: "Pre-Matric and Post-Matric Scholarship for OBC, EBC, and DNT students. Financial assistance for education from Class 9 to Post-Graduation.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "OBC/EBC/DNT students, Family income < ₹2.5 lakh/year",
            link: "https://socialjustice.gov.in/schemes/pm-yasasvi",
            provider: "Ministry of Social Justice & Empowerment",
            isNew: true
        },
        {
            title: "National Scholarship Portal",
            description: "One-stop solution for various scholarships from Central and State Governments. Apply for Pre-Matric, Post-Matric, Merit-cum-Means scholarships.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "Students from Class 1 to Post-Graduation",
            link: "https://scholarships.gov.in/",
            provider: "Government of India"
        },
        {
            title: "SWAYAM - NPTEL",
            description: "Online courses and certification for Higher Education and Career Growth. Courses from IITs and IIMs available for free.",
            category: "education",
            subCategory: "higher",
            eligibility: "All students and lifelong learners",
            link: "https://swayam.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "PMRF (Prime Minister's Research Fellowship)",
            description: "Highest level of research fellowship for students in IITs, IISc, NITs for PhD programs in Science & Technology.",
            category: "education",
            subCategory: "research",
            eligibility: "B.Tech/Masters graduates with high GATE/GPA",
            link: "https://pmrf.in/",
            provider: "Department of Higher Education"
        },
        {
            title: "National Overseas Scholarship",
            description: "Financial assistance to SC, ST, and Landless Labourers' children for pursuing Master's and PhD degrees in foreign universities.",
            category: "education",
            subCategory: "backward",
            eligibility: "SC/ST students with < ₹6 lakh annual family income",
            link: "https://nosmsje.gov.in/",
            provider: "Ministry of Social Justice"
        },
        {
            title: "Vidya Lakshmi Portal",
            description: "Single window for Students to access Information and apply for Educational Loans provided by banks.",
            category: "education",
            subCategory: "higher",
            eligibility: "All students seeking education loans",
            link: "https://www.vidyalakshmi.co.in/",
            provider: "NSDL / Ministry of Finance"
        },
        {
            title: "AICTE Pragati Scholarship",
            description: "Scholarship for girl students for technical education. Assistance for Tuition Fee and Incidentals.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "Girl students in first year of Degree/Diploma",
            link: "https://www.aicte-india.org/schemes/students-development-schemes/pragati",
            provider: "AICTE"
        },
        {
            title: "INSPIRE Fellowship",
            description: "Support for research in Basic and Applied Sciences for university toppers to pursue PhD.",
            category: "education",
            subCategory: "research",
            eligibility: "University 1st rank holders in Science streams",
            link: "https://online-inspire.gov.in/",
            provider: "Department of Science & Technology"
        },
        {
            title: "Pre-Matric Scholarship for ST",
            description: "Financial support to ST students studying in classes 9 and 10 to reduce dropout rates.",
            category: "education",
            subCategory: "backward",
            eligibility: "ST students, Family income < ₹2.5 lakh",
            link: "https://tribal.nic.in/",
            provider: "Ministry of Tribal Affairs"
        },
        {
            title: "Ishan Uday Scholarship",
            description: "Special scholarship for students from the North Eastern Region for general degree, technical and professional courses.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "Students from NER region only",
            link: "https://www.ugc.ac.in/ishi_uday/",
            provider: "University Grants Commission (UGC)"
        },
        {
            title: "PM-Poshan (Mid Day Meal)",
            description: "Nutrition scheme for school children. Daily hot cooked meals for students in government schools.",
            category: "education",
            subCategory: "age",
            eligibility: "Children in Class 1 to 8",
            link: "https://pmposhan.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "Samagra Shiksha",
            description: "Integrated school education program. Holistic support from pre-school to senior secondary level.",
            category: "education",
            subCategory: "age",
            eligibility: "All school-going children and teachers",
            link: "https://samagra.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "Balika Samridhi Yojana",
            description: "Financial assistance for the birth and education of girls. Focuses on attitude towards girl children.",
            category: "education",
            subCategory: "age",
            eligibility: "Girl children from BPL families",
            link: "https://wcd.nic.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Kasturba Gandhi Balika Vidyalaya",
            description: "Residential schools at upper primary level for girls belonging to SC, ST, OBC and minorities.",
            category: "education",
            subCategory: "age",
            eligibility: "Girls from marginalized communities",
            link: "https://samagra.education.gov.in/kgbv.html",
            provider: "Ministry of Education"
        },
        {
            title: "National Means cum Merit Scholarship",
            description: "Scholarship to prevent dropouts in Class 8 and encourage students to continue secondary education.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "Students with < ₹3.5 lakh annual income",
            link: "https://dsel.education.gov.in/scheme/nmms",
            provider: "Department of Education"
        },

        // --- HEALTHCARE ---
        {
            title: "Ayushman Bharat - PM-JAY",
            description: "World's largest health insurance scheme. Free treatment up to ₹5 lakh per family per year.",
            category: "healthcare",
            eligibility: "SECC 2011 identified families",
            link: "https://pmjay.gov.in/",
            provider: "National Health Authority"
        },
        {
            title: "PM Jan Aushadhi Pariyojana",
            description: "Providing quality generic medicines at affordable prices to all through special outlets.",
            category: "healthcare",
            eligibility: "All citizens (especially poor)",
            link: "http://janaushadhi.gov.in/",
            provider: "Department of Pharmaceuticals"
        },
        {
            title: "Janani Suraksha Yojana (JSY)",
            description: "Cash assistance for pregnant women for institutional delivery. Safe motherhood initiative.",
            category: "healthcare",
            eligibility: "Pregnant women from BPL/SC/ST families",
            link: "https://nhm.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "Pradhan Mantri Matru Vandana Yojana",
            description: "Maternity benefit program. Direct cash transfer of ₹5,000 in three installments.",
            category: "healthcare",
            eligibility: "Pregnant and lactating mothers",
            link: "https://pmmvy.wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Mission Indradhanush",
            description: "Universal immunization program. Full immunization for all children under 2 years.",
            category: "healthcare",
            eligibility: "Unvaccinated children and mothers",
            link: "https://nhm.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "Nikshay Poshan Yojana",
            description: "Financial incentive of ₹500 per month for nutritional support to TB patients.",
            category: "healthcare",
            eligibility: "All TB patients registered on NIKSHAY portal",
            link: "https://tbcindia.gov.in/",
            provider: "National TB Elimination Program"
        },
        {
            title: "e-Sanjeevani Teleconsultation",
            description: "Stay Home OPD. Telemedicine service providing free medical consultation online.",
            category: "healthcare",
            eligibility: "All Indian citizens",
            link: "https://esanjeevaniopd.in/",
            provider: "Ministry of Health & Family Welfare"
        },
        {
            title: "Rashtriya Bal Swasthya Karyakram",
            description: "Early identification and early intervention for 30 health conditions in children (4 Ds).",
            category: "healthcare",
            eligibility: "Children from birth to 18 years",
            link: "https://rbsk.nhm.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "National Health Mission (NHM)",
            description: "Universal access to equitable, affordable and quality health care services.",
            category: "healthcare",
            eligibility: "General Public",
            link: "https://nhm.gov.in/",
            provider: "Government of India"
        },
        {
            title: "PM-Suraksha Bima Yojana",
            description: "Accidental insurance cover of ₹2 lakh at an ultra-low premium of ₹20 per year.",
            category: "healthcare",
            eligibility: "Bank account holders aged 18-70",
            link: "https://jansuraksha.gov.in/",
            provider: "Ministry of Finance"
        },

        // --- AGRICULTURE ---
        {
            title: "PM-KISAN",
            description: "Direct income support of ₹6,000 per year to landholding farmers.",
            category: "agriculture",
            eligibility: "All landholding farmer families",
            link: "https://pmkisan.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "Kisan Credit Card (KCC)",
            description: "Short term credit for farmers to meet their financial requirements for cultivation.",
            category: "agriculture",
            eligibility: "Farmers, tenant farmers, sharecroppers",
            link: "https://www.india.gov.in/",
            provider: "Various Banks"
        },
        {
            title: "PM Fasal Bima Yojana",
            description: "Crop insurance scheme for farmers against non-preventable natural risks.",
            category: "agriculture",
            eligibility: "All farmers growing notified crops",
            link: "https://pmfby.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "e-NAM (National Agriculture Market)",
            description: "Online trading platform for agricultural commodities in India.",
            category: "agriculture",
            eligibility: "Farmers, traders, and local mandis",
            link: "https://www.enam.gov.in/",
            provider: "Small Farmers' Agribusiness Consortium"
        },
        {
            title: "PM-KUSUM",
            description: "Solar pumps and grid-connected solar power plants for farmers.",
            category: "agriculture",
            eligibility: "Individual farmers and Cooperatives",
            link: "https://pmkusum.mnre.gov.in/",
            provider: "Ministry of New & Renewable Energy"
        },
        {
            title: "Soil Health Card Scheme",
            description: "Customized crop-specific recommendations for fertilizer use to help farmers.",
            category: "agriculture",
            eligibility: "All farmers in India",
            link: "https://www.soilhealth.dac.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "PM Krishi Sinchai Yojana",
            description: "Ensuring protective irrigation to all agricultural farms in the country.",
            category: "agriculture",
            eligibility: "States and individual landholders",
            link: "https://pmksy.gov.in/",
            provider: "Department of Agriculture"
        },
        {
            title: "Paramparagat Krishi Vikas Yojana",
            description: "Promotion of organic farming through a cluster-based approach.",
            category: "agriculture",
            eligibility: "Farmer groups (at least 50 farmers)",
            link: "https://pgsindia-ncof.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "National Bamboo Mission",
            description: "Support for bamboo plantation and making bamboo industries sustainable.",
            category: "agriculture",
            eligibility: "Farmers and Entrepreneurs",
            link: "https://nbm.nic.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "PM Matsya Sampada Yojana",
            description: "Development of fisheries sector with financial support for fishers.",
            category: "agriculture",
            eligibility: "Fishers and Fish farmers",
            link: "https://pmmsy.dof.gov.in/",
            provider: "Department of Fisheries"
        },

        // --- EMPLOYMENT & BUSINESS ---
        {
            title: "MGNREGA",
            description: "100 days of guaranteed wage employment to every rural household.",
            category: "jobs",
            eligibility: "Adult members of rural households",
            link: "https://nrega.nic.in/",
            provider: "Ministry of Rural Development"
        },
        {
            title: "PM Mudra Yojana",
            description: "Loans up to ₹10 lakh for small business activities in non-farm sectors.",
            category: "jobs",
            eligibility: "Micro-enterprises and Retailers",
            link: "https://www.mudra.org.in/",
            provider: "MUDRA Ltd"
        },
        {
            title: "Start Up India",
            description: "Recognition and support for new startups including tax exemptions.",
            category: "jobs",
            eligibility: "New innovative businesses in India",
            link: "https://www.startupindia.gov.in/",
            provider: "DPIIT"
        },
        {
            title: "Stand Up India",
            description: "Loans targeted at SC/ST and Women entrepreneurs for greenfield projects.",
            category: "jobs",
            eligibility: "SC/ST and Women above 18 years",
            link: "https://www.standupmitra.in/",
            provider: "SIDBI"
        },
        {
            title: "PM-EGP (Employment Generation)",
            description: "Credit linked subsidy program for setting up small enterprises.",
            category: "jobs",
            eligibility: "Individuals above 18, self-help groups",
            link: "https://www.kviconline.gov.in/pmegpeportal/",
            provider: "KVIC"
        },
        {
            title: "National Career Service",
            description: "Job seeker registration, career counseling, and job matching services.",
            category: "jobs",
            eligibility: "All unemployed youth",
            link: "https://www.ncs.gov.in/",
            provider: "Ministry of Labour"
        },
        {
            title: "e-Shram Portal",
            description: "Database of unorganized workers to provide social security benefits.",
            category: "jobs",
            eligibility: "Unorganized workers aged 16-59",
            link: "https://eshram.gov.in/",
            provider: "Ministry of Labour"
        },
        {
            title: "Lakhpati Didi",
            description: "Skilling women in SHGs to earn at least ₹1 lakh annually.",
            category: "jobs",
            eligibility: "Women in SHGs",
            link: "https://nrlm.gov.in/",
            provider: "Ministry of Rural Development"
        },
        {
            title: "PM SVANidhi",
            description: "Micro-credit for street vendors up to ₹10,000 for working capital.",
            category: "jobs",
            eligibility: "Street vendors in urban areas",
            link: "https://pmsvanidhi.mohua.gov.in/",
            provider: "Ministry of Housing & Urban Affairs"
        },
        {
            title: "Skill India Mission",
            description: "Empowering youth with industrial/vocational skill training.",
            category: "jobs",
            eligibility: "School/College dropouts and youth",
            link: "https://www.skillindia.gov.in/",
            provider: "MSDE"
        },

        // --- HOUSING & INFRA ---
        {
            title: "PMAY-Urban",
            description: "Affordable housing for urban poor with interest subsidies.",
            category: "housing",
            eligibility: "Economically Weaker Sections (EWS)",
            link: "https://pmay-urban.gov.in/",
            provider: "Ministry of Housing"
        },
        {
            title: "PMAY-Gramin",
            description: "Housing assistance for rural households without a pucca house.",
            category: "housing",
            eligibility: "Rural families in SECC list",
            link: "https://pmayg.nic.in/",
            provider: "Ministry of Rural Development"
        },
        {
            title: "Jal Jeevan Mission",
            description: "Providing functional tap connection to every rural household (Har Ghar Jal).",
            category: "housing",
            eligibility: "Rural households",
            link: "https://jaljeevanmission.gov.in/",
            provider: "Ministry of Jal Shakti"
        },
        {
            title: "PM-Saubhagya",
            description: "Ensuring last mile connectivity and electricity connections to all un-electrified households.",
            category: "housing",
            eligibility: "Rural and Urban poor households",
            link: "https://saubhagya.gov.in/",
            provider: "Ministry of Power"
        },
        {
            title: "Solar Rooftop Subsidy",
            description: "Incentives for installing solar panels on rooftops for households.",
            category: "housing",
            eligibility: "Residential consumers",
            link: "https://solarrooftop.gov.in/",
            provider: "Ministry of New & Renewable Energy"
        },

        // --- SOCIAL WELFARE / OTHER ---
        {
            title: "Atal Pension Yojana",
            description: "Pension scheme for unorganized sector workers with guaranteed income.",
            category: "schemes",
            eligibility: "Citizens aged 18-40",
            link: "https://npscra.nsdl.co.in/",
            provider: "PFRDA"
        },
        {
            title: "Sukanya Samriddhi Yojana",
            description: "Small deposit scheme for the girl child with high interest rate.",
            category: "schemes",
            eligibility: "Girl child aged < 10 years",
            link: "https://www.india.gov.in/",
            provider: "Ministry of Finance"
        },
        {
            title: "One Nation One Ration Card",
            description: "Portability of food security benefits across the country.",
            category: "schemes",
            eligibility: "Ration card holders (NFSA)",
            link: "https://nfsa.gov.in/",
            provider: "Ministry of Consumer Affairs"
        },
        {
            title: "Ujjwala 2.0",
            description: "LPG connections for women from BPL families without deposit.",
            category: "schemes",
            eligibility: "Adult women of BPL households",
            link: "https://www.pmuy.gov.in/",
            provider: "Ministry of Petroleum"
        },
        {
            title: "PM Jan Dhan Yojana",
            description: "Universal access to banking facilities with zero balance account.",
            category: "schemes",
            eligibility: "All unbanked citizens",
            link: "https://pmjdy.gov.in/",
            provider: "Department of Financial Services"
        },
        {
            title: "Beti Bachao Beti Padhao",
            description: "Preventing gender-biased sex selection and ensuring girl's education.",
            category: "schemes",
            eligibility: "General Public",
            link: "https://wcd.nic.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "PM Vishwakarma",
            description: "End-to-end support for traditional artisans and craftspeople.",
            category: "jobs",
            eligibility: "Traditional artisans (Sculptors, Potter, etc.)",
            link: "https://pmvishwakarma.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "PM-JANMAN",
            description: "Justice for Janjati Adivasi through comprehensive development.",
            category: "schemes",
            eligibility: "Particularly Vulnerable Tribal Groups (PVTGs)",
            link: "https://tribal.nic.in/",
            provider: "Ministry of Tribal Affairs"
        },
        {
            title: "SMILE Scheme",
            description: "Support for marginalized individuals for Livelihood and Enterprise.",
            category: "schemes",
            eligibility: "Transgender persons and people engaged in begging",
            link: "https://socialjustice.gov.in/",
            provider: "Ministry of Social Justice"
        },
        {
            title: "PM-DAKSH",
            description: "Skill development for marginalized sections to make them employable.",
            category: "jobs",
            eligibility: "SC, OBC, EBC and Safai Karamcharis",
            link: "https://pmdaksh.dosje.gov.in/",
            provider: "Ministry of Social Justice"
        },

        // --- WOMEN & CHILD ---
        {
            title: "Pradhan Mantri Matru Vandana Yojana",
            description: "Maternity benefit program providing cash incentives for pregnant and lactating mothers.",
            category: "women",
            eligibility: "Pregnant and lactating mothers",
            link: "https://pmmvy.wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Mahila Coir Yojana",
            description: "Skill development program for women artisans in the coir industry.",
            category: "women",
            eligibility: "Rural women and artisans",
            link: "https://coirboard.gov.in/",
            provider: "Coir Board"
        },
        {
            title: "STEP Scheme",
            description: "Support to Training and Employment Programme for Women to provide skills that lead to employability.",
            category: "women",
            eligibility: "Women aged 16 years and above",
            link: "https://wcd.nic.in/schemes/support-training-and-employment-programme-women-step",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Mahila Shakti Kendra",
            description: "Empowering rural women through community participation and providing convergence of government schemes.",
            category: "women",
            eligibility: "Rural women in identified districts",
            link: "https://wcd.nic.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "One Stop Centre Scheme",
            description: "Support for women affected by violence, in private and public spaces, within the family, community and at the workplace.",
            category: "women",
            eligibility: "All women facing violence",
            link: "https://wcd.nic.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Nari Shakti Puraskar",
            description: "Highest civilian honor for women in India, recognizing exceptional achievements and contributions.",
            category: "women",
            eligibility: "Women and institutions working for women's empowerment",
            link: "https://narishaktipuraskar.wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Working Women Hostel",
            description: "Providing safe and affordable accommodation for working women with daycare facilities for their children.",
            category: "women",
            eligibility: "Working women, trainees under training for job",
            link: "https://wcd.nic.in/",
            provider: "Ministry of Women & Child Development"
        },

        // --- DISABILITY SUPPORT ---
        {
            title: "ADIP Scheme",
            description: "Assistance to Disabled Persons for Purchase/Fitting of Aids and Appliances (ADIP).",
            category: "disability",
            eligibility: "Persons with 40% or more disability, monthly income < ₹20,000",
            link: "https://depwd.gov.in/",
            provider: "Department of Empowerment of Persons with Disabilities"
        },
        {
            title: "National Fellowship for Students with Disabilities",
            description: "Fellowship for students with disabilities to pursue M.Phil and Ph.D. programs.",
            category: "disability",
            eligibility: "Students with disabilities pursuing higher education",
            link: "https://www.ugc.ac.in/",
            provider: "UGC / Ministry of Social Justice"
        },
        {
            title: "Deendayal Disabled Rehabilitation Scheme",
            description: "Financial assistance to NGOs for providing education, vocational training and rehabilitation of persons with disabilities.",
            category: "disability",
            eligibility: "NGOs and PwD beneficiaries",
            link: "https://socialjustice.gov.in/",
            provider: "Ministry of Social Justice"
        },
        {
            title: "Unique Disability ID (UDID)",
            description: "Creation of a national database for PwDs and providing a unique ID card for accessing government benefits.",
            category: "disability",
            eligibility: "All persons with disabilities",
            link: "https://www.swavlambancard.gov.in/",
            provider: "DEPwD"
        },
        {
            title: "Sugamya Bharat Abhiyan",
            description: "Accessible India Campaign to make the built environment, transport system, and ICT ecosystem accessible for PwDs.",
            category: "disability",
            eligibility: "All citizens (infrastructure focus)",
            link: "https://accessibleindia.gov.in/",
            provider: "Government of India"
        },
        {
            title: "NHFDC Loan Schemes",
            description: "Concessional loans for persons with disabilities for starting small businesses or professional education.",
            category: "disability",
            eligibility: "Persons with disabilities aged 18-60",
            link: "http://www.nhfdc.nic.in/",
            provider: "National Handicapped Finance and Development Corp"
        },

        // --- STARTUPS & BUSINESS ---
        {
            title: "Startup India Seed Fund Scheme",
            description: "Financial assistance to startups for proof of concept, prototype development, product trials, and market entry.",
            category: "startup",
            eligibility: "Startups recognized by DPIIT",
            link: "https://seedfund.startupindia.gov.in/",
            provider: "Department for Promotion of Industry and Internal Trade"
        },
        {
            title: "ASPIRE Scheme",
            description: "A Scheme for Promotion of Innovation, Rural Industries and Entrepreneurship.",
            category: "startup",
            eligibility: "Entrepreneurs and MSMEs",
            link: "https://aspire.msme.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "SFURTI Scheme",
            description: "Scheme of Fund for Regeneration of Traditional Industries for making traditional industries more productive and competitive.",
            category: "startup",
            eligibility: "Traditional industry clusters, NGOs, SHGs",
            link: "https://sfurti.msme.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "CLCS-TU Scheme",
            description: "Credit Linked Capital Subsidy and Technology Upgradation Scheme for MSMEs.",
            category: "startup",
            eligibility: "Micro and Small Enterprises",
            link: "https://msme.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "ZED Certification Scheme",
            description: "Zero Defect Zero Effect (ZED) Certification for MSMEs to encourage quality and environmental sustainability.",
            category: "startup",
            eligibility: "MSMEs with valid Udyam Registration",
            link: "https://zed.msme.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "SAMRIDH Scheme",
            description: "Startup Accelerator of MeitY for Product Innovation, Development and growth.",
            category: "startup",
            eligibility: "Startups and Accelerators",
            link: "https://www.meity.gov.in/",
            provider: "Ministry of Electronics & IT"
        },
        {
            title: "Mudra Loan Program",
            description: "Refinance support to banks for lending to micro-units in manufacturing, trading, and service sectors.",
            category: "startup",
            eligibility: "Small businesses and entrepreneurs",
            link: "https://www.mudra.org.in/",
            provider: "MUDRA Bank"
        },

        // --- ADDITIONAL RESOURCES ---
        {
            title: "Digital India BPO Promotion Scheme",
            description: "Incentives to BPO/ITES operations in small towns and cities to create employment.",
            category: "jobs",
            eligibility: "IT/ITES companies",
            link: "https://meity.gov.in/ibps",
            provider: "MeitY"
        },
        {
            title: "PLI for Electronics",
            description: "Production Linked Incentive scheme for large scale electronics manufacturing in India.",
            category: "startup",
            eligibility: "Manufacturing companies",
            link: "https://www.meity.gov.in/",
            provider: "Ministry of IT"
        },
        {
            title: "RKVY-RAFTAAR",
            description: "Rashtriya Krishi Vikas Yojana - Remunerative Approaches for Agriculture and Allied Sectors Rejuvenation.",
            category: "agriculture",
            eligibility: "States and Farmer Groups",
            link: "https://rkvy.nic.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "PM-ABHIM",
            description: "PM Ayushman Bharat Health Infrastructure Mission for strengthening health systems across levels.",
            category: "healthcare",
            eligibility: "General Public / Health Institutions",
            link: "https://nhm.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "Ayushman Bhava",
            description: "Campaign to ensure optimum delivery of health schemes to every intended beneficiary.",
            category: "healthcare",
            eligibility: "All citizens",
            link: "https://ayushmanbhava.mohfw.gov.in/",
            provider: "National Health Authority"
        },
        {
            title: "SVAMITVA Scheme",
            description: "Survey of Villages and Mapping with Improvised Technology in Village Areas for property validation.",
            category: "schemes",
            eligibility: "Rural property owners",
            link: "https://svamitva.nic.in/",
            provider: "Ministry of Panchayati Raj"
        },
        {
            title: "PM-PRANAM",
            description: "PM Programme for Restoration, Awareness, Nourishment and Amelioration of Mother Earth (Reduction of Chemical Fertilizers).",
            category: "agriculture",
            eligibility: "Farmers and State Governments",
            link: "https://fert.nic.in/",
            provider: "Ministry of Chemicals & Fertilizers"
        },
        {
            title: "Namami Gange",
            description: "Integrated Conservation Mission to check pollution, conservation and rejuvenation of National River Ganga.",
            category: "schemes",
            eligibility: "General Public / Communities along Ganga",
            link: "https://nmcg.nic.in/",
            provider: "National Mission for Clean Ganga"
        },
        {
            title: "PM Van Dhan Yojana",
            description: "Livelihood generation for tribals by harnessing non-timber forest produce.",
            category: "jobs",
            eligibility: "Tribal gatherers and SHGs",
            link: "https://trifed.tribal.gov.in/",
            provider: "TRIFED"
        },
        {
            title: "National Digital Health Mission",
            description: "Digital health ecosystem for India, including ABHA (Health ID) and digital health records.",
            category: "healthcare",
            eligibility: "All Indian citizens",
            link: "https://abdm.gov.in/",
            provider: "NHA"
        },
        {
            title: "E-Shram Card",
            description: "Registration of unorganized workers to facilitate social security benefits and accidental insurance cover.",
            category: "schemes",
            eligibility: "Unorganized workers aged 16-59",
            link: "https://eshram.gov.in/",
            provider: "Ministry of Labour & Employment"
        },
        {
            title: "PM SHRI Schools",
            description: "PM Schools for Rising India - upgraded schools with modern infrastructure and pedagogical techniques.",
            category: "education",
            eligibility: "Students in government schools",
            link: "https://pmshrischools.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "National Apprenticeship Promotion Scheme",
            description: "Incentivizing employers to engage apprentices and providing training for youth.",
            category: "jobs",
            eligibility: "Apprentices and Training Providers",
            link: "https://www.apprenticeshipindia.gov.in/",
            provider: "MSDE"
        },
        {
            title: "Operation Greens",
            description: "Integrated development of Tomato, Onion and Potato (TOP) value chain to prevent price volatility.",
            category: "agriculture",
            eligibility: "Farmers and Food Processors",
            link: "https://mofpi.gov.in/",
            provider: "Ministry of Food Processing"
        },
        {
            title: "PM DevINE",
            description: "Prime Minister’s Development Initiative for North East Region to fund infrastructure and social development projects.",
            category: "schemes",
            eligibility: "NE Region projects and communities",
            link: "https://mdoner.gov.in/",
            provider: "MDoNER"
        },
        {
            title: "Mahila Samman Saving Certificate",
            description: "Small savings scheme for women with attractive interest rates and partial withdrawal options.",
            category: "women",
            eligibility: "Women and Girl Child",
            link: "https://www.indiapost.gov.in/",
            provider: "Department of Posts"
        },
        {
            title: "MISHTI Scheme",
            description: "Mangrove Initiative for Shoreline Habitats & Tangible Incomes for mangrove plantation along coastline.",
            category: "schemes",
            eligibility: "Coastal communities and environmental agencies",
            link: "https://moef.gov.in/",
            provider: "Ministry of Environment & Forests"
        },
        {
            title: "Amrit Bharat Station Scheme",
            description: "Modernization of railway stations across the country with enhanced passenger amenities.",
            category: "housing",
            eligibility: "Rail passengers",
            link: "https://indianrailways.gov.in/",
            provider: "Ministry of Railways"
        },
        {
            title: "PM-Jivan Jyoti Bima Yojana",
            description: "Life insurance cover of ₹2 lakh for savings bank account holders for an annual premium of ₹436.",
            category: "schemes",
            eligibility: "Bank account holders aged 18-50",
            link: "https://jansuraksha.gov.in/",
            provider: "Ministry of Finance"
        },
        {
            title: "NSAP (Social Assistance)",
            description: "Financial assistance to the elderly, widows and persons with disabilities in the form of social pensions.",
            category: "schemes",
            eligibility: "BPL households, senior citizens, widows",
            link: "https://nsap.nic.in/",
            provider: "Ministry of Rural Development"
        },
        {
            title: "Atal Bhujal Yojana",
            description: "Sustainable management of ground water resources with community participation.",
            category: "agriculture",
            eligibility: "Gram Panchayats in identified regions",
            link: "https://ataljal.mowr.gov.in/",
            provider: "Ministry of Jal Shakti"
        },
        {
            title: "National Logistics Policy",
            description: "Reducing cost of logistics and improving efficiency for global competitiveness of Indian products.",
            category: "startup",
            eligibility: "Logistics companies and entrepreneurs",
            link: "https://logistics.gov.in/",
            provider: "DPIIT"
        }
    ]


    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true)
                const response = await api.get('/resources')
                const dbResources = response.data || []

                // Combine hardcoded with DB resources, avoiding duplicates by title
                const combined = [...governmentResources]
                dbResources.forEach(dbR => {
                    if (!combined.find(h => h.title === dbR.title)) {
                        combined.unshift(dbR)
                    }
                })

                setResources(combined)
            } catch (error) {
                console.error('Error fetching resources:', error)
                setResources(governmentResources)
            } finally {
                setLoading(false)
            }
        }
        fetchResources()
    }, [])

    useEffect(() => {
        filterResources()
    }, [searchQuery, selectedCategory, selectedSubCategory, resources])

    const filterResources = () => {
        let filtered = resources

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(r => r.category === selectedCategory)

            // Sub-category filter for Education
            if (selectedCategory === 'education' && selectedSubCategory !== 'all') {
                filtered = filtered.filter(r => r.subCategory === selectedSubCategory)
            }
        }

        if (searchQuery) {
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.provider.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredResources(filtered)
    }

    // Show only 4 resources initially, then all on "View More"
    const displayedResources = showAll ? filteredResources : filteredResources.slice(0, 4)

    return (
        <div className="resources-page">
            <div className="container">
                <div className="page-header">
                    <h1>Government Resources & Schemes</h1>
                    <p>Access official government schemes, programs, and resources for your benefit</p>
                </div>

                {/* Stats Section */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{resources.length}+</div>
                            <div className="stat-label">Active Schemes</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Search size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">10</div>
                            <div className="stat-label">Categories</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Award size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">100%</div>
                            <div className="stat-label">Official Sources</div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="search-filter-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search schemes, programs, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category.value}
                                className={`filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedCategory(category.value)
                                    setSelectedSubCategory('all')
                                    setShowAll(false)
                                }}
                            >
                                {category.icon}
                                {category.label}
                            </button>
                        ))}
                    </div>

                    {selectedCategory === 'education' && (
                        <div className="education-sub-filters fade-in">
                            {subCategories.map(sub => (
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
                </div>

                {/* Resources Grid */}
                <div className="resources-grid">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading government resources...</p>
                        </div>
                    ) : displayedResources.length > 0 ? (
                        displayedResources.map((resource, index) => (
                            <div key={index} className="resource-card">
                                <div className="resource-header">
                                    <span className={`badge badge-${resource.category === 'schemes' ? 'primary' :
                                        resource.category === 'education' ? 'info' :
                                            resource.category === 'healthcare' ? 'error' :
                                                resource.category === 'housing' ? 'warning' :
                                                    resource.category === 'agriculture' ? 'success' :
                                                        resource.category === 'women' ? 'primary' :
                                                            resource.category === 'disability' ? 'info' :
                                                                resource.category === 'startup' ? 'success' :
                                                                    'secondary'
                                        }`}>
                                        {resource.category}
                                    </span>
                                    {resource.isNew && <span className="badge badge-error">New</span>}
                                </div>

                                <h3>{resource.title}</h3>
                                <p className="resource-description">{resource.description}</p>

                                <div className="resource-meta">
                                    <div className="meta-item">
                                        <strong>Provider:</strong> {resource.provider}
                                    </div>
                                    {resource.eligibility && (
                                        <div className="meta-item">
                                            <strong>Eligibility:</strong> {resource.eligibility}
                                        </div>
                                    )}
                                </div>

                                <div className="resource-actions">
                                    <a
                                        href={resource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm"
                                    >
                                        Visit Official Website
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <Filter size={48} />
                            <p>No resources found matching your criteria</p>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setSearchQuery('')
                                    setSelectedCategory('all')
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* View More Button */}
                {filteredResources.length > 4 && (
                    <div className="view-more-section">
                        <button
                            className="view-more-btn"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? 'Show Less' : `View More (${filteredResources.length - 4} more)`}
                        </button>
                    </div>
                )}

                {/* Important Links Section */}
                <div className="important-links-section">
                    <h2>Important Government Portals</h2>
                    <div className="links-grid">
                        <a href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer" className="link-card">
                            <Building size={24} />
                            <h4>India.gov.in</h4>
                            <p>National Portal of India</p>
                        </a>
                        <a href="https://www.mygov.in/" target="_blank" rel="noopener noreferrer" className="link-card">
                            <Users size={24} />
                            <h4>MyGov</h4>
                            <p>Citizen Engagement Platform</p>
                        </a>
                        <a href="https://www.digitalindia.gov.in/" target="_blank" rel="noopener noreferrer" className="link-card">
                            <GraduationCap size={24} />
                            <h4>Digital India</h4>
                            <p>Digital Empowerment</p>
                        </a>
                        <a href="https://www.umang.gov.in/" target="_blank" rel="noopener noreferrer" className="link-card">
                            <Briefcase size={24} />
                            <h4>UMANG</h4>
                            <p>Unified Mobile App</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Resources
