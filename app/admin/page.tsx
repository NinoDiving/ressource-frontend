'use client';

import { addCategory, deleteCategory, fetchCategories } from '@/api/categories';
import { deleteComment, fetchAllComments, updateCommentState } from '@/api/comments';
import { fetchPendingResources, updateResourceState, validateResource, fetchResources, deleteResource } from '@/api/resources';
import { createAdminAccount, fetchUsers, updateUserRole, updateUserState } from '@/api/users';
import AuthGuard from '@/components/auth/AuthGuard';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';

type AdminTab = 'moderation' | 'resources' | 'comments' | 'users' | 'categories' | 'superadmin';

// --- ICONS (UI/UX Clean Overhaul) ---
const Icons = {
  Shield: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  MessageSquare: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>,
  Book: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Users: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Folder: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Settings: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Alert: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Search: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  UserCircle: () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  File: () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  Check: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  Ban: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  Trash: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  ArrowUp: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" /></svg>,
  Plus: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
};

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('moderation');

  const roleName = user?.role?.name || 'User';
  const isModo = ['Moderator', 'Admin', 'SuperAdmin'].includes(roleName);
  const isAdmin = ['Admin', 'SuperAdmin'].includes(roleName);
  const isSuperAdmin = roleName === 'SuperAdmin';

  if (!isModo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-12">
        <div className="bg-white p-12 rounded-lg shadow-sm border border-[#E5E5E5] text-center max-w-md">
          <div className="mx-auto w-12 h-12 text-red-500 mb-6 flex justify-center items-center rounded-full bg-red-50"><Icons.Ban /></div>
          <h2 className="text-xl font-semibold text-[#434343] mb-2">Accès restreint</h2>
          <p className="text-[#717171] mb-8 text-sm leading-relaxed">
            Vous ne disposez pas des habilitations nécessaires pour accéder à l'interface d'administration du Ministère.
          </p>
          <a href="/" className="inline-flex items-center justify-center bg-[#3B3B2B] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#2b2b1b] transition-colors">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'moderation', label: 'Modération', icon: <Icons.Shield />, show: isModo },
    { id: 'comments', label: 'Commentaires', icon: <Icons.MessageSquare />, show: isModo },
    { id: 'resources', label: 'Ressources', icon: <Icons.Book />, show: isAdmin },
    { id: 'users', label: 'Utilisateurs', icon: <Icons.Users />, show: isAdmin },
    { id: 'categories', label: 'Catégories', icon: <Icons.Folder />, show: isAdmin },
    { id: 'superadmin', label: 'Système', icon: <Icons.Settings />, show: isSuperAdmin },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[#F5F5F5] font-sans">
        <Header />
        
        <main className="flex-1 flex pt-[88px]"> {/* Adjust padding based on Header height */}
          {/* SIDEBAR */}
          <aside className="w-72 fixed left-0 top-[88px] bottom-0 bg-white border-r border-[#E5E5E5] flex flex-col py-8 shadow-[1px_0_4px_rgba(0,0,0,0.02)] z-10 overflow-y-auto">
            <div className="px-8 mb-8">
              <h2 className="text-[11px] font-bold text-[#717171] uppercase tracking-[0.15em]">Espace Administration</h2>
              <p className="text-xs text-[#717171]/70 mt-1">Ministère de la Santé</p>
            </div>
            
            <nav className="flex-1 px-4 space-y-1">
              {menuItems.filter(item => item.show).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-[#F5F5F5] text-[#3B3B2B]' 
                      : 'text-[#717171] hover:bg-[#F5F5F5]/50 hover:text-[#434343]'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-[#3B3B2B]' : 'text-[#717171]'}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* CONTENT AREA */}
          <section className="flex-1 p-8 ml-72">
            <div className="max-w-6xl mx-auto">
              <header className="mb-6">
                <h1 className="text-2xl font-semibold text-[#434343]">
                  {menuItems.find(i => i.id === activeTab)?.label}
                </h1>
              </header>

              <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] overflow-hidden">
                {activeTab === 'moderation' && <ModerationView />}
                {activeTab === 'resources' && <ResourcesManagementView />}
                {activeTab === 'users' && <UsersView />}
                {activeTab === 'categories' && <CategoriesView />}
                {activeTab === 'comments' && <CommentsView />}
                {activeTab === 'superadmin' && <SuperAdminView />}
              </div>
            </div>
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}

// --- SUB-VIEWS ---

function ResourcesManagementView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmData, setConfirmData] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-resources'],
    queryFn: () => fetchResources({ take: 100 }) // Limite raisonnable pour l'admin
  });

  const resources = data?.resources || [];

  const stateMutation = useMutation({
    mutationFn: ({ id, state }: { id: number, state: string }) => updateResourceState(id, state as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-all-resources'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteResource(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-all-resources'] })
  });

  if (isLoading) return <div className="p-12 text-center text-[#717171] text-sm">Chargement du référentiel...</div>;

  const filtered = resources.filter((r: any) => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-[#E5E5E5] bg-white flex justify-between items-center">
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
            <Icons.Search />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher une ressource..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-md text-sm outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B] transition-shadow"
          />
        </div>
        <span className="text-xs font-medium text-[#717171] bg-[#F5F5F5] px-3 py-1 rounded-full">{filtered.length} résultats</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#F5F5F5] text-[#717171]">
            <tr>
              <th className="px-6 py-3 font-medium">Titre</th>
              <th className="px-6 py-3 font-medium">Auteur</th>
              <th className="px-6 py-3 font-medium">Statut</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {filtered.map((resource: any) => (
              <tr key={resource.id} className="hover:bg-[#F5F5F5]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F5F5F5] rounded flex items-center justify-center text-[#717171] shrink-0 border border-[#E5E5E5] overflow-hidden">
                      {resource.imageUrl ? <img src={resource.imageUrl} className="w-full h-full object-cover" /> : <Icons.File />}
                    </div>
                    <div>
                      <p className="font-medium text-[#434343]">{resource.title}</p>
                      <p className="text-xs text-[#717171] mt-0.5">{resource.category?.name} • {resource.type?.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#717171]">{resource.user?.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${resource.isDrafted ? 'bg-[#F5F5F5] text-[#717171] border border-[#E5E5E5]' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {resource.isDrafted ? 'Brouillon' : 'Publié'}
                    </span>
                    {resource.isSuspended && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        Suspendu
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => stateMutation.mutate({ id: resource.id, state: resource.isSuspended ? 'Publish' : 'Draft' })}
                      className="p-1.5 text-[#717171] hover:text-[#3B3B2B] hover:bg-[#F5F5F5] rounded transition-colors"
                      title={resource.isSuspended ? 'Réactiver' : 'Suspendre'}
                    >
                      {resource.isSuspended ? <Icons.Check /> : <Icons.Ban />}
                    </button>
                    <button 
                      onClick={() => setConfirmData({ isOpen: true, id: resource.id })}
                      className="p-1.5 text-[#717171] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[#717171] italic text-sm">
                  Aucune donnée disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ isOpen: false, id: null })}
        onConfirm={() => confirmData.id && deleteMutation.mutate(confirmData.id)}
        title="Supprimer la ressource"
        message="Êtes-vous certain de vouloir supprimer définitivement cette ressource ? Cette action est irréversible."
        confirmLabel="Supprimer"
      />
    </div>
  );
}

