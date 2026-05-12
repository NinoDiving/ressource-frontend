'use client';

import { fetchResources } from '@/api/resources';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import ResourceCard from '@/components/resources/ResourceCard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

// --- ICONS (Refined for Modern UI) ---
const Icons = {
  ArrowRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Shield: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Search: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
};

export default function HomePage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  const { data, isLoading } = useQuery({
    queryKey: ['resources', 'popular'],
    queryFn: () => fetchResources({ take: 4 }),
  });

  const resources = data?.resources || [];

  const faqs = [
    { id: 1, q: "Qu'est-ce que la plateforme (Re)ssource ?", a: "C'est un portail collaboratif dédié au partage de connaissances et de documents officiels. Il permet aux agents et aux partenaires de consulter un catalogue vérifié de ressources pédagogiques, d'articles et de guides pratiques." },
    { id: 2, q: "Comment les contenus sont-ils vérifiés ?", a: "Chaque ressource publiée sur la plateforme passe par un circuit de modération rigoureux. Les experts du Ministère s'assurent de la conformité, de la pertinence et de la qualité des informations avant toute validation publique." },
    { id: 3, q: "Qui peut contribuer au catalogue ?", a: "Tout utilisateur disposant d'un compte certifié peut proposer des ressources. La plateforme encourage le partage d'expérience et la mutualisation des savoirs entre professionnels du secteur." },
    { id: 4, q: "Les ressources sont-elles téléchargeables ?", a: "Oui, la majorité des ressources sont disponibles sous différents formats (PDF, Vidéo, Article) et peuvent être consultées hors ligne ou enregistrées dans vos favoris personnels." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] font-sans selection:bg-primary/20">
      <Header />

      <main className="flex-1">
        
        {/* SECTION 1: MINISTERIAL HERO (Clean Split) */}
        <section className="relative pt-40 pb-32 px-6 bg-[#3B3B2B] overflow-hidden">
          {/* Decorative Circles (from CTA section) */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20"></div>
          
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            {/* Centered Content */}
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-6xl lg:text-8xl font-bold text-white leading-[1.1] mb-8 tracking-tighter">
                Le savoir <span className="text-emerald-400">mutualisé</span> <br /> au service de tous.
              </h1>
              <p className="text-lg text-white/60 mb-12 leading-relaxed max-w-lg mx-auto">
                Portail officiel de partage de connaissances certifiées pour les acteurs de la santé et les citoyens.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/resources" 
                  className="bg-white text-primary px-8 py-4 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-[#F5F5F5] transition-all shadow-xl"
                >
                  Consulter le catalogue
                </Link>
                {!user && (
                  <Link 
                    href="/register" 
                    className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-sm"
                  >
                    Créer un compte
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: STATS TICKER (KEEP AS REQUESTED) */}
        <section className="bg-white border-y border-[#E5E5E5] overflow-hidden py-12 relative">
          <div className="inline-flex animate-marquee whitespace-nowrap">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-32 items-center px-16">
                <div className="flex flex-col items-center">
                  <p className="text-5xl font-bold text-primary mb-1">12</p>
                  <p className="text-[10px] text-text-light uppercase font-bold tracking-[0.25em]">Thématiques clés</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-5xl font-bold text-primary mb-1">3 450</p>
                  <p className="text-[10px] text-text-light uppercase font-bold tracking-[0.25em]">Dossiers indexés</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-5xl font-bold text-primary mb-1">42k</p>
                  <p className="text-[10px] text-text-light uppercase font-bold tracking-[0.25em]">Utilisateurs actifs</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-5xl font-bold text-primary mb-1">100%</p>
                  <p className="text-[10px] text-text-light uppercase font-bold tracking-[0.25em]">Vérifié par l'état</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: MISSION WITH IMAGE */}
        <section className="py-32 px-6 bg-[#F5F5F5]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <h2 className="text-4xl font-semibold text-grey mb-10 leading-tight">
                    Une mission de service public au cœur du <span className="text-primary underline decoration-primary/20 underline-offset-8">partage digital</span>.
                  </h2>
                  <div className="space-y-8">
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                        <Icons.Shield />
                      </div>
                      <div>
                        <h4 className="font-bold text-grey uppercase text-xs tracking-widest mb-2">Fiabilité Absolue</h4>
                        <p className="text-text-light text-sm leading-relaxed">
                          Chaque ressource publiée est soumise à une double validation par des experts métiers pour garantir l'exactitude des informations.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-white text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <Icons.Users />
                      </div>
                      <div>
                        <h4 className="font-bold text-grey uppercase text-xs tracking-widest mb-2">Intelligence Collective</h4>
                        <p className="text-text-light text-sm leading-relaxed">
                          La plateforme favorise l'échange direct entre les citoyens et les professionnels pour construire une base de savoir vivante.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-4/5 rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                  <img 
                    src="/healthcare_collaboration_hero_1778598054849.png" 
                    alt="Collaboration Santé" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-primary p-8 rounded-xl text-white shadow-xl max-w-[200px] hidden md:block">
                  <p className="text-3xl font-bold mb-1">24/7</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Accès continu aux ressources</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FEATURED RESOURCES */}
        <section className="py-32 px-6 bg-white border-y border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <h2 className="text-4xl font-semibold text-grey mb-4">Dernières publications</h2>
                <div className="h-1.5 w-24 bg-primary rounded-full"></div>
              </div>
              <Link 
                href="/resources" 
                className="group flex items-center gap-3 text-sm font-bold text-primary uppercase tracking-widest hover:underline"
              >
                Tout le catalogue
                <div className="group-hover:translate-x-1 transition-transform">
                   <Icons.ArrowRight />
                </div>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="py-32 text-center">
                <div className="inline-block w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {resources.slice(0, 4).map((resource: any) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 5: FAQ & ACCORDION */}
        <section className="py-32 px-6 bg-[#F5F5F5]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-semibold text-grey mb-6 tracking-tight">Questions fréquentes</h2>
              <p className="text-text-light">Tout ce qu'il faut savoir sur l'utilisation de la plateforme.</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden transition-all hover:shadow-md">
                  <button 
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full p-6 flex justify-between items-center text-left group"
                  >
                    <span className="font-bold text-grey text-sm uppercase tracking-wide group-hover:text-primary transition-colors">{faq.q}</span>
                    <span className={`${openFaq === faq.id ? 'rotate-180' : ''} transition-transform text-primary`}>
                      <Icons.ChevronDown />
                    </span>
                  </button>
                  <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === faq.id ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-text-light text-sm leading-relaxed border-t border-[#F5F5F5] pt-6">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: PREMIUM CTA */}
        <section className="py-32 px-6 bg-white">
          <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-6xl font-semibold mb-8 leading-tight">
                Engagez-vous pour une <br className="hidden md:block" /> santé mieux partagée.
              </h2>
              <p className="text-white/70 text-lg mb-14 max-w-xl mx-auto">
                Rejoignez le premier réseau citoyen de documentation en santé publique et contribuez au savoir collectif.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link 
                  href="/register" 
                  className="bg-white text-primary px-12 py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#F5F5F5] transition-all shadow-xl"
                >
                  Créer mon compte
                </Link>
                <Link 
                  href="/contact" 
                  className="text-white font-bold text-sm uppercase tracking-widest border-b-2 border-white/20 hover:border-white transition-all pb-1"
                >
                  Contactez-nous
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
