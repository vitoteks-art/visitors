import React, { useState, useEffect } from 'react';
import { LayoutDashboard, UserPlus, Users, Mail, Menu, X, Bell, LogOut, Settings, Sun, Moon, CheckCircle, XCircle } from 'lucide-react';
import { ViewState, Notification } from './types';
import { checkNotifications } from './services/storage';
import CheckInForm from './components/CheckInForm';
import ReceptionDashboard from './components/ReceptionDashboard';
import AdminDashboard from './components/AdminDashboard';
import HostSimulation from './components/HostSimulation';
import LoginPage from './components/LoginPage';
import KioskLanding from './components/KioskLanding';
import CheckOutKiosk from './components/CheckOutKiosk';
import AdminStaffManagement from './components/AdminStaffManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const MainApp: React.FC = () => {
  const [view, setView] = useState<ViewState>('check-in');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [lastNotificationId, setLastNotificationId] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [audioPrimed, setAudioPrimed] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Prime audio on first interaction to bypass browser autoplay policies
  useEffect(() => {
    const handlePrime = () => {
      if (!audioPrimed) {
        setAudioPrimed(true);
        // Silent play to unlock audio context
        const silent = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        silent.volume = 0;
        silent.play().catch(() => { });
        window.removeEventListener('click', handlePrime);
      }
    };
    window.addEventListener('click', handlePrime);
    return () => window.removeEventListener('click', handlePrime);
  }, [audioPrimed]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Poll for notifications
  useEffect(() => {
    const pollNotifications = async () => {
      const data = await checkNotifications(
        lastNotificationId,
        isAuthenticated ? user?.role : '',
        isAuthenticated ? user?.name : ''
      );

      if (data && data.has_new) {
        setLastNotificationId(data.latest_id);

        // Append new notifications
        const newNotifs = data.notifications.map(n => ({ ...n, isRead: false }));
        setNotifications(prev => [...newNotifs, ...prev].slice(0, 50));

        const latest = data.notifications[data.notifications.length - 1];
        setActiveNotification(latest);
        setShowNotification(true);

        // Audio Alarm - Only for internal views
        const isInternalView = ['reception', 'host-portal', 'admin', 'staff-management'].includes(view);
        if (isInternalView) {
          try {
            // Using a slightly different URL that is highly available
            const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_276a6d36d4.mp3'); // A clear ping sound
            audio.play().catch(e => {
              // Fallback to original if primary fails
              const fallback = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              fallback.play().catch(err => console.error("Audio block:", err));
            });
          } catch (e) {
            console.error("Audio playback failed", e);
          }
        }

        setTimeout(() => {
          setShowNotification(false);
          setActiveNotification(null);
        }, 8000);
      }
    };

    const interval = setInterval(pollNotifications, 3000);
    return () => clearInterval(interval);
  }, [lastNotificationId, isAuthenticated, user, view]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const toggleDropdown = () => {
    setShowBellDropdown(!showBellDropdown);
    if (!showBellDropdown) {
      // Small delay to mark as read so user sees the numbers change
      setTimeout(markAllAsRead, 1000);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowBellDropdown(false);
  };

  // Kiosk Sub-Views
  const [kioskView, setKioskView] = useState<'landing' | 'check-in' | 'check-out'>('landing');

  // Callback when check-in/out completes
  const handleKioskComplete = () => {
    setKioskView('landing');
    // If we want to switch back to reception view after any internal admin action, 
    // but for Kiosk we usually want to stay on Kiosk landing.
  };

  const handleNavClick = (id: ViewState) => {
    if (id !== 'check-in' && !isAuthenticated) {
      setView('login');
    } else {
      setView(id);
      if (id === 'check-in') setKioskView('landing');
    }
    setSidebarOpen(false);
  };

  const NavItem = ({ id, label, icon: Icon }: { id: ViewState, label: string, icon: any }) => (
    <button
      onClick={() => handleNavClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${view === id
        ? 'bg-blue-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
        }`}
    >
      <Icon className={`h-5 w-5 ${view === id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`} />
      <span>{label}</span>
    </button>
  );

  const renderContent = () => {
    if (view === 'login') {
      return <LoginPage onLoginSuccess={() => setView('admin')} />;
    }

    if (['reception', 'host-portal', 'admin', 'staff-management'].includes(view) && !isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-sm w-full transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Access Restricted</h2>
            <p className="mb-6 text-gray-500 dark:text-gray-400">Please log in to access the internal portals.</p>
            <button onClick={() => setView('login')} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-200 dark:shadow-none transition">
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    switch (view) {
      case 'check-in':
        if (kioskView === 'landing') return <KioskLanding onSelectAction={setKioskView} />;
        if (kioskView === 'check-out') return <CheckOutKiosk onCancel={() => setKioskView('landing')} onComplete={handleKioskComplete} />;
        return <CheckInForm onComplete={handleKioskComplete} />;
      case 'reception': return <ReceptionDashboard />;
      case 'host-portal': return <HostSimulation />;
      case 'admin': return <AdminDashboard />;
      case 'staff-management': return <AdminStaffManagement />;
      default: return <KioskLanding onSelectAction={setKioskView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-200">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Kosmos Energy VMS</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">powered Vitotek Systems</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reception Pro</p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            <NavItem id="check-in" label="Kiosk Station" icon={UserPlus} />
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Internal</p>
            </div>
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'reception') && (
              <NavItem id="reception" label="Live Dashboard" icon={Users} />
            )}
            {isAuthenticated && <NavItem id="host-portal" label="Host Portal" icon={Mail} />}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <NavItem id="admin" label="Reports & Logs" icon={LayoutDashboard} />
                <NavItem id="staff-management" label="Staff Management" icon={Settings} />
              </>
            )}
          </nav>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
                  {user?.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <button onClick={() => { logout(); setView('check-in'); }} className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg text-sm font-medium transition">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setView('login')} className="w-full bg-gray-900 dark:bg-black text-white py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-black dark:hover:bg-gray-900 transition">
                Staff Login
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 z-10 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {view === 'check-in' && 'Kiosk Mode'}
              {view === 'reception' && 'Live Dashboard'}
              {view === 'host-portal' && 'Visitor Notification'}
              {view === 'admin' && 'Admin Analytics & Logs'}
              {view === 'login' && 'Staff Authentication'}
              {view === 'staff-management' && 'Manage Staff'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button onClick={toggleDropdown} className={`relative p-2 transition-colors rounded-lg ${showBellDropdown ? 'bg-gray-100 dark:bg-gray-700 text-brand-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full border-2 border-white dark:border-gray-800">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showBellDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowBellDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                      <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                      <button onClick={markAllAsRead} className="text-xs text-brand-600 hover:text-brand-700 font-bold uppercase tracking-wider">Mark all read</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors relative ${!n.isRead ? 'bg-blue-50/30 dark:bg-brand-900/10' : ''}`}>
                            {!n.isRead && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-full" />}
                            <div className="flex gap-3">
                              <div className={`p-2 rounded-lg h-fit ${n.type === 'NEW_VISITOR' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                                n.type === 'CHECK_IN_APPROVED' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                                  n.type === 'CHECK_IN_DECLINED' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                    'bg-gray-100 text-gray-600 dark:bg-gray-700'
                                }`}>
                                {n.type === 'NEW_VISITOR' ? <UserPlus className="h-4 w-4" /> :
                                  n.type === 'CHECK_IN_APPROVED' ? <CheckCircle className="h-4 w-4" /> :
                                    n.type === 'CHECK_IN_DECLINED' ? <XCircle className="h-4 w-4" /> :
                                      <Bell className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{n.visitorName || 'New Visitor'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700 text-center">
                        <button onClick={clearNotifications} className="text-xs text-gray-500 hover:text-red-500 transition-colors">Clear all notifications</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {view === 'reception' && (
              <button onClick={() => setView('check-in')} className="hidden md:flex bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition items-center gap-2">
                <UserPlus className="h-4 w-4" /> Check-in Visitor
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 relative">
          {showNotification && (
            <div className="absolute top-6 right-6 z-50 animate-in slide-in-from-right-10 duration-500">
              <div className="bg-brand-600 dark:bg-brand-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px]">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bell className="h-6 w-6 text-white animate-bounce" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg leading-tight">
                    {activeNotification?.type === 'NEW_VISITOR' ? 'Arrival Alert' :
                      activeNotification?.type === 'CHECK_IN_APPROVED' ? 'Visit Approved' :
                        activeNotification?.type === 'CHECK_IN_DECLINED' ? 'Visit Declined' : 'Status Update'}
                  </p>
                  <p className="text-sm text-blue-50 opacity-90">
                    {activeNotification?.type === 'CHECK_IN_APPROVED'
                      ? `${activeNotification.visitorName || 'Visitor'} has been approved.`
                      : activeNotification?.type === 'CHECK_IN_DECLINED'
                        ? `${activeNotification.visitorName || 'Visitor'} has been declined.`
                        : activeNotification?.visitorName
                          ? `${activeNotification.visitorName} is here to see you.`
                          : activeNotification?.message || 'A visitor has checked in.'}
                  </p>
                </div>
                <button onClick={() => setShowNotification(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors self-start mt-0.5">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
          <div className="max-w-[1600px] mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  </AuthProvider>
);

export default App;