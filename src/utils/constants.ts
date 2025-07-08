export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDTwdTJ1-yfb6PfVWK8D8eemjeuqO1XCzM';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

export const MOCK_SCHEMES_DATA = [
  {
    id: '1',
    title: 'Student Financial Aid Program',
    description: 'Financial assistance for university students from low-income families',
    category: 'education',
    country: 'US',
    eligibility: ['Age 18-25', 'Family income < $50,000', 'Enrolled in accredited university'],
    benefits: ['Up to $5,000 per semester', 'Book allowance', 'Transportation stipend'],
    documents: ['Income certificate', 'University enrollment', 'Bank statements'],
    deadline: '2024-03-15',
    website: 'https://education.gov/financial-aid',
    isActive: true,
  },
  {
    id: '2',
    title: 'Farmer Subsidy Scheme',
    description: 'Agricultural support for small and marginal farmers',
    category: 'farmers',
    country: 'IN',
    eligibility: ['Land ownership < 5 acres', 'Primary occupation farming', 'Valid farmer ID'],
    benefits: ['Seed subsidy', 'Equipment loans', 'Crop insurance'],
    documents: ['Land records', 'Farmer ID', 'Bank account details'],
    deadline: '2024-04-30',
    website: 'https://agriculture.gov.in/schemes',
    isActive: true,
  },
  {
    id: '3',
    title: 'Women Entrepreneur Grant',
    description: 'Business grants for women-led startups and enterprises',
    category: 'women',
    country: 'KE',
    eligibility: ['Female entrepreneur', 'Business plan required', 'Age 21-45'],
    benefits: ['Up to $10,000 grant', 'Business mentorship', 'Market linkage'],
    documents: ['Business plan', 'ID copy', 'Bank statements'],
    deadline: '2024-05-20',
    website: 'https://women.gov.ke/grants',
    isActive: true,
  },
  {
    id: '4',
    title: 'Affordable Housing Program',
    description: 'Low-cost housing solutions for middle-income families',
    category: 'housing',
    country: 'BR',
    eligibility: ['Monthly income R$2,000-8,000', 'First-time home buyer', 'Brazilian citizen'],
    benefits: ['Subsidized loans', 'Reduced interest rates', 'Down payment assistance'],
    documents: ['Income proof', 'CPF', 'Employment certificate'],
    deadline: '2024-06-30',
    website: 'https://habitacao.gov.br',
    isActive: true,
  },
  {
    id: '5',
    title: 'Universal Healthcare Access',
    description: 'Free healthcare services for all citizens',
    category: 'health',
    country: 'NG',
    eligibility: ['Nigerian citizen', 'Valid ID', 'Health insurance enrollment'],
    benefits: ['Free consultations', 'Subsidized medications', 'Emergency care'],
    documents: ['National ID', 'Birth certificate', 'Proof of residence'],
    website: 'https://health.gov.ng/nhis',
    isActive: true,
  },
];