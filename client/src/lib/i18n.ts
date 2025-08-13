// Internationalization support

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
export const translations = {
  en: {
    // Navigation
    'nav.home': "Home",
    'nav.report': "Report Issue",
    'nav.status': "Track Status",
    'nav.community': "Community",
    'nav.emergency': "Emergency",

    // Common
    'common.encrypted': "Encrypted",
    'common.anonymous': "Anonymous",
    'common.verified': "Verified",

    // Homepage
    'home.title': "SpeakSecure - Your Voice, Your Safety",
    'home.subtitle': "Report anonymously, stay protected with zero-knowledge privacy.",
    'home.report.title': "Report Issue",
    'home.report.description': "Submit your complaint anonymously with complete privacy protection.",
    'home.status.title': "Track Status",
    'home.status.description': "Check the progress of your submitted reports safely.",
    'home.community.title': "Help Others",
    'home.community.description': "Support community members by viewing and upvoting public reports.",

    // Report page
    'report.title': "Submit Anonymous Report",
    'report.subtitle': "Share your experience safely and anonymously",
    'form.category': "Category",
    'form.select_category': "Select category",
    'categories.workplace': "Workplace Harassment",
    'categories.domestic': "Domestic Violence",
    'categories.cyberbullying': "Cyberbullying",
    'categories.discrimination': "Discrimination",
    'categories.other': "Other",
    'form.location': "Location",
    'form.description': "Description",
    'form.evidence': "Evidence",
    'form.emergency': "Mark as Emergency",
    'form.submit': "Submit Report",
    'form.submitting': "Submitting...",

    // Emergency
    'emergency.title': "Emergency Alert",
    'emergency.description': "This will send an immediate alert to emergency services and trusted contacts.",
    'emergency.button': "Emergency Help",

    // Status tracking
    'status.title': "Track Your Reports",
    'status.noReports': "No reports found",
    'status.id': "Report ID",
    'status.category': "Category",
    'status.date': "Date",
    'status.status': "Status",
    'status.actions': "Actions"
  },
  hi: {
    // Hindi translations
    'nav.home': "होम",
    'nav.report': "शिकायत दर्ज करें",
    'nav.status': "स्थिति ट्रैक करें",
    'nav.community': "समुदाय",
    'nav.emergency': "आपातकाल",

    'home.title': "स्पीकसिक्योर - आपकी आवाज़, आपकी सुरक्षा",
    'home.subtitle': "गुमनाम रूप से रिपोर्ट करें, शून्य-ज्ञान गोपनीयता के साथ सुरक्षित रहें।",
    'home.report.title': "शिकायत दर्ज करें",
    'home.report.description': "पूर्ण गोपनीयता सुरक्षा के साथ अपनी शिकायत गुमनाम रूप से दर्ज करें।",
    'home.status.title': "स्थिति ट्रैक करें",
    'home.status.description': "अपनी दर्ज की गई रिपोर्टों की प्रगति सुरक्षित रूप से जांचें।",
    'home.community.title': "दूसरों की मदद करें",
    'home.community.description': "सार्वजनिक रिपोर्ट देखकर और अपवोट करके समुदाय के सदस्यों का समर्थन करें।",

    'report.title': "गुमनाम रिपोर्ट जमा करें",
    'report.subtitle': "अपना अनुभव सुरक्षित और गुमनाम रूप से साझा करें",
    'form.category': "श्रेणी",
    'form.description': "विवरण",
    'form.submit': "रिपोर्ट जमा करें",

    'emergency.title': "आपातकालीन अलर्ट",
    'emergency.description': "यह आपातकालीन सेवाओं और विश्वसनीय संपर्कों को तत्काल अलर्ट भेजेगा।",
    'emergency.button': "आपातकालीन सहायता"
  },
  ta: {
    'nav.home': "முகப்பு",
    'nav.report': "புகார் பதிவு செய்யுங்கள்",
    'nav.status': "நிலையை கண்காணிக்கவும்",
    'nav.community': "சமூகம்",
    'nav.emergency': "அவசரநிலை"
  },
  kn: {
    'nav.home': "ಮುಖ್ಯಪುಟ",
    'nav.report': "ದೂರು ದಾಖಲಿಸಿ",
    'nav.status': "ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    'nav.community': "ಸಮುದಾಯ",
    'nav.emergency': "ತುರ್ತುಸ್ಥಿತಿ"
  },
  ur: {
    'nav.home': "ہوم",
    'nav.report': "شکایت درج کریں",
    'nav.status': "اسٹیٹس ٹریک کریں",
    'nav.community': "کمیونٹی",
    'nav.emergency': "ایمرجنسی"
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: Object.keys(translations).reduce((acc, lang) => {
      acc[lang] = { translation: translations[lang] };
      return acc;
    }, {} as any),
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

// Export translation function
export const t = (key: string): string => {
  return i18n.t(key);
};

// Export language functions
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

export const setLanguage = (lang: string): void => {
  i18n.changeLanguage(lang);
};

export default i18n;