import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const translations = {
  en: {
    discover: "Discover",
    experiences: "Experiences",
    maps: "Maps",
    alerts: "Alerts",
    myPlans: "My Plans",
    welcome: "Welcome to Nepal",
    secureLogin: "Secure Login Active"
  },
  ne: {
    discover: "पत्ता लगाउनुहोस्",
    experiences: "अनुभवहरू",
    maps: "नक्सा",
    alerts: "सचेतना",
    myPlans: "मेरो योजनाहरू",
    welcome: "नेपालमा स्वागत छ",
    secureLogin: "सुरक्षित लगइन सक्रिय"
  }
};

export function useLanguage() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ne' : 'en';
    setLanguage(newLang);
    localStorage.setItem('appLanguage', newLang);
  };

  const t = (key) => translations[language][key] || key;

  return { language, toggleLanguage, t };
}

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      size="sm"
      className="text-white hover:bg-white/10"
    >
      <Globe className="w-4 h-4 mr-2" />
      {language === 'en' ? 'नेपाली' : 'English'}
    </Button>
  );
}