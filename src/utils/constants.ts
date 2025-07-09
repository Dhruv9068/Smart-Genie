export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDTwdTJ1-yfb6PfVWK8D8eemjeuqO1XCzM';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const OPENROUTER_CONFIG = {
  apiKey: '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',
  baseURL: 'https://openrouter.ai/api/v1',
  model: 'openai/gpt-4o',
  siteUrl: 'https://schemegenie.netlify.app',
  siteName: 'SchemeGenie'
};

export const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_3czmjnf',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_a0o7x81',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'XwPMmLzYZ3HVnMO07',
};

export const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY || 'sk_d86a8933358a4e3739162236d1da010a865d9c51cc10511c';
export const ELEVEN_LABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Default voice

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCZmv4R5JsQkTG3jaLH1AlUdZzWByC539s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "scheme-genie-1982f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "scheme-genie-1982f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "scheme-genie-1982f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "927689273758",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:927689273758:web:00bda652b2af6b8974e68f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-94CTZC987F"
};

export const REAL_INDIAN_SCHEMES_DATA = [
  {
    id: 'nmms-2024',
    title: 'National Means‑cum‑Merit Scholarship (NMMS)',
    description: 'Merit-based scholarship for economically disadvantaged students in classes 9-12 studying in government/aided schools.',
    category: 'education',
    country: 'IN',
    eligibility: [
      'Class 9–12 students in government/aided schools',
      'Meritorious and needy students',
      'Family income below specified limit',
      'Must pass qualifying examination'
    ],
    benefits: ['₹12,000 per year', 'Renewable annually', 'Direct bank transfer'],
    documents: [
      'Income certificate',
      'Caste certificate (if applicable)',
      'School enrollment certificate',
      'Bank account details',
      'Previous year mark sheets'
    ],
    deadline: '2024-10-31',
    deadline: '2025-10-31',
    website: 'https://scholarships.gov.in',
    isActive: true,
    applicationProcess: 'Apply via NSP: Search "National Means‑cum‑Merit" at scholarships.gov.in',
    amount: '₹12,000 per year'
  },
  {
    id: 'pmrf-2024',
    title: 'Prime Minister\'s Research Fellowship (PMRF)',
    description: 'Fellowship for Ph.D. programs at premier institutes like IISc, IITs, IISERs to promote research culture.',
    category: 'education',
    country: 'IN',
    eligibility: [
      'Admissions into Ph.D. programs at IISc, IITs, IISERs',
      'Excellent academic record',
      'Research aptitude',
      'Age limit as per institute norms'
    ],
    benefits: [
      '₹70,000/month for 1st year',
      '₹80,000/month in later years',
      '₹2 lakh contingency per annum',
      'Research support'
    ],
    documents: [
      'Academic transcripts',
      'Research proposal',
      'Recommendation letters',
      'Identity proof',
      'Category certificate (if applicable)'
    ],
    deadline: '2024-12-15',
    deadline: '2025-12-15',
    website: 'https://pmrf.in',
    isActive: true,
    applicationProcess: 'Via Ministry notifications & institute websites',
    amount: '₹70,000-80,000/month + ₹2L contingency'
  },
  {
    id: 'csir-ugc-jrf-2024',
    title: 'CSIR‑UGC JRF‑NET Fellowship',
    description: 'Junior Research Fellowship for pursuing Ph.D. in science subjects through CSIR-UGC NET qualification.',
    category: 'education',
    country: 'IN',
    eligibility: [
      'Qualify CSIR‑UGC NET for Junior Research Fellowship',
      'Pursuing Ph.D. in eligible subjects',
      'Age limit: 28 years (relaxation for reserved categories)',
      'Valid NET certificate'
    ],
    benefits: [
      '₹31,000/month for first 2 years',
      '₹35,000/month for next 3 years',
      '₹20,000 annual contingency',
      'HRA as applicable'
    ],
    documents: [
      'NET certificate',
      'Ph.D. admission letter',
      'Academic certificates',
      'Research proposal',
      'Supervisor recommendation'
    ],
    deadline: '2024-11-30',
    deadline: '2025-11-30',
    website: 'https://csirhrdg.res.in',
    isActive: true,
    applicationProcess: 'Apply via CSIR NET exam portal when notification opens',
    amount: '₹31,000-35,000/month + ₹20,000 contingency'
  },
  {
    id: 'dbt-jrf-2024',
    title: 'DBT‑JRF Fellowship',
    description: 'Department of Biotechnology Junior Research Fellowship for biotechnology Ph.D. programs.',
    category: 'education',
    country: 'IN',
    eligibility: [
      'Qualify DBT-BET for biotechnology Ph.D. programs',
      'M.Sc./M.Tech in biotechnology or related fields',
      'Age limit: 28 years (relaxation for reserved categories)',
      'Valid BET score'
    ],
    benefits: [
      '₹25,000/month initially',
      '₹28,000/month after upgradation',
      'HRA as per rules',
      'Research contingency'
    ],
    documents: [
      'BET scorecard',
      'Academic transcripts',
      'Ph.D. admission proof',
      'Research proposal',
      'Medical certificate'
    ],
    deadline: '2024-09-30',
    deadline: '2025-09-30',
    website: 'https://dbtindia.gov.in',
    isActive: true,
    applicationProcess: 'Apply via DBT BET announcements on DBT website',
    amount: '₹25,000-28,000/month + HRA + contingency'
  },
  {
    id: 'aicte-adf-2024',
    title: 'AICTE Doctoral Fellowship (ADF)',
    description: 'Fellowship for Ph.D. scholars in AICTE-affiliated institutions to promote research in technical education.',
    category: 'education',
    country: 'IN',
    eligibility: [
      'Ph.D. scholars in AICTE-affiliated institutions',
      'Full-time Ph.D. program',
      'Good academic record',
      'Research in technical/management fields'
    ],
    benefits: [
      '₹37,000/month for first 2 years',
      '₹42,000/month in year 3',
      '₹15,000/year contingency',
      'Conference participation support'
    ],
    documents: [
      'Ph.D. admission letter',
      'Academic certificates',
      'Research proposal',
      'Supervisor details',
      'Institution affiliation proof'
    ],
    deadline: '2024-08-31',
    deadline: '2025-08-31',
    website: 'https://aicte-india.org',
    isActive: true,
    applicationProcess: 'Notifications from AICTE & participating institutes',
    amount: '₹37,000-42,000/month + ₹15k/year contingency'
  },
  {
    id: 'raita-vidyanidhi-2024',
    title: 'Raita Vidyanidhi Scholarship (Karnataka)',
    description: 'State scholarship for children of farmers in Karnataka pursuing higher education.',
    category: 'education',
    country: 'IN',
    eligibility: [
      'Children of farmers in Karnataka',
      'Pursuing higher education',
      'Family primarily dependent on agriculture',
      'Income criteria as per state norms'
    ],
    benefits: [
      'Up to ₹11,000/year',
      'Tuition fee support',
      'Book allowance',
      'Examination fee reimbursement'
    ],
    documents: [
      'Farmer certificate',
      'Income certificate',
      'Land records',
      'Admission proof',
      'Bank account details'
    ],
    deadline: '2024-12-31',
    deadline: '2025-12-31',
    website: 'https://ssp.postmatric.karnataka.gov.in',
    isActive: true,
    applicationProcess: 'Karnataka SSP portal → search "Raita Vidyanidhi"',
    amount: 'Up to ₹11,000/year'
  },
  {
    id: 'karnataka-sc-st-prize-2024',
    title: 'Karnataka Prize Money Scholarship (SC/ST)',
    description: 'Prize money for SC/ST students completing SSLC/Higher studies with First Class in Karnataka.',
    category: 'education',
    country: 'IN',
    eligibility: [
      'SC/ST students in Karnataka',
      'Completed SSLC/Higher studies with First Class',
      'Valid caste certificate',
      'Domicile of Karnataka'
    ],
    benefits: [
      '₹7,000–₹35,000 depending on level',
      'One-time prize money',
      'Recognition certificate',
      'Merit encouragement'
    ],
    documents: [
      'Caste certificate',
      'Mark sheets',
      'Domicile certificate',
      'Bank account details',
      'Income certificate'
    ],
    deadline: '2024-06-30',
    deadline: '2025-07-30',
    website: 'https://ssp.postmatric.karnataka.gov.in',
    isActive: true,
    applicationProcess: 'SSP State Scholarship Portal (dates TBA)',
    amount: '₹7,000–₹35,000 depending on level'
  },
  {
    id: 'epass-karnataka-2024',
    title: 'ePass Karnataka: Post‑Matric + Food & Accommodation + Fee Concession',
    description: 'Comprehensive support for post-matric students in Karnataka including fee concession and accommodation.',
    category: 'education',
    country: 'IN',
    eligibility: [
      'Post‑matric students in Karnataka',
      'Family income within limits',
      'SC/ST/OBC/Minority students',
      'Regular attendance required'
    ],
    benefits: [
      '₹3,500/year maintenance',
      'FAAS ₹1,500/month food allowance',
      'Fee Concession up to ₹1,750',
      'Hostel accommodation support'
    ],
    documents: [
      'Income certificate',
      'Caste/community certificate',
      'Admission receipt',
      'Bank passbook',
      'Aadhaar card'
    ],
    deadline: '2024-10-15',
    deadline: '2025-10-15',
    website: 'https://karepass.cgg.gov.in',
    isActive: true,
    applicationProcess: 'ePass portal (karepass.cgg.gov.in)',
    amount: '₹3,500/year + ₹1,500/month + Fee concession ₹1,750'
  },
  {
    id: 'faea-scholarship-2024',
    title: 'FAEA Scholarship (Foundation for Academic Excellence & Access)',
    description: 'Scholarship for UG students from disadvantaged backgrounds or high academic achievers.',
    category: 'education',
    country: 'IN',
    eligibility: [
      'UG students from disadvantaged backgrounds',
      'SC/ST/OBC/BPL/EWS categories or high scorers',
      'Good academic performance',
      'Financial need assessment'
    ],
    benefits: [
      'Tuition fee support',
      'Mentoring programs',
      'Career guidance',
      'Skill development workshops'
    ],
    documents: [
      'Academic transcripts',
      'Income certificate',
      'Category certificate',
      'Admission proof',
      'Statement of purpose'
    ],
    deadline: '2025-06-30',
    website: 'https://faea.org',
    isActive: true,
    applicationProcess: 'FAEA official site',
    amount: 'Varies (support for tuition, mentoring, etc.)'
  },
  {
    id: 'mirae-asset-2024',
    title: 'Mirae Asset Foundation Scholarship',
    description: 'Scholarship for UG & PG students across India by Mirae Asset Foundation.',
    category: 'education',
    country: 'IN',
    eligibility: [
      'UG & PG students across India',
      'Good academic record',
      'Financial need',
      'Leadership potential'
    ],
    benefits: [
      '₹40,000 for UG students',
      '₹50,000 for PG students',
      'One-time scholarship',
      'Certificate of recognition'
    ],
    documents: [
      'Academic certificates',
      'Income proof',
      'Admission letter',
      'Essays/SOP',
      'Recommendation letters'
    ],
    deadline: '2025-06-20',
    website: 'https://www.miraeassetfoundation.org',
    isActive: true,
    applicationProcess: 'Online application through foundation website',
    amount: '₹40,000 (UG) / ₹50,000 (PG)'
  }
];