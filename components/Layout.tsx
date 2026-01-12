
import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, Home, Search, Map, BarChart3, Star, Bell, PlusCircle, User as UserIcon, Heart, LayoutDashboard, UtensilsCrossed, CalendarDays } from 'lucide-react';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab, unreadCount = 0 }) => {
  const isStudent = user?.role === UserRole.STUDENT;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-64">
      {/* Mobile Header */}
      <header className="md:hidden bg-white px-6 py-5 flex justify-between items-center sticky top-0 z-30 border-b border-orange-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <PlusCircle size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">MESS<span className="text-orange-600">MATE</span></h1>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setActiveTab('notifications')} className="relative w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 border-2 border-white rounded-full"></span>}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-orange-100 fixed left-0 top-0 bottom-0 z-40">
        <div className="p-8">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <PlusCircle size={24} className="text-white" />
             </div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight">MESS<span className="text-orange-600">MATE</span></h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {isStudent ? (
            <>
              <NavItem icon={<Home size={22} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
              <NavItem icon={<CalendarDays size={22} />} label="Book Meals" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
              <NavItem icon={<Heart size={22} />} label="Favorites" active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
              <NavItem icon={<Search size={22} />} label="Explore" active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
              <NavItem icon={<Map size={22} />} label="Live Map" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
              <NavItem icon={<Star size={22} />} label="Feedback" active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} />
            </>
          ) : (
            <>
              <NavItem icon={<LayoutDashboard size={22} />} label="Dashboard" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
              <NavItem icon={<UtensilsCrossed size={22} />} label="Management" active={activeTab === 'manage'} onClick={() => setActiveTab('manage')} />
              <NavItem icon={<Star size={22} />} label="Feedback" active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} />
              <NavItem icon={<BarChart3 size={22} />} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
            </>
          )}
          <div className="pt-4 mt-4 border-t border-orange-50">
            <NavItem 
              icon={<Bell size={22} />} 
              label="Alerts" 
              active={activeTab === 'notifications'} 
              onClick={() => setActiveTab('notifications')}
              badge={unreadCount > 0 ? unreadCount : undefined}
            />
            <NavItem icon={<UserIcon size={22} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </div>
        </nav>

        <div className="p-6 border-t border-orange-50">
          <button onClick={onLogout} className="w-full flex items-center space-x-3 p-4 rounded-2xl text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all font-bold group">
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-50 flex justify-around items-center py-3 px-2 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <TabItem icon={<Home size={24} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Home" />
        {isStudent ? (
          <>
            <TabItem icon={<CalendarDays size={24} />} active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} label="Book" />
            <TabItem icon={<Search size={24} />} active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} label="Explore" />
            <TabItem icon={<Map size={24} />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} label="Map" />
          </>
        ) : (
          <>
            <TabItem icon={<UtensilsCrossed size={24} />} active={activeTab === 'manage'} onClick={() => setActiveTab('manage')} label="Manage" />
            <TabItem icon={<Star size={24} />} active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} label="Feed" />
            <TabItem icon={<BarChart3 size={24} />} active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="Stats" />
          </>
        )}
        <TabItem icon={<UserIcon size={24} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label="Me" />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, badge }: { icon: any, label: string, active: boolean, onClick: () => void, badge?: number }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 relative ${
      active 
        ? 'bg-orange-600 text-white font-bold shadow-xl shadow-orange-100' 
        : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
    }`}
  >
    <div className="flex items-center space-x-4">
      {icon}
      <span className="text-base">{label}</span>
    </div>
    {badge && (
      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${active ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}>
        {badge}
      </span>
    )}
  </button>
);

const TabItem = ({ icon, active, onClick, label }: { icon: any, active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center flex-1 transition-all duration-300 ${active ? 'text-orange-600 scale-110' : 'text-slate-400'}`}
  >
    <div className={`${active ? 'bg-orange-50 p-1 rounded-xl' : ''}`}>
      {icon}
    </div>
    <span className={`text-[10px] mt-1 font-bold ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default Layout;
