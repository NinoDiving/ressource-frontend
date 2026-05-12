'use client';

import { addMessageToConversation, fetchConversationById, fetchMyConversations } from '@/api/conversations';
import { fetchMyResources } from '@/api/resources';
import { fetchMyFavorites } from '@/api/users';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/layout/Header';
import ResourceCard from '@/components/resources/ResourceCard';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Tab = 'resources' | 'progression' | 'discussion' | 'favorites';

// --- ICONS (UI/UX Clean Overhaul) ---
const Icons = {
  FileText: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  TrendingUp: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Users: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Heart: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Plus: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Search: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  ChevronLeft: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  Message: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Send: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('resources');

  const tabs = [
    { id: 'resources', label: 'Mes ressources', icon: <Icons.FileText /> },
    { id: 'progression', label: 'Progression', icon: <Icons.TrendingUp /> },
    { id: 'discussion', label: 'Groupes de discussion', icon: <Icons.Users /> },
    { id: 'favorites', label: 'Mes Favoris', icon: <Icons.Heart /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'resources':
        return <ResourcesView />;
      case 'discussion':
        return <DiscussionView />;
      case 'favorites':
        return <FavoritesView />;
      default:
        return (
          <div className="py-20 text-center text-[#717171] border border-dashed border-[#E5E5E5] rounded-md text-sm">
            Fonctionnalité en cours de déploiement.
          </div>
        );
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[#F5F5F5] font-sans">
        <Header />

        <main className="flex-1 flex pt-[88px]">
          {/* SIDEBAR */}
          <aside className="w-72 fixed left-0 top-[88px] bottom-0 bg-white border-r border-[#E5E5E5] flex flex-col py-8 shadow-[1px_0_4px_rgba(0,0,0,0.02)] z-10 overflow-y-auto">
            <div className="px-8 mb-8">
              <h2 className="text-[11px] font-bold text-[#717171] uppercase tracking-[0.15em]">Espace Personnel</h2>
              <p className="text-xs text-[#717171]/70 mt-1">Plateforme (Re)ssources</p>
            </div>
            
            <nav className="flex-1 px-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-[#F5F5F5] text-[#3B3B2B]' 
                      : 'text-[#717171] hover:bg-[#F5F5F5]/50 hover:text-[#434343]'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-[#3B3B2B]' : 'text-[#717171]'}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* CONTENT AREA */}
          <section className="flex-1 p-8 ml-72">
            <div className="max-w-6xl mx-auto">
              <header className="mb-6 bg-white border border-[#E5E5E5] p-6 rounded-lg flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-[#434343]">
                    Bienvenue, {user?.name || 'Utilisateur'}
                  </h1>
                  <p className="text-sm text-[#717171] mt-1">Consultez et gérez vos données personnelles</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#717171]">
                  <Icons.Users />
                </div>
              </header>

              <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] overflow-hidden min-h-[600px]">
                {renderContent()}
              </div>
            </div>
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}

// --- SUB-VIEWS ---

function ResourcesView() {
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['my-resources'],
    queryFn: fetchMyResources,
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8 border-b border-[#E5E5E5] pb-6">
        <div>
          <h3 className="text-lg font-medium text-[#434343]">Mes ressources</h3>
          <p className="text-xs text-[#717171] mt-1">Consultez et modifiez les contenus que vous avez publiés</p>
        </div>
        <Link href="/dashboard/create-resource">
          <button className="inline-flex items-center gap-1.5 bg-[#3B3B2B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors">
            <Icons.Plus /> Nouveau dossier
          </button>
        </Link>
      </div>

      <div className="flex gap-4 mb-8">
        <select className="bg-white border border-[#E5E5E5] rounded-md px-3 py-1.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B]">
          <option>Toutes les catégories</option>
        </select>
        <select className="bg-white border border-[#E5E5E5] rounded-md px-3 py-1.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B]">
          <option>Tous les types</option>
        </select>
        <select className="bg-white border border-[#E5E5E5] rounded-md px-3 py-1.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B]">
          <option>Tri par date de parution</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[#717171] text-sm">Chargement du registre...</div>
      ) : resources.length === 0 ? (
        <div className="py-16 text-center text-[#717171] border border-dashed border-[#E5E5E5] rounded-md text-sm">
          Vous n'avez pas encore initié de ressources.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {resources.map((resource: any) => (
            <ResourceCard key={resource.id} resource={resource} isDashboardView={true} />
          ))}
        </div>
      )}

      {resources.length > 0 && (
        <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-4 mt-8">
          <span className="text-xs text-[#717171] font-medium">Page 1 sur 1</span>
          <div className="flex gap-2">
            <button className="p-1 text-[#717171] hover:text-[#3B3B2B] transition-colors"><Icons.ChevronLeft /></button>
            <button className="p-1 text-[#717171] hover:text-[#3B3B2B] transition-colors"><Icons.ChevronRight /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function DiscussionView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['my-conversations'],
    queryFn: fetchMyConversations,
  });

  // RÉCUPÉRATION DE L'HISTORIQUE COMPLET
  const { data: activeConv, isLoading: isConvLoading } = useQuery({
    queryKey: ['conversation', selectedConvId],
    queryFn: () => fetchConversationById(selectedConvId!),
    enabled: !!selectedConvId
  });

  const messageMutation = useMutation({
    mutationFn: (text: string) => addMessageToConversation(selectedConvId!, text),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['my-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConvId] });
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  if (isLoading) return <div className="p-12 text-center text-sm text-[#717171]">Chargement des discussions...</div>;

  if (conversations.length === 0) return (
    <div className="p-16 text-center text-[#717171] border border-dashed border-[#E5E5E5] rounded-md m-6 text-sm">
      Aucun groupe de discussion actif pour le moment.
    </div>
  );

  return (
    <div className="flex h-[600px]">
      {/* SIDEBAR LIST */}
      <div className="w-80 border-r border-[#E5E5E5] flex flex-col">
        <div className="p-4 border-b border-[#E5E5E5]">
          <h3 className="text-sm font-bold text-[#434343] uppercase tracking-wider">Discussions</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv: any) => (
            <button 
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className={`w-full text-left p-4 border-b border-[#E5E5E5] transition-colors hover:bg-[#F5F5F5] ${selectedConvId === conv.id ? 'bg-[#F5F5F5] border-l-4 border-l-[#3B3B2B]' : ''}`}
            >
              <h4 className="font-semibold text-sm text-[#434343] truncate">{conv.title || 'Discussion de groupe'}</h4>
              <p className="text-[10px] text-[#717171] mt-1 truncate">
                {conv.messages?.[0] ? `${conv.messages[0].sender.name}: ${conv.messages[0].text}` : 'Aucun message'}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {conv.participants.slice(0, 3).map((p: any) => (
                    <div key={p.id} className="inline-flex h-5 w-5 rounded-full ring-2 ring-white bg-[#E5E5E5] items-center justify-center text-[8px] font-bold text-[#717171]">
                      {p.name.charAt(0)}
                    </div>
                  ))}
                </div>
                {conv.participants.length > 3 && <span className="text-[10px] text-[#717171] ml-2">+{conv.participants.length - 3}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#F9F9F9]">
        {isConvLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-[#717171]">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mr-3"></div>
            Chargement de l'historique...
          </div>
        ) : activeConv ? (
          <>
            <div className="p-4 bg-white border-b border-[#E5E5E5] flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-semibold text-[#434343]">{activeConv.title}</h3>
                <p className="text-[10px] text-[#717171]">{activeConv.participants.length} participants</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeConv.messages?.length === 0 && (
                <div className="text-center py-20 text-[#717171] text-xs italic">Commencez la discussion...</div>
              )}
              {activeConv.messages?.map((msg: any) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-[#3B3B2B] text-white' : 'bg-white border border-[#E5E5E5] text-[#434343]'}`}>
                      {!isMe && <p className="text-[9px] font-bold mb-1 text-[#717171] uppercase tracking-tighter">{msg.sender.name}</p>}
                      <p>{msg.text}</p>
                      <p className={`text-[8px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-[#717171]'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-[#E5E5E5]">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && messageMutation.mutate(messageText)}
                  placeholder="Écrire votre message..."
                  className="flex-1 bg-[#F5F5F5] border border-[#E5E5E5] rounded-md px-4 py-2 text-sm outline-none focus:border-[#3B3B2B]"
                />
                <button 
                  onClick={() => messageMutation.mutate(messageText)}
                  disabled={!messageText.trim() || messageMutation.isPending}
                  className="bg-[#3B3B2B] text-white p-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <Icons.Send />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#717171]">
            <div className="w-16 h-16 bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center mb-4">
              <Icons.Message />
            </div>
            <p className="text-sm font-medium">Sélectionnez une discussion pour commencer à échanger</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FavoritesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['my-favorites'],
    queryFn: fetchMyFavorites,
  });

  const filteredFavorites = favorites.filter((f: any) => 
    f.resource?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.resource?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8 border-b border-[#E5E5E5] pb-6">
        <div>
          <h3 className="text-lg font-medium text-[#434343]">Mes favoris</h3>
          <p className="text-xs text-[#717171] mt-1">Retrouvez les dossiers et contenus que vous avez sauvegardés</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
            <Icons.Search />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher dans mes favoris..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-[#E5E5E5] rounded-md text-sm outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B]"
          />
        </div>
        <select className="bg-white border border-[#E5E5E5] rounded-md px-3 py-1.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B]">
          <option>Toutes les catégories</option>
        </select>
        <select className="bg-white border border-[#E5E5E5] rounded-md px-3 py-1.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B]">
          <option>Tous les types</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[#717171] text-sm">Chargement des données...</div>
      ) : filteredFavorites.length === 0 ? (
        <div className="py-16 text-center text-[#717171] border border-dashed border-[#E5E5E5] rounded-md text-sm">
          {searchTerm ? 'Aucune ressource ne correspond à votre recherche.' : "Vous n'avez épinglé aucune ressource."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredFavorites.map((fav: any) => (
            <ResourceCard key={fav.id} resource={fav.resource} isFavorite={true} />
          ))}
        </div>
      )}

      {filteredFavorites.length > 0 && (
        <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-4 mt-8">
          <span className="text-xs text-[#717171] font-medium">Page 1 sur 1</span>
          <div className="flex gap-2">
            <button className="p-1 text-[#717171] hover:text-[#3B3B2B] transition-colors"><Icons.ChevronLeft /></button>
            <button className="p-1 text-[#717171] hover:text-[#3B3B2B] transition-colors"><Icons.ChevronRight /></button>
          </div>
        </div>
      )}
    </div>
  );
}
