// Single source of truth for public scheme information.
//
// Used by the React pages (Schemes, SchemeDetail, EligibilityChecker) AND by
// scripts/prerender.mjs at build time, so it must stay plain data: no JSX, no
// browser APIs, no imports.
//
// EDITORIAL RULES (see /editorial-policy):
// - Only add facts you can trace to the official portal or notification.
// - When a detail can't be confirmed, say "Check the official guidelines"
//   instead of guessing.
// - `review.status` is 'verified' only after someone has checked every field
//   against the official source; set `review.verifiedOn` (YYYY-MM-DD) and
//   `review.reviewer` at the same time.

export const LAST_CONTENT_UPDATE = '2026-10-31'

export const CATEGORIES = [
    {
        id: 'students',
        label: 'Students & Scholarships',
        emoji: '🎓',
        intro: 'Scholarships, fee support and free skill training for school and college students. Most scholarship applications open once a year, so check the deadline on the official portal early.',
    },
    {
        id: 'farmers',
        label: 'Farmers',
        emoji: '🌾',
        intro: 'Income support and crop insurance for farmer families. Keep your land records, Aadhaar and Aadhaar-linked bank account ready before you apply.',
    },
    {
        id: 'women',
        label: 'Women & Girls',
        emoji: '👩',
        intro: 'Savings, business loans and direct cash support aimed at women and girls, including schemes run by the Jharkhand government.',
    },
    {
        id: 'senior-citizens',
        label: 'Senior Citizens & Pension',
        emoji: '🧓',
        intro: 'Free hospital cover for everyone aged 70 and above, and pension schemes you can join while working to secure an income after 60.',
    },
    {
        id: 'business',
        label: 'Business & Self-Employment',
        emoji: '🏪',
        intro: 'Collateral-free loans for small businesses and first-time entrepreneurs, applied for through banks and official loan portals.',
    },
    {
        id: 'health-insurance',
        label: 'Health & Insurance',
        emoji: '🏥',
        intro: 'Hospital cover and very low-cost life and accident insurance that anyone with a bank account can join.',
    },
    {
        id: 'employment',
        label: 'Jobs & Skills',
        emoji: '🛠️',
        intro: 'Free certified skill training and support for starting your own work.',
    },
]