function CommentsView() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [confirmData, setConfirmData] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: fetchAllComments
  });

  const stateMutation = useMutation({
    mutationFn: ({ id, isSuspended }: { id: number, isSuspended: boolean }) => updateCommentState(id, isSuspended),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
  });

  const userStateMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => updateUserState(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
  });

  if (isLoading) return <div className="p-12 text-center text-[#717171] text-sm">Chargement des registres...</div>;

  const groupedComments = comments.reduce((acc: any, comment: any) => {
    const resId = comment.resourceId;
    if (!acc[resId]) {
      acc[resId] = { title: comment.resource.title, comments: [] };
    }
    acc[resId].comments.push(comment);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-8">
      {Object.keys(groupedComments).length === 0 ? (
        <div className="py-12 text-center text-[#717171] border border-dashed border-[#E5E5E5] rounded-md text-sm">
          Aucun signalement ou commentaire.
        </div>
      ) : (
        Object.entries(groupedComments).map(([resId, data]: [string, any]) => (
          <div key={resId} className="border border-[#E5E5E5] rounded-md bg-white overflow-hidden">
            <div className="bg-[#F5F5F5] px-4 py-3 border-b border-[#E5E5E5] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Icons.File />
                <Link href={`/resources/${resId}`} className="font-medium text-[#434343] hover:underline text-sm">
                  {data.title}
                </Link>
              </div>
              <span className="text-xs font-medium text-[#717171] bg-white border border-[#E5E5E5] px-2 py-0.5 rounded">
                {data.comments.length}
              </span>
            </div>
            
            <div className="divide-y divide-[#E5E5E5]">
              {data.comments.map((comment: any) => (
                <div key={comment.id} className={`p-4 transition-colors ${comment.isSuspended ? 'bg-[#F5F5F5] opacity-75' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-[#717171]"><Icons.UserCircle /></div>
                      <div>
                        <p className="text-sm font-medium text-[#434343] flex items-center gap-2">
                          {comment.user.name}
                          {!comment.user.isActive && <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-wide">Bloqué</span>}
                        </p>
                        <p className="text-xs text-[#717171]">{comment.user.mail}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => userStateMutation.mutate({ id: comment.user.id, isActive: !comment.user.isActive })}
                        className={`p-1.5 rounded transition-colors ${comment.user.isActive ? 'text-[#717171] hover:text-red-600 hover:bg-red-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                        title={comment.user.isActive ? 'Bloquer l\'auteur' : 'Débloquer l\'auteur'}
                      >
                        {comment.user.isActive ? <Icons.Ban /> : <Icons.Check />}
                      </button>
                      
                      <button 
                        onClick={() => stateMutation.mutate({ id: comment.id, isSuspended: !comment.isSuspended })}
                        className={`p-1.5 rounded transition-colors ${comment.isSuspended ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-[#717171] hover:text-[#3B3B2B] hover:bg-[#F5F5F5]'}`}
                        title={comment.isSuspended ? 'Rétablir le contenu' : 'Masquer le contenu'}
                      >
                        {comment.isSuspended ? <Icons.Check /> : <Icons.Shield />}
                      </button>
                      
                      <button 
                        onClick={() => setConfirmData({ isOpen: true, id: comment.id })}
                        className="p-1.5 text-[#717171] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#434343] mt-3 pl-9 leading-relaxed">{comment.content}</p>
                  <div className="mt-2 pl-9 text-[11px] text-[#717171]">
                    {new Date(comment.insertionTime).toLocaleString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <ConfirmModal 
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ isOpen: false, id: null })}
        onConfirm={() => confirmData.id && deleteMutation.mutate(confirmData.id)}
        title="Supprimer le commentaire"
        message="Voulez-vous vraiment supprimer ce message ? Cette action est définitive."
        confirmLabel="Supprimer"
      />
    </div>
  );
}

function ModerationView() {
  const queryClient = useQueryClient();
  const { data: pending = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-pending'],
    queryFn: fetchPendingResources
  });

  const validateMutation = useMutation({
    mutationFn: (id: number) => validateResource(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pending'] })
  });

  const refuseMutation = useMutation({
    mutationFn: (id: number) => updateResourceState(id, 'Draft'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pending'] })
  });

  if (isLoading) return <div className="p-12 text-center text-[#717171] text-sm">Chargement des dossiers en attente...</div>;

  if (isError) return (
    <div className="p-6 m-6 text-sm text-red-700 bg-red-50 rounded-md border border-red-200 flex items-center gap-3">
      <Icons.Alert /> Erreur système : {(error as any).response?.data?.message || error.message}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-[#E5E5E5] bg-white flex justify-between items-center">
        <h3 className="text-lg font-medium text-[#434343]">Dossiers en attente de validation</h3>
        <span className="text-xs font-medium text-[#3B3B2B] bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-1 rounded-full">{pending.length} dossier(s)</span>
      </div>
      
      {pending.length === 0 ? (
        <div className="p-12 text-center text-[#717171] italic text-sm">
          Aucun dossier nécessitant votre attention.
        </div>
      ) : (
        <div className="divide-y divide-[#E5E5E5]">
          {pending.map((resource: any) => (
            <div key={resource.id} className="p-6 flex gap-6 hover:bg-[#F5F5F5]/30 transition-colors">
              <div className="w-20 h-20 bg-[#F5F5F5] border border-[#E5E5E5] rounded flex items-center justify-center shrink-0 overflow-hidden text-[#717171]">
                {resource.imageUrl ? <img src={resource.imageUrl} className="w-full h-full object-cover" /> : <Icons.File />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-[#434343] text-base mb-1">{resource.title}</h4>
                    <p className="text-sm text-[#717171]">Créateur: <span className="font-medium text-[#434343]">{resource.user?.name}</span></p>
                    <p className="text-xs text-[#717171] mt-1">Nomenclature: {resource.category?.name} - {resource.type?.name}</p>
                  </div>
                  <span className="text-[11px] text-[#717171]">
                    Dépôt le {new Date(resource.insertionTime).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => validateMutation.mutate(resource.id)}
                    disabled={validateMutation.isPending}
                    className="inline-flex items-center gap-1.5 text-xs bg-[#3B3B2B] text-white px-4 py-2 rounded font-medium hover:bg-[#2b2b1b] transition-colors disabled:opacity-50"
                  >
                    <Icons.Check /> Approuver
                  </button>
                  <button 
                    onClick={() => refuseMutation.mutate(resource.id)}
                    disabled={refuseMutation.isPending}
                    className="inline-flex items-center gap-1.5 text-xs bg-white text-[#434343] border border-[#E5E5E5] px-4 py-2 rounded font-medium hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
                  >
                    <Icons.Ban /> Rejeter
                  </button>
                  <Link 
                    href={`/resources/${resource.id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#717171] px-4 py-2 hover:text-[#3B3B2B] transition-colors ml-auto"
                  >
                    Examiner le dossier
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers
  });

  const stateMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => updateUserState(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number, role: string }) => updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  });

  if (isLoading) return <div className="p-12 text-center text-[#717171] text-sm">Chargement du registre du personnel...</div>;

  if (isError) return (
    <div className="p-6 m-6 text-sm text-red-700 bg-red-50 rounded-md border border-red-200 flex items-center gap-3">
      <Icons.Alert /> Erreur système : {(error as any).response?.data?.message || error.message}
    </div>
  );

  const filtered = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.mail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-[#E5E5E5] bg-white flex justify-between items-center">
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
            <Icons.Search />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher un identifiant..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-md text-sm outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B] transition-shadow"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#F5F5F5] text-[#717171]">
            <tr>
              <th className="px-6 py-3 font-medium">Identité</th>
              <th className="px-6 py-3 font-medium">Habilitation</th>
              <th className="px-6 py-3 font-medium">Statut</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {filtered.map((u: any) => (
              <tr key={u.id} className="hover:bg-[#F5F5F5]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="text-[#717171]"><Icons.UserCircle /></div>
                    <div>
                      <p className="font-medium text-[#434343]">{u.name}</p>
                      <p className="text-xs text-[#717171] font-mono mt-0.5">{u.mail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                    u.role?.name === 'SuperAdmin' ? 'bg-red-50 text-red-700 border-red-200' :
                    u.role?.name === 'Admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    u.role?.name === 'Moderator' ? 'bg-sky-50 text-sky-700 border-sky-200' : 
                    'bg-[#F5F5F5] text-[#717171] border-[#E5E5E5]'
                  }`}>
                    {u.role?.name === 'User' ? 'Standard' : u.role?.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-[#717171]">{u.isActive ? 'Autorisé' : 'Révoqué'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.role?.name === 'User' && (
                      <button 
                        onClick={() => roleMutation.mutate({ id: u.id, role: 'Moderator' })}
                        className="p-1.5 text-[#717171] hover:text-[#3B3B2B] hover:bg-[#F5F5F5] rounded transition-colors"
                        title="Élever les droits (Modérateur)"
                      >
                        <Icons.ArrowUp />
                      </button>
                    )}
                    <button 
                      onClick={() => stateMutation.mutate({ id: u.id, isActive: !u.isActive })}
                      className={`p-1.5 rounded transition-colors ${
                        u.isActive ? 'text-[#717171] hover:text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={u.isActive ? 'Révoquer l\'accès' : 'Rétablir l\'accès'}
                    >
                      {u.isActive ? <Icons.Ban /> : <Icons.Check />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[#717171] italic text-sm">
                  Aucun dossier trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesView() {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState('');
  const [confirmData, setConfirmData] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories
  });

  const addMutation = useMutation({
    mutationFn: (name: string) => addCategory({ name }),
    onSuccess: () => {
      setNewCatName('');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
  });

  if (isLoading) return <div className="p-12 text-center text-[#717171] text-sm">Chargement des nomenclatures...</div>;

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-[#434343]">Classification</h3>
          <p className="text-xs text-[#717171] mt-1">Gestion des thématiques du référentiel</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nouvel intitulé" 
            className="w-64 px-4 py-2 border border-[#E5E5E5] rounded-md text-sm outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B]"
          />
          <button 
            onClick={() => newCatName && addMutation.mutate(newCatName)}
            disabled={addMutation.isPending || !newCatName.trim()}
            className="inline-flex items-center gap-1.5 bg-[#3B3B2B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2b2b1b] transition-colors disabled:opacity-50"
          >
            <Icons.Plus /> Insérer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat: any) => (
          <div key={cat.id} className="p-4 rounded-md border border-[#E5E5E5] bg-white flex justify-between items-center group hover:border-[#3B3B2B]/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-[#717171]"><Icons.Folder /></div>
              <div>
                <p className="font-medium text-[#434343] text-sm">{cat.name}</p>
                <p className="text-[10px] text-[#717171] font-mono mt-0.5">REF-{cat.id.toString().padStart(4, '0')}</p>
              </div>
            </div>
            <button 
              onClick={() => setConfirmData({ isOpen: true, id: cat.id })}
              className="p-1.5 text-[#717171] opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded transition-all"
              title="Supprimer la nomenclature"
            >
              <Icons.Trash />
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal 
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ isOpen: false, id: null })}
        onConfirm={() => confirmData.id && deleteMutation.mutate(confirmData.id)}
        title="Supprimer la catégorie"
        message="Êtes-vous certain de vouloir supprimer cette catégorie ? Cela pourrait affecter le classement des ressources existantes."
        confirmLabel="Supprimer"
      />
    </div>
  );
}

function SuperAdminView() {
  const [formData, setFormData] = useState({ name: '', mail: '', password: '' });
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });
  
  const createAdminMutation = useMutation({
    mutationFn: (data: any) => createAdminAccount(data),
    onSuccess: () => {
      setModal({
        isOpen: true,
        title: 'Succès',
        message: 'Habilitation accordée avec succès.',
        type: 'success'
      });
      setFormData({ name: '', mail: '', password: '' });
    },
    onError: (err: any) => {
      setModal({
        isOpen: true,
        title: 'Erreur',
        message: err.response?.data?.message || 'Erreur lors de l\'attribution des droits.',
        type: 'error'
      });
    }
  });

  return (
    <div className="p-8 max-w-xl">
      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-8 flex items-start gap-3">
        <div className="text-red-600 mt-0.5"><Icons.Alert /></div>
        <div>
          <p className="text-red-800 text-sm font-medium">Zone d'habilitation critique</p>
          <p className="text-red-700/80 text-xs mt-1 leading-relaxed">
            Les actions effectuées ici ont un impact direct sur la sécurité de l'infrastructure globale. La délivrance de droits d'administration de niveau supérieur est tracée.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-[#434343]">Générer une habilitation système</h4>
          <p className="text-xs text-[#717171] mt-1 mb-6">Délivrance de certificats d'accès de rang Administrateur.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#434343] mb-1.5">Identité de l'agent</label>
              <input 
                type="text" 
                placeholder="Nom complet" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 rounded-md border border-[#E5E5E5] text-sm outline-none focus:border-[#3B3B2B]" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#434343] mb-1.5">Adresse courriel institutionnelle</label>
              <input 
                type="email" 
                placeholder="prenom.nom@sante.gouv.fr" 
                value={formData.mail}
                onChange={(e) => setFormData({...formData, mail: e.target.value})}
                className="w-full px-4 py-2 rounded-md border border-[#E5E5E5] text-sm outline-none focus:border-[#3B3B2B]" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#434343] mb-1.5">Jeton d'authentification initial</label>
              <input 
                type="password" 
                placeholder="Mot de passe temporaire complexe" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 rounded-md border border-[#E5E5E5] text-sm outline-none focus:border-[#3B3B2B]" 
              />
            </div>
            <div className="pt-4">
              <button 
                onClick={() => createAdminMutation.mutate(formData)}
                disabled={createAdminMutation.isPending || !formData.name || !formData.mail || !formData.password}
                className="w-full flex items-center justify-center gap-2 bg-[#434343] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#3B3B2B] transition-colors disabled:opacity-50"
              >
                <Icons.Shield /> {createAdminMutation.isPending ? 'Génération...' : 'Délivrer les droits'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
