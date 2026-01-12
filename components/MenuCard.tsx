
import React from 'react';
import { DayMenu } from '../types';
import { Sun, Moon, Sparkles, Heart, ImageIcon, AlertCircle } from 'lucide-react';

interface MenuCardProps {
  menu: DayMenu;
  messName: string;
  insight?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ menu, messName, insight, isFavorite, onToggleFavorite }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-orange-50 overflow-hidden mb-8 transform transition-all hover:scale-[1.01]">
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white relative">
        <div className="flex justify-between items-start">
          <div>
            <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md border border-white/20 mb-3 inline-block">Daily Special</span>
            <h3 className="text-3xl font-black tracking-tight leading-none">{messName}</h3>
            <p className="text-orange-100 text-sm mt-2 font-medium">
              {new Date(menu.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {onToggleFavorite && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className={`p-4 rounded-3xl backdrop-blur-md transition-all duration-300 ${isFavorite ? 'bg-white text-orange-600 scale-110 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
        
        {insight && (
          <div className="mt-6 bg-white/10 p-4 rounded-2xl text-sm flex items-start space-x-3 border border-white/10 backdrop-blur-sm">
            <Sparkles size={20} className="text-orange-200 shrink-0" />
            <p className="leading-relaxed"><span className="font-bold">HEALTH TIP:</span> {insight}</p>
          </div>
        )}
      </div>

      {menu.images && menu.images.length > 0 && (
        <div className="flex overflow-x-auto p-6 space-x-4 scrollbar-hide bg-orange-50/30">
          {menu.images.map((img, i) => (
            <div key={i} className="flex-shrink-0 w-48 h-36 rounded-3xl bg-slate-200 overflow-hidden shadow-md group relative">
              <img src={img} alt="Food item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                 <ImageIcon size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center space-x-3 text-orange-600 mb-6 font-black uppercase tracking-widest text-xs">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Sun size={20} />
            </div>
            <span>Lunch Menu</span>
          </div>
          <ul className="space-y-4">
            {menu.lunch.map((item, idx) => (
              <li key={idx} className="flex items-center space-x-4 group">
                <div className="w-2 h-2 rounded-full bg-orange-200 group-hover:bg-orange-500 transition-colors"></div>
                <span className="text-slate-700 font-bold">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-slate-900 rounded-3xl p-6 shadow-lg shadow-slate-200">
          <div className="flex items-center space-x-3 text-orange-400 mb-6 font-black uppercase tracking-widest text-xs">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-orange-400">
              <Moon size={20} />
            </div>
            <span>Dinner Menu</span>
          </div>
          <ul className="space-y-4">
            {menu.dinner.map((item, idx) => (
              <li key={idx} className="flex items-center space-x-4 group">
                <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-orange-500 transition-colors"></div>
                <span className="text-slate-100 font-bold">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {menu.note && (
        <div className="bg-orange-50 px-8 py-5 border-t border-orange-100 text-xs text-orange-700 font-bold flex items-center space-x-3">
          <AlertCircle size={16} />
          <span>MANAGER'S NOTE: {menu.note}</span>
        </div>
      )}
    </div>
  );
};

export default MenuCard;
