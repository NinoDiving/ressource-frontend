'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function Footer() {
  const { user, logout } = useAuth();

  return (
    <footer className="bg-white border-t border-[#E5E5E5] px-6 lg:px-12 pt-16 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image 
                src="/assets/images/logo.png" 
                alt="(Re)ssource" 
                width={120} 
                height={40} 
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-[#717171] text-sm leading-relaxed max-w-xs">
              Portail officiel de mutualisation des ressources et des connaissances au service des acteurs du système de santé.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold text-[#434343] uppercase tracking-[0.2em] mb-6">Navigation</h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/" className="text-[#717171] hover:text-[#3B3B2B] transition-colors">Accueil</Link>
              <Link href="/resources" className="text-[#717171] hover:text-[#3B3B2B] transition-colors">Catalogue des ressources</Link>
              <Link href="/dashboard" className="text-[#717171] hover:text-[#3B3B2B] transition-colors">Espace personnel</Link>
              <Link href="/profile" className="text-[#717171] hover:text-[#3B3B2B] transition-colors">Mon profil</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#434343] uppercase tracking-[0.2em] mb-6">Support & Contact</h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/faq" className="text-[#717171] hover:text-[#3B3B2B] transition-colors">Centre d'aide</Link>
              <Link href="/contact" className="text-[#717171] hover:text-[#3B3B2B] transition-colors">Nous contacter</Link>
              <Link href="/bug-report" className="text-[#717171] hover:text-[#3B3B2B] transition-colors">Signaler un problème</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#434343] uppercase tracking-[0.2em] mb-6">Espace Utilisateur</h4>
            <div className="flex flex-col items-start gap-4">
              {user ? (
                <button 
                  onClick={logout}
                  className="bg-primary text-white px-6 py-2 rounded-md text-xs font-semibold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-sm cursor-pointer"
                >
                  Se déconnecter
                </button>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-primary text-white px-6 py-2 rounded-md text-xs font-semibold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-sm"
                >
                  Se connecter
                </Link>
              )}
              <p className="text-[10px] text-[#717171] italic">{user ? `Connecté en tant que ${user.name}` : 'Accès sécurisé pour tous'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-[#E5E5E5] gap-10">
          <div className="flex gap-10 grayscale opacity-70">
            <div className="text-[10px] font-bold border-l-2 border-[#434343] pl-3 py-1 text-[#434343] uppercase tracking-tighter leading-tight">
              Ministère<br/>de la Santé<br/>et de la Prévention
            </div>
            <div className="text-[10px] font-bold border-l-2 border-[#434343] pl-3 py-1 text-[#434343] uppercase tracking-tighter leading-tight">
              Liberté<br/>Égalité<br/>Fraternité
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] text-[#717171] font-bold uppercase tracking-widest">
            <Link href="/mentions-legales" className="hover:text-[#434343] transition-colors">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-[#434343] transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-[#434343] transition-colors">Confidentialité</Link>
            <span>© 2026 - (Re)ssource</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
