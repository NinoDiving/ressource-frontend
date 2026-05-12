'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useState } from 'react';

// --- ICONS ---
const Icons = {
  Lock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Shield: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    firstname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register, isRegistering } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await register({
        name: `${formData.firstname} ${formData.name}`,
        mail: formData.email,
        password: formData.password,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de la création de l'accès");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-[560px]">
          {/* HEADER */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-semibold text-[#434343]">Création de compte</h1>
            <p className="text-sm text-[#717171] mt-2">Créez votre compte personnel pour accéder au catalogue et contribuer</p>
          </div>

          {/* FORM CARD */}
          <div className="bg-white rounded-md border border-[#E5E5E5] shadow-sm p-8 lg:p-12">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded text-xs font-medium mb-8">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-[#434343] uppercase tracking-wider mb-2">Nom</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
                      <Icons.User />
                    </div>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="NOM" 
                      required
                      className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-md pl-10 pr-4 py-2.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#434343] uppercase tracking-wider mb-2">Prénom</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
                      <Icons.User />
                    </div>
                    <input 
                      type="text" 
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="Prénom" 
                      required
                      className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-md pl-10 pr-4 py-2.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B] transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-[#434343] uppercase tracking-wider mb-2">Adresse électronique</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
                    <Icons.Mail />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemple@mail.com" 
                    required
                    className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-md pl-10 pr-4 py-2.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B] transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-[#434343] uppercase tracking-wider mb-2">Mot de passe</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
                      <Icons.Lock />
                    </div>
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••" 
                      required
                      className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-md pl-10 pr-4 py-2.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#434343] uppercase tracking-wider mb-2">Confirmation</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
                      <Icons.Lock />
                    </div>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••" 
                      required
                      className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-md pl-10 pr-4 py-2.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B] transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex flex-col items-center gap-6">
                <button 
                  type="submit" 
                  disabled={isRegistering}
                  className="w-full bg-[#3B3B2B] text-white py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-sm disabled:opacity-50"
                >
                  {isRegistering ? 'Enregistrement...' : "Créer l'accès"}
                </button>
                
                <Link href="/login" className="text-xs text-[#717171] hover:text-[#3B3B2B] hover:underline transition-colors">
                  Vous possédez déjà un compte ? <span className="font-bold text-[#3B3B2B]">Se connecter</span>
                </Link>
                
                <div className="relative w-full py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E5E5]"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase">
                    <span className="bg-white px-4 text-[#717171] tracking-widest">Ou</span>
                  </div>
                </div>
                
                <button 
                  type="button" 
                  className="w-full bg-white border border-[#000091] text-[#000091] py-3 rounded-md text-xs font-bold flex items-center justify-center gap-3 hover:bg-[#000091] hover:text-white transition-all group"
                >
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[8px] uppercase tracking-tighter opacity-70 group-hover:opacity-90">S'inscrire avec</span>
                    <span className="text-sm font-black tracking-tight">FranceConnect</span>
                  </div>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-12 text-center text-[10px] text-[#717171] font-medium uppercase tracking-widest leading-loose">
            <p>Conformément au RGPD, vos données sont sécurisées</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="/confidentialite" className="hover:text-[#434343]">Politique de confidentialité</Link>
              <Link href="/cgu" className="hover:text-[#434343]">Conditions Générales</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
