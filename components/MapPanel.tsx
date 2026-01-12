
import React, { useState, useEffect } from 'react';
import { Mess, Location } from '../types';
import { MapPin, Navigation, Info, Clock, Route, ChevronRight } from 'lucide-react';

interface MapPanelProps {
  messes: Mess[];
  userLocation?: Location;
}

const MapPanel: React.FC<MapPanelProps> = ({ messes, userLocation = { lat: 12.9716, lng: 77.5946 } }) => {
  const [selectedMess, setSelectedMess] = useState<Mess | null>(null);

  const getDistance = (l1: Location, l2: Location) => {
    const d = Math.sqrt(Math.pow(l1.lat - l2.lat, 2) + Math.pow(l1.lng - l2.lng, 2)) * 111;
    return d.toFixed(1);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[3rem] overflow-hidden border border-orange-50 relative shadow-2xl shadow-orange-100/50">
      <div className="flex-1 relative bg-orange-50/20 bg-[radial-gradient(#fed7aa_1.5px,transparent_1.5px)] [background-size:32px_32px]">
        {messes.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMess(m)}
            className="absolute p-3 transition-all duration-300 hover:scale-125 z-10 focus:outline-none"
            style={{ 
              left: `${50 + (m.coords.lng - userLocation.lng) * 500}%`,
              top: `${50 - (m.coords.lat - userLocation.lat) * 500}%`
            }}
          >
            <div className={`relative ${selectedMess?.id === m.id ? 'scale-125' : ''}`}>
              <MapPin 
                size={42} 
                className={m.isOpen ? 'text-orange-600 fill-orange-100' : 'text-slate-300 fill-slate-50'} 
              />
              {m.isOpen && <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-xl animate-pulse"></span>}
            </div>
          </button>
        ))}

        <div 
          className="absolute w-10 h-10 bg-slate-900 rounded-full border-4 border-white shadow-2xl z-20 flex items-center justify-center text-white"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="absolute inset-0 bg-slate-900 rounded-full animate-ping opacity-20"></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        </div>

        <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md p-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] space-y-3 border border-orange-100 shadow-xl z-30">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-orange-600 rounded-lg"></div>
            <span>Dining Open</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <div className="w-4 h-4 bg-slate-200 rounded-lg"></div>
            <span>Inactive</span>
          </div>
        </div>
      </div>

      {selectedMess && (
        <div className="bg-white p-10 border-t border-orange-50 animate-in slide-in-from-bottom-12 duration-500 z-40 shadow-[0_-20px_60px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest mb-1 block">{selectedMess.location}</span>
              <h3 className="text-3xl font-black text-slate-900 leading-none">{selectedMess.name}</h3>
            </div>
            <button onClick={() => setSelectedMess(null)} className="text-slate-300 hover:text-slate-900 p-2">
              <ChevronRight size={32} className="rotate-90" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-orange-50/50 p-5 rounded-[2rem] flex items-center space-x-4 border border-orange-100/50">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                 <Route size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Radius</p>
                <p className="text-lg font-black text-slate-900 tracking-tighter">{getDistance(userLocation, selectedMess.coords)} km</p>
              </div>
            </div>
            <div className="bg-slate-900 p-5 rounded-[2rem] flex items-center space-x-4 shadow-xl">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-orange-400">
                 <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Walk Time</p>
                <p className="text-lg font-black text-white tracking-tighter">{Math.ceil(parseFloat(getDistance(userLocation, selectedMess.coords)) * 12)} m</p>
              </div>
            </div>
          </div>

          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-6 rounded-[2rem] flex items-center justify-center space-x-3 shadow-2xl shadow-orange-200 text-lg transition-all active:scale-95">
            <Navigation size={24} />
            <span>Open Navigation</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MapPanel;
