
import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Shield, Globe, Menu, X, AlertTriangle, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { t, getCurrentLanguage, setLanguage } from '@/lib/i18n';
import { useEmergency } from '@/hooks/use-emergency';
import { useTheme } from '@/components/theme-provider';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const { openEmergencyModal } = useEmergency();
  const { theme, setTheme } = useTheme();

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCurrentLang(newLang);
    window.location.reload(); // Refresh to apply translations
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/report', label: t('nav.report') },
    { path: '/status', label: t('nav.status') },
    { path: '/community', label: t('nav.community') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              SpeakSecure
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  location === item.path
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Emergency Button */}
            <Button
              onClick={openEmergencyModal}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white border-0 px-3 py-2"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t('nav.emergency')}</span>
              <span className="sm:hidden">SOS</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Language Selector */}
            <Select value={currentLang} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-24 h-9 text-xs">
                <Globe className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
                <SelectItem value="ur">اردو</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-3 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    location === item.path
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Emergency Button */}
              <Button
                onClick={() => {
                  openEmergencyModal();
                  setIsMenuOpen(false);
                }}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white w-fit mt-2"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {t('nav.emergency')}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
