import { useState, useEffect, lazy, Suspense } from 'react';
import React from 'react';
import GPHeader from './components/GPHeader';
import GPFooter from './components/GPFooter';
import HeroCarousel from './components/HeroCarousel';
import { useAuth } from './contexts/AuthContext';
import { useWebsiteSettings } from './contexts/WebsiteSettingsContext';
import { Language } from './types';

// Lazy load heavy components for better performance
const DashboardStats = lazy(() => import('./components/DashboardStatsOptimized'));
const FlashNews = lazy(() => import('./components/FlashNewsOptimized'));
const SarpanchMessage = lazy(() => import('./components/SarpanchMessage'));
const ElectedBodyPage = lazy(() => import('./components/ElectedBodyPage'));
const GrievancePage = lazy(() => import('./components/GrievancePage'));
const DevelopmentWorksPage = lazy(() => import('./components/DevelopmentWorksPage'));
const SchemesPage = lazy(() => import('./components/SchemesPageOptimized'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const StaffPage = lazy(() => import('./components/StaffPage'));
const GalleryPage = lazy(() => import('./components/GalleryPageOptimized'));
const AboutUsPage = lazy(() => import('./components/AboutUsPage'));
const CommitteesPage = lazy(() => import('./components/CommitteesPage'));
const TaxPaymentPage = lazy(() => import('./components/TaxPaymentPage'));
const TaxCheckPage = lazy(() => import('./components/TaxCheckPage'));
const CertificateFormsPage = lazy(() => import('./components/CertificateFormsPage'));
const FormsPage = lazy(() => import('./components/FormsPage'));
const GramPanchayatDevelopmentPlanPage = lazy(() => import('./components/GramPanchayatDevelopmentPlanPage'));
const TendersPage = lazy(() => import('./components/TendersPage'));
const RTIPage = lazy(() => import('./components/RTIPage'));
const GramSabhaPage = lazy(() => import('./components/GramSabhaPage'));
const BudgetPage = lazy(() => import('./components/BudgetPage'));
const BPLListPage = lazy(() => import('./components/BPLListPage'));
const UserLogin = lazy(() => import('./components/UserLogin'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const ContentManagement = lazy(() => import('./components/ContentManagement'));
const PublicSearch = lazy(() => import('./components/PublicSearch'));
const GovernanceRecordsPage = lazy(() => import('./components/GovernanceRecordsPage'));
const PublicTrackingPage = lazy(() => import('./components/PublicTrackingPage'));

// Loading component with better error handling
const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex flex-col justify-center items-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    <span className="mt-3 text-gray-600">{message}</span>
  </div>
);

// Full page loading component
const FullPageLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col justify-center items-center z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
    <span className="mt-4 text-lg text-gray-700 font-medium">{message}</span>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex justify-center items-center min-h-[200px] bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
            <p className="text-red-600">Please refresh the page or try again later.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const { user, profile, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useWebsiteSettings();
  const [language, setLanguage] = useState<Language>('en');
  const [currentPage, setCurrentPage] = useState('home');
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // URL to page mapping
  const urlToPageMap: Record<string, string> = {
    'home': 'home',
    'about': 'about',
    'contact': 'contact',
    'search': 'search',
    'progress': 'progress',
    'tracking': 'tracking',
    'staff': 'staff',
    'gallery': 'gallery',
    'schemes': 'schemes',
    'development': 'development',
    'transparency': 'transparency',
    'tenders': 'tenders',
    'downloads': 'downloads',
    'videos': 'videos',
    'budget': 'budget',
    'gpdp': 'gpdp',
    'gram-sabha': 'gram-sabha',
    'grievance': 'grievance',
    'rti': 'rti',
    'committees': 'committees',
    'elected-body': 'elected-body',
    'forms': 'forms',
    'certificates': 'certificates',
    'certificate': 'certificates',
    'tax-check': 'tax-check',
    'check-tax': 'check-tax',
    'tax-payment': 'tax-payment',
    'pay-tax': 'pay-tax',
    'grievances': 'grievances',
    'development-works': 'development-works',
    'bpl-list': 'bpl-list',
    'login': 'login',
    'my-dashboard': 'my-dashboard',
    'admin-dashboard': 'admin-dashboard',
    'super-admin-dashboard': 'super-admin-dashboard',
  };

  const nestedUrlToPageMap: Record<string, string> = {
    '/about/history': 'about',
    '/about/geography': 'about',
    '/about/demographics': 'about',
    '/about/map': 'about',
    '/administration/elected-body': 'elected-body',
    '/administration/staff': 'staff',
    '/administration/committees': 'committees',
    '/services/pay-tax': 'pay-tax',
    '/services/certificates': 'certificates',
    '/services/grievances': 'grievances',
    '/services/forms': 'forms',
    '/development/works': 'development-works',
    '/development/gpdp': 'gpdp',
    '/development/tenders': 'tenders',
    '/transparency/rti': 'rti',
    '/transparency/gram-sabha': 'gram-sabha',
    '/transparency/budget': 'budget',
    '/transparency/bpl': 'bpl-list',
    '/gallery/photos': 'gallery',
    '/gallery/videos': 'gallery',
  };

  // Parse the current URL without pushing a second history entry.
  const syncPageFromUrl = () => {
    const path = window.location.pathname;
    const nestedPage = nestedUrlToPageMap[path];
    if (nestedPage) {
      setCurrentPage(nestedPage);
      setUrlParams({});
      return;
    }
    const pathSegments = path.split('/').filter(Boolean);
    
    if (pathSegments.length > 0) {
      const firstSegment = pathSegments[0];
      const secondSegment = pathSegments[1];
      
      // Check if it's a certificate form like /forms/birth
      if (firstSegment === 'forms' && secondSegment) {
        setCurrentPage('certificates');
        setUrlParams({ type: secondSegment });
        return;
      }
      
      // Check if it's a regular page
      if (urlToPageMap[firstSegment]) {
        setCurrentPage(urlToPageMap[firstSegment]);
        setUrlParams({});
        return;
      }
    }

    setCurrentPage('home');
    setUrlParams({});
  };

  // Parse URL and support refresh/back/forward navigation.
  useEffect(() => {
    syncPageFromUrl();
    window.addEventListener('popstate', syncPageFromUrl);
    return () => window.removeEventListener('popstate', syncPageFromUrl);
  }, []);

  // Page to URL mapping
  const pageToUrlMap: Record<string, string> = {
    'home': '/',
    'about': '/about',
    'contact': '/contact',
    'staff': '/staff',
    'gallery': '/gallery',
    'schemes': '/schemes',
    'development': '/development',
    'transparency': '/transparency',
    'tenders': '/tenders',
    'downloads': '/downloads',
    'videos': '/videos',
    'budget': '/budget',
    'gpdp': '/gpdp',
    'gram-sabha': '/gram-sabha',
    'grievance': '/grievance',
    'rti': '/rti',
    'committees': '/committees',
    'elected-body': '/elected-body',
    'forms': '/forms',
    'certificates': '/certificates',
    'certificate': '/certificates',
    'tax-check': '/tax-check',
    'check-tax': '/tax-check',
    'tax-payment': '/tax-payment',
    'pay-tax': '/tax-payment',
    'grievances': '/grievance',
    'development-works': '/development/works',
    'bpl-list': '/bpl-list',
    'login': '/login',
    'my-dashboard': '/my-dashboard',
    'admin-dashboard': '/admin-dashboard',
    'super-admin-dashboard': '/super-admin-dashboard',
  };

  // Enhanced setCurrentPage that also updates URL
  const updatePage = (page: string, params?: Record<string, string>) => {
    setCurrentPage(page);
    
    // Build URL based on page and params
    let newUrl = pageToUrlMap[page] || '/';
    if (page === 'certificates' && params?.type) {
      newUrl = `/forms/${params.type}`;
    }
    
    // Update browser history
    window.history.pushState({ page, params }, '', newUrl);
    
    if (params) {
      setUrlParams(params);
    }
  };

  // Update HTML lang attribute and dir when language changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.lang = language === 'mr' ? 'mr' : 'en';
    htmlElement.dir = language === 'mr' ? 'ltr' : 'ltr'; // Marathi uses left-to-right
    htmlElement.setAttribute('data-language', language);
    
    // Ensure UTF-8 is properly set
    htmlElement.setAttribute('charset', 'UTF-8');
  }, [language]);

  // Apply primary color from website settings to CSS
  useEffect(() => {
    if (settings?.primary_color) {
      document.documentElement.style.setProperty('--primary-color', settings.primary_color);
    }
  }, [settings?.primary_color]);

  // Send users to the dashboard appropriate for their role after authentication.
  useEffect(() => {
    if (!user || !profile || (currentPage !== 'login' && currentPage !== 'my-dashboard')) {
      return;
    }

    const dashboard = profile.role === 'super_admin'
      ? 'super-admin-dashboard'
      : profile.role === 'admin'
        ? 'admin-dashboard'
        : 'my-dashboard';

    if (currentPage !== dashboard) {
      updatePage(dashboard);
    }
  }, [user, profile, currentPage]);

  // Show full page loader while checking authentication (AFTER all hooks)
  if (authLoading || settingsLoading) {
    return <FullPageLoader message="Loading latest village data..." />;
  }

  // Optimized Home page component with progressive loading
  const HomePage = ({ language }: { language: Language }) => {
    const [showMessage, setShowMessage] = useState(false);
    
    // Load components progressively after initial render
    useEffect(() => {
      const timer2 = setTimeout(() => setShowMessage(true), 1000);
      
      return () => {
        clearTimeout(timer2);
      };
    }, []);

    return (
      <>
        <HeroCarousel language={language} onNavigate={updatePage} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Quick Access Dashboard for logged in users */}
          {user && (
            <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-white">
                  <h3 className="text-lg font-semibold">
                    {language === 'mr' 
                      ? `नमस्कार, ${profile?.full_name || 'वापरकर्ता'}!` 
                      : `Welcome, ${profile?.full_name || 'User'}!`}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {language === 'mr' 
                      ? 'तुमचे अर्ज आणि तक्रारी व्यवस्थापित करा' 
                      : 'Manage your applications and complaints'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updatePage('my-dashboard')}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                  >
                    {language === 'mr' ? '📊 माझे डॅशबोर्ड' : '📊 My Dashboard'}
                  </button>
                  {/* Hide Apply for Certificate for Admins */}
                  {!(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                    <button
                      onClick={() => updatePage('certificates')}
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition"
                    >
                      {language === 'mr' ? '📄 प्रमाणपत्र अर्ज' : '📄 Apply for Certificate'}
                    </button>
                  )}
                  {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                    <button
                      onClick={() => {
                        if (profile.role === 'super_admin') {
                          updatePage('super-admin-dashboard');
                        } else {
                          updatePage('admin-dashboard');
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                    >
                      {language === 'mr' ? '⚙️ प्रशासन' : '⚙️ Admin Panel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Flash News - Load immediately */}
          <Suspense fallback={<LoadingSpinner />}>
            <FlashNews language={language} />
          </Suspense>
          
          {/* Sarpanch Message - Load after 1s */}
          {showMessage && (
            <Suspense fallback={<LoadingSpinner />}>
              <SarpanchMessage language={language} />
            </Suspense>
          )}
          
          {/* Dashboard Stats - Load last */}
          {showMessage && (
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardStats language={language} />
            </Suspense>
          )}
        </div>
      </>
    );
  };

  // Simple router - in production use React Router
  const renderPage = () => {
    const t = (en: string, mr: string) => language === 'mr' ? mr : en;
    
    const BackButton = () => (
      <button
        onClick={() => updatePage('home')}
        className="mb-6 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold text-lg"
      >
        ← {t('Back to Home', 'मुख्यपृष्ठावर परत')}
      </button>
    );
    
    switch (currentPage) {
      case 'elected-body':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <ElectedBodyPage language={language} />
              </Suspense>
            </ErrorBoundary>
          </div>
        );
      case 'grievances':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <GrievancePage language={language} />
              </Suspense>
            </ErrorBoundary>
          </div>
        );
      case 'development-works':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <DevelopmentWorksPage language={language} />
              </Suspense>
            </ErrorBoundary>
          </div>
        );
      case 'schemes':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <SchemesPage language={language} />
              </Suspense>
            </ErrorBoundary>
          </div>
        );
      case 'contact':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <ContactPage language={language} />
            </Suspense>
          </div>
        );
      case 'search':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PublicSearch language={language} />
          </Suspense>
        );
      case 'progress':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <GovernanceRecordsPage language={language} />
          </Suspense>
        );
      case 'tracking':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PublicTrackingPage language={language} />
          </Suspense>
        );
      case 'staff':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <StaffPage language={language} />
            </Suspense>
          </div>
        );
      case 'gallery':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <GalleryPage language={language} />
            </Suspense>
          </div>
        );
      case 'about':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <AboutUsPage language={language} />
            </Suspense>
          </div>
        );
      case 'committees':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <CommitteesPage language={language} />
            </Suspense>
          </div>
        );
      case 'pay-tax':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <TaxPaymentPage language={language} />
            </Suspense>
          </div>
        );
      case 'check-tax':
        return (
          <div>
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <TaxCheckPage language={language} />
            </Suspense>
          </div>
        );
      case 'certificates':
        // Certificates require login
        if (!user) {
          return (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold text-blue-800 mb-2">
                  {language === 'mr' ? 'कृपया लॉगिन करा' : 'Please Login'}
                </h2>
                <p className="text-blue-700 mb-4">
                  {language === 'mr' 
                    ? 'प्रमाणपत्रासाठी अर्ज करण्यासाठी कृपया प्रथम लॉगिन करा.' 
                    : 'Please login first to apply for certificates.'}
                </p>
                <button
                  onClick={() => updatePage('login')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {language === 'mr' ? 'लॉगिन' : 'Login'}
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <CertificateFormsPage 
                language={language} 
                onBack={() => updatePage('home')} 
                onNavigate={(page, params) => {
                  if (page === 'certificate' && params?.type) {
                    // Update URL when certificate type is selected
                    window.history.pushState({ page, params }, '', `/forms/${params.type}`);
                    setUrlParams(params);
                  } else {
                    updatePage(page);
                  }
                }}
                certificateType={urlParams.type}
              />
            </Suspense>
          </div>
        );
      case 'forms':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <FormsPage language={language} />
            </Suspense>
          </div>
        );
      case 'gpdp':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <GramPanchayatDevelopmentPlanPage language={language} onBack={() => updatePage('home')} />
            </Suspense>
          </div>
        );
      case 'tenders':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <TendersPage language={language} onBack={() => updatePage('home')} />
            </Suspense>
          </div>
        );
      case 'rti':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <RTIPage language={language} onBack={() => updatePage('home')} />
            </Suspense>
          </div>
        );
      case 'gram-sabha':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <GramSabhaPage language={language} onBack={() => updatePage('home')} />
            </Suspense>
          </div>
        );
      case 'budget':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <BudgetPage language={language} onBack={() => updatePage('home')} />
            </Suspense>
          </div>
        );
      case 'bpl-list':
        // BPL list is restricted to admin users only
        if (!user || (profile?.role !== 'admin' && profile?.role !== 'super_admin')) {
          return (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                  {language === 'mr' ? 'प्रवेश प्रतिबंधित' : 'Access Restricted'}
                </h2>
                <p className="text-yellow-700">
                  {language === 'mr' 
                    ? 'BPL यादी माहिती केवळ प्रशासकांसाठी उपलब्ध आहे.' 
                    : 'BPL list information is only available to administrators.'}
                </p>
                <button
                  onClick={() => updatePage('home')}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {language === 'mr' ? 'मुख्यपृष्ठावर परत' : 'Back to Home'}
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <BPLListPage language={language} onBack={() => updatePage('home')} />
            </Suspense>
          </div>
        );
      case 'login':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading login page..." />}>
            <UserLogin isMarathi={language === 'mr'} onNavigate={updatePage} />
          </Suspense>
        );
      case 'my-dashboard':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading your dashboard..." />}>
            <UserDashboard isMarathi={language === 'mr'} onNavigate={updatePage} />
          </Suspense>
        );
      case 'admin-dashboard':
        if (!user || (profile?.role !== 'admin' && profile?.role !== 'super_admin')) {
          updatePage('home');
          return null;
        }
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Admin Dashboard..." />}>
            <AdminDashboard isMarathi={language === 'mr'} onNavigate={updatePage} />
          </Suspense>
        );
      case 'super-admin-dashboard':
        // Redirect admin users to their appropriate dashboard
        if (profile && profile.role !== 'super_admin') {
          updatePage('admin-dashboard');
          return (
            <div className="flex items-center justify-center min-h-screen">
              <p>Redirecting to appropriate dashboard...</p>
            </div>
          );
        }
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Super Admin Dashboard..." />}>
            <SuperAdminDashboard onNavigate={updatePage} language={language} />
          </Suspense>
        );
      case 'content-management':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Content Management..." />}>
            <ContentManagement onNavigate={updatePage} initialSection={null} />
          </Suspense>
        );
      case 'home':
      default:
        // Handle content-management with section parameter
        if (currentPage.startsWith('content-management?section=')) {
          const section = currentPage.split('=')[1];
          return (
            <Suspense fallback={<LoadingSpinner message="Loading Content Management..." />}>
              <ContentManagement onNavigate={updatePage} initialSection={section} />
            </Suspense>
          );
        }
        return <HomePage language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col">
      <GPHeader 
        language={language} 
        onLanguageChange={setLanguage}
        onNavigate={updatePage}
        user={user}
        profile={profile}
      />
      <main className="flex-1">
        {renderPage()}
      </main>
      <GPFooter language={language} onNavigate={updatePage} />
    </div>
  );
}

export default App;
