// Internationalization support

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "header.title": "SpeakSecure",
      "header.report": "Report",
      "header.public_feed": "Public Feed",
      "header.status": "Status",
      "header.admin": "Admin",
      "header.ngo": "NGO",
      "header.analytics": "Analytics",
      "header.emergency": "Emergency",
      "language.english": "English",
      "language.hindi": "Hindi",
      "language.urdu": "Urdu",
      "language.bengali": "Bengali",
      "emergency.title": "Emergency Alert",
      "emergency.description": "This will immediately notify authorities",
      "emergency.confirm": "Confirm Emergency",
      "emergency.cancel": "Cancel"
    }
  },
  hi: {
    translation: {
      "header.title": "स्पीकसिक्योर",
      "header.report": "रिपोर्ट",
      "header.public_feed": "सार्वजनिक फ़ीड",
      "header.status": "स्थिति",
      "header.admin": "व्यवस्थापक",
      "header.ngo": "एनजीओ",
      "header.analytics": "विश्लेषण",
      "header.emergency": "आपातकाल",
      "language.english": "अंग्रेजी",
      "language.hindi": "हिंदी",
      "language.urdu": "उर्दू",
      "language.bengali": "बंगाली",
      "emergency.title": "आपातकालीन अलर्ट",
      "emergency.description": "यह तुरंत अधिकारियों को सूचित करेगा",
      "emergency.confirm": "आपातकाल की पुष्टि करें",
      "emergency.cancel": "रद्द करें"
    }
  },
  ur: {
    translation: {
      "header.title": "اسپیک سیکیور",
      "header.report": "رپورٹ",
      "header.public_feed": "پبلک فیڈ",
      "header.status": "اسٹیٹس",
      "header.admin": "ایڈمن",
      "header.ngo": "این جی او",
      "header.analytics": "تجزیات",
      "header.emergency": "ایمرجنسی",
      "language.english": "انگریزی",
      "language.hindi": "ہندی",
      "language.urdu": "اردو",
      "language.bengali": "بنگالی",
      "emergency.title": "ایمرجنسی الرٹ",
      "emergency.description": "یہ فوری طور پر حکام کو مطلع کرے گا",
      "emergency.confirm": "ایمرجنسی کی تصدیق",
      "emergency.cancel": "منسوخ"
    }
  },
  bn: {
    translation: {
      "header.title": "স্পিকসিকিউর",
      "header.report": "রিপোর্ট",
      "header.public_feed": "পাবলিক ফিড",
      "header.status": "স্ট্যাটাস",
      "header.admin": "অ্যাডমিন",
      "header.ngo": "এনজিও",
      "header.analytics": "অ্যানালিটিক্স",
      "header.emergency": "জরুরী",
      "language.english": "ইংরেজি",
      "language.hindi": "হিন্দি",
      "language.urdu": "উর্দু",
      "language.bengali": "বাংলা",
      "emergency.title": "জরুরী সতর্কতা",
      "emergency.description": "এটি অবিলম্বে কর্তৃপক্ষকে অবহিত করবে",
      "emergency.confirm": "জরুরী অবস্থা নিশ্চিত করুন",
      "emergency.cancel": "বাতিল"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const t = (key: string) => i18n.t(key);

export const getCurrentLanguage = () => i18n.language;

export const setLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('language', lng);
};

// Load saved language
const savedLanguage = localStorage.getItem('language');
if (savedLanguage) {
  i18n.changeLanguage(savedLanguage);
}

export default i18n;