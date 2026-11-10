// Single source of truth for public scheme information.
//
// Used by the React pages (Schemes, SchemeDetail, EligibilityChecker) AND by
// scripts/prerender.mjs at build time, so it must stay plain data: no JSX, no
// browser APIs, no imports.
//
// EDITORIAL RULES (see /editorial-policy):
// - Only add facts you can trace to an official portal, notification or
//   government press release. List the source in `sources`.
// - When a detail can't be confirmed, say so and point to the official
//   portal instead of guessing.
// - `example` is an illustration written by us, never a real person's story.
//   The page labels it as an example.
// - `review.status` is 'verified' only after a named person has checked every
//   field against the official source; set `review.verifiedOn` (YYYY-MM-DD)
//   and `review.reviewer` at the same time. Until then it stays 'pending'.
// - `hi` holds a reviewed Hindi version of the same facts. Fields missing from
//   `hi` fall back to English, and the page says so.

export const LAST_CONTENT_UPDATE = '2026-11-10'

export const CATEGORIES = [
    {
        id: 'students',
        label: 'Students & Scholarships',
        labelHi: 'छात्र और छात्रवृत्ति',
        intro: 'Scholarships, fee support and free skill training for school and college students. Most scholarship forms open once a year, so note the deadline as soon as it is announced.',
        introHi: 'स्कूल और कॉलेज के छात्रों के लिए छात्रवृत्ति, फ़ीस सहायता और मुफ़्त कौशल प्रशिक्षण। ज़्यादातर छात्रवृत्ति फ़ॉर्म साल में एक बार खुलते हैं, इसलिए अंतिम तिथि की घोषणा होते ही नोट कर लें।',
    },
    {
        id: 'farmers',
        label: 'Farmers',
        labelHi: 'किसान',
        intro: 'Income support and crop insurance for farming families. Keep land records, Aadhaar and an Aadhaar-linked bank account ready before you start.',
        introHi: 'किसान परिवारों के लिए आय सहायता और फ़सल बीमा। शुरू करने से पहले ज़मीन के कागज़, आधार और आधार से जुड़ा बैंक खाता तैयार रखें।',
    },
    {
        id: 'women',
        label: 'Women & Girls',
        labelHi: 'महिलाएँ और बेटियाँ',
        intro: 'Savings for daughters, business loans for women entrepreneurs, and monthly support for women in Jharkhand.',
        introHi: 'बेटियों के लिए बचत, महिला उद्यमियों के लिए लोन, और झारखंड की महिलाओं के लिए हर महीने की सहायता।',
    },
    {
        id: 'senior-citizens',
        label: 'Senior Citizens & Pension',
        labelHi: 'वरिष्ठ नागरिक और पेंशन',
        intro: 'Free hospital cover for everyone aged 70 and above, and a pension you can start building while you are still working.',
        introHi: '70 साल और उससे ज़्यादा उम्र के सभी लोगों के लिए मुफ़्त अस्पताल कवर, और काम करते हुए ही शुरू की जा सकने वाली पेंशन।',
    },
    {
        id: 'business',
        label: 'Business & Self-Employment',
        labelHi: 'व्यवसाय और स्वरोज़गार',
        intro: 'Loans without collateral for small shops, workshops and first-time entrepreneurs, given through banks.',
        introHi: 'छोटी दुकान, वर्कशॉप और पहली बार काम शुरू करने वालों के लिए बिना गारंटी के बैंक लोन।',
    },
    {
        id: 'health-insurance',
        label: 'Health & Insurance',
        labelHi: 'स्वास्थ्य और बीमा',
        intro: 'Hospital cover, plus life and accident insurance that costs less than ₹500 a year for anyone with a bank account.',
        introHi: 'अस्पताल का कवर, और बैंक खाते वाले हर व्यक्ति के लिए साल में ₹500 से कम का जीवन और दुर्घटना बीमा।',
    },
    {
        id: 'employment',
        label: 'Jobs & Skills',
        labelHi: 'नौकरी और कौशल',
        intro: 'Free, certified skill training and loans to start working for yourself.',
        introHi: 'मुफ़्त, प्रमाणित कौशल प्रशिक्षण, और अपना काम शुरू करने के लिए लोन।',
    },
]

const JAN_SURAKSHA_HELPLINE = 'National toll-free: 1800-180-1111 / 1800-110-001 (state numbers are listed on jansuraksha.gov.in)'

export const SCHEMES = [
    {
        slug: 'pm-kisan',
        name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        shortName: 'PM-KISAN',
        level: 'central',
        authority: 'Ministry of Agriculture & Farmers Welfare, Government of India',
        categories: ['farmers'],
        summary: '₹6,000 a year for farming families who own cultivable land, paid straight into the bank in three ₹2,000 instalments.',
        intro: 'PM-KISAN is not a loan and not insurance. It is a fixed cash amount the central government sends to landholding farmer families, three times a year. Most problems people face are not about eligibility at all, but about paperwork: a missing e-KYC, a bank account not linked to Aadhaar, or a name spelled differently in two records.',
        whoFor: 'Families that own farmland in their own names: husband, wife and children under 18 count as one family.',
        eligibility: [
            'Your family owns cultivable land, and it is recorded in the state land records in a family member’s name.',
            'The bank account where you want the money is linked (seeded) with Aadhaar.',
            'You have completed e-KYC. Without it, instalments stop.',
        ],
        exclusions: [
            'Institutional landholders.',
            'Families where anyone paid income tax in the last assessment year.',
            'Serving or retired government employees, except Multi-Tasking Staff and Class IV / Group D staff.',
            'Pensioners getting ₹10,000 or more a month, except Multi-Tasking Staff and Class IV / Group D pensioners.',
            'People who hold or held constitutional posts, and current or former ministers, MPs, MLAs and similar office holders.',
            'Registered doctors, engineers, lawyers, chartered accountants and architects practising their profession.',
        ],
        benefits: [
            '₹6,000 a year for each eligible family.',
            'Paid as three instalments of ₹2,000 by Direct Benefit Transfer (DBT).',
        ],
        example: 'A couple in Palamu owns 1.5 acres recorded in the husband’s name. Neither pays income tax. They register once, finish e-KYC, and the family receives ₹2,000 three times a year. Their son, who is 24 and married, is a separate family: he gets nothing unless land is recorded in his own name.',
        documents: [
            'Aadhaar card',
            'Bank account details (account must be linked with Aadhaar)',
            'Land records (khatauni / record of rights)',
            'Mobile number for OTP and e-KYC',
        ],
        howToApply: [
            'Open pmkisan.gov.in and choose “New Farmer Registration”.',
            'Enter Aadhaar, mobile number and state, then confirm the OTP.',
            'Fill in land and bank details and submit.',
            'Complete e-KYC: by OTP on the portal, or with your fingerprint at a Common Service Centre (CSC).',
            'Your state verifies the land records. Payments start only after this approval.',
            'If you are not comfortable online, a CSC or your block agriculture office can register you.',
        ],
        deadlines: 'Registration is open all year. You receive instalments only from the period after your application is approved.',
        officialLinks: [
            { label: 'PM-KISAN official portal', url: 'https://pmkisan.gov.in/' },
        ],
        helpline: 'PM-KISAN helpline: 155261 or 011-24300606',
        rejections: [
            { problem: 'e-KYC not done', fix: 'Do OTP e-KYC on pmkisan.gov.in, or fingerprint e-KYC at a CSC.' },
            { problem: 'Payment failed: bank account not seeded with Aadhaar', fix: 'Ask your bank to link Aadhaar to the account (NPCI mapping), then wait for the next instalment.' },
            { problem: 'Name differs between Aadhaar, bank and land record', fix: 'Correct the spelling in Aadhaar or the bank so they match, or use “Edit Aadhaar details” on the portal.' },
            { problem: 'Application pending at state level', fix: 'Your land record has not been verified yet. Contact the block agriculture office with your land papers.' },
        ],
        faqs: [
            { q: 'Can tenant farmers get PM-KISAN?', a: 'Generally no. The land must be recorded in your family’s name. Tenant farmers and sharecroppers without land in their name are not covered.' },
            { q: 'How do I check whether my money was sent?', a: 'Use “Know Your Status” on pmkisan.gov.in with your registration number or Aadhaar-linked mobile number.' },
            { q: 'Both husband and wife own land. Do we get ₹12,000?', a: 'No. Husband, wife and minor children are one family, and the benefit is per family.' },
            { q: 'A family member started paying income tax. What now?', a: 'The family becomes ineligible. Payments received after that may have to be returned, so update your status instead of continuing.' },
        ],
        sources: [
            { label: 'PM-KISAN portal: eligibility, exclusions and FAQs', url: 'https://pmkisan.gov.in/' },
        ],
        match: { occupations: ['farmer'], minAge: 18, needsLand: true },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
        hi: {
            summary: 'खेती की ज़मीन वाले किसान परिवारों को साल में ₹6,000, जो ₹2,000 की तीन किस्तों में सीधे बैंक खाते में आते हैं।',
            intro: 'PM-KISAN न कर्ज़ है, न बीमा। यह एक तय नकद राशि है जो केंद्र सरकार ज़मीन वाले किसान परिवारों को साल में तीन बार भेजती है। ज़्यादातर दिक्कतें पात्रता की नहीं, कागज़ों की होती हैं: e-KYC न होना, बैंक खाता आधार से न जुड़ा होना, या दो दस्तावेज़ों में नाम की अलग वर्तनी।',
            whoFor: 'जिन परिवारों के नाम पर खेती की ज़मीन दर्ज है। पति, पत्नी और 18 साल से कम उम्र के बच्चे मिलकर एक परिवार गिने जाते हैं।',
            eligibility: [
                'परिवार के पास खेती लायक ज़मीन है और वह राज्य के भू-अभिलेख में परिवार के किसी सदस्य के नाम पर दर्ज है।',
                'जिस बैंक खाते में पैसा चाहिए, वह आधार से जुड़ा (सीडेड) है।',
                'e-KYC पूरा है। इसके बिना किस्तें रुक जाती हैं।',
            ],
            exclusions: [
                'संस्थागत भूमिधारक।',
                'वे परिवार जिनमें किसी ने पिछले कर-निर्धारण वर्ष में आयकर दिया हो।',
                'सेवारत या सेवानिवृत्त सरकारी कर्मचारी (मल्टी-टास्किंग स्टाफ और चतुर्थ श्रेणी / ग्रुप D को छोड़कर)।',
                '₹10,000 या उससे ज़्यादा मासिक पेंशन पाने वाले (मल्टी-टास्किंग स्टाफ और चतुर्थ श्रेणी / ग्रुप D पेंशनभोगी छोड़कर)।',
                'संवैधानिक पद पर रहे लोग, और वर्तमान या पूर्व मंत्री, सांसद, विधायक आदि।',
                'पेशे में कार्यरत पंजीकृत डॉक्टर, इंजीनियर, वकील, चार्टर्ड अकाउंटेंट और आर्किटेक्ट।',
            ],
            benefits: [
                'हर पात्र परिवार को साल में ₹6,000।',
                '₹2,000 की तीन किस्तें, डायरेक्ट बेनिफिट ट्रांसफर (DBT) से।',
            ],
            example: 'पलामू के एक दंपति के पास 1.5 एकड़ ज़मीन है, जो पति के नाम दर्ज है। दोनों में से कोई आयकर नहीं देता। वे एक बार पंजीकरण करते हैं, e-KYC पूरा करते हैं, और परिवार को साल में तीन बार ₹2,000 मिलते हैं। उनका 24 साल का शादीशुदा बेटा अलग परिवार है: उसके नाम ज़मीन दर्ज न हो तो उसे लाभ नहीं मिलेगा।',
            documents: [
                'आधार कार्ड',
                'बैंक खाते का विवरण (खाता आधार से जुड़ा होना चाहिए)',
                'ज़मीन के कागज़ (खतौनी / अधिकार अभिलेख)',
                'OTP और e-KYC के लिए मोबाइल नंबर',
            ],
            howToApply: [
                'pmkisan.gov.in खोलें और “New Farmer Registration” चुनें।',
                'आधार, मोबाइल नंबर और राज्य भरें, फिर OTP डालें।',
                'ज़मीन और बैंक का विवरण भरकर जमा करें।',
                'e-KYC पूरा करें: पोर्टल पर OTP से, या कॉमन सर्विस सेंटर (CSC) पर अंगूठे से।',
                'राज्य सरकार ज़मीन के रिकॉर्ड की जाँच करती है। मंज़ूरी के बाद ही भुगतान शुरू होता है।',
                'ऑनलाइन करना मुश्किल लगे तो CSC या प्रखंड कृषि कार्यालय से पंजीकरण करवा सकते हैं।',
            ],
            deadlines: 'पंजीकरण पूरे साल खुला रहता है। किस्तें आवेदन मंज़ूर होने के बाद की अवधि से मिलती हैं।',
            helpline: 'PM-KISAN हेल्पलाइन: 155261 या 011-24300606',
            rejections: [
                { problem: 'e-KYC नहीं हुआ', fix: 'pmkisan.gov.in पर OTP से, या CSC पर अंगूठे से e-KYC करें।' },
                { problem: 'भुगतान फेल: बैंक खाता आधार से नहीं जुड़ा', fix: 'बैंक से खाते को आधार से जुड़वाएँ (NPCI मैपिंग), फिर अगली किस्त का इंतज़ार करें।' },
                { problem: 'आधार, बैंक और ज़मीन के रिकॉर्ड में नाम अलग', fix: 'आधार या बैंक में वर्तनी ठीक करवाएँ, या पोर्टल पर “Edit Aadhaar details” का उपयोग करें।' },
                { problem: 'आवेदन राज्य स्तर पर लंबित', fix: 'ज़मीन के रिकॉर्ड की जाँच बाकी है। ज़मीन के कागज़ लेकर प्रखंड कृषि कार्यालय से संपर्क करें।' },
            ],
            faqs: [
                { q: 'क्या बटाईदार या किराये पर खेती करने वाले किसानों को PM-KISAN मिलता है?', a: 'आम तौर पर नहीं। ज़मीन परिवार के नाम पर दर्ज होनी चाहिए। जिनके नाम ज़मीन नहीं है, वे इसमें शामिल नहीं हैं।' },
                { q: 'कैसे देखें कि पैसा भेजा गया या नहीं?', a: 'pmkisan.gov.in पर “Know Your Status” में पंजीकरण संख्या या आधार से जुड़ा मोबाइल नंबर डालें।' },
                { q: 'पति और पत्नी दोनों के नाम ज़मीन है। क्या ₹12,000 मिलेंगे?', a: 'नहीं। पति, पत्नी और नाबालिग बच्चे एक परिवार हैं, और लाभ प्रति परिवार है।' },
                { q: 'परिवार का कोई सदस्य आयकर देने लगा, अब क्या?', a: 'परिवार अपात्र हो जाता है। उसके बाद मिली राशि लौटानी पड़ सकती है, इसलिए भुगतान लेते रहने के बजाय स्थिति अपडेट करें।' },
            ],
        },
    },
    {
        slug: 'pm-fasal-bima-yojana',
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        shortName: 'PM Fasal Bima Yojana',
        level: 'central',
        authority: 'Ministry of Agriculture & Farmers Welfare, Government of India',
        categories: ['farmers', 'health-insurance'],
        summary: 'Crop insurance for a small premium: 2% for kharif crops, 1.5% for rabi crops, 5% for commercial and horticulture crops. The government pays the rest.',
        intro: 'Crop insurance only helps if you join before the season’s cut-off date and report damage on time. Unlike PM-KISAN, tenant farmers and sharecroppers can join, as long as the crop is notified for insurance in their area that season.',
        whoFor: 'Farmers growing a notified crop in a notified area, including owners, tenant farmers and sharecroppers.',
        eligibility: [
            'The crop you are sowing is notified for insurance in your area for that season.',
            'You are the owner, a tenant farmer or a sharecropper of the land.',
            'Joining is voluntary for every farmer, including those with crop loans.',
        ],
        exclusions: [
            'Crops or areas not notified by your state for that season.',
        ],
        benefits: [
            'Compensation for yield loss from drought, flood, pests, disease and other natural causes, as defined in the scheme.',
            'Farmer’s share of premium: 2% of sum insured for kharif food and oilseed crops, 1.5% for rabi food and oilseed crops, 5% for commercial and horticulture crops. Central and state governments pay the remaining premium.',
        ],
        example: 'A sharecropper in Dumka grows paddy on land owned by someone else. Paddy is notified in her block for the kharif season. With the sharecropping agreement or the certificate her state accepts, she enrols at a CSC before the cut-off and pays 2% of the sum insured as premium.',
        documents: [
            'Aadhaar card',
            'Bank account details',
            'Land records, or the tenancy / sharecropping document your state accepts',
            'Sowing details or sowing certificate, if your state asks for it',
        ],
        howToApply: [
            'Find out the cut-off date for the season from your bank, CSC or pmfby.gov.in.',
            'Enrol through your bank (automatic offer if you have a crop loan), a CSC, an insurance company agent, or the PMFBY portal.',
            'Pay your share of the premium and keep the receipt or policy number.',
            'If a calamity damages your crop, report it within 72 hours through the Crop Insurance app, the 14447 helpline, your bank or the insurance company.',
        ],
        deadlines: 'Each state announces season-wise cut-off dates. Check before sowing.',
        officialLinks: [
            { label: 'PMFBY official portal', url: 'https://pmfby.gov.in/' },
        ],
        helpline: 'Krishi Rakshak helpline: 14447',
        rejections: [
            { problem: 'Enrolled after the cut-off date', fix: 'There is no late enrolment. Note next season’s date early.' },
            { problem: 'Crop loss reported late', fix: 'Report within 72 hours of the event and keep the complaint number.' },
            { problem: 'Crop sown differs from the crop insured', fix: 'If you change the crop, inform the bank or insurer before the cut-off.' },
        ],
        faqs: [
            { q: 'Is PMFBY compulsory if I have a crop loan?', a: 'No. Since 2020 enrolment is voluntary for all farmers. Loanee farmers can opt out by telling their bank before the cut-off.' },
            { q: 'Who decides how much compensation I get?', a: 'Claims depend on yield data for your area and the terms of the scheme for that crop. For local calamities such as hailstorm, losses are assessed for your field.' },
            { q: 'Where do I complain if the claim is delayed?', a: 'Call 14447 or raise it on pmfby.gov.in with your policy or application number.' },
        ],
        sources: [
            { label: 'PMFBY portal', url: 'https://pmfby.gov.in/' },
        ],
        match: { occupations: ['farmer'], minAge: 18 },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
    },
    {
        slug: 'ayushman-bharat-pm-jay',
        name: 'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (AB PM-JAY)',
        shortName: 'Ayushman Bharat PM-JAY',
        level: 'central',
        authority: 'National Health Authority, Government of India',
        categories: ['health-insurance', 'senior-citizens'],
        summary: 'Free, cashless hospital treatment up to ₹5 lakh per family per year. Everyone aged 70 or above is covered, whatever their income.',
        intro: 'You do not “apply” for PM-JAY the way you apply for a scholarship. Either your family is already on the beneficiary list, or you are 70 or older. In both cases the job is the same: check your name, complete e-KYC and get the Ayushman card, which is free.',
        whoFor: 'Families identified as eligible under the scheme, and every person aged 70 or above.',
        eligibility: [
            'Your family is on the PM-JAY beneficiary list (check on beneficiary.nha.gov.in or the Ayushman app), OR',
            'you are aged 70 or above. Income does not matter for this group; you get an Ayushman Vay Vandana card.',
        ],
        exclusions: [],
        benefits: [
            'Up to ₹5 lakh per family per year for hospitalisation (secondary and tertiary care).',
            'Cashless and paperless treatment at empanelled hospitals, government and private.',
            'People aged 70+ whose family is already covered get an extra top-up of up to ₹5 lakh a year for themselves.',
        ],
        example: 'A 72-year-old in Hazaribagh has never been on any list. Since October 2024 he can get an Ayushman Vay Vandana card with his Aadhaar alone, and use it for a cataract or knee surgery at an empanelled hospital without paying.',
        documents: [
            'Aadhaar card (for e-KYC, and as age proof for 70+)',
            'Ration card or another family ID, if the operator asks',
        ],
        howToApply: [
            'Check your name on beneficiary.nha.gov.in or in the Ayushman app.',
            'Complete e-KYC with Aadhaar and download the Ayushman card.',
            'If you need help, go to the Ayushman Mitra desk at an empanelled hospital or to a CSC.',
            'At an empanelled hospital, show the card. Treatment for covered procedures is cashless.',
        ],
        deadlines: 'No application window. You can check eligibility and get the card any time.',
        officialLinks: [
            { label: 'PM-JAY official website', url: 'https://pmjay.gov.in/' },
            { label: 'Check eligibility / get Ayushman card', url: 'https://beneficiary.nha.gov.in/' },
        ],
        helpline: 'National helpline: 14555',
        rejections: [
            { problem: 'Hospital says the card is not valid', fix: 'Confirm the hospital is empanelled for that treatment, and that e-KYC is complete. Call 14555 if it still fails.' },
            { problem: 'Name not found in the list', fix: 'Search with each family member’s details. If you are 70+, apply for the Vay Vandana card instead.' },
            { problem: 'Someone asks for money to make the card', fix: 'The card is free. Do not pay; report it on 14555.' },
        ],
        faqs: [
            { q: 'My parents are over 70 but not on the list. Can they get cover?', a: 'Yes. Since October 2024 every citizen aged 70 or above is eligible regardless of income, through the Ayushman Vay Vandana card.' },
            { q: 'Does PM-JAY pay for doctor visits without admission (OPD)?', a: 'It mainly covers hospital admission and listed procedures. Check the covered procedures on pmjay.gov.in.' },
            { q: 'Can I use it in another state?', a: 'Yes. The card works at empanelled hospitals across India.' },
            { q: 'My family has an employer health scheme. Can a 70+ member still join?', a: 'Seniors already in some other public health schemes must choose one. Check the current rules on pmjay.gov.in.' },
        ],
        sources: [
            { label: 'PM-JAY official website', url: 'https://pmjay.gov.in/' },
            { label: 'Beneficiary portal (NHA)', url: 'https://beneficiary.nha.gov.in/' },
        ],
        match: { occupations: 'any', minAge: 0 },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
        hi: {
            summary: 'हर परिवार को हर साल ₹5 लाख तक का मुफ़्त, कैशलेस अस्पताल इलाज। 70 साल या उससे ज़्यादा उम्र के सभी लोग शामिल हैं, आमदनी कुछ भी हो।',
            intro: 'PM-JAY के लिए छात्रवृत्ति की तरह “आवेदन” नहीं करना होता। या तो आपका परिवार पहले से लाभार्थी सूची में है, या आपकी उम्र 70 साल या उससे ज़्यादा है। दोनों में काम एक ही है: अपना नाम जाँचें, e-KYC करें और आयुष्मान कार्ड लें, जो मुफ़्त है।',
            whoFor: 'योजना में पात्र पहचाने गए परिवार, और 70 साल या उससे ज़्यादा उम्र का हर व्यक्ति।',
            eligibility: [
                'आपका परिवार PM-JAY लाभार्थी सूची में है (beneficiary.nha.gov.in या आयुष्मान ऐप पर जाँचें), या',
                'आपकी उम्र 70 साल या उससे ज़्यादा है। इसमें आमदनी नहीं देखी जाती; आपको आयुष्मान वय वंदना कार्ड मिलता है।',
            ],
            benefits: [
                'हर परिवार को हर साल अस्पताल में भर्ती (सेकेंडरी और टर्शियरी इलाज) के लिए ₹5 लाख तक।',
                'सूचीबद्ध (एम्पैनल्ड) सरकारी और निजी अस्पतालों में कैशलेस और पेपरलेस इलाज।',
                'जिनका परिवार पहले से शामिल है, उनके 70+ सदस्यों को अपने लिए हर साल ₹5 लाख तक का अतिरिक्त कवर।',
            ],
            example: 'हज़ारीबाग के 72 साल के एक बुज़ुर्ग किसी सूची में नहीं थे। अक्टूबर 2024 से वे सिर्फ़ आधार से आयुष्मान वय वंदना कार्ड बनवा सकते हैं, और सूचीबद्ध अस्पताल में मोतियाबिंद या घुटने का ऑपरेशन बिना पैसे दिए करवा सकते हैं।',
            documents: [
                'आधार कार्ड (e-KYC के लिए, और 70+ के लिए उम्र के प्रमाण के रूप में)',
                'राशन कार्ड या परिवार का कोई और पहचान पत्र, अगर ऑपरेटर माँगे',
            ],
            howToApply: [
                'beneficiary.nha.gov.in या आयुष्मान ऐप पर अपना नाम जाँचें।',
                'आधार से e-KYC करें और आयुष्मान कार्ड डाउनलोड करें।',
                'मदद चाहिए तो सूचीबद्ध अस्पताल के आयुष्मान मित्र डेस्क या CSC पर जाएँ।',
                'सूचीबद्ध अस्पताल में कार्ड दिखाएँ। शामिल इलाज कैशलेस होता है।',
            ],
            deadlines: 'कोई आवेदन अवधि नहीं। पात्रता जाँच और कार्ड कभी भी बनवा सकते हैं।',
            helpline: 'राष्ट्रीय हेल्पलाइन: 14555',
            rejections: [
                { problem: 'अस्पताल कहता है कार्ड मान्य नहीं', fix: 'पक्का करें कि अस्पताल उस इलाज के लिए सूचीबद्ध है और e-KYC पूरा है। फिर भी न चले तो 14555 पर कॉल करें।' },
                { problem: 'सूची में नाम नहीं मिला', fix: 'परिवार के हर सदस्य के विवरण से खोजें। 70+ हैं तो वय वंदना कार्ड के लिए आवेदन करें।' },
                { problem: 'कोई कार्ड बनाने के पैसे माँगता है', fix: 'कार्ड मुफ़्त है। पैसे न दें; 14555 पर शिकायत करें।' },
            ],
            faqs: [
                { q: 'मेरे माता-पिता 70 से ऊपर हैं पर सूची में नहीं हैं। क्या उन्हें कवर मिलेगा?', a: 'हाँ। अक्टूबर 2024 से 70 साल या उससे ज़्यादा उम्र का हर नागरिक, आमदनी कुछ भी हो, आयुष्मान वय वंदना कार्ड से पात्र है।' },
                { q: 'क्या बिना भर्ती के डॉक्टर को दिखाने (OPD) का खर्च मिलता है?', a: 'योजना मुख्य रूप से अस्पताल में भर्ती और तय प्रक्रियाओं को कवर करती है। pmjay.gov.in पर शामिल इलाज की सूची देखें।' },
                { q: 'क्या दूसरे राज्य में इस्तेमाल कर सकते हैं?', a: 'हाँ। कार्ड पूरे भारत के सूचीबद्ध अस्पतालों में चलता है।' },
                { q: 'हमारे परिवार के पास किसी और सरकारी स्वास्थ्य योजना का कवर है। क्या 70+ सदस्य फिर भी जुड़ सकते हैं?', a: 'कुछ दूसरी सरकारी स्वास्थ्य योजनाओं वाले बुज़ुर्गों को एक योजना चुननी होती है। मौजूदा नियम pmjay.gov.in पर देखें।' },
            ],
        },
    },
    {
        slug: 'pm-mudra-yojana',
        name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
        shortName: 'PM MUDRA Yojana',
        level: 'central',
        authority: 'Department of Financial Services, Ministry of Finance, Government of India',
        categories: ['business', 'employment', 'women'],
        summary: 'Bank loans without collateral for small businesses: up to ₹50,000 to start, rising to ₹20 lakh for borrowers who repaid an earlier MUDRA loan.',
        intro: 'MUDRA is not a grant. It is a normal bank loan with interest, but you do not have to pledge land or gold, because the loan is backed by a government guarantee. The bank still checks whether your business can repay it, so a clear plan matters more than any agent.',
        whoFor: 'People starting or growing a small non-farm business: a shop, tailoring unit, repair workshop, food stall, transport vehicle or an activity allied to farming such as dairy or poultry.',
        eligibility: [
            'You run, or want to start, a small income-generating business that is not a company and not crop farming.',
            'You are 18 or older and pass the lender’s normal credit checks.',
            'Tarun Plus (above ₹10 lakh) is only for people who took a Tarun loan and repaid it in full.',
        ],
        exclusions: [
            'Personal loans, crop loans and loans for buying land are not MUDRA loans.',
        ],
        benefits: [
            'Shishu: up to ₹50,000.',
            'Kishore: above ₹50,000, up to ₹5 lakh.',
            'Tarun: above ₹5 lakh, up to ₹10 lakh.',
            'Tarun Plus: above ₹10 lakh, up to ₹20 lakh (repeat borrowers only, from 24 October 2024).',
            'No collateral. The bank sets the interest rate.',
        ],
        example: 'A woman who stitches blouses at home wants a second sewing machine and fabric stock worth ₹45,000. That is a Shishu loan. She takes quotations for the machine to her bank with Aadhaar and a one-page plan of how much she earns each month.',
        documents: [
            'Identity and address proof (such as Aadhaar)',
            'A short business plan, or quotations for the machines or stock you want to buy',
            'Proof of business address, and Udyam registration if you have it',
            'Bank statements of the last few months, and caste certificate if applicable',
        ],
        howToApply: [
            'Write down what the loan is for, how much you need and how you will repay it each month.',
            'Visit a bank, small finance bank, NBFC or microfinance institution, or apply online on Udyamimitra.',
            'Fill in the MUDRA form for the right category (Shishu, Kishore, Tarun or Tarun Plus).',
            'The lender checks your documents and plan, may visit your business, and then sanctions the loan.',
        ],
        deadlines: 'Open all year.',
        officialLinks: [
            { label: 'MUDRA official website', url: 'https://www.mudra.org.in/' },
            { label: 'Apply online (Udyamimitra)', url: 'https://www.udyamimitra.in/' },
        ],
        helpline: 'State-wise MUDRA toll-free numbers are listed on mudra.org.in.',
        rejections: [
            { problem: 'Weak or missing business plan', fix: 'Show expected monthly income, costs and the instalment you can afford. Quotations help.' },
            { problem: 'Poor repayment history on another loan', fix: 'Clear old dues first; check your credit report.' },
            { problem: 'Asking for Tarun Plus as a first loan', fix: 'Tarun Plus is only after a Tarun loan is fully repaid. Apply in the right category.' },
        ],
        faqs: [
            { q: 'Do I have to pay anyone to get a MUDRA loan?', a: 'No. There is no fee to an agent. Be careful of people who promise a “guaranteed” loan for money.' },
            { q: 'What interest will I pay?', a: 'Each bank sets its own rate within RBI rules. Compare at two banks if you can.' },
            { q: 'Can I get a MUDRA loan for a cow or buffalo?', a: 'Yes, dairy and other activities allied to agriculture are allowed. Crop cultivation itself is not.' },
        ],
        sources: [
            { label: 'MUDRA official website', url: 'https://www.mudra.org.in/' },
            { label: 'PIB, Ministry of Finance: Tarun Plus category (October 2024)', url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2024/oct/doc20241029426401.pdf' },
        ],
        match: { occupations: ['business', 'worker', 'unemployed', 'homemaker'], minAge: 18 },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
        hi: {
            summary: 'छोटे व्यवसाय के लिए बिना गारंटी (कोलैटरल) का बैंक लोन: शुरुआत में ₹50,000 तक, और पिछला MUDRA लोन चुकाने वालों के लिए ₹20 लाख तक।',
            intro: 'MUDRA अनुदान नहीं है। यह ब्याज वाला सामान्य बैंक लोन है, पर इसमें ज़मीन या सोना गिरवी नहीं रखना पड़ता, क्योंकि लोन पर सरकारी गारंटी होती है। बैंक फिर भी देखता है कि आपका काम लोन चुका पाएगा या नहीं, इसलिए किसी एजेंट से ज़्यादा ज़रूरी एक साफ़ योजना है।',
            whoFor: 'जो लोग खेती के अलावा कोई छोटा काम शुरू करना या बढ़ाना चाहते हैं: दुकान, सिलाई, मरम्मत की दुकान, खाने का ठेला, सवारी गाड़ी, या खेती से जुड़ा काम जैसे डेयरी या मुर्गी पालन।',
            eligibility: [
                'आपका कोई छोटा कमाई वाला काम है या शुरू करना है, जो कंपनी नहीं है और फ़सल की खेती नहीं है।',
                'आपकी उम्र 18 साल या ज़्यादा है और आप बैंक की सामान्य क्रेडिट जाँच में ठीक हैं।',
                'तरुण प्लस (₹10 लाख से ऊपर) सिर्फ़ उनके लिए है जिन्होंने तरुण लोन लेकर पूरा चुका दिया है।',
            ],
            exclusions: [
                'पर्सनल लोन, फ़सल लोन और ज़मीन खरीदने का लोन MUDRA लोन नहीं हैं।',
            ],
            benefits: [
                'शिशु: ₹50,000 तक।',
                'किशोर: ₹50,000 से ऊपर, ₹5 लाख तक।',
                'तरुण: ₹5 लाख से ऊपर, ₹10 लाख तक।',
                'तरुण प्लस: ₹10 लाख से ऊपर, ₹20 लाख तक (सिर्फ़ दोबारा लोन लेने वाले, 24 अक्टूबर 2024 से)।',
                'कोई गारंटी नहीं। ब्याज दर बैंक तय करता है।',
            ],
            example: 'घर पर ब्लाउज़ सिलने वाली एक महिला को दूसरी सिलाई मशीन और ₹45,000 का कपड़ा चाहिए। यह शिशु लोन है। वह मशीन का कोटेशन, आधार और एक पन्ने की योजना (हर महीने कितना कमाती है) लेकर बैंक जाती है।',
            documents: [
                'पहचान और पते का प्रमाण (जैसे आधार)',
                'छोटी व्यवसाय योजना, या मशीन / सामान के कोटेशन',
                'काम की जगह के पते का प्रमाण, और उद्यम पंजीकरण हो तो वह',
                'पिछले कुछ महीनों का बैंक स्टेटमेंट, और लागू हो तो जाति प्रमाण पत्र',
            ],
            howToApply: [
                'लिख लें कि लोन किस काम के लिए है, कितना चाहिए और हर महीने कैसे चुकाएँगे।',
                'बैंक, स्मॉल फ़ाइनेंस बैंक, NBFC या माइक्रोफ़ाइनेंस संस्था में जाएँ, या उद्यमी मित्र पर ऑनलाइन आवेदन करें।',
                'सही श्रेणी (शिशु, किशोर, तरुण या तरुण प्लस) का MUDRA फ़ॉर्म भरें।',
                'बैंक कागज़ और योजना जाँचता है, काम की जगह देख सकता है, और फिर लोन मंज़ूर करता है।',
            ],
            deadlines: 'पूरे साल खुला।',
            helpline: 'राज्यवार MUDRA टोल-फ़्री नंबर mudra.org.in पर दिए हैं।',
            rejections: [
                { problem: 'व्यवसाय योजना कमज़ोर या नहीं है', fix: 'हर महीने की अनुमानित कमाई, खर्च और आप कितनी किस्त दे सकते हैं, यह दिखाएँ। कोटेशन मदद करते हैं।' },
                { problem: 'किसी और लोन का भुगतान ठीक नहीं रहा', fix: 'पहले पुराना बकाया चुकाएँ; अपनी क्रेडिट रिपोर्ट देखें।' },
                { problem: 'पहले ही लोन में तरुण प्लस माँगना', fix: 'तरुण प्लस तरुण लोन पूरा चुकाने के बाद ही मिलता है। सही श्रेणी में आवेदन करें।' },
            ],
            faqs: [
                { q: 'क्या MUDRA लोन के लिए किसी को पैसे देने पड़ते हैं?', a: 'नहीं। किसी एजेंट को कोई फ़ीस नहीं देनी होती। “पक्का लोन” दिलाने के नाम पर पैसे माँगने वालों से सावधान रहें।' },
                { q: 'ब्याज कितना लगेगा?', a: 'हर बैंक RBI के नियमों में अपनी दर तय करता है। हो सके तो दो बैंकों में तुलना करें।' },
                { q: 'क्या गाय या भैंस के लिए MUDRA लोन मिल सकता है?', a: 'हाँ, डेयरी और खेती से जुड़े काम शामिल हैं। फ़सल की खेती खुद शामिल नहीं है।' },
            ],
        },
    },
    {
        slug: 'stand-up-india',
        name: 'Stand-Up India Scheme',
        shortName: 'Stand-Up India',
        level: 'central',
        authority: 'Department of Financial Services, Ministry of Finance, Government of India (portal run by SIDBI)',
        categories: ['business', 'women'],
        summary: 'Bank loans of ₹10 lakh to ₹1 crore for women and SC/ST entrepreneurs starting a brand-new enterprise.',
        intro: 'Stand-Up India is for your first enterprise in a sector, not for expanding a shop you already run. Every scheduled commercial bank branch is expected to finance such entrepreneurs, and you still bring a part of the project cost yourself.',
        whoFor: 'Women entrepreneurs, and Scheduled Caste or Scheduled Tribe entrepreneurs, aged 18 or above.',
        eligibility: [
            'You are a woman, or belong to a Scheduled Caste or Scheduled Tribe, and you are 18 or older.',
            'The loan is for a greenfield (first-time) enterprise in manufacturing, services, trading or an activity allied to agriculture.',
            'For a company or partnership, at least 51% of the shareholding and control is held by an SC/ST or woman entrepreneur.',
            'You have not defaulted on any bank or financial institution.',
        ],
        exclusions: [
            'Expansion of an existing business.',
        ],
        benefits: [
            'A composite loan of ₹10 lakh to ₹1 crore (term loan plus working capital).',
            'Repayment over up to 7 years, with a moratorium of up to 18 months.',
            'Guidance and links to support agencies through the Stand-Up Mitra portal.',
        ],
        example: 'An SC entrepreneur who has worked in a flour mill for years wants to set up his own mill costing ₹18 lakh. It is his first enterprise, so it is greenfield. He brings at least 10% of the cost as his own margin and applies at a bank branch with a project report.',
        documents: [
            'Identity and address proof',
            'Caste certificate (for SC/ST applicants)',
            'Project report with costs and expected income',
            'Proof of business premises and quotations',
        ],
        howToApply: [
            'Register on standupmitra.in, or go directly to a scheduled commercial bank branch.',
            'You can also ask the Lead District Manager (LDM) of your district for help.',
            'Submit the project report and documents.',
            'The bank appraises the project and sanctions the loan.',
        ],
        deadlines: 'Open all year.',
        officialLinks: [
            { label: 'Stand-Up Mitra portal', url: 'https://www.standupmitra.in/' },
        ],
        helpline: 'Contact details for help centres and Lead District Managers are on standupmitra.in.',
        rejections: [
            { problem: 'The business already exists', fix: 'For expansion, ask the bank about MUDRA or other MSME loans instead.' },
            { problem: 'No margin money', fix: 'Arrange at least 10% of the project cost yourself, or ask about state schemes that support margin money.' },
        ],
        faqs: [
            { q: 'Can a woman and her husband apply together?', a: 'A partnership or company qualifies if at least 51% of shares and control are with the woman.' },
            { q: 'Is the loan interest-free?', a: 'No. It is a bank loan at the bank’s rate, which is expected to be the lowest applicable rate for that category.' },
        ],
        sources: [
            { label: 'Stand-Up Mitra portal (SIDBI)', url: 'https://www.standupmitra.in/' },
        ],
        match: { occupations: ['business', 'worker', 'unemployed', 'homemaker'], minAge: 18, requires: 'woman-or-scst' },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
    },
    {
        slug: 'atal-pension-yojana',
        name: 'Atal Pension Yojana (APY)',
        shortName: 'Atal Pension Yojana',
        level: 'central',
        authority: 'Department of Financial Services; administered by PFRDA',
        categories: ['senior-citizens', 'health-insurance'],
        summary: 'Pay a small amount every month until 60, then receive a fixed pension of ₹1,000 to ₹5,000 a month for life. Open to non-taxpayers aged 18–40.',
        intro: 'APY suits people without an employer pension: farm workers, drivers, domestic workers, small traders. The earlier you join, the less you pay each month for the same pension, because you contribute for more years.',
        whoFor: 'Indian citizens aged 18 to 40 with a savings account who do not pay income tax.',
        eligibility: [
            'You are an Indian citizen aged 18 to 40.',
            'You have a savings account at a bank or post office.',
            'You are not, and have never been, an income-tax payer (rule since 1 October 2022).',
        ],
        exclusions: [
            'Income-tax payers cannot join from 1 October 2022. People who joined before that date continue.',
        ],
        benefits: [
            'Guaranteed pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000 or ₹5,000 a month from age 60, depending on the amount you chose.',
            'After you, your spouse receives the same pension for life.',
            'After both of you, the saved amount is paid to your nominee.',
        ],
        example: 'A 25-year-old auto driver chooses a ₹3,000 pension. His bank debits a fixed small amount every month for 35 years. At 60 the pension starts, and if he dies first, his wife gets the same ₹3,000.',
        documents: [
            'Savings account at a bank or post office',
            'Aadhaar and mobile number',
            'Nominee details',
        ],
        howToApply: [
            'Go to the bank or post office where you have a savings account, or use your bank’s app or net banking if it offers APY.',
            'Fill in the APY form and choose the pension amount.',
            'Contributions are auto-debited monthly, quarterly or half-yearly.',
        ],
        deadlines: 'You can join any time between ages 18 and 40.',
        officialLinks: [
            { label: 'Jan Suraksha portal (Government of India)', url: 'https://www.jansuraksha.gov.in/' },
            { label: 'PFRDA', url: 'https://www.pfrda.org.in/' },
        ],
        helpline: 'APY subscriber helpline (CRA): 1800-889-1030',
        rejections: [
            { problem: 'Auto-debit failed', fix: 'Keep enough balance on the debit date. Missed contributions attract a small penalty.' },
            { problem: 'Joined after age 40', fix: 'APY cannot be opened after 40. Ask your bank about the National Pension System (NPS).' },
        ],
        faqs: [
            { q: 'How much do I pay each month?', a: 'It depends on your age when you join and the pension you pick. The official contribution chart is on jansuraksha.gov.in.' },
            { q: 'Can I change the pension amount later?', a: 'Yes, you can raise or lower it once a year through your bank.' },
            { q: 'Can I leave the scheme before 60?', a: 'Voluntary exit is allowed with conditions; you get back your contributions with earnings as per the rules.' },
        ],
        sources: [
            { label: 'Jan Suraksha portal', url: 'https://www.jansuraksha.gov.in/' },
            { label: 'PFRDA', url: 'https://www.pfrda.org.in/' },
        ],
        match: { occupations: 'any', minAge: 18, maxAge: 40, excludesTaxPayers: true },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
    },
    {
        slug: 'pm-jeevan-jyoti-bima-yojana',
        name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
        shortName: 'PM Jeevan Jyoti Bima Yojana',
        level: 'central',
        authority: 'Department of Financial Services, Ministry of Finance, Government of India',
        categories: ['health-insurance'],
        summary: 'Life cover of ₹2 lakh for ₹436 a year. Your nominee gets the money if you die from any cause.',
        intro: 'For ₹436 a year, about ₹36 a month, your family gets ₹2 lakh if you die from any cause, illness included. It is term insurance: if nothing happens, nothing is paid back. Many people already have it through their bank and do not know it, so check your passbook for the yearly debit.',
        whoFor: 'People aged 18 to 50 with a savings account at a bank or post office.',
        eligibility: [
            'You are 18 to 50 years old and have a savings account.',
            'You agree to the premium being auto-debited once a year.',
        ],
        exclusions: [
            'Cover ends at age 55.',
        ],
        benefits: [
            '₹2 lakh to the nominee on death from any cause.',
            'Premium ₹436 a year, auto-debited.',
            'If you join before 50 and keep renewing, cover continues up to 55.',
        ],
        example: 'A 32-year-old mason enrols at his bank. ₹436 is debited every year around May. If he dies of an illness at 40, his wife as nominee claims ₹2 lakh through the bank.',
        documents: [
            'Savings account at a bank or post office',
            'Aadhaar for KYC, and nominee details',
        ],
        howToApply: [
            'Enrol at your bank or post office branch, or in your bank’s app or net banking.',
            'Fill in the consent-cum-declaration form with nominee details.',
            'The premium is auto-debited every year.',
        ],
        deadlines: 'The cover year runs from 1 June to 31 May and renews automatically.',
        officialLinks: [
            { label: 'Jan Suraksha portal (Government of India)', url: 'https://www.jansuraksha.gov.in/' },
        ],
        helpline: JAN_SURAKSHA_HELPLINE,
        rejections: [
            { problem: 'Policy lapsed', fix: 'Keep ₹436 in the account before the renewal date (end of May).' },
            { problem: 'Claim delayed', fix: 'The nominee submits the claim form with death certificate at the same bank branch; ask for an acknowledgement.' },
        ],
        faqs: [
            { q: 'Is a new joiner covered from day one?', a: 'For new enrolments, death in the first 30 days is covered only if it is due to an accident.' },
            { q: 'Can I have both PMJJBY and PMSBY?', a: 'Yes. Together they cost ₹456 a year. PMJJBY covers death from any cause; PMSBY covers accidents and disability.' },
        ],
        sources: [
            { label: 'Jan Suraksha portal', url: 'https://www.jansuraksha.gov.in/' },
        ],
        match: { occupations: 'any', minAge: 18, maxAge: 50 },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
    },
    {
        slug: 'pm-suraksha-bima-yojana',
        name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
        shortName: 'PM Suraksha Bima Yojana',
        level: 'central',
        authority: 'Department of Financial Services, Ministry of Finance, Government of India',
        categories: ['health-insurance'],
        summary: 'Accident cover for ₹20 a year: ₹2 lakh for death or total disability, ₹1 lakh for partial disability.',
        intro: 'At ₹20 a year this is the cheapest cover on this site, and it pays only for accidents. It suits anyone who travels on roads every day or works with machines, from age 18 up to 70.',
        whoFor: 'People aged 18 to 70 with a savings account at a bank or post office.',
        eligibility: [
            'You are 18 to 70 years old and have a savings account.',
            'You agree to the premium being auto-debited once a year.',
        ],
        exclusions: [
            'Death or illness that is not caused by an accident.',
        ],
        benefits: [
            '₹2 lakh for accidental death or total permanent disability.',
            '₹1 lakh for partial permanent disability.',
            'Premium ₹20 a year, auto-debited.',
        ],
        example: 'A delivery rider aged 45 loses the use of one hand in a road accident. Under PMSBY he can claim ₹1 lakh for partial permanent disability through his bank.',
        documents: [
            'Savings account at a bank or post office',
            'Aadhaar for KYC, and nominee details',
        ],
        howToApply: [
            'Enrol at your bank or post office branch, or in your bank’s app or net banking.',
            'Fill in the consent-cum-declaration form.',
            'The premium is auto-debited every year.',
        ],
        deadlines: 'The cover year runs from 1 June to 31 May and renews automatically.',
        officialLinks: [
            { label: 'Jan Suraksha portal (Government of India)', url: 'https://www.jansuraksha.gov.in/' },
        ],
        helpline: JAN_SURAKSHA_HELPLINE,
        rejections: [
            { problem: 'Claim for death from illness', fix: 'PMSBY covers accidents only. For death from any cause, see PM Jeevan Jyoti Bima Yojana.' },
            { problem: 'No accident record', fix: 'Keep the FIR or hospital record of the accident; the claim needs it.' },
        ],
        faqs: [
            { q: 'Does it pay hospital bills?', a: 'No. It pays a fixed amount for death or permanent disability, not treatment costs. For hospital costs, see Ayushman Bharat PM-JAY.' },
            { q: 'I have accounts in two banks. Can I enrol twice?', a: 'No. You can be covered through only one account.' },
        ],
        sources: [
            { label: 'Jan Suraksha portal', url: 'https://www.jansuraksha.gov.in/' },
        ],
        match: { occupations: 'any', minAge: 18, maxAge: 70 },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
    },
    {
        slug: 'sukanya-samriddhi-yojana',
        name: 'Sukanya Samriddhi Yojana (SSY)',
        shortName: 'Sukanya Samriddhi Yojana',
        level: 'central',
        authority: 'Ministry of Finance, Government of India; accounts at post offices and authorised banks',
        categories: ['women', 'students'],
        summary: 'A savings account for a daughter under 10. Deposit ₹250 to ₹1.5 lakh a year for 15 years; the account matures when it is 21 years old.',
        intro: 'This is savings, not a cash benefit: the money in the account is what you deposit plus interest set by the government every quarter. It works best when parents start early and deposit a little every year, so the amount is there for higher education.',
        whoFor: 'Parents or legal guardians of a girl below 10 years of age.',
        eligibility: [
            'The girl is under 10 when the account is opened.',
            'One account per girl, and normally up to two girls per family (more for twins or triplets).',
        ],
        exclusions: [],
        benefits: [
            'Deposit at least ₹250 and up to ₹1.5 lakh in a financial year.',
            'Deposits for 15 years; the account matures 21 years after opening.',
            'Up to 50% can be withdrawn after she turns 18, for higher education.',
            'Interest is announced by the government each quarter (it has been 8.2% a year in recent quarters). Confirm the current rate at the post office.',
            'Deposits qualify for tax deduction under Section 80C in the old tax regime.',
        ],
        example: 'Parents open an account when their daughter is 2 and deposit ₹500 a month. They stop depositing after 15 years, when she is 17. The account keeps earning interest and matures when she is 23, 21 years after opening.',
        documents: [
            'Birth certificate of the girl',
            'Identity and address proof of the parent or guardian',
            'Photographs',
        ],
        howToApply: [
            'Visit a post office or an authorised bank branch.',
            'Fill in the account opening form and submit the documents.',
            'Make the first deposit of at least ₹250.',
        ],
        deadlines: 'Open the account before the girl turns 10.',
        officialLinks: [
            { label: 'India Post: savings schemes', url: 'https://www.indiapost.gov.in/' },
        ],
        helpline: 'Ask at your post office or bank branch.',
        rejections: [
            { problem: 'Account became “defaulted”', fix: 'Deposit the missed minimum (₹250 a year) with the ₹50 per year penalty to revive it.' },
            { problem: 'Daughter already 10 or older', fix: 'An SSY account cannot be opened. Ask about other savings options at the post office.' },
        ],
        faqs: [
            { q: 'Can the account be moved to another city?', a: 'Yes. It can be transferred between post offices and banks.' },
            { q: 'Can we withdraw for her marriage?', a: 'The account can be closed early for her marriage after she turns 18, under the scheme rules.' },
        ],
        sources: [
            { label: 'India Post: Sukanya Samriddhi Account', url: 'https://www.indiapost.gov.in/' },
        ],
        match: { occupations: 'any', minAge: 18, parentOfGirlUnder10: true },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
    },
    {
        slug: 'post-matric-scholarship-sc-students',
        name: 'Post Matric Scholarship for Scheduled Caste Students',
        shortName: 'Post Matric Scholarship (SC)',
        level: 'central',
        authority: 'Ministry of Social Justice & Empowerment, Government of India (implemented through states)',
        categories: ['students'],
        summary: 'Fees and a yearly allowance for Scheduled Caste students from Class 11 onwards, if family income is up to ₹2.5 lakh a year.',
        intro: 'This scholarship pays your compulsory fees directly and adds an allowance, from Class 11 up to PhD. It is applied for every year, and most rejections come from paperwork: an old income certificate, or an institute that never verified the form.',
        whoFor: 'Scheduled Caste students in any recognised course after Class 10: Class 11–12, ITI, diploma, graduation, post-graduation and similar.',
        eligibility: [
            'You belong to a Scheduled Caste.',
            'You are studying a recognised course after Class 10.',
            'Your parents’ or guardians’ total income is up to ₹2.5 lakh a year.',
        ],
        exclusions: [
            'Family income above ₹2.5 lakh a year. A proposal to raise the limit to ₹4.5 lakh was reported in 2026, but no change had been notified when we last checked.',
        ],
        benefits: [
            'Compulsory non-refundable fees charged by the institution.',
            'An academic allowance that depends on the course group. Current amounts are in the official guidelines.',
        ],
        example: 'A student in Class 11 at a government school in Ranchi lives with her mother, who earns about ₹1.2 lakh a year. She applies with her caste certificate, a current income certificate and her Class 10 marksheet, and her school verifies the form online.',
        documents: [
            'Caste certificate',
            'Income certificate (current, from the competent authority)',
            'Previous year’s marksheet',
            'Admission or fee receipt from the institution',
            'Aadhaar and an Aadhaar-linked bank account',
        ],
        howToApply: [
            'Find out whether your state uses the National Scholarship Portal or its own scholarship portal for this scheme.',
            'Register, fill in the form and upload the documents before the deadline.',
            'Make sure your institution verifies the application; then the district or state office approves it.',
            'Apply again every academic year to renew.',
        ],
        deadlines: 'Opens once a year around the start of the session. The exact dates are announced on the scholarship portal.',
        officialLinks: [
            { label: 'National Scholarship Portal', url: 'https://scholarships.gov.in/' },
            { label: 'myScheme: state scholarship details', url: 'https://www.myscheme.gov.in/' },
        ],
        helpline: 'National Scholarship Portal helpdesk: 0120-6619540, helpdesk@nsp.gov.in',
        rejections: [
            { problem: 'Income certificate expired or from the wrong office', fix: 'Get a fresh certificate from the authority your state accepts before applying.' },
            { problem: 'Institute did not verify the form', fix: 'Remind the scholarship nodal officer at your institute before the verification deadline.' },
            { problem: 'Bank account not Aadhaar-linked', fix: 'Link Aadhaar to the account so the money can be paid.' },
        ],
        faqs: [
            { q: 'Do students in Jharkhand apply on the National Scholarship Portal?', a: 'Several states use their own portal for this scheme. Ask your institute’s scholarship nodal officer or the state welfare department.' },
            { q: 'Can I get this along with another scholarship?', a: 'Generally you can hold only one scholarship for the same course. Check the rules for the other scholarship before applying.' },
            { q: 'I failed a year. Can I still renew?', a: 'Renewal usually depends on being promoted to the next class. Check your state’s guidelines.' },
        ],
        sources: [
            { label: 'National Scholarship Portal (helpdesk details)', url: 'https://scholarships.gov.in/' },
            { label: 'myScheme', url: 'https://www.myscheme.gov.in/' },
        ],
        match: { occupations: ['student'], minAge: 14, requires: 'sc', excludesHighIncome: true },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
    },
    {
        slug: 'pm-kaushal-vikas-yojana',
        name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
        shortName: 'PM Kaushal Vikas Yojana',
        level: 'central',
        authority: 'Ministry of Skill Development & Entrepreneurship, Government of India',
        categories: ['employment', 'students'],
        summary: 'Free job-skill courses with a government certificate, from electrician and tailoring to retail and IT. Short courses are for ages 15–45.',
        intro: 'PMKVY training is free. If a centre asks you for a course fee, that is a warning sign. You pick a job role, train at an approved centre, pass an assessment and get a certificate that employers recognise. People who already have a skill but no certificate can get it certified through Recognition of Prior Learning (RPL).',
        whoFor: 'Young people who want a job skill or a certificate for skills they already have, including school and college dropouts.',
        eligibility: [
            'You are an Indian citizen.',
            'Short-term training: aged 15 to 45. Recognition of Prior Learning (RPL): aged 18 to 59.',
            'Some job roles need a minimum education level; it is shown with each course.',
        ],
        exclusions: [],
        benefits: [
            'Free training at approved centres.',
            'Assessment and a government-recognised certificate.',
            'Placement support at many centres.',
        ],
        example: 'A 19-year-old who left school after Class 10 joins a three-month electrician (domestic) course at a centre in his district, found on the Skill India Digital Hub. He pays nothing, passes the assessment and gets a certificate he can show to contractors.',
        documents: [
            'Aadhaar card',
            'Educational certificates, if the course needs them',
            'Bank account details',
        ],
        howToApply: [
            'Register on the Skill India Digital Hub (skillindiadigital.gov.in).',
            'Search courses and training centres near you, and check the eligibility shown for each course.',
            'Enrol, attend the training, and take the assessment.',
        ],
        deadlines: 'Batches start at different times at each centre.',
        officialLinks: [
            { label: 'Skill India Digital Hub', url: 'https://www.skillindiadigital.gov.in/' },
        ],
        helpline: 'Skill India candidate helpline: 8800055555',
        rejections: [
            { problem: 'Centre asks for a fee', fix: 'Do not pay. Check the centre on the Skill India Digital Hub and report it on 8800055555.' },
            { problem: 'Over 45 for a short course', fix: 'If you already work in the trade, ask about RPL certification, which goes up to 59.' },
        ],
        faqs: [
            { q: 'Do I get a job guarantee?', a: 'No. Many centres help with placement, but a job is not guaranteed.' },
            { q: 'Can I do two courses?', a: 'Check the current rules on the Skill India Digital Hub for the course you want.' },
        ],
        sources: [
            { label: 'Skill India Digital Hub', url: 'https://www.skillindiadigital.gov.in/' },
        ],
        match: { occupations: ['student', 'unemployed', 'worker', 'homemaker'], minAge: 15, maxAge: 59 },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
    },
    {
        slug: 'jharkhand-maiyan-samman-yojana',
        name: 'Jharkhand Mukhyamantri Maiyan Samman Yojana (JMMSY)',
        shortName: 'Maiyan Samman Yojana',
        level: 'state',
        state: 'Jharkhand',
        authority: 'Government of Jharkhand',
        categories: ['women'],
        summary: '₹2,500 every month for women in Jharkhand aged 18 to 50, paid into an Aadhaar-linked bank account.',
        intro: 'Maiyan Samman is a Jharkhand state scheme, so only women living in Jharkhand can apply. The amount was raised from ₹1,000 to ₹2,500 a month from December 2024. Applications are taken online and at camps the state organises, and payments go only to a single Aadhaar-linked account in the woman’s own name.',
        whoFor: 'Women who live in Jharkhand and are 18 to 50 years old.',
        eligibility: [
            'You are a woman and a resident of Jharkhand.',
            'You are 18 to 50 years old.',
            'You have one bank account in your own name, linked with Aadhaar.',
        ],
        exclusions: [
            'Women from families with a government employee or an income-tax payer, as reported. The official portal lists the full exclusions.',
        ],
        benefits: [
            '₹2,500 a month by Direct Benefit Transfer (raised from ₹1,000 in December 2024).',
        ],
        example: 'A 34-year-old homemaker in Giridih has a bank account linked to Aadhaar and a ration card in the family’s name. Her husband works on daily wages and pays no income tax. She applies at the panchayat camp and the money comes to her own account each month.',
        documents: [
            'Aadhaar card',
            'Proof of Jharkhand residence (such as ration card or domicile certificate)',
            'Details of your Aadhaar-linked bank account',
        ],
        howToApply: [
            'Apply on the official portal, or at a camp held by the state in your panchayat or ward.',
            'Submit the form with your documents and keep the acknowledgement.',
            'Track the application status on the official portal.',
        ],
        deadlines: 'Watch the official portal and local announcements for open application periods.',
        officialLinks: [
            { label: 'Maiyan Samman Yojana official portal', url: 'https://mmmsy.jharkhand.gov.in/' },
            { label: 'Scheme on myScheme', url: 'https://www.myscheme.gov.in/schemes/jmmsy' },
        ],
        rejections: [
            { problem: 'Bank account not linked with Aadhaar', fix: 'Link Aadhaar at your bank; payments fail without it.' },
            { problem: 'Account in a family member’s name', fix: 'The account must be in the applicant woman’s own name.' },
            { problem: 'Age outside 18–50', fix: 'Check your age on the Aadhaar card; the scheme is only for this age band.' },
        ],
        faqs: [
            { q: 'Can a woman from another state living in Jharkhand apply?', a: 'The scheme is for residents of Jharkhand. Check the residence proof accepted on the official portal.' },
            { q: 'Is there a family income limit?', a: 'Some reports mention one, but we could not confirm it from an official source. Check the official portal before applying.' },
        ],
        sources: [
            { label: 'Maiyan Samman Yojana official portal', url: 'https://mmmsy.jharkhand.gov.in/' },
            { label: 'myScheme: JMMSY', url: 'https://www.myscheme.gov.in/schemes/jmmsy' },
        ],
        match: { occupations: 'any', minAge: 18, maxAge: 50, gender: 'female', state: 'Jharkhand', excludesTaxPayers: true },
        review: { status: 'pending', lastUpdated: '2026-11-10' },
        hi: {
            summary: 'झारखंड की 18 से 50 साल की महिलाओं को हर महीने ₹2,500, आधार से जुड़े बैंक खाते में।',
            intro: 'मैयां सम्मान झारखंड सरकार की योजना है, इसलिए सिर्फ़ झारखंड में रहने वाली महिलाएँ आवेदन कर सकती हैं। दिसंबर 2024 से राशि ₹1,000 से बढ़कर ₹2,500 प्रति माह हो गई। आवेदन ऑनलाइन और सरकार के शिविरों में लिए जाते हैं, और पैसा सिर्फ़ महिला के अपने नाम के एक आधार-लिंक्ड खाते में आता है।',
            whoFor: 'झारखंड में रहने वाली 18 से 50 साल की महिलाएँ।',
            eligibility: [
                'आप महिला हैं और झारखंड की निवासी हैं।',
                'आपकी उम्र 18 से 50 साल है।',
                'आपके अपने नाम पर एक बैंक खाता है, जो आधार से जुड़ा है।',
            ],
            exclusions: [
                'जिन परिवारों में कोई सरकारी कर्मचारी या आयकरदाता है, उनकी महिलाएँ (जैसा बताया गया है)। पूरी सूची आधिकारिक पोर्टल पर है।',
            ],
            benefits: [
                'डायरेक्ट बेनिफिट ट्रांसफर से हर महीने ₹2,500 (दिसंबर 2024 में ₹1,000 से बढ़ाया गया)।',
            ],
            example: 'गिरिडीह की 34 साल की एक गृहिणी का बैंक खाता आधार से जुड़ा है और परिवार के नाम राशन कार्ड है। उनके पति दिहाड़ी पर काम करते हैं और आयकर नहीं देते। वे पंचायत के शिविर में आवेदन करती हैं, और हर महीने पैसा उनके अपने खाते में आता है।',
            documents: [
                'आधार कार्ड',
                'झारखंड निवास का प्रमाण (जैसे राशन कार्ड या निवास प्रमाण पत्र)',
                'आधार से जुड़े बैंक खाते का विवरण',
            ],
            howToApply: [
                'आधिकारिक पोर्टल पर, या अपनी पंचायत / वार्ड में राज्य के शिविर में आवेदन करें।',
                'दस्तावेज़ों के साथ फ़ॉर्म जमा करें और पावती (रसीद) संभालकर रखें।',
                'आवेदन की स्थिति आधिकारिक पोर्टल पर देखें।',
            ],
            deadlines: 'आवेदन कब खुले हैं, यह आधिकारिक पोर्टल और स्थानीय सूचनाओं पर देखें।',
            rejections: [
                { problem: 'बैंक खाता आधार से नहीं जुड़ा', fix: 'बैंक जाकर आधार जुड़वाएँ; इसके बिना भुगतान फेल होता है।' },
                { problem: 'खाता परिवार के किसी और सदस्य के नाम पर', fix: 'खाता आवेदन करने वाली महिला के अपने नाम पर होना चाहिए।' },
                { problem: 'उम्र 18–50 से बाहर', fix: 'आधार कार्ड पर अपनी उम्र देखें; योजना सिर्फ़ इसी आयु वर्ग के लिए है।' },
            ],
            faqs: [
                { q: 'दूसरे राज्य की महिला जो झारखंड में रहती है, क्या आवेदन कर सकती है?', a: 'योजना झारखंड के निवासियों के लिए है। कौन-सा निवास प्रमाण मान्य है, यह आधिकारिक पोर्टल पर देखें।' },
                { q: 'क्या परिवार की आमदनी की कोई सीमा है?', a: 'कुछ रिपोर्टों में सीमा बताई गई है, पर हम किसी आधिकारिक स्रोत से इसकी पुष्टि नहीं कर पाए। आवेदन से पहले आधिकारिक पोर्टल देखें।' },
            ],
        },
    },
]

export const getScheme = (slug) => SCHEMES.find((s) => s.slug === slug)
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id)
export const schemesInCategory = (id) => SCHEMES.filter((s) => s.categories.includes(id))

// A scheme with its Hindi text where a reviewed translation exists. `isHindi`
// tells the page whether to say that the details are still in English.
export const localizeScheme = (scheme, language) => {
    if (language !== 'hi' || !scheme.hi) return { ...scheme, isHindi: false }
    return { ...scheme, ...scheme.hi, isHindi: true }
}
export const categoryLabel = (category, language) =>
    (language === 'hi' && category?.labelHi) || category?.label

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
