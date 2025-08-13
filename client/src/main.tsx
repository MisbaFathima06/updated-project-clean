import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import { translations } from "./lib/i18n";

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: Object.keys(translations).reduce((acc, lang) => {
      acc[lang] = { translation: translations[lang] };
      return acc;
    }, {} as any),
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

createRoot(document.getElementById("root")!).render(<App />);