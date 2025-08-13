// Internationalization support

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: "Home",
        report: "Report Issue",
        status: "Track Status", 
        publicFeed: "Public Feed",
        ngo: "NGO Portal",
        admin: "Admin Panel",
        analytics: "Analytics"
      },

      // Homepage
      home: {
        title: "SpeakSecure",
        subtitle: "Your voice matters. Report anonymously, stay protected.",
        description: "A secure platform for reporting harassment, abuse, and safety concerns with complete anonymity and zero-knowledge proof technology.",
        getStarted: "Get Started",
        reportNow: "Report Issue",
        learnMore: "Learn More",
        features: {
          anonymous: {
            title: "100% Anonymous",
            description: "Your identity is protected with zero-knowledge cryptography"
          },
          secure: {
            title: "Military-Grade Security", 
            description: "End-to-end encryption ensures your data stays private"
          },
          decentralized: {
            title: "Decentralized Storage",
            description: "Your reports are stored on IPFS for maximum security"
          },
          multilingual: {
            title: "Multi-Language Support",
            description: "Report in your preferred language"
          }
        }
      },

      // Report page
      report: {
        title: "Submit Anonymous Report",
        subtitle: "Share your experience safely and anonymously",
        category: {
          label: "Category *",
          placeholder: "Select category",
          workplace: "Workplace Harassment",
          domestic: "Domestic Violence", 
          cyberbullying: "Cyberbullying",
          discrimination: "Discrimination",
          other: "Other"
        },
        location: {
          label: "Location",
          placeholder: "Enter location (optional)"
        },
        description: {
          label: "Description *", 
          placeholder: "Describe what happened..."
        },
        evidence: {
          label: "Evidence",
          upload: "Upload files (optional)",
          voice: "Record Voice Note"
        },
        emergency: {
          label: "Mark as Emergency",
          description: "Check this if you need immediate help"
        },
        submit: "Submit Report",
        submitting: "Submitting..."
      },

      // Emergency
      emergency: {
        title: "Emergency Alert",
        description: "This will send an immediate alert to emergency services and trusted contacts.",
        button: "Emergency Help"
      },

      // Status tracking
      status: {
        title: "Track Your Reports",
        noReports: "No reports found",
        id: "Report ID",
        category: "Category", 
        date: "Date",
        status: "Status",
        actions: "Actions"
      },

      // Public feed
      publicFeed: {
        title: "Community Reports",
        subtitle: "Anonymous reports from the community",
        noReports: "No public reports available",
        upvote: "Support",
        comment: "Comment"
      }
    }
  },
  hi: {
    translation: {
      // Hindi translations
      nav: {
        home: "होम",
        report: "शिकायत दर्ज करें", 
        status: "स्थिति ट्रैक करें",
        publicFeed: "सार्वजनिक फीड",
        ngo: "एनजीओ पोर्टल",
        admin: "एडमिन पैनल",
        analytics: "एनालिटिक्स"
      },

      home: {
        title: "स्पीकसिक्योर",
        subtitle: "आपकी आवाज मायने रखती है। गुमनाम रूप से रिपोर्ट करें, सुरक्षित रहें।",
        description: "उत्पीड़न, दुर्व्यवहार और सुरक्षा चिंताओं की रिपोर्ट के लिए एक सुरक्षित प्लेटफॉर्म, पूर्ण गुमनामी और शून्य-ज्ञान प्रमाण तकनीक के साथ।",
        getStarted: "शुरू करें",
        reportNow: "शिकायत दर्ज करें", 
        learnMore: "और जानें"
      },

      report: {
        title: "गुमनाम रिपोर्ट जमा करें",
        subtitle: "अपना अनुभव सुरक्षित और गुमनाम रूप से साझा करें",
        category: {
          label: "श्रेणी *",
          placeholder: "श्रेणी चुनें"
        },
        description: {
          label: "विवरण *",
          placeholder: "क्या हुआ था, बताएं..."
        },
        submit: "रिपोर्ट जमा करें"
      },

      emergency: {
        title: "आपातकालीन अलर्ट", 
        description: "यह आपातकालीन सेवाओं और विश्वसनीय संपर्कों को तत्काल अलर्ट भेजेगा।",
        button: "आपातकालीन सहायता"
      }
    }
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;