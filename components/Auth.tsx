
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { db } from '../services/db';
import { Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Essential fields are missing.');
      return;
    }

    const users = db.getUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (isLogin) {
      if (existingUser) {
        onAuthSuccess(existingUser);
      } else {
        const newUser: User = { id: Math.random().toString(36).substr(2, 9), email, role, favorites: [] };
        db.saveUser(newUser);
        onAuthSuccess(newUser);
      }
    } else {
      const newUser: User = { id: Math.random().toString(36).substr(2, 9), email, role, favorites: [] };
      db.saveUser(newUser);
      onAuthSuccess(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full animate-in zoom-in-95 duration-700 relative">
        {/* Abstract Background Shapes */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-200/50 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-100 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="bg-white rounded-[3.5rem] shadow-[0_30px_100px_rgba(249,115,22,0.1)] p-10 md:p-14 border border-orange-50 relative z-10">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-orange-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 rotate-6 shadow-2xl shadow-orange-300">
              <Sparkles size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">MESS<span className="text-orange-600">MATE</span></h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Campus Dining Redefined</p>
          </div>

          <div className="flex p-2 bg-slate-100 rounded-[2rem] mb-10 border-4 border-slate-100">
            <button 
              onClick={() => setRole(UserRole.STUDENT)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-[1.5rem] transition-all duration-300 text-sm font-black uppercase tracking-widest ${
                role === UserRole.STUDENT ? 'bg-white text-orange-600 shadow-xl' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserIcon size={18} />
              <span>Student</span>
            </button>
            <button 
              onClick={() => setRole(UserRole.ADMIN)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-[1.5rem] transition-all duration-300 text-sm font-black uppercase tracking-widest ${
                role === UserRole.ADMIN ? 'bg-white text-orange-600 shadow-xl' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={18} />
              <span>Partner</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email ID</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="campus-id@college.edu"
                  className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-orange-50 focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Access Code</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-orange-50 focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-rose-500 text-xs font-black bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
                <AlertCircle size={14} />
                <p>{error}</p>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-6 rounded-[2rem] transition-all duration-500 shadow-2xl shadow-orange-200 flex items-center justify-center space-x-3 text-lg group active:scale-95"
            >
              <span>{isLogin ? 'Sign In' : 'Join Network'}</span>
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>

          <div className="mt-12 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-orange-600 transition-colors py-2"
            >
              {isLogin ? "Create an account" : "Back to Sign In"}
            </button>
          </div>
        </div>
        
        <p className="text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] mt-10">
          SECURE CAMPUS ACCESS &bull; 2024
        </p>
      </div>
    </div>
  );
};

const AlertCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default Auth;
