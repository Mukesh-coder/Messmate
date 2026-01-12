
import React, { useState } from 'react';
import { User, UserPreferences, Mess } from '../types';
import { MESSES } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { Utensils, Sparkles, MapPin, ChevronRight, Check, AlertCircle, Loader2 } from 'lucide-react';

interface OnboardingProps {
  user: User;
  onComplete: (primaryMessId: string, prefs: UserPreferences) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [diet, setDiet] = useState<'VEG' | 'NON_VEG' | 'BOTH'>('BOTH');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [recMessId, setRecMessId] = useState<string>(MESSES[0].id);
  const [isLoading, setIsLoading] = useState(false);

  const toggleAllergy = (a: string) => {
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const getRecommendation = async () => {
    setIsLoading(true);
    setStep(2);
    try {
      const messList = MESSES.map(m => `${m.id}:${m.name}(${m.isVegOnly ? 'Veg' : 'Mixed'})`).join(', ');
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Recommend one mess ID from this list for a student who is ${diet} and allergic to ${allergies.join(', ') || 'nothing'}. List: ${messList}. Return ONLY the ID string.`,
      });
      const id = response.text.trim();
      const matched = MESSES.find(m => m.id === id);
      setRecMessId(matched ? matched.id : MESSES[0].id);
    } catch (e) {
      setRecMessId(MESSES[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    onComplete(recMessId, { diet, allergies, spiceLevel: 'MEDIUM' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
      <div className="max-w-md w-full flex flex-col items-center text-center py-10">
        
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div className="bg-orange-100 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-3 shadow-xl shadow-orange-50">
              <Utensils size={48} className="text-orange-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Dietary Profile</h2>
            <p className="text-slate-500 font-bold mb-10">Help us tailor your campus dining experience.</p>
            
            <div className="space-y-3 w-full">
              {['VEG', 'NON_VEG', 'BOTH'].map((type) => (
                <button
                  key={type}
                  onClick={() => setDiet(type as any)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-between font-bold ${
                    diet === type ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-slate-100 bg-white text-slate-500 hover:border-orange-200'
                  }`}
                >
                  <span>{type === 'VEG' ? 'Pure Vegetarian' : type === 'NON_VEG' ? 'Mostly Non-Veg' : 'Universal (Everything)'}</span>
                  {diet === type && <Check size={20} />}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="w-full mt-10 bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center space-x-2 shadow-xl">
              <span>Next: Allergies</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div className="bg-rose-100 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 -rotate-3 shadow-xl shadow-rose-50">
              <AlertCircle size={48} className="text-rose-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Safety First</h2>
            <p className="text-slate-500 font-bold mb-10">Any allergies we should flag in menus?</p>
            
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {['Peanuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish', 'Nuts'].map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAllergy(a)}
                  className={`px-6 py-3 rounded-full border-2 font-black text-xs uppercase tracking-widest transition-all ${
                    allergies.includes(a) ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <button onClick={getRecommendation} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center space-x-2 shadow-xl">
              <span>Generate AI Recommendation</span>
              <Sparkles size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center">
                <Loader2 size={64} className="text-orange-500 animate-spin mb-6" />
                <p className="font-black text-slate-900 text-xl">Consulting Gemini Chef...</p>
              </div>
            ) : (
              <>
                <div className="bg-emerald-100 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-3 shadow-xl shadow-emerald-50">
                  <Sparkles size={48} className="text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Our Best Match!</h2>
                <p className="text-slate-500 font-bold mb-10">Based on your preferences, we suggest:</p>
                
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white text-left mb-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 bg-orange-600 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">98% Fit</div>
                  <h3 className="text-2xl font-black mb-1">{MESSES.find(m => m.id === recMessId)?.name}</h3>
                  <p className="text-slate-400 font-bold text-sm">{MESSES.find(m => m.id === recMessId)?.location}</p>
                </div>

                <div className="space-y-4">
                  <button onClick={handleFinish} className="w-full bg-orange-600 text-white py-6 rounded-2xl font-black text-lg shadow-2xl shadow-orange-200">
                    Perfect, let's eat!
                  </button>
                  <button onClick={() => setStep(0)} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                    Re-edit preferences
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex space-x-2 mt-20">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all ${step === i ? 'w-8 bg-orange-600' : 'w-2 bg-slate-100'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
