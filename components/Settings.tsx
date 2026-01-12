
import React, { useState } from 'react';
import { User, UserSettings } from '../types';
import { Bell, Moon, Shield, Trash2, ArrowLeft, Info, ChevronRight, Clock, Star } from 'lucide-react';

interface SettingsProps {
  user: User;
  onBack: () => void;
  onUpdate: (settings: UserSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onBack, onUpdate }) => {
  const [settings, setSettings] = useState<UserSettings>(user.settings || {
    notifications: { lunchReminders: true, dinnerReminders: true, weeklyReports: false },
    darkMode: false
  });

  const toggleNotif = (key: keyof UserSettings['notifications']) => {
    const next = { ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } };
    setSettings(next);
    onUpdate(next);
  };

  const toggleDarkMode = () => {
    const next = { ...settings, darkMode: !settings.darkMode };
    setSettings(next);
    onUpdate(next);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-400 hover:text-orange-600 transition-colors mb-8 font-black uppercase text-xs tracking-widest"
      >
        <ArrowLeft size={16} />
        <span>Back to Profile</span>
      </button>

      <header className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">App Settings</h2>
        <p className="text-slate-500 mt-2 font-bold">Configure your dining preferences and notifications.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
            <Bell size={14} className="mr-2" /> Notifications
          </h3>
          <div className="bg-white rounded-[2.5rem] border border-orange-50 overflow-hidden shadow-sm">
            <ToggleRow 
              label="Lunch Reminders" 
              active={settings.notifications.lunchReminders} 
              onToggle={() => toggleNotif('lunchReminders')} 
              icon={<Clock size={20} />}
            />
            <ToggleRow 
              label="Dinner Reminders" 
              active={settings.notifications.dinnerReminders} 
              onToggle={() => toggleNotif('dinnerReminders')} 
              icon={<Star size={20} />}
            />
            <ToggleRow 
              label="Weekly Health Recap" 
              active={settings.notifications.weeklyReports} 
              onToggle={() => toggleNotif('weeklyReports')} 
              icon={<Info size={20} />}
            />
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
            <Shield size={14} className="mr-2" /> System & Privacy
          </h3>
          <div className="bg-white rounded-[2.5rem] border border-orange-50 overflow-hidden shadow-sm">
            <ToggleRow 
              label="Dark Mode (Beta)" 
              active={settings.darkMode} 
              onToggle={toggleDarkMode} 
              icon={<Moon size={20} />}
            />
            <div className="p-6 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
               <div className="flex items-center space-x-4">
                 <div className="text-slate-400"><Trash2 size={20} /></div>
                 <span className="font-bold text-slate-700">Clear Search History</span>
               </div>
               <ChevronRight size={18} className="text-slate-200" />
            </div>
          </div>

          <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100 flex flex-col items-center text-center">
            <h4 className="font-black text-rose-600 uppercase text-[10px] tracking-widest mb-2">Danger Zone</h4>
            <button className="text-rose-600 font-black hover:underline">Delete Profile & Reset App</button>
          </div>
        </section>
      </div>
    </div>
  );
};

const ToggleRow = ({ label, active, onToggle, icon }: { label: string, active: boolean, onToggle: () => void, icon: any }) => (
  <div className="p-6 border-b border-slate-50 last:border-0 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <div className={`${active ? 'text-orange-600' : 'text-slate-300'} transition-colors`}>{icon}</div>
      <span className="font-bold text-slate-800">{label}</span>
    </div>
    <button 
      onClick={onToggle}
      className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${active ? 'bg-orange-600' : 'bg-slate-200'}`}
    >
      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default Settings;
