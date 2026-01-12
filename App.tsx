
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, DayMenu, Mess, UserSettings, Notification, MealBooking } from './types';
import { db } from './services/db';
import Layout from './components/Layout';
import MenuCard from './components/MenuCard';
import Settings from './components/Settings';
import MealBookingComponent from './components/MealBooking';
import MapPanel from './components/MapPanel';
import { 
  Plus, Search, Utensils, Info, Star, Heart, Users, TrendingUp,
  MessageSquare, Settings as SettingsIcon, LogOut, ChevronRight, Clock, ShieldCheck,
  Bell, CheckCircle, AlertTriangle, Send, Activity, BarChart2, Edit3, Trash, X, Eye, CalendarDays, History
} from 'lucide-react';
import { getMenuInsights } from './services/gemini';

interface AppContentProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdateSettings: (settings: UserSettings) => void;
}

const AppContent: React.FC<AppContentProps> = ({ user, onLogout, activeTab, setActiveTab, onUpdateSettings }) => {
  const [menus, setMenus] = useState<DayMenu[]>([]);
  const [allMesses, setAllMesses] = useState<Mess[]>([]);
  const [selectedMessId, setSelectedMessId] = useState<string>(user.primaryMessId || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [insight, setInsight] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState<{ title: string; type: string } | null>(null);
  const [userBookings, setUserBookings] = useState<MealBooking[]>([]);

  // Admin Form State
  const [editingMenu, setEditingMenu] = useState<DayMenu | null>(null);
  const [newLunchItem, setNewLunchItem] = useState('');
  const [newDinnerItem, setNewDinnerItem] = useState('');
  const [newBreakfastItem, setNewBreakfastItem] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const isAdmin = user.role === UserRole.ADMIN;

  const refreshData = () => {
    setMenus(db.getMenus());
    setAllMesses(db.getMesses());
    setUserBookings(db.getBookings(user.id));
  };

  useEffect(() => {
    refreshData();
    setNotifications(db.getNotifications(user.id));

    const interval = setInterval(() => {
      setAllMesses(prev => prev.map(m => ({
        ...m,
        liveDiners: Math.max(0, Math.min(m.capacity, m.liveDiners + Math.floor(Math.random() * 21) - 10))
      })));
    }, 10000);

    const handleNewNotif = (e: any) => {
      if (e.detail.userId === user.id) {
        setNotifications(prev => [e.detail.notification, ...prev]);
        setToast({ title: e.detail.notification.title, type: e.detail.notification.type });
        setTimeout(() => setToast(null), 4000);
      }
    };

    const handleMenuUpdated = (e: any) => {
      setMenus(db.getMenus());
      if (e.detail?.menu?.messId === selectedMessId) {
        setToast({ title: "Menu updated live!", type: "SUCCESS" });
        setTimeout(() => setToast(null), 3000);
      }
    };

    const handleMessUpdated = () => setAllMesses(db.getMesses());

    window.addEventListener('new-notification', handleNewNotif);
    window.addEventListener('menu-updated', handleMenuUpdated);
    window.addEventListener('mess-updated', handleMessUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('new-notification', handleNewNotif);
      window.removeEventListener('menu-updated', handleMenuUpdated);
      window.removeEventListener('mess-updated', handleMessUpdated);
    };
  }, [user.id, selectedMessId]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayMenu = menus.find(m => m.date === today && m.messId === selectedMessId);
    if (todayMenu) {
      getMenuInsights(todayMenu.lunch, todayMenu.dinner).then(setInsight);
    } else {
      setInsight('');
    }
  }, [menus, selectedMessId]);

  useEffect(() => {
    if (isAdmin && activeTab === 'manage') {
      const today = new Date().toISOString().split('T')[0];
      const targetMessId = user.messId || selectedMessId || (allMesses[0]?.id);
      const todayMenu = menus.find(m => m.date === today && m.messId === targetMessId);
      
      if (todayMenu) {
        setEditingMenu({ ...todayMenu });
      } else {
        setEditingMenu({
          id: Math.random().toString(36).substr(2, 9),
          date: today,
          messId: targetMessId || '',
          breakfast: [],
          lunch: [],
          dinner: [],
          note: ''
        });
      }
    }
  }, [isAdmin, activeTab, menus, user.messId, selectedMessId, allMesses]);

  const currentMess = useMemo(() => allMesses.find(m => m.id === (selectedMessId || (allMesses[0]?.id))), [selectedMessId, allMesses]);

  const pastBookings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return userBookings.filter(b => b.date < today).sort((a, b) => b.date.localeCompare(a.date));
  }, [userBookings]);

  const handleAddItem = (type: 'lunch' | 'dinner' | 'breakfast') => {
    if (!editingMenu) return;
    const value = type === 'lunch' ? newLunchItem : type === 'dinner' ? newDinnerItem : newBreakfastItem;
    if (!value.trim()) return;

    setEditingMenu({
      ...editingMenu,
      [type]: [...editingMenu[type], value.trim()]
    });

    if (type === 'lunch') setNewLunchItem('');
    else if (type === 'dinner') setNewDinnerItem('');
    else setNewBreakfastItem('');
  };

  const handleRemoveItem = (type: 'lunch' | 'dinner' | 'breakfast', index: number) => {
    if (!editingMenu) return;
    const newList = [...editingMenu[type]];
    newList.splice(index, 1);
    setEditingMenu({ ...editingMenu, [type]: newList });
  };

  const handleSaveMenu = () => {
    if (!editingMenu) return;
    db.saveMenu(editingMenu);
    setToast({ title: "Broadcasting updates...", type: "SUCCESS" });
    setTimeout(() => setToast(null), 3000);
  };

  if (isSettingsOpen) {
    return (
      <Layout user={user} onLogout={onLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
        <Settings user={user} onBack={() => setIsSettingsOpen(false)} onUpdate={onUpdateSettings} />
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} activeTab={activeTab} setActiveTab={setActiveTab} unreadCount={notifications.filter(n => !n.isRead).length}>
      {/* Real-time Toast */}
      {toast && (
        <div className="fixed top-24 right-6 left-6 md:left-auto md:w-80 z-50 animate-in slide-in-from-right-8 fade-in">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center space-x-3 border-l-4 border-orange-500">
            <Bell size={20} className="text-orange-400" />
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">Live Update</p>
              <p className="text-sm font-bold">{toast.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT HOME */}
      {!isAdmin && activeTab === 'home' && (
        <div className="animate-in fade-in duration-500">
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Hey, {user.email.split('@')[0]}!</h2>
              <div className="flex items-center mt-1 space-x-2">
                <p className="text-slate-500 font-bold">
                  {user.preferences?.diet === 'VEG' ? 'Pure vegetarian highlights' : 'What are you craving?'}
                </p>
              </div>
            </div>
            {currentMess && (
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-3 bg-white px-5 py-2.5 rounded-2xl border border-orange-100 shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-full ${currentMess.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{currentMess.isOpen ? 'Dining Open' : 'Closed'}</span>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Users size={12} />
                  <span>{currentMess.liveDiners} Students currently eating</span>
                </div>
              </div>
            )}
          </header>

          {/* Quick Booking Promo */}
          <div className="bg-orange-600 p-8 rounded-[3rem] text-white mb-10 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-orange-200">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-md">
                <CalendarDays size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Plan your week!</h3>
                <p className="text-orange-100 text-sm font-bold">Advance bookings skip the 12:30 PM rush.</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('bookings')}
              className="bg-white text-orange-600 font-black px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
            >
              Book Now
            </button>
          </div>

          <div className="flex overflow-x-auto pb-6 space-x-3 scrollbar-hide mb-8">
            {allMesses.map(mess => (
              <button
                key={mess.id}
                onClick={() => setSelectedMessId(mess.id)}
                className={`px-8 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 text-sm font-black tracking-tight border-2 ${
                  selectedMessId === mess.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-orange-200'
                }`}
              >
                {mess.name}
              </button>
            ))}
          </div>

          {menus.find(m => m.date === new Date().toISOString().split('T')[0] && m.messId === selectedMessId) ? (
            <MenuCard 
              menu={menus.find(m => m.date === new Date().toISOString().split('T')[0] && m.messId === selectedMessId)!} 
              messName={currentMess?.name || ''} 
              insight={insight}
            />
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-orange-50">
              <Utensils size={64} className="text-orange-100 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-900">No Menu Posted</h3>
              <p className="text-slate-500 mt-3 font-bold">Chef hasn't shared today's special yet.</p>
            </div>
          )}
        </div>
      )}

      {/* MEAL BOOKING PAGE */}
      {!isAdmin && activeTab === 'bookings' && (
        <MealBookingComponent 
          user={user} 
          messes={allMesses} 
          menus={menus} 
          onBookingComplete={() => {
            setUserBookings(db.getBookings(user.id));
            setToast({ title: "Meal Reserved!", type: "SUCCESS" });
            setTimeout(() => setToast(null), 3000);
          }} 
          onNavigateToMap={() => setActiveTab('map')}
        />
      )}

      {/* LIVE MAP PAGE */}
      {!isAdmin && activeTab === 'map' && (
        <div className="h-[calc(100vh-200px)] animate-in fade-in duration-500">
           <MapPanel messes={allMesses} />
        </div>
      )}

      {/* ADMIN DASHBOARD (OWNER HOME) */}
      {isAdmin && activeTab === 'home' && (
        <div className="animate-in fade-in duration-500">
          <header className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Hall Dashboard</h2>
            <p className="text-slate-500 mt-1 font-bold">Real-time stats for your dining operations.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard icon={<Users />} label="Active Diners" value={currentMess?.liveDiners || 0} trend="+12% vs yesterday" color="orange" />
            <StatCard icon={<TrendingUp />} label="Total Views" value={currentMess?.viewCount || 0} trend="Top performing" color="slate" />
            <StatCard icon={<Star />} label="Avg Rating" value={currentMess?.avgRating.toFixed(1) || 0} trend="Based on 45 reviews" color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-10 rounded-[3rem] border border-orange-50 shadow-sm">
                <h3 className="text-2xl font-black mb-6 flex items-center">
                  <Activity size={24} className="mr-3 text-orange-500" />
                  Live Busy-Meter
                </h3>
                <div className="space-y-6">
                   <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                        <span>Current Occupancy</span>
                        <span>{Math.round((currentMess?.liveDiners || 0) / (currentMess?.capacity || 1) * 100)}%</span>
                      </div>
                      <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-orange-50">
                        <div style={{ width: `${(currentMess?.liveDiners || 0) / (currentMess?.capacity || 1) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500 transition-all duration-1000"></div>
                      </div>
                   </div>
                   <p className="text-sm font-bold text-slate-500">Capacity: {currentMess?.capacity} seats available.</p>
                </div>
             </div>

             <div className="bg-slate-900 p-10 rounded-[3rem] text-white">
                <h3 className="text-2xl font-black mb-6 flex items-center">
                  <Send size={24} className="mr-3 text-orange-400" />
                  Quick Broadcast
                </h3>
                <textarea 
                  placeholder="Tell students about today's special or unexpected changes..." 
                  className="w-full bg-white/10 border-none rounded-2xl p-6 text-sm font-bold placeholder:text-slate-500 mb-6 focus:ring-2 focus:ring-orange-500 text-white"
                  rows={3}
                />
                <button 
                  onClick={() => db.broadcastNotification({ title: 'Important Update', message: 'The mess is serving extra snacks today!', type: 'INFO' })}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-orange-900/50"
                >
                  Blast Notification
                </button>
             </div>
          </div>
        </div>
      )}

      {/* MANAGE MESS (OWNER ONLY) */}
      {isAdmin && activeTab === 'manage' && editingMenu && (
        <div className="animate-in slide-in-from-right-8 duration-500">
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Manage Menus</h2>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-2" />
                  Live Sync
                </span>
              </div>
              <p className="text-slate-500 font-bold">Real-time updates are reflected for all students instantly.</p>
            </div>
            <div className="flex items-center space-x-3">
               <button 
                onClick={() => setShowPreview(!showPreview)}
                className={`p-4 rounded-2xl flex items-center space-x-2 font-black uppercase text-xs tracking-widest transition-all ${showPreview ? 'bg-orange-600 text-white' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}
              >
                <Eye size={18} />
                <span>{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
              </button>
              <button 
                onClick={() => {
                  const updatedMess = { ...currentMess!, isOpen: !currentMess!.isOpen };
                  db.updateMess(updatedMess);
                }}
                className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm ${currentMess?.isOpen ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}
              >
                {currentMess?.isOpen ? 'Close Dining' : 'Open Dining'}
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form Section */}
            <div className="space-y-8">
              <AdminMenuSection 
                title="Breakfast" 
                items={editingMenu.breakfast || []} 
                onAdd={() => handleAddItem('breakfast')} 
                onRemove={(idx) => handleRemoveItem('breakfast', idx)}
                value={newBreakfastItem}
                onChange={setNewBreakfastItem}
                icon={<Clock size={24} />}
              />
              <AdminMenuSection 
                title="Lunch" 
                items={editingMenu.lunch} 
                onAdd={() => handleAddItem('lunch')} 
                onRemove={(idx) => handleRemoveItem('lunch', idx)}
                value={newLunchItem}
                onChange={setNewLunchItem}
                icon={<Utensils size={24} />}
              />
              <AdminMenuSection 
                title="Dinner" 
                items={editingMenu.dinner} 
                onAdd={() => handleAddItem('dinner')} 
                onRemove={(idx) => handleRemoveItem('dinner', idx)}
                value={newDinnerItem}
                onChange={setNewDinnerItem}
                icon={<Activity size={24} />}
              />

              <div className="bg-white rounded-[2.5rem] p-8 border border-orange-50 shadow-sm">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 block">Manager's Note</label>
                <textarea 
                  value={editingMenu.note || ''}
                  onChange={(e) => setEditingMenu({ ...editingMenu, note: e.target.value })}
                  placeholder="Any special notes or alerts?" 
                  className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-sm h-24 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button 
                onClick={handleSaveMenu}
                className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl flex items-center justify-center space-x-3 text-lg hover:bg-orange-600 transition-all transform active:scale-[0.98]"
              >
                <Send size={24} />
                <span>Broadcast Live Update</span>
              </button>
            </div>

            {/* Preview Section */}
            <div className={`space-y-6 ${showPreview ? 'block animate-in slide-in-from-right-4' : 'hidden lg:block opacity-40'}`}>
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Student View Preview</h3>
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Real-time Mockup</span>
              </div>
              <MenuCard menu={editingMenu} messName={currentMess?.name || 'Your Mess Hall'} insight="AI Insights will be generated after broadcast." />
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PAGE */}
      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-20">
          <header className="mb-12 text-center">
             <div className="w-32 h-32 bg-orange-600 rounded-[3rem] mx-auto mb-6 flex items-center justify-center text-white text-5xl font-black shadow-2xl rotate-3">
               {user.email[0].toUpperCase()}
             </div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tight">{user.email.split('@')[0]}</h2>
             <p className="text-slate-400 font-bold mt-2 italic">{isAdmin ? 'Partner Account' : 'Student Account'}</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[3rem] border border-orange-50 overflow-hidden shadow-xl shadow-orange-100/50 p-4 space-y-2">
                <ProfileAction icon={<SettingsIcon size={20} />} label="App Settings" onClick={() => setIsSettingsOpen(true)} />
                <ProfileAction icon={<ShieldCheck size={20} />} label="Security" onClick={() => {}} />
                <ProfileAction icon={<Bell size={20} />} label="Notifications" onClick={() => setIsSettingsOpen(true)} />
                <button onClick={onLogout} className="w-full flex items-center space-x-4 p-5 rounded-[2rem] text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all font-black text-lg mt-4"><LogOut size={24} /><span>Sign Out</span></button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-[3rem] border border-orange-50 p-10 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black flex items-center">
                    <History size={24} className="mr-3 text-orange-500" />
                    Past Bookings
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pastBookings.length} Total</span>
                </div>

                {pastBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pastBookings.map(b => (
                      <div key={b.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-orange-100 transition-all">
                        <div className="flex items-center space-x-5">
                          <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-500 text-sm">
                            {new Date(b.date).getDate()}
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-900 leading-none">{b.mealType}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{allMesses.find(m => m.id === b.messId)?.name}</p>
                            <p className="text-[10px] text-slate-300 font-bold mt-0.5">{new Date(b.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-slate-200 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-300">
                    <History size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-black text-sm uppercase tracking-widest">No history yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTHER TABS */}
      {activeTab === 'notifications' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-3xl mx-auto">
          <header className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Alerts</h2>
            <p className="text-slate-500 font-bold">Stay updated with latest campus dining news.</p>
          </header>
          
          <div className="space-y-4">
            {notifications.length > 0 ? notifications.map(n => (
              <div key={n.id} className="bg-white p-8 rounded-[2.5rem] border border-orange-50 flex items-start space-x-6 hover:border-orange-200 transition-all group">
                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${n.type === 'ALERT' ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-600'}`}>
                  {n.type === 'ALERT' ? <AlertTriangle /> : <CheckCircle />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black text-slate-900 text-lg leading-tight">{n.title}</h4>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-500 font-bold text-sm leading-relaxed">{n.message}</p>
                </div>
              </div>
            )) : (
              <div className="py-32 text-center text-slate-300">
                <Bell size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-black text-sm uppercase tracking-widest">Inbox is clear</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

const AdminMenuSection = ({ title, items, onAdd, onRemove, value, onChange, icon }: any) => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-orange-50 shadow-sm">
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">{icon}</div>
      <h3 className="text-xl font-black text-slate-900">{title}</h3>
    </div>
    
    <div className="space-y-3 mb-6">
      {items.map((item: string, idx: number) => (
        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
          <span className="font-bold text-slate-700">{item}</span>
          <button onClick={() => onRemove(idx)} className="text-slate-300 hover:text-rose-500 transition-colors">
            <X size={18} />
          </button>
        </div>
      ))}
    </div>

    <div className="flex space-x-2">
      <input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onAdd()}
        className="flex-1 bg-slate-50 p-5 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-orange-500" 
        placeholder={`Add ${title.toLowerCase()} item...`} 
      />
      <button onClick={onAdd} className="p-5 bg-slate-900 text-white rounded-2xl hover:bg-orange-600 transition-all">
        <Plus size={20} />
      </button>
    </div>
  </div>
);

const ProfileAction = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-6 rounded-[2rem] hover:bg-orange-50 transition-all text-slate-900 font-bold group">
    <div className="flex items-center space-x-4">
      <div className="text-orange-600 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-lg">{label}</span>
    </div>
    <ChevronRight size={20} className="text-slate-300" />
  </button>
);

const StatCard = ({ icon, label, value, trend, color }: { icon: any, label: string, value: string | number, trend: string, color: 'orange' | 'slate' | 'emerald' }) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };
  return (
    <div className={`p-8 rounded-[3rem] border shadow-sm ${colors[color]} group`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
      </div>
      <h4 className="text-4xl font-black text-slate-900 mb-2">{value}</h4>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{trend}</p>
    </div>
  );
};

export default AppContent;
