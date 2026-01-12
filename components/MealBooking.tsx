
import React, { useState, useEffect, useMemo } from 'react';
import { User, DayMenu, Mess, MealBooking } from '../types';
import { db } from '../services/db';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Sparkles, Clock, Utensils, QrCode, MapPin, Navigation, ShoppingBag, X, CheckSquare, Square } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface MealBookingProps {
  user: User;
  messes: Mess[];
  menus: DayMenu[];
  onBookingComplete: () => void;
  onNavigateToMap: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MealBookingComponent: React.FC<MealBookingProps> = ({ user, messes, menus, onBookingComplete, onNavigateToMap }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMessId, setSelectedMessId] = useState(user.primaryMessId || messes[0]?.id);
  const [bookings, setBookings] = useState<MealBooking[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({}); // Key: mealType-date

  useEffect(() => {
    setBookings(db.getBookings(user.id));
  }, [user.id]);

  const next7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, []);

  const currentMenu = useMemo(() => {
    return menus.find(m => m.date === selectedDate && m.messId === selectedMessId);
  }, [selectedDate, selectedMessId, menus]);

  const selectedMess = useMemo(() => {
    return messes.find(m => m.id === selectedMessId);
  }, [selectedMessId, messes]);

  const checkDietaryFit = async (menuItems: string[]) => {
    if (!menuItems.length) return;
    try {
      const prompt = `Analyze if this menu: [${menuItems.join(', ')}] is suitable for a student who is ${user.preferences?.diet} and allergic to: ${user.preferences?.allergies.join(', ') || 'nothing'}. 
      Provide a 1-sentence assessment and a safety score (1-10). Format: [Score] Assessment.`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setInsight(response.text);
    } catch (e) {
      setInsight(null);
    }
  };

  useEffect(() => {
    if (currentMenu) {
      const allItems = [...currentMenu.breakfast, ...currentMenu.lunch, ...currentMenu.dinner];
      checkDietaryFit(allItems);
    } else {
      setInsight(null);
    }
  }, [currentMenu]);

  const toggleItemSelection = (mealType: string, item: string) => {
    const key = `${mealType}-${selectedDate}`;
    const current = selectedItems[key] || [];
    if (current.includes(item)) {
      setSelectedItems({ ...selectedItems, [key]: current.filter(i => i !== item) });
    } else {
      setSelectedItems({ ...selectedItems, [key]: [...current, item] });
    }
  };

  const handleBook = (mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER') => {
    const key = `${mealType}-${selectedDate}`;
    const items = selectedItems[key] || [];
    
    const newBooking: MealBooking = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      messId: selectedMessId,
      date: selectedDate,
      mealType,
      status: 'CONFIRMED',
      timestamp: new Date().toISOString(),
      selectedItems: items
    };

    db.saveBooking(user.id, newBooking);
    const updated = db.getBookings(user.id);
    setBookings(updated);
    
    if (user.settings?.notifications.lunchReminders) {
        db.addNotification(user.id, {
            title: 'Booking Confirmed!',
            message: `Your ${mealType} at ${selectedMess?.name} is scheduled for ${selectedDate}. We'll remind you!`,
            type: 'SUCCESS'
        });
    }
    
    onBookingComplete();
  };

  const handleCancel = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking? This slot will be released to other students.')) {
      db.cancelBooking(user.id, bookingId);
      setBookings(db.getBookings(user.id));
      db.addNotification(user.id, {
        title: 'Booking Cancelled',
        message: 'Your reservation has been successfully removed.',
        type: 'ALERT'
      });
    }
  };

  const isBooked = (date: string, type: string) => {
    return bookings.some(b => b.date === date && b.mealType === type && b.messId === selectedMessId);
  };

  const upcomingBookings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => b.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  }, [bookings]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Meal Reservation</h2>
          <p className="text-slate-500 font-bold mt-1">Select your menu items and confirm your slot.</p>
        </div>
        {selectedMess && (
          <button 
            onClick={onNavigateToMap}
            className="hidden md:flex items-center space-x-2 bg-white px-6 py-3 rounded-2xl border border-orange-100 text-orange-600 font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all shadow-sm"
          >
            <MapPin size={16} />
            <span>Locate Mess</span>
          </button>
        )}
      </header>

      {/* Date Selection */}
      <div className="flex overflow-x-auto pb-6 space-x-3 scrollbar-hide mb-8">
        {next7Days.map(date => {
          const d = new Date(date);
          const isSelected = selectedDate === date;
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 w-24 py-4 rounded-[2rem] flex flex-col items-center justify-center transition-all border-2 ${
                isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-orange-200'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest mb-1">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="text-2xl font-black">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Select Dining Hall</h3>
            <div className="space-y-3">
              {messes.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMessId(m.id)}
                  className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all font-bold ${
                    selectedMessId === m.id ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-sm block">{m.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{m.location}</span>
                  </div>
                  {selectedMessId === m.id && <CheckCircle size={16} />}
                </button>
              ))}
            </div>
          </div>

          {insight && (
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-indigo-100">
               <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles size={48} /></div>
               <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center">
                 <Sparkles size={14} className="mr-2" /> Gemini AI Safety Check
               </h3>
               <p className="text-sm font-bold leading-relaxed">{insight}</p>
            </div>
          )}

          {selectedMess && (
             <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Hall Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-400"><Clock size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Breakfast Time</p>
                      <p className="text-sm font-bold">{selectedMess.operatingHours?.breakfast}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-400"><Navigation size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                      <p className="text-sm font-bold">{selectedMess.location}</p>
                    </div>
                  </div>
                </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 gap-8">
            <MealSlot 
              type="BREAKFAST" 
              items={currentMenu?.breakfast || []} 
              isBooked={isBooked(selectedDate, 'BREAKFAST')} 
              onBook={() => handleBook('BREAKFAST')}
              time={selectedMess?.operatingHours?.breakfast || "7:30 - 9:30"}
              disabled={!currentMenu}
              selectedItems={selectedItems[`BREAKFAST-${selectedDate}`] || []}
              onToggleItem={(item) => toggleItemSelection('BREAKFAST', item)}
            />
            <MealSlot 
              type="LUNCH" 
              items={currentMenu?.lunch || []} 
              isBooked={isBooked(selectedDate, 'LUNCH')} 
              onBook={() => handleBook('LUNCH')}
              time={selectedMess?.operatingHours?.lunch || "12:30 - 2:30"}
              disabled={!currentMenu}
              selectedItems={selectedItems[`LUNCH-${selectedDate}`] || []}
              onToggleItem={(item) => toggleItemSelection('LUNCH', item)}
            />
            <MealSlot 
              type="DINNER" 
              items={currentMenu?.dinner || []} 
              isBooked={isBooked(selectedDate, 'DINNER')} 
              onBook={() => handleBook('DINNER')}
              time={selectedMess?.operatingHours?.dinner || "7:30 - 9:30"}
              disabled={!currentMenu}
              selectedItems={selectedItems[`DINNER-${selectedDate}`] || []}
              onToggleItem={(item) => toggleItemSelection('DINNER', item)}
            />
          </div>

          {!currentMenu && (
            <div className="bg-orange-50 rounded-[2.5rem] p-12 text-center border-4 border-dashed border-orange-100">
               <Utensils size={48} className="text-orange-200 mx-auto mb-4" />
               <p className="text-slate-500 font-bold">Chef hasn't posted the menu for this date yet.</p>
               <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-black">Bookings open 24h before meal time</p>
            </div>
          )}

          {upcomingBookings.length > 0 && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-orange-50">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Confirmed Tickets</h3>
                  <button onClick={onNavigateToMap} className="text-orange-600 font-black text-[10px] uppercase tracking-widest hover:underline">View Map Instructions</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {upcomingBookings.map(b => (
                   <div key={b.id} className="relative group overflow-hidden bg-slate-50 p-6 rounded-[2rem] border border-transparent hover:border-orange-200 transition-all">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShoppingBag size={64} />
                      </div>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm">
                          {new Date(b.date).getDate()}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 leading-none">{b.mealType}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{messes.find(m => m.id === b.messId)?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                         <div className="flex items-center space-x-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                           <CheckCircle size={14} />
                           <span>Confirmed</span>
                         </div>
                         <div className="flex items-center space-x-2">
                           <button onClick={() => handleCancel(b.id)} className="bg-white p-3 rounded-xl shadow-sm text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                             <X size={18} />
                           </button>
                           <button className="bg-white p-3 rounded-xl shadow-sm text-slate-400 hover:text-orange-600 transition-colors">
                             <QrCode size={18} />
                           </button>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MealSlot = ({ type, items, isBooked, onBook, time, disabled, selectedItems, onToggleItem }: { 
  type: string, 
  items: string[], 
  isBooked: boolean, 
  onBook: () => void, 
  time: string, 
  disabled: boolean,
  selectedItems: string[],
  onToggleItem: (item: string) => void
}) => (
  <div className={`bg-white rounded-[2.5rem] p-8 border border-orange-50 shadow-sm transition-all hover:shadow-md ${disabled ? 'opacity-50 grayscale' : ''}`}>
    <div className="flex justify-between items-start mb-8">
      <div className="flex items-center space-x-4 text-orange-600">
        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
          <Utensils size={24} />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-[0.2em] block text-slate-400">{type}</span>
          <span className="text-xl font-black text-slate-900">{time}</span>
        </div>
      </div>
      {isBooked && (
        <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200">Reserved & Active</span>
      )}
    </div>

    <div className="space-y-4 mb-8">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personalize your tray</p>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? items.map((item, i) => {
          const isItemSelected = selectedItems.includes(item);
          return (
            <button
              key={i}
              disabled={isBooked || disabled}
              onClick={() => onToggleItem(item)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all border-2 flex items-center space-x-2 ${
                isItemSelected 
                  ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' 
                  : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-orange-200'
              }`}
            >
              {isItemSelected ? <CheckSquare size={14} /> : <Square size={14} className="opacity-30" />}
              <span>{item}</span>
            </button>
          );
        }) : (
          <p className="text-xs text-slate-300 italic">Menu items not listed yet...</p>
        )}
      </div>
    </div>

    <button
      disabled={isBooked || disabled}
      onClick={onBook}
      className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
        isBooked 
          ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100' 
          : 'bg-slate-900 text-white hover:bg-orange-600 shadow-xl shadow-slate-100 active:scale-95'
      }`}
    >
      {isBooked ? 'Slot Reserved Successfully' : `Book ${type} Slot`}
    </button>
  </div>
);

export default MealBookingComponent;
