/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { Home, Users, FileText, Building2, Award, Info, ImageIcon, Phone, LogIn, LogOut, User, Settings, Menu, X, Globe, Crown } from 'lucide-react';
import { Language } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

interface GPHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate?: (page: string) => void;
  user?: any;
  profile?: any;
}

const GPHeader = ({ language, onLanguageChange, onNavigate }: GPHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, profile } = useAuth();
  const { settings } = useWebsiteSettings();

  // Get village name based on language
  const villageName = language === 'mr' 
    ? (settings.village_name_mr || settings.village_name || 'गाव')
    : (settings.village_name || 'Village');
  
  const districtName = language === 'mr'
    ? (settings.district_mr || settings.district || 'जिल्हा')
    : (settings.district || 'District');
    
  const talukaName = language === 'mr'
    ? (settings.taluka_mr || settings.taluka || 'तालुका')
    : (settings.taluka || 'Taluka');

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      setIsMobileMenuOpen(false);
      setActiveMenu(null);
    }
  };

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  const isDesktopViewport = () => window.matchMedia('(min-width: 768px)').matches;

  // Get colors from settings or default
  const primaryColor = settings.primary_color || '#15803d'; // green-700
  const secondaryColor = settings.secondary_color || '#16a34a'; // green-600
  const accentColor = settings.accent_color || '#15803d'; // green-700

  const headerStyle = {
    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}, ${accentColor})`
  };

  const navItems = [
    {
      id: 'home',
      label: t('Home', 'मुख्यपृष्ठ'),
      icon: Home,
      path: '/',
    },
    {
      id: 'about',
      label: t('About Us', 'आमच्याबद्दल'),
      icon: Info,
      submenu: [
        { label: t('History', 'इतिहास'), path: '/about/history' },
        { label: t('Geography', 'भूगोल'), path: '/about/geography' },
        { label: t('Demographics', 'लोकसंख्या'), path: '/about/demographics' },
        { label: t('Village Map', 'गावाचा नकाशा'), path: '/about/map' },
      ],
    },
    {
      id: 'administration',
      label: t('Administration', 'प्रशासन'),
      icon: Users,
      submenu: [
        { label: t('Elected Body', 'निवडून आलेले सदस्य'), path: '/administration/elected-body' },
        { label: t('Gram Sevak & Staff', 'ग्रामसेवक व कर्मचारी'), path: '/administration/staff' },
        { label: t('Committees', 'समित्या'), path: '/administration/committees' },
      ],
    },
    {
      id: 'services',
      label: t('Citizen Services', 'नागरिक सुविधा'),
      icon: FileText,
      submenu: [
        // { label: t('Pay Tax Online', 'कर भरा'), path: '/services/pay-tax' },
        // Hide 'Apply for Certificates' option for admin or super_admin users
        ...(profile?.role === 'admin' || profile?.role === 'super_admin' ? [] : [{ label: t('Apply for Certificates', 'प्रमाणपत्रे'), path: '/services/certificates' }]),
        { label: t('Submit Grievance', 'तक्रारी'), path: '/services/grievances' },
        { label: t('Download Forms', 'फॉर्म'), path: '/services/forms' },
      ],
    },
    {
      id: 'development',
      label: t('Development', 'विकासकामे'),
      icon: Building2,
      submenu: [
        { label: t('Works List', 'कामांची यादी'), path: '/development/works' },
        { label: t('GPDP', 'ग्रामपंचायत विकास योजना'), path: '/development/gpdp' },
        { label: t('Tenders', 'निविदा'), path: '/development/tenders' },
      ],
    },
    {
      id: 'schemes',
      label: t('Schemes', 'योजना'),
      icon: Award,
      submenu: [
        { label: t('Central Schemes', 'केंद्र सरकारच्या योजना'), path: '/schemes/central' },
        { label: t('State Schemes', 'राज्य सरकारच्या योजना'), path: '/schemes/state' },
        { label: t('Beneficiaries', 'लाभार्थी यादी'), path: '/schemes/beneficiaries' },
      ],
    },
    {
      id: 'transparency',
      label: t('Transparency', 'माहिती अधिकार'),
      icon: FileText,
      submenu: [
        { label: t('RTI', 'माहिती अधिकार'), path: '/transparency/rti' },
        { label: t('Gram Sabha', 'ग्रामसभा'), path: '/transparency/gram-sabha' },
        ...(profile?.role === 'admin' || profile?.role === 'super_admin'
          ? [{ label: t('BPL List', 'गरीबी रेषेखालील यादी'), path: '/transparency/bpl' }]
          : []),
      ],
    },
    {
      id: 'gallery',
      label: t('Gallery', 'छायाचित्रे'),
      icon: ImageIcon,
      submenu: [
        { label: t('Photo Gallery', 'फोटो'), path: '/gallery/photos' },
        { label: t('Video Gallery', 'व्हिडिओ'), path: '/gallery/videos' },
      ],
    },
    {
      id: 'contact',
      label: t('Contact Us', 'संपर्क'),
      icon: Phone,
      path: '/contact',
    },
  ];

  return (
    <header 
      className="gp-header text-white shadow-lg sticky top-0 z-50"
      style={headerStyle}
    >
      {/* Top Bar */}
      <div className="py-2 px-4" style={{ background: accentColor }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">{t(`Welcome to Digital ${villageName}`, `डिजिटल ${villageName} मध्ये आपले स्वागत आहे`)}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'mr' : 'en')}
              className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition"
            >
              <Globe size={16} />
              <span>{language === 'en' ? 'English' : 'मराठी'}</span>
            </button>
            
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition"
                >
                  <User size={16} />
                  <span className="hidden md:inline">{profile?.full_name || 'User'}</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white text-gray-800 shadow-lg rounded border overflow-hidden z-50">
                    <div className="px-4 py-2 border-b bg-gray-50">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                      {profile?.role && (
                        <p className="text-xs text-blue-600 capitalize mt-1">{profile.role.replace('_', ' ')}</p>
                      )}
                    </div>
                    
                    {profile?.role === 'citizen' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleNavigation('my-dashboard');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 transition"
                      >
                        <User size={16} />
                        {t('My Dashboard', 'माझे डॅशबोर्ड')}
                      </button>
                    )}
                    
                    {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleNavigation('admin-dashboard');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 transition"
                      >
                        <Settings size={16} />
                        {t('Admin Dashboard', 'प्रशासन डॅशबोर्ड')}
                      </button>
                    )}
                    
                    {profile?.role === 'super_admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleNavigation('super-admin-dashboard');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 transition"
                      >
                        <Crown size={16} />
                        {t('Super Admin Dashboard', 'सुपर अॅडमिन डॅशबोर्ड')}
                      </button>
                    )}
                    
                    <hr />
                    
                    <button
                      onClick={async () => {
                        console.log('User menu logout clicked');
                        setShowUserMenu(false);
                        // Clear storage and refresh
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.replace('/');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600 transition"
                    >
                      <LogOut size={16} />
                      {t('Logout', 'बाहेर पडा')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavigation('login')}
                className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition"
              >
                <LogIn size={16} />
                <span>{t('Login', 'प्रवेश')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="py-4 px-4 border-b border-green-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
              alt="Emblem" 
              className="h-16 w-16 object-contain"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {t(`Gram Panchayat ${villageName}`, `ग्रामपंचायत ${villageName}`)}
              </h1>
              <p className="text-sm text-green-100">
                {t(`District: ${districtName} | Taluka: ${talukaName}`, `जिल्हा: ${districtName} | तालुका: ${talukaName}`)}
              </p>
            </div>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block border-t border-white/20`}
        style={{ background: accentColor }}
      >
        <div className="max-w-7xl mx-auto">
          <ul className="md:flex md:items-center md:justify-center">
            {navItems.map((item) => (
              <li
                key={item.id}
                className="relative group"
                onMouseEnter={() => {
                  if (isDesktopViewport() && item.submenu) {
                    setActiveMenu(item.id);
                  }
                }}
                onMouseLeave={() => {
                  if (isDesktopViewport()) {
                    setActiveMenu(null);
                  }
                }}
              >
                <button
                  onClick={() => {
                    if (item.id === 'home') {
                      handleNavigation('home');
                    } else if (item.submenu) {
                      setActiveMenu((currentMenu) => currentMenu === item.id ? null : item.id);
                    } else if (item.id === 'schemes' && !item.submenu) {
                      handleNavigation('schemes');
                    } else if (item.id === 'contact' && !item.submenu) {
                      handleNavigation('contact');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-green-600 transition w-full text-left"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.submenu && (
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Dropdown Menu */}
                {item.submenu && (
                  <ul
                    className={`${
                      activeMenu === item.id ? 'block' : 'hidden'
                    } md:absolute md:left-0 md:top-full md:min-w-[250px] bg-white text-gray-800 md:shadow-xl md:rounded-b-lg overflow-hidden`}
                  >
                    {item.submenu.map((subItem, index) => (
                      <li key={index}>
                        <button
                          onClick={() => {
                            // Map submenu items to pages
                            if (subItem.path === '/administration/elected-body') {
                              handleNavigation('elected-body');
                            } else if (subItem.path === '/administration/staff') {
                              handleNavigation('staff');
                            } else if (subItem.path === '/administration/committees') {
                              handleNavigation('committees');
                            } else if (subItem.path === '/services/pay-tax') {
                              handleNavigation('pay-tax');
                            } else if (subItem.path === '/services/certificates') {
                              handleNavigation('certificates');
                            } else if (subItem.path === '/services/grievances') {
                              handleNavigation('grievances');
                            } else if (subItem.path === '/services/forms') {
                              handleNavigation('forms');
                            } else if (subItem.path === '/development/works') {
                              handleNavigation('development-works');
                            } else if (subItem.path === '/development/gpdp') {
                              handleNavigation('gpdp');
                            } else if (subItem.path === '/development/tenders') {
                              handleNavigation('tenders');
                            } else if (subItem.path === '/transparency/rti') {
                              handleNavigation('rti');
                            } else if (subItem.path === '/transparency/gram-sabha') {
                              handleNavigation('gram-sabha');
                            } else if (subItem.path === '/transparency/budget') {
                              handleNavigation('budget');
                            } else if (subItem.path === '/transparency/bpl') {
                              handleNavigation('bpl-list');
                            } else if (subItem.path === '/schemes/central' || subItem.path === '/schemes/state' || subItem.path === '/schemes/beneficiaries') {
                              handleNavigation('schemes');
                            } else if (subItem.path === '/gallery/photos' || subItem.path === '/gallery/videos') {
                              handleNavigation('gallery');
                            } else if (subItem.path?.startsWith('/about/')) {
                              handleNavigation('about');
                            }
                          }}
                          className="w-full text-left block px-6 py-3 hover:bg-green-50 transition border-b border-gray-100 last:border-0"
                        >
                          {subItem.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default GPHeader;