export const SCHEMES = [
    {
        slug: 'pm-kisan',
        name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        shortName: 'PM-KISAN',
        level: 'central',
        authority: 'Ministry of Agriculture & Farmers Welfare, Government of India',
        categories: ['farmers'],
        summary: 'PM-KISAN pays eligible landholding farmer families ₹6,000 a year, sent directly to their bank account in three instalments of ₹2,000.',
        whoFor: 'Farmer families (husband, wife and minor children) who own cultivable land in their names.',
        eligibility: [
            'You are a farmer family that owns cultivable land, as recorded in the state land records.',
            'Your bank account is linked (seeded) with Aadhaar.',
            'You have completed e-KYC, which is mandatory to receive instalments.',
        ],
        exclusions: [
            'Institutional landholders.',
            'Families where any member paid income tax in the last assessment year.',
            'Serving or retired government employees (Multi-Tasking Staff, Class IV and Group D employees are not excluded).',
            'Retired pensioners getting ₹10,000 or more per month (Multi-Tasking Staff, Class IV and Group D pensioners are not excluded).',
            'Current or former holders of constitutional posts, ministers, MPs, MLAs and similar office holders.',
            'Registered professionals such as doctors, engineers, lawyers, chartered accountants and architects.',
        ],
        benefits: [
            '₹6,000 per year per eligible family.',
            'Paid in three equal instalments of ₹2,000 through Direct Benefit Transfer (DBT).',
        ],
        documents: [
            'Aadhaar card',
            'Bank account details (account must be Aadhaar-seeded)',
            'Land ownership records (khatauni / land papers)',
            'Mobile number for OTP and e-KYC',
        ],
        howToApply: [
            'Go to the official portal pmkisan.gov.in and choose "New Farmer Registration".',
            'Enter your Aadhaar number, mobile number and state, and verify with OTP.',
            'Fill in your land and bank details and submit.',
            'Complete e-KYC (OTP-based on the portal, or biometric at a Common Service Centre).',
            'Your state government verifies the application before payments start.',
            'You can also apply through your nearest Common Service Centre (CSC) or the local agriculture office.',
        ],
        deadlines: 'Registration is open throughout the year.',
        officialLinks: [
            { label: 'PM-KISAN official portal', url: 'https://pmkisan.gov.in/' },
        ],
        helpline: 'PM-KISAN helpline: 155261 / 011-24300606',
        mistakes: [
            'Not completing e-KYC, which stops instalments.',
            'Bank account not seeded with Aadhaar, so the payment fails.',
            'Name spelled differently in Aadhaar, bank and land records.',
        ],
        faqs: [
            { q: 'Can tenant farmers get PM-KISAN?', a: 'The scheme is for landholding farmer families, so the land must be recorded in your name. Tenant farmers without land in their name are generally not covered. Check the official guidelines for your state.' },
            { q: 'How do I check my payment status?', a: 'Use the "Know Your Status" option on pmkisan.gov.in with your registration number, or the beneficiary status page.' },
        ],
        match: { occupations: ['farmer'], minAge: 18 },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'pm-fasal-bima-yojana',
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        shortName: 'PM Fasal Bima Yojana',
        level: 'central',
        authority: 'Ministry of Agriculture & Farmers Welfare, Government of India',
        categories: ['farmers', 'health-insurance'],
        summary: 'PMFBY is crop insurance that protects farmers against crop loss from natural disasters, pests and diseases, at a low premium paid by the farmer.',
        whoFor: 'Farmers, including sharecroppers and tenant farmers, growing notified crops in notified areas.',
        eligibility: [
            'You grow a crop notified for insurance in your area for that season.',
            'Owner farmers, sharecroppers and tenant farmers can join.',
            'Enrolment is voluntary for all farmers.',
        ],
        exclusions: [],
        benefits: [
            'Insurance cover for crop loss due to natural calamities, pests and diseases.',
            'Farmer premium: 2% of sum insured for Kharif food and oilseed crops, 1.5% for Rabi food and oilseed crops, and 5% for commercial and horticultural crops. The government pays the rest.',
        ],
        documents: [
            'Aadhaar card',
            'Bank account details',
            'Land records, or a tenancy / sharecropping agreement where applicable',
            'Sowing certificate or crop details, as required by your state',
        ],
        howToApply: [
            'Apply before the enrolment cut-off date for the season, which is announced by your state.',
            'Enrol through your bank (if you have a crop loan), a Common Service Centre, an insurance company agent, or the PMFBY portal.',
            'Pay your share of the premium and keep the receipt.',
            'Report crop loss to the insurance company or through the official app within the time limit after the event.',
        ],
        deadlines: 'Enrolment closes on season-wise cut-off dates set by each state. Check the PMFBY portal or your bank before the season starts.',
        officialLinks: [
            { label: 'PMFBY official portal', url: 'https://pmfby.gov.in/' },
        ],
        mistakes: [
            'Missing the seasonal enrolment cut-off date.',
            'Not reporting crop loss within the allowed time after the event.',
        ],
        faqs: [
            { q: 'Is PMFBY compulsory for loanee farmers?', a: 'No. Enrolment is voluntary for all farmers, including those with crop loans.' },
        ],
        match: { occupations: ['farmer'], minAge: 18 },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'ayushman-bharat-pm-jay',
        name: 'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (AB PM-JAY)',
        shortName: 'Ayushman Bharat PM-JAY',
        level: 'central',
        authority: 'National Health Authority, Government of India',
        categories: ['health-insurance', 'senior-citizens'],
        summary: 'PM-JAY gives eligible families free, cashless hospital treatment of up to ₹5 lakh per family per year at empanelled government and private hospitals. Every citizen aged 70 or above is covered regardless of income.',
        whoFor: 'Poor and vulnerable families identified under the scheme, and all senior citizens aged 70 years and above.',
        eligibility: [
            'Your family is listed as eligible under the scheme’s deprivation and occupation criteria (check on the beneficiary portal).',
            'OR you are aged 70 or above. Income does not matter for this group; you can get an Ayushman Vay Vandana card.',
        ],
        exclusions: [],
        benefits: [
            'Up to ₹5 lakh per family per year for secondary and tertiary hospital care.',
            'Cashless and paperless treatment at empanelled hospitals.',
            'Senior citizens aged 70+ in families already covered get an additional top-up of up to ₹5 lakh a year for themselves.',
        ],
        documents: [
            'Aadhaar card (used for e-KYC and, for 70+, as proof of age)',
            'Ration card or other family ID, if asked',
        ],
        howToApply: [
            'Check your eligibility on the official beneficiary portal or the Ayushman app.',
            'Complete e-KYC and download your Ayushman card.',
            'You can also get help at an empanelled hospital (Ayushman Mitra desk) or a Common Service Centre.',
            'Show your Ayushman card at an empanelled hospital for cashless treatment.',
        ],
        deadlines: 'No application window. You can check eligibility and get your card at any time.',
        officialLinks: [
            { label: 'PM-JAY official website', url: 'https://pmjay.gov.in/' },
            { label: 'Check eligibility / get Ayushman card', url: 'https://beneficiary.nha.gov.in/' },
        ],
        helpline: 'National helpline: 14555',
        mistakes: [
            'Going to a hospital that is not empanelled under PM-JAY.',
            'Paying agents to "make" an Ayushman card. Getting the card is free.',
        ],
        faqs: [
            { q: 'My parents are over 70 but not in the PM-JAY list. Can they get cover?', a: 'Yes. Since October 2024 every citizen aged 70 or above is eligible regardless of income. Apply for the Ayushman Vay Vandana card through the official app or portal.' },
            { q: 'Does PM-JAY cover outpatient (OPD) visits?', a: 'PM-JAY mainly covers hospitalisation. Check the official website for the list of covered procedures.' },
        ],
        match: { occupations: 'any', minAge: 0 },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'pm-mudra-yojana',
        name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
        shortName: 'PM MUDRA Yojana',
        level: 'central',
        authority: 'Department of Financial Services, Ministry of Finance, Government of India',
        categories: ['business', 'employment', 'women'],
        summary: 'MUDRA loans are collateral-free loans of up to ₹20 lakh for small, non-corporate businesses, given through banks, NBFCs and microfinance institutions.',
        whoFor: 'Individuals and small businesses starting or growing an income-generating activity in manufacturing, trading, services or activities allied to agriculture.',
        eligibility: [
            'You run, or want to start, a non-corporate, non-farm small or micro enterprise, or an activity allied to agriculture.',
            'You meet the lending institution’s normal credit checks.',
        ],
        exclusions: [],
        benefits: [
            'Shishu: loans up to ₹50,000.',
            'Kishore: above ₹50,000 and up to ₹5 lakh.',
            'Tarun: above ₹5 lakh and up to ₹10 lakh.',
            'Tarun Plus: above ₹10 lakh and up to ₹20 lakh, only for borrowers who have taken and fully repaid a Tarun loan.',
            'No collateral required. Loans are covered by a government credit guarantee.',
        ],
        documents: [
            'Identity and address proof (such as Aadhaar)',
            'Business plan or quotation for the machinery/items you want to buy',
            'Proof of business address, and business registration (such as Udyam) where available',
            'Bank statements, and your category certificate if applicable',
        ],
        howToApply: [
            'Prepare a simple plan of what the loan is for and how much you need.',
            'Visit a bank, NBFC or microfinance institution, or apply online through the Udyamimitra portal.',
            'Fill in the MUDRA application form for the right category (Shishu, Kishore, Tarun or Tarun Plus).',
            'The lender checks your documents and plan before sanctioning the loan.',
        ],
        deadlines: 'Open throughout the year.',
        officialLinks: [
            { label: 'MUDRA official website', url: 'https://www.mudra.org.in/' },
            { label: 'Apply online (Udyamimitra)', url: 'https://www.udyamimitra.in/' },
        ],
        mistakes: [
            'Paying middlemen who promise a "guaranteed" MUDRA loan. There is no processing fee for applying through official channels.',
            'Asking for a bigger loan than your business plan can justify.',
        ],
        faqs: [
            { q: 'Is a MUDRA loan free money?', a: 'No. It is a loan that must be repaid with interest. The interest rate is set by the lending bank.' },
        ],
        match: { occupations: ['business', 'worker', 'unemployed', 'homemaker'], minAge: 18 },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'stand-up-india',
        name: 'Stand-Up India Scheme',
        shortName: 'Stand-Up India',
        level: 'central',
        authority: 'Department of Financial Services, Ministry of Finance, Government of India',
        categories: ['business', 'women'],
        summary: 'Stand-Up India helps women and SC/ST entrepreneurs get bank loans between ₹10 lakh and ₹1 crore to set up a new (greenfield) enterprise.',
        whoFor: 'Women entrepreneurs and Scheduled Caste / Scheduled Tribe entrepreneurs aged 18 and above.',
        eligibility: [
            'You are a woman, or belong to a Scheduled Caste or Scheduled Tribe, and are 18 or older.',
            'The loan is for a greenfield enterprise (a first-time venture) in manufacturing, services, trading or activities allied to agriculture.',
            'For companies or partnerships, at least 51% of the shareholding and control must be with an SC/ST or woman entrepreneur.',
            'You have not defaulted on any bank or financial institution.',
        ],
        exclusions: [],
        benefits: [
            'Bank loans from ₹10 lakh up to ₹1 crore, covering term loan and working capital.',
            'Handholding support through the Stand-Up Mitra portal.',
        ],
        documents: [
            'Identity and address proof',
            'Caste certificate (for SC/ST applicants)',
            'Project report / business plan',
            'Proof of business premises and quotations',
        ],
        howToApply: [
            'Register on the Stand-Up Mitra portal, or apply directly at a scheduled commercial bank branch.',
            'Submit your business plan and documents.',
            'The bank appraises the project and sanctions the loan.',
        ],
        deadlines: 'Open throughout the year.',
        officialLinks: [
            { label: 'Stand-Up Mitra portal', url: 'https://www.standupmitra.in/' },
        ],
        mistakes: [
            'Applying for an expansion of an existing business. The scheme is only for new (greenfield) enterprises.',
        ],
        faqs: [],
        match: { occupations: ['business', 'worker', 'unemployed', 'homemaker'], minAge: 18, requires: 'woman-or-scst' },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'atal-pension-yojana',
        name: 'Atal Pension Yojana (APY)',
        shortName: 'Atal Pension Yojana',
        level: 'central',
        authority: 'Department of Financial Services; administered by PFRDA',
        categories: ['senior-citizens', 'health-insurance'],
        summary: 'Atal Pension Yojana is a voluntary pension scheme. You pay a small monthly amount while working and get a guaranteed pension of ₹1,000 to ₹5,000 a month after turning 60.',
        whoFor: 'Indian citizens aged 18 to 40 with a savings bank or post office account, especially workers in the unorganised sector.',
        eligibility: [
            'You are an Indian citizen aged between 18 and 40.',
            'You have a savings bank account or post office savings account.',
            'You are not, and have never been, an income-tax payer (rule in force since 1 October 2022).',
        ],
        exclusions: [
            'Income-tax payers cannot join from 1 October 2022. People who joined before that date can continue.',
        ],
        benefits: [
            'Guaranteed minimum pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000 or ₹5,000 a month from age 60, depending on the amount you chose and contributed.',
            'After the subscriber’s death, the same pension goes to the spouse.',
            'After both have died, the accumulated amount is returned to the nominee.',
        ],
        documents: [
            'Savings bank account',
            'Aadhaar and mobile number',
            'Nominee details',
        ],
        howToApply: [
            'Visit your bank or post office branch where you have a savings account, or use your bank’s net banking / app if it offers APY.',
            'Fill in the APY registration form and choose your pension amount.',
            'Contributions are auto-debited from your account monthly, quarterly or half-yearly.',
        ],
        deadlines: 'You can join any time between 18 and 40 years of age. Joining earlier means lower monthly contributions.',
        officialLinks: [
            { label: 'Jan Suraksha portal (Government of India)', url: 'https://www.jansuraksha.gov.in/' },
            { label: 'PFRDA', url: 'https://www.pfrda.org.in/' },
        ],
        mistakes: [
            'Keeping too little balance in the account, so the auto-debit fails and a penalty applies.',
        ],
        faqs: [
            { q: 'How much do I need to pay each month?', a: 'It depends on your age when you join and the pension you choose. The official contribution chart is on the Jan Suraksha and PFRDA websites.' },
        ],
        match: { occupations: 'any', minAge: 18, maxAge: 40, excludesTaxPayers: true },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'pm-jeevan-jyoti-bima-yojana',
        name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
        shortName: 'PM Jeevan Jyoti Bima Yojana',
        level: 'central',
        authority: 'Department of Financial Services, Ministry of Finance, Government of India',
        categories: ['health-insurance'],
        summary: 'PMJJBY is a one-year renewable life insurance that pays ₹2 lakh to your nominee on death from any cause, for a premium of ₹436 a year.',
        whoFor: 'People aged 18 to 50 with a savings bank or post office account.',
        eligibility: [
            'You are aged 18 to 50 and have a savings bank or post office account.',
            'You give consent for the premium to be auto-debited.',
        ],
        exclusions: [],
        benefits: [
            '₹2 lakh life cover for death due to any cause.',
            'Premium of ₹436 per year, auto-debited from your account.',
            'Cover can continue up to age 55 if you join before 50 and keep renewing.',
        ],
        documents: [
            'Savings bank or post office account',
            'Aadhaar (for KYC) and nominee details',
        ],
        howToApply: [
            'Enrol at your bank or post office branch, or through your bank’s net banking / app.',
            'Fill in the consent-cum-declaration form and nominee details.',
            'The premium is auto-debited every year.',
        ],
        deadlines: 'Cover runs from 1 June to 31 May and renews every year.',
        officialLinks: [
            { label: 'Jan Suraksha portal (Government of India)', url: 'https://www.jansuraksha.gov.in/' },
        ],
        mistakes: [
            'Insufficient balance on the renewal date, which can lapse your cover.',
        ],
        faqs: [],
        match: { occupations: 'any', minAge: 18, maxAge: 50 },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'pm-suraksha-bima-yojana',
        name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
        shortName: 'PM Suraksha Bima Yojana',
        level: 'central',
        authority: 'Department of Financial Services, Ministry of Finance, Government of India',
        categories: ['health-insurance'],
        summary: 'PMSBY is accident insurance that pays up to ₹2 lakh for accidental death or disability, for a premium of ₹20 a year.',
        whoFor: 'People aged 18 to 70 with a savings bank or post office account.',
        eligibility: [
            'You are aged 18 to 70 and have a savings bank or post office account.',
            'You give consent for the premium to be auto-debited.',
        ],
        exclusions: [
            'It covers accidents only. Death from illness is not covered.',
        ],
        benefits: [
            '₹2 lakh for accidental death or total permanent disability.',
            '₹1 lakh for partial permanent disability.',
            'Premium of ₹20 per year, auto-debited from your account.',
        ],
        documents: [
            'Savings bank or post office account',
            'Aadhaar (for KYC) and nominee details',
        ],
        howToApply: [
            'Enrol at your bank or post office branch, or through your bank’s net banking / app.',
            'Fill in the consent-cum-declaration form.',
            'The premium is auto-debited every year.',
        ],
        deadlines: 'Cover runs from 1 June to 31 May and renews every year.',
        officialLinks: [
            { label: 'Jan Suraksha portal (Government of India)', url: 'https://www.jansuraksha.gov.in/' },
        ],
        mistakes: [
            'Thinking it covers death from illness. For that, see PM Jeevan Jyoti Bima Yojana.',
        ],
        faqs: [],
        match: { occupations: 'any', minAge: 18, maxAge: 70 },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'sukanya-samriddhi-yojana',
        name: 'Sukanya Samriddhi Yojana (SSY)',
        shortName: 'Sukanya Samriddhi Yojana',
        level: 'central',
        authority: 'Ministry of Finance, Government of India; accounts opened at post offices and authorised banks',
        categories: ['women', 'students'],
        summary: 'Sukanya Samriddhi Yojana is a government-backed savings account for a girl child, to save for her education and marriage, with tax benefits.',
        whoFor: 'Parents or legal guardians of a girl child below 10 years of age.',
        eligibility: [
            'The girl is below 10 years of age when the account is opened.',
            'One account per girl, and generally up to two girls per family (exceptions apply for twins or triplets).',
        ],
        exclusions: [],
        benefits: [
            'Minimum deposit ₹250 and maximum ₹1.5 lakh per financial year.',
            'Deposits are made for 15 years; the account matures 21 years after opening.',
            'Up to 50% can be withdrawn after the girl turns 18, for higher education.',
            'Interest rate is set by the government every quarter. Check the current rate at the post office or bank.',
            'Deposits qualify for tax deduction under Section 80C (old tax regime).',
        ],
        documents: [
            'Birth certificate of the girl child',
            'Identity and address proof of the parent or guardian',
            'Photographs',
        ],
        howToApply: [
            'Visit a post office or an authorised bank branch.',
            'Fill in the SSY account opening form and submit the documents.',
            'Make the first deposit (at least ₹250).',
        ],
        deadlines: 'The account must be opened before the girl turns 10.',
        officialLinks: [
            { label: 'India Post – savings schemes', url: 'https://www.indiapost.gov.in/' },
        ],
        mistakes: [
            'Missing the minimum yearly deposit, which makes the account "defaulted" until you pay a penalty.',
        ],
        faqs: [],
        match: { occupations: 'any', minAge: 18, parentOfGirlUnder10: true },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'post-matric-scholarship-sc-students',
        name: 'Post Matric Scholarship for Scheduled Caste Students',
        shortName: 'Post Matric Scholarship (SC)',
        level: 'central',
        authority: 'Ministry of Social Justice & Empowerment, Government of India (implemented through states)',
        categories: ['students'],
        summary: 'This scholarship pays the compulsory fees and an academic allowance for Scheduled Caste students studying in Class 11 and above, when family income is up to ₹2.5 lakh a year.',
        whoFor: 'Scheduled Caste students studying post-matric courses (Class 11, 12, diploma, graduation, post-graduation and similar).',
        eligibility: [
            'You belong to a Scheduled Caste.',
            'You are studying a recognised post-matric course (after Class 10).',
            'Your parents’ or guardians’ total annual income is up to ₹2.5 lakh.',
        ],
        exclusions: [],
        benefits: [
            'Compulsory non-refundable fees charged by the institution.',
            'An academic allowance that depends on the course group. Check the official guidelines for current amounts.',
        ],
        documents: [
            'Caste certificate',
            'Income certificate',
            'Previous year’s marksheet',
            'Admission / fee receipt from the institution',
            'Aadhaar and Aadhaar-seeded bank account',
        ],
        howToApply: [
            'Apply online on your state’s scholarship portal or on the National Scholarship Portal, whichever your state uses for this scheme.',
            'Upload the documents and submit before the deadline.',
            'Your institution and then the district/state office verify the application.',
        ],
        deadlines: 'Applications open once a year, usually around the start of the academic session. The exact dates are announced on the scholarship portal.',
        officialLinks: [
            { label: 'National Scholarship Portal', url: 'https://scholarships.gov.in/' },
            { label: 'myScheme – search state scholarship details', url: 'https://www.myscheme.gov.in/' },
        ],
        mistakes: [
            'Income certificate older than allowed, or issued by the wrong authority.',
            'Missing institute verification after submitting online.',
        ],
        faqs: [
            { q: 'Do students in Jharkhand apply on the National Scholarship Portal?', a: 'Some states run Post Matric Scholarships through their own state portal. Check with your institution’s scholarship nodal officer or your state welfare department.' },
        ],
        match: { occupations: ['student'], minAge: 14, requires: 'sc', excludesHighIncome: true },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'pm-kaushal-vikas-yojana',
        name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
        shortName: 'PM Kaushal Vikas Yojana',
        level: 'central',
        authority: 'Ministry of Skill Development & Entrepreneurship, Government of India',
        categories: ['employment', 'students'],
        summary: 'PMKVY offers free, short-term skill training with a government-recognised certificate, to help young people find jobs or start their own work.',
        whoFor: 'Indian youth who want to learn a job skill, including school and college dropouts and unemployed people.',
        eligibility: [
            'You are an Indian citizen looking to gain or certify a job skill.',
            'Age limits and education requirements depend on the course. Check the official guidelines for the course you choose.',
        ],
        exclusions: [],
        benefits: [
            'Free training at approved training centres.',
            'Assessment and a government-recognised skill certificate.',
            'Placement support at many centres.',
        ],
        documents: [
            'Aadhaar card',
            'Educational certificates (if the course requires them)',
            'Bank account details',
        ],
        howToApply: [
            'Register on the Skill India Digital Hub portal.',
            'Search for courses and training centres near you.',
            'Enrol in a course and attend the training and assessment.',
        ],
        deadlines: 'Courses start at different times at each centre.',
        officialLinks: [
            { label: 'Skill India Digital Hub', url: 'https://www.skillindiadigital.gov.in/' },
        ],
        mistakes: [
            'Paying a fee to a centre for a course that should be free under PMKVY. Check the centre on the official portal first.',
        ],
        faqs: [],
        match: { occupations: ['student', 'unemployed', 'worker', 'homemaker'], minAge: 15 },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
    {
        slug: 'jharkhand-maiyan-samman-yojana',
        name: 'Jharkhand Mukhyamantri Maiyan Samman Yojana (JMMSY)',
        shortName: 'Maiyan Samman Yojana',
        level: 'state',
        state: 'Jharkhand',
        authority: 'Government of Jharkhand',
        categories: ['women'],
        summary: 'Jharkhand’s Maiyan Samman Yojana gives eligible women residents of Jharkhand monthly financial support of ₹2,500 directly in their bank account.',
        whoFor: 'Women who are residents of Jharkhand, within the age band set by the state.',
        eligibility: [
            'You are a woman and a resident of Jharkhand.',
            'Your age is within the band set by the state. Recent reports say 18 to 50, but sources differ, so confirm on the official portal.',
            'You have a bank account linked with Aadhaar.',
        ],
        exclusions: [
            'Government employees and income-tax payers are reported to be excluded. Check the official portal for the full list.',
        ],
        benefits: [
            '₹2,500 per month via Direct Benefit Transfer (raised from ₹1,000 in late 2024).',
        ],
        documents: [
            'Aadhaar card',
            'Proof of Jharkhand residence (such as ration card or domicile certificate)',
            'Aadhaar-linked bank account details',
        ],
        howToApply: [
            'Apply online on the official portal, or at a camp organised by the state government in your area.',
            'Submit the application with your documents.',
            'Track your application status on the official portal.',
        ],
        deadlines: 'Check the official portal and local announcements for open application windows.',
        officialLinks: [
            { label: 'Maiyan Samman Yojana official portal', url: 'https://mmmsy.jharkhand.gov.in/' },
            { label: 'Scheme on myScheme', url: 'https://www.myscheme.gov.in/schemes/jmmsy' },
        ],
        mistakes: [
            'Bank account not linked with Aadhaar, so payments fail.',
        ],
        faqs: [],
        match: { occupations: 'any', minAge: 18, maxAge: 50, gender: 'female', state: 'Jharkhand', excludesTaxPayers: true },
        review: { status: 'pending', lastUpdated: '2026-10-31' },
    },
]

export const getScheme = (slug) => SCHEMES.find((s) => s.slug === slug)
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id)
export const schemesInCategory = (id) => SCHEMES.filter((s) => s.categories.includes(id))

// Category hubs are only published when they have enough schemes to be useful.
export const MIN_SCHEMES_PER_HUB = 2
export const publishedCategories = () =>
    CATEGORIES.filter((c) => schemesInCategory(c.id).length >= MIN_SCHEMES_PER_HUB)

export const relatedSchemes = (scheme, limit = 3) =>
    SCHEMES
        .filter((s) => s.slug !== scheme.slug)
        .map((s) => ({ s, score: s.categories.filter((c) => scheme.categories.includes(c)).length }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ s }) => s)
