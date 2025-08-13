// Internationalization support

export interface TranslationStrings {
  [key: string]: string;
}

export const translations: Record<string, TranslationStrings> = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.report': 'Report',
    'nav.status': 'Track Status',
    'nav.community': 'Community',
    'nav.emergency': 'Emergency',
    
    // Emergency
    'emergency.title': 'Emergency Alert',
    'emergency.description': 'Are you in immediate danger and need help? This will send an encrypted alert to your emergency contact.',
    
    // Home page
    'home.title': 'Your Voice Matters. Your Identity Doesn\'t.',
    'home.subtitle': 'Speak without fear. Report anonymously. Get help safely. Protected by Zero-Knowledge cryptography and blockchain technology.',
    'home.report.title': 'Report a Problem',
    'home.report.description': 'Submit your complaint securely and anonymously. We protect your identity while ensuring your voice is heard.',
    'home.status.title': 'Track Status',
    'home.status.description': 'Check the progress of your complaint with reference ID. Get updates from NGOs and admin responses.',
    'home.community.title': 'Help Others',
    'home.community.description': 'View public complaints and show support. Help build a stronger community by upvoting important issues.',
    
    // Common
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.encrypted': '256-bit Encrypted',
    'common.anonymous': 'Zero-Knowledge Anonymous',
    'common.verified': 'Blockchain Verified',
  },
  
  hi: {
    // Header
    'nav.home': 'होम',
    'nav.report': 'रिपोर्ट',
    'nav.status': 'स्थिति ट्रैक करें',
    'nav.community': 'समुदाय',
    'nav.emergency': 'आपातकाल',
    
    // Emergency
    'emergency.title': 'आपातकालीन अलर्ट',
    'emergency.description': 'क्या आप तत्काल खतरे में हैं और मदद चाहिए? यह आपके आपातकालीन संपर्क को एन्क्रिप्टेड अलर्ट भेजेगा।',
    
    // Home page
    'home.title': 'आपकी आवाज़ मायने रखती है। आपकी पहचान नहीं।',
    'home.subtitle': 'बिना डर के बोलें। गुमनाम रूप से रिपोर्ट करें। सुरक्षित रूप से मदद पाएं।',
    'home.report.title': 'समस्या की रिपोर्ट करें',
    'home.report.description': 'अपनी शिकायत सुरक्षित और गुमनाम रूप से दर्ज करें।',
    'home.status.title': 'स्थिति ट्रैक करें',
    'home.status.description': 'संदर्भ आईडी के साथ अपनी शिकायत की प्रगति जांचें।',
    'home.community.title': 'दूसरों की मदद करें',
    'home.community.description': 'सार्वजनिक शिकायतें देखें और समर्थन दिखाएं।',
    
    // Common
    'common.submit': 'सबमिट करें',
    'common.cancel': 'रद्द करें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.encrypted': '256-बिट एन्क्रिप्टेड',
    'common.anonymous': 'शून्य-ज्ञान गुमनाम',
    'common.verified': 'ब्लॉकचेन सत्यापित',
  },
  
  ta: {
    // Header
    'nav.home': 'முகப்பு',
    'nav.report': 'புகார்',
    'nav.status': 'நிலையை கண்காணிக்கவும்',
    'nav.community': 'சமுதாயம்',
    'nav.emergency': 'அவசரநிலை',
    
    // Emergency
    'emergency.title': 'அவசர எச்சரிக்கை',
    'emergency.description': 'நீங்கள் உடனடி ஆபத்தில் இருக்கிறீர்களா மற்றும் உதவி தேவையா? இது உங்கள் அவசர தொடர்பாளருக்கு குறியாக்கப்பட்ட எச்சரிக்கையை அனுப்பும்.',
    
    // Home page
    'home.title': 'உங்கள் குரல் முக்கியம். உங்கள் அடையாளம் அல்ல.',
    'home.subtitle': 'பயமின்றி பேசுங்கள். அநாமதேயமாக புகார் செய்யுங்கள்.',
    'home.report.title': 'பிரச்சனையை புகாரளிக்கவும்',
    'home.report.description': 'உங்கள் புகாரை பாதுகாப்பாக மற்றும் அநாமதேயமாக சமர்ப்பிக்கவும்.',
    'home.status.title': 'நிலையை கண்காணிக்கவும்',
    'home.status.description': 'குறிப்பு ஐடி மூலம் உங்கள் புகாரின் முன்னேற்றத்தை சரிபார்க்கவும்.',
    'home.community.title': 'மற்றவர்களுக்கு உதவுங்கள்',
    'home.community.description': 'பொது புகார்களை பார்த்து ஆதரவு காட்டுங்கள்.',
    
    // Common
    'common.submit': 'சமர்ப்பிக்கவும்',
    'common.cancel': 'ரத்து செய்',
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
    'common.encrypted': '256-பிட் குறியாக்கம்',
    'common.anonymous': 'பூஜ்ய-அறிவு அநாமதேய',
    'common.verified': 'பிளாக்செயின் சரிபார்க்கப்பட்டது',
  },
  
  kn: {
    // Header
    'nav.home': 'ಮುಖ್ಯಪುಟ',
    'nav.report': 'ವರದಿ',
    'nav.status': 'ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    'nav.community': 'ಸಮುದಾಯ',
    'nav.emergency': 'ತುರ್ತು',
    
    // Emergency
    'emergency.title': 'ತುರ್ತು ಎಚ್ಚರಿಕೆ',
    'emergency.description': 'ನೀವು ತಕ್ಷಣದ ಅಪಾಯದಲ್ಲಿದ್ದೀರಾ ಮತ್ತು ಸಹಾಯ ಬೇಕಾ? ಇದು ನಿಮ್ಮ ತುರ್ತು ಸಂಪರ್ಕಕ್ಕೆ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಎಚ್ಚರಿಕೆಯನ್ನು ಕಳುಹಿಸುತ್ತದೆ.',
    
    // Home page
    'home.title': 'ನಿಮ್ಮ ಧ್ವನಿ ಮುಖ್ಯ. ನಿಮ್ಮ ಗುರುತು ಅಲ್ಲ.',
    'home.subtitle': 'ಭಯವಿಲ್ಲದೆ ಮಾತಾಡಿ. ಅನಾಮಧೇಯವಾಗಿ ವರದಿ ಮಾಡಿ.',
    'home.report.title': 'ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ',
    'home.report.description': 'ನಿಮ್ಮ ದೂರನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಮತ್ತು ಅನಾಮಧೇಯವಾಗಿ ಸಲ್ಲಿಸಿ.',
    'home.status.title': 'ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    'home.status.description': 'ಉಲ್ಲೇಖ ಐಡಿಯೊಂದಿಗೆ ನಿಮ್ಮ ದೂರಿನ ಪ್ರಗತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
    'home.community.title': 'ಇತರರಿಗೆ ಸಹಾಯ ಮಾಡಿ',
    'home.community.description': 'ಸಾರ್ವಜನಿಕ ದೂರುಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಬೆಂಬಲ ತೋರಿಸಿ.',
    
    // Common
    'common.submit': 'ಸಲ್ಲಿಸಿ',
    'common.cancel': 'ರದ್ದುಮಾಡಿ',
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'common.error': 'ದೋಷ',
    'common.success': 'ಯಶಸ್ಸು',
    'common.encrypted': '256-ಬಿಟ್ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದೆ',
    'common.anonymous': 'ಶೂನ್ಯ-ಜ್ಞಾನ ಅನಾಮಧೇಯ',
    'common.verified': 'ಬ್ಲಾಕ್‌ಚೈನ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
  },
  
  ur: {
    // Header
    'nav.home': 'ہوم',
    'nav.report': 'رپورٹ',
    'nav.status': 'اسٹیٹس ٹریک کریں',
    'nav.community': 'کمیونٹی',
    'nav.emergency': 'ایمرجنسی',
    
    // Emergency
    'emergency.title': 'ایمرجنسی الرٹ',
    'emergency.description': 'کیا آپ فوری خطرے میں ہیں اور مدد چاہیے؟ یہ آپ کے ایمرجنسی رابطے کو انکرپٹ شدہ الرٹ بھیجے گا۔',
    
    // Home page
    'home.title': 'آپ کی آواز اہم ہے۔ آپ کی شناخت نہیں۔',
    'home.subtitle': 'بغیر خوف کے بولیں۔ گمنام طریقے سے رپورٹ کریں۔',
    'home.report.title': 'مسئلے کی رپورٹ کریں',
    'home.report.description': 'اپنی شکایت محفوظ اور گمنام طریقے سے جمع کرائیں۔',
    'home.status.title': 'اسٹیٹس ٹریک کریں',
    'home.status.description': 'حوالہ آئی ڈی کے ساتھ اپنی شکایت کی پیشرفت چیک کریں۔',
    'home.community.title': 'دوسروں کی مدد کریں',
    'home.community.description': 'عوامی شکایات دیکھیں اور سپورٹ دکھائیں۔',
    
    // Common
    'common.submit': 'جمع کرائیں',
    'common.cancel': 'منسوخ کریں',
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.error': 'خرابی',
    'common.success': 'کامیابی',
    'common.encrypted': '256-بٹ انکرپٹ شدہ',
    'common.anonymous': 'صفر-علم گمنام',
    'common.verified': 'بلاک چین تصدیق شدہ',
  },
};

let currentLanguage = 'en';

export function setLanguage(language: string): void {
  if (translations[language]) {
    currentLanguage = language;
    localStorage.setItem('speaksecure-language', language);
  }
}

export function getCurrentLanguage(): string {
  return currentLanguage;
}

export function t(key: string): string {
  return translations[currentLanguage]?.[key] || translations['en']?.[key] || key;
}

// Initialize language from localStorage (with error handling)
try {
  const savedLanguage = localStorage.getItem('speaksecure-language');
  if (savedLanguage && translations[savedLanguage]) {
    currentLanguage = savedLanguage;
  }
} catch (error) {
  console.warn('Could not load saved language:', error);
}
