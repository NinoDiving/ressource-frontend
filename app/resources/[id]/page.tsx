'use client';

import { createComment, deleteComment, fetchCommentsByResource, updateCommentState } from '@/api/comments';
import { createConversation } from '@/api/conversations';
import { deleteResource, fetchResources, updateResourceState } from '@/api/resources';
import { favoriteResource, fetchMyFavorites, searchUsers, unfavoriteResource } from '@/api/users';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// --- ICONS ---
const Icons = {
  Heart: ({ filled }: { filled?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  ThumbUp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  ThumbDown: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
};

export default function ResourceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Group Discussion Modal State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [firstMessage, setFirstMessage] = useState('');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const roleName = user?.role?.name || 'User';
  const isModo = ['Moderator', 'Admin', 'SuperAdmin'].includes(roleName);
  const isAdmin = ['Admin', 'SuperAdmin'].includes(roleName);

  // Mutations
  const resStateMutation = useMutation({
    mutationFn: (state: string) => updateResourceState(parseInt(id as string), state as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources'] })
  });

  const resDeleteMutation = useMutation({
    mutationFn: () => deleteResource(parseInt(id as string)),
    onSuccess: () => window.location.href = '/resources'
  });

  const commentStateMutation = useMutation({
    mutationFn: ({ id, isSuspended }: { id: number, isSuspended: boolean }) => updateCommentState(id, isSuspended),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', id] })
  });

  const commentDeleteMutation = useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', id] })
  });

  // Fetch resource data
  const { data, isLoading: isResLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => fetchResources()
  });

  const resources = data?.resources || [];

  // Fetch comments
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => fetchCommentsByResource(parseInt(id as string))
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['my-favorites'],
    queryFn: fetchMyFavorites,
    enabled: !!user
  });

  const resource = resources.find((r: any) => r.id === parseInt(id as string));
  const isFavorite = favorites.some((f: any) => f.resourceId === parseInt(id as string));

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !resource) return;
      if (isFavorite) {
        return unfavoriteResource(user.id, resource.id);
      } else {
        return favoriteResource(user.id, resource.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-favorites'] });
    },
  });

  // Mutation to add comment
  const commentMutation = useMutation({
    mutationFn: (data: { content: string, parentId?: number }) => 
      createComment({ 
        content: data.content, 
        resourceId: parseInt(id as string),
        parentId: data.parentId 
      }),
    onSuccess: () => {
      setCommentText('');
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    }
  });

  // User Search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (userSearch.length > 1) {
        const results = await searchUsers(userSearch);
        // Exclude self from search results
        setSearchResults(results.filter((u: any) => u.id !== user?.id));
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [userSearch, user?.id]);

  const toggleUserSelection = (u: any) => {
    if (selectedUsers.some(selected => selected.id === u.id)) {
      setSelectedUsers(selectedUsers.filter(selected => selected.id !== u.id));
    } else {
      setSelectedUsers([...selectedUsers, u]);
    }
  };

  const createGroupMutation = useMutation({
    mutationFn: () => createConversation({
      title: groupTitle || `Discussion sur ${resource?.title}`,
      participantIds: selectedUsers.map(u => u.id),
      resourceId: resource?.id,
      message: firstMessage || "Bonjour à tous, j'aimerais échanger avec vous sur ce document."
    }),
    onSuccess: () => {
      setIsGroupModalOpen(false);
      router.push('/dashboard');
    }
  });

  useEffect(() => {
    if (replyTo && commentInputRef.current) {
      commentInputRef.current.focus();
      commentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [replyTo]);

  if (isResLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#3B3B2B] rounded-full animate-spin"></div>
        <p className="text-[#717171] text-sm font-medium">Chargement du dossier...</p>
      </div>
    </div>
  );
  
  if (!resource) return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <h3 className="text-xl font-semibold text-[#434343] mb-2">Référence introuvable</h3>
        <p className="text-[#717171] mb-8 text-center max-w-md text-sm">Le document demandé n'existe pas ou n'est plus disponible dans le référentiel.</p>
        <Link href="/resources" className="bg-[#3B3B2B] text-white px-6 py-2.5 rounded-md text-sm font-medium">Retour au catalogue</Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      
      <main className="flex-1 pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* BREADCRUMBS */}
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#717171]/50 mb-8 overflow-x-auto whitespace-nowrap">
            <Link href="/resources" className="hover:text-[#3B3B2B] transition-colors">Catalogue</Link>
            <Icons.ChevronLeft />
            <span className="text-[#717171]/70">{resource.category?.name}</span>
            <Icons.ChevronLeft />
            <span className="text-[#434343] truncate max-w-[200px]">{resource.title}</span>
          </nav>

          {/* DOCUMENT WRAPPER */}
          <article className="bg-white rounded-lg border border-[#E5E5E5] shadow-sm overflow-hidden">
            
            {/* HERO AREA */}
            <div className="relative aspect-21/9 bg-[#F5F5F5] border-b border-[#E5E5E5]">
               {resource.imageUrl ? (
                <img src={resource.imageUrl} alt={resource.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#717171]/20 text-4xl font-bold uppercase tracking-tighter">
                  Document Officiel
                </div>
              )}
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="bg-white/95 border border-[#E5E5E5] text-[#434343] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  {resource.category?.name}
                </span>
                <span className="bg-white/95 border border-[#E5E5E5] text-[#434343] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  {resource.type?.name}
                </span>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="p-8 lg:p-16">
              <header className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-8">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-5xl font-semibold text-[#434343] leading-tight mb-6">
                    {resource.title}
                  </h1>
                  <div className="flex items-center gap-4 text-xs text-[#717171] mb-8">
                    <div className="flex items-center gap-1.5"><Icons.User /> <span className="font-medium text-[#434343]">{resource.user?.name}</span></div>
                    <div className="w-1 h-1 bg-[#E5E5E5] rounded-full"></div>
                    <div className="flex items-center gap-1.5"><Icons.Clock /> <span>{new Date(resource.insertionTime).toLocaleDateString('fr-FR')}</span></div>
                  </div>
                  <div className="bg-primary/5 border-l-4 border-primary p-6 text-grey italic text-base leading-relaxed rounded-r-lg">
                    {resource.description}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {isAdmin && (
                    <div className="flex flex-col gap-2 p-2 bg-[#F5F5F5] rounded border border-[#E5E5E5] w-full">
                      <button 
                        onClick={() => resStateMutation.mutate(resource.isSuspended ? 'Publish' : 'Draft')}
                        className={`text-[10px] font-bold uppercase px-4 py-2 rounded transition-colors ${resource.isSuspended ? 'bg-emerald-600 text-white' : 'bg-white text-amber-700 border border-[#E5E5E5] hover:bg-[#F5F5F5]'}`}
                      >
                        {resource.isSuspended ? 'Rétablir publication' : 'Mettre en retrait'}
                      </button>
                      <button 
                        onClick={() => setConfirmModal({
                          isOpen: true,
                          title: 'Supprimer la ressource',
                          message: 'Voulez-vous vraiment supprimer définitivement ce document ? Cette action est irréversible.',
                          onConfirm: () => resDeleteMutation.mutate()
                        })}
                        className="text-[10px] font-bold uppercase px-4 py-2 rounded bg-white text-red-600 border border-[#E5E5E5] hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={() => favoriteMutation.mutate()}
                    disabled={!user || favoriteMutation.isPending}
                    className={`flex flex-col items-center gap-2 px-6 py-4 rounded border transition-colors w-full group ${isFavorite ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-[#E5E5E5] text-[#717171] hover:bg-red-50 hover:border-red-100 hover:text-red-600'}`}
                  >
                    <Icons.Heart filled={isFavorite} />
                    <span className="uppercase text-[9px] font-bold tracking-widest">
                      {isFavorite ? 'Enregistré' : 'Enregistrer'}
                    </span>
                  </button>
                </div>
              </header>

              <div className="border-t border-[#E5E5E5] pt-12">
                <div 
                  className="rich-text-body"
                  dangerouslySetInnerHTML={{ __html: resource.content }} 
                />
              </div>

              {/* ACTIONS AREA */}
              <div className="mt-16 pt-8 border-t border-[#E5E5E5] flex flex-wrap justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="text-center flex items-center gap-4">
                    <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Pertinence :</span>
                    <div className="flex gap-2">
                      <button className="p-2 border border-[#E5E5E5] rounded hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-[#717171]"><Icons.ThumbUp /></button>
                      <button className="p-2 border border-[#E5E5E5] rounded hover:bg-red-50 hover:text-red-700 transition-colors text-[#717171]"><Icons.ThumbDown /></button>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsGroupModalOpen(true)}
                  className="bg-[#3B3B2B] text-white px-6 py-2.5 rounded-md text-xs font-semibold uppercase tracking-widest hover:bg-primary-dark transition-colors"
                >
                  Créer un groupe de discussion
                </button>
              </div>
            </div>
          </article>

          {/* COMMENTS SECTION */}
          <section className="mt-16">
            <h2 className="text-xl font-semibold text-[#434343] mb-8 flex items-center gap-3">
              Commentaires et retours d'expérience
              <span className="text-xs font-medium text-[#717171] bg-white border border-[#E5E5E5] px-2 py-0.5 rounded">{comments.length}</span>
            </h2>

            <div className="bg-white rounded-lg border border-[#E5E5E5] p-8 shadow-sm">
              
              {/* MAIN INPUT AREA (only if not replying) */}
              {user ? (
                !replyTo && (
                  <CommentInput 
                    value={commentText}
                    onChange={(val) => setCommentText(val)}
                    onSubmit={() => commentMutation.mutate({ content: commentText, parentId: replyTo || undefined })}
                    isPending={commentMutation.isPending}
                    inputRef={commentInputRef}
                  />
                )
              ) : (
                <div className="mb-12 p-8 bg-[#F5F5F5] rounded border border-dashed border-[#E5E5E5] text-center">
                  <p className="text-[#717171] text-sm">Veuillez vous authentifier pour participer aux échanges.</p>
                  <Link href="/login" className="text-[#3B3B2B] font-bold text-xs uppercase tracking-widest mt-3 inline-block hover:underline">Se connecter</Link>
                </div>
              )}

              {/* LIST AREA */}
              {isCommentsLoading ? (
                 <div className="space-y-6 animate-pulse">
                   {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#F5F5F5] rounded"></div>)}
                 </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 text-[#717171] italic text-sm">Aucun retour d'expérience n'a encore été publié pour ce document.</div>
              ) : (
                <div className="space-y-8">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="space-y-4">
                      {/* MAIN COMMENT */}
                      <div className={`p-6 rounded border transition-colors ${comment.isSuspended ? 'bg-red-50/30 border-red-100' : 'bg-white border-[#E5E5E5] hover:border-[#3B3B2B]/20'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-primary"><Icons.User /></div>
                            <div>
                              <p className="font-bold text-[#434343] text-sm flex items-center gap-2">
                                {comment.user.name}
                                {comment.isSuspended && <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">Masqué</span>}
                              </p>
                              <p className="text-[10px] text-text-light flex items-center gap-1"><Icons.Clock /> {new Date(comment.insertionTime).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isModo && (
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => commentStateMutation.mutate({ id: comment.id, isSuspended: !comment.isSuspended })}
                                  className={`p-1.5 rounded border transition-colors ${comment.isSuspended ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-amber-700 hover:bg-amber-50 border-[#E5E5E5]'}`}
                                  title={comment.isSuspended ? 'Rétablir' : 'Masquer'}
                                >
                                  <Icons.Shield />
                                </button>
                                <button 
                                  onClick={() => setConfirmModal({
                                    isOpen: true,
                                    title: 'Supprimer le commentaire',
                                    message: 'Voulez-vous vraiment supprimer ce message ?',
                                    onConfirm: () => commentDeleteMutation.mutate(comment.id)
                                  })}
                                  className="p-1.5 rounded border border-[#E5E5E5] text-[#717171] hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Supprimer"
                                >
                                  <Icons.Trash />
                                </button>
                              </div>
                            )}
                            {user && !comment.parentId && (
                              <button 
                                onClick={() => setReplyTo(comment.id)}
                                className={`text-[10px] font-bold uppercase tracking-widest hover:underline ml-2 ${replyTo === comment.id ? 'text-red-600' : 'text-[#3B3B2B]'}`}
                              >
                                {replyTo === comment.id ? 'Annuler' : 'Répondre'}
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[#434343] text-sm leading-relaxed pl-8">{comment.content}</p>
                        
                        {/* REPLY INPUT (only under this comment if selected) */}
                        {user && replyTo === comment.id && (
                          <CommentInput 
                            value={commentText}
                            onChange={(val) => setCommentText(val)}
                            onSubmit={() => commentMutation.mutate({ content: commentText, parentId: replyTo || undefined })}
                            isPending={commentMutation.isPending}
                            inputRef={commentInputRef}
                            isReply={true}
                            onCancel={() => setReplyTo(null)}
                          />
                        )}
                      </div>

                      {/* REPLIES */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-12 space-y-3">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="bg-[#F5F5F5] p-4 rounded border border-[#E5E5E5]">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="text-[#717171] scale-75"><Icons.User /></div>
                                <div>
                                  <p className="font-bold text-[#434343] text-[12px]">{reply.user.name}</p>
                                  <p className="text-[9px] text-[#717171]">{new Date(reply.insertionTime).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <p className="text-[#717171] text-xs leading-relaxed pl-6">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* GROUP DISCUSSION MODAL */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-[#3B3B2B]/40 backdrop-blur-sm z-100 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-xl border border-[#E5E5E5] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#E5E5E5] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-[#434343]">Créer un groupe de discussion</h3>
                <p className="text-xs text-[#717171] mt-1">Échangez avec vos collaborateurs sur ce document</p>
              </div>
              <button onClick={() => setIsGroupModalOpen(false)} className="text-[#717171] hover:text-[#434343] transition-colors">
                <Icons.X />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Selected Users Chips */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {selectedUsers.map(u => (
                    <div key={u.id} className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-full pl-3 pr-1 py-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-[#434343]">{u.name}</span>
                      <button onClick={() => toggleUserSelection(u)} className="p-0.5 text-[#717171] hover:text-red-600">
                        <Icons.X />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* User Search */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#717171] uppercase tracking-widest">Rechercher des participants</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
                    <Icons.Search />
                  </div>
                  <input 
                    type="text" 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Saisir un nom ou un prénom..."
                    className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-md pl-10 pr-4 py-2.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B]"
                  />
                </div>
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-[#E5E5E5] rounded-md shadow-sm bg-white overflow-hidden">
                    {searchResults.map((u: any) => {
                      const isSelected = selectedUsers.some(sel => sel.id === u.id);
                      return (
                        <button 
                          key={u.id}
                          onClick={() => toggleUserSelection(u)}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-[#F5F5F5] transition-colors ${isSelected ? 'bg-[#F5F5F5]' : ''}`}
                        >
                          <div>
                            <p className="font-medium text-[#434343]">{u.name}</p>
                            <p className="text-[10px] text-[#717171]">{u.mail}</p>
                          </div>
                          {isSelected && <div className="text-emerald-600"><Icons.Shield /></div>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#717171] uppercase tracking-widest">Titre du groupe (optionnel)</label>
                  <input 
                    type="text" 
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    placeholder={resource?.title}
                    className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-md px-4 py-2.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#717171] uppercase tracking-widest">Premier message</label>
                  <textarea 
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    placeholder="Bonjour à tous, j'aimerais échanger avec vous sur ce document..."
                    className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-md p-4 text-[#434343] text-sm min-h-[100px] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B] transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#F5F5F5] border-t border-[#E5E5E5] flex justify-end gap-3">
              <button 
                onClick={() => setIsGroupModalOpen(false)}
                className="px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest text-[#717171] hover:text-[#434343] transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => createGroupMutation.mutate()}
                disabled={selectedUsers.length === 0 || createGroupMutation.isPending}
                className="bg-[#3B3B2B] text-white px-8 py-2 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {createGroupMutation.isPending ? 'Création...' : 'Créer le groupe'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Confirmer"
      />

      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS ---

interface CommentInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  isReply?: boolean;
  onCancel?: () => void;
}

function CommentInput({ 
  value, 
  onChange, 
  onSubmit, 
  isPending, 
  inputRef, 
  isReply = false, 
  onCancel 
}: CommentInputProps) {
  return (
    <div className={`${isReply ? 'mt-6 pl-8' : 'mb-12 border-b border-[#E5E5E5] pb-12'}`}>
      <div className="flex items-start gap-4">
        <div className={`rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#717171] shrink-0 ${isReply ? 'w-8 h-8 scale-75' : 'w-10 h-10'}`}>
          <Icons.User />
        </div>
        <div className="flex-1">
          <textarea 
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isReply ? "Saisir votre réponse..." : "Ajouter une observation ou un retour..."}
            className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-md p-4 text-[#434343] text-sm min-h-[100px] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B] transition-all resize-none"
          />
          <div className="flex justify-between items-center mt-3">
            {isReply && onCancel && (
              <button onClick={onCancel} className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline">Annuler la réponse</button>
            )}
            <div className="flex-1"></div>
            <button 
              onClick={onSubmit}
              disabled={!value.trim() || isPending}
              className="bg-[#3B3B2B] text-white px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <Icons.Send /> {isPending ? 'Envoi...' : 'Publier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
