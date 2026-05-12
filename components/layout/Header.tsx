'use client';

import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fermer le menu lors du changement de page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/resources', label: 'Ressource' },
  ];

  return (
    <header className="flex items-center justify-between px-6 lg:px-12 py-4 bg-white border-b border-[#E5E5E5] sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/assets/images/logo.png" 
            alt="(RE)Sources Relationnelles" 
            width={140} 
            height={140}
            className="object-contain w-32 lg:w-40"
          />
        </Link>
      </div>
      
      {/* DESKTOP NAV */}
      <nav className="hidden lg:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`relative text-grey hover:text-primary transition-colors font-medium pb-1 ${isActive ? 'text-primary' : ''}`}
            >
              {link.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-left-1 duration-300"></span>
              )}
            </Link>
          );
        })}
        
        {user ? (
          <>
            <Link 
              href="/dashboard" 
              className={`relative text-grey hover:text-primary transition-colors font-medium pb-1 ${pathname.startsWith('/dashboard') ? 'text-primary' : ''}`}
            >
              Tableau de bord
              {pathname.startsWith('/dashboard') && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-left-1 duration-300"></span>
              )}
            </Link>
            {user && ['Moderator', 'Admin', 'SuperAdmin'].includes(user.role?.name) && (
              <Link 
                href="/admin" 
                className={`text-primary hover:text-primary-dark transition-colors font-bold flex items-center gap-1 pb-1 relative`}
              >
                <span>🛡️</span> Administration
                {pathname.startsWith('/admin') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-left-1 duration-300"></span>
                )}
              </Link>
            )}
            <button 
              onClick={logout}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-widest cursor-pointer ml-4 shadow-md"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <Link 
            href="/login" 
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-widest ml-4 shadow-md"
          >
            Se connecter
          </Link>
        )}
      </nav>

      {/* MOBILE BURGER BUTTON */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden p-2 text-grey hover:text-primary transition-colors"
        aria-label="Menu"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          )}
        </svg>
      </button>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[73px] bg-white z-40 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col p-6 space-y-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-xl font-medium ${pathname === link.href ? 'text-primary' : 'text-grey'}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-[#E5E5E5] w-full"></div>
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-xl font-medium ${pathname.startsWith('/dashboard') ? 'text-primary' : 'text-grey'}`}
                >
                  Tableau de bord
                </Link>
                {user && ['Moderator', 'Admin', 'SuperAdmin'].includes(user.role?.name) && (
                  <Link 
                    href="/admin" 
                    className={`text-xl font-bold text-primary`}
                  >
                    Administration
                  </Link>
                )}
                <button 
                  onClick={logout}
                  className="bg-primary text-white w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="bg-primary text-white w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-center shadow-lg"
              >
                Se connecter
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
