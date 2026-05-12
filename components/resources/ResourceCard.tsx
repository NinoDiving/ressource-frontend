'use client';

import { deleteOwnResource, updateOwnResourceState } from '@/api/resources';
import { favoriteResource, unfavoriteResource } from '@/api/users';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// --- ICONS ---
const Icons = {
  Heart: ({ filled }: { filled?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  MoreVertical: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  File: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  )
};

import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ResourceCard({ resource, isFavorite = false, isDashboardView = false }: { resource?: any, isFavorite?: boolean, isDashboardView?: boolean }) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  
  if (!resource) return null;

  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const stateMutation = useMutation({
    mutationFn: (state: 'Draft' | 'Publish') => updateOwnResourceState(resource.id, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setShowMenu(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteOwnResource(resource.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;
      if (isFavorite) {
        return unfavoriteResource(currentUser.id, resource.id);
      } else {
        return favoriteResource(currentUser.id, resource.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const getStatus = () => {
    if (resource.isDrafted) return { label: 'Brouillon', color: 'bg-[#F5F5F5] text-[#717171] border border-[#E5E5E5]' };
    if (resource.isSuspended) {
      if (resource.isValidated) {
        return { label: 'Suspendu', color: 'bg-red-50 text-red-700 border border-red-200' };
      }
      return { label: 'En attente de validation', color: 'bg-amber-50 text-amber-700 border border-amber-200' };
    }
    return { label: 'Publié', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  };

  const status = getStatus();
  const isOwner = currentUser?.id === resource.userId;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    router.push(`/resources/${resource.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-md overflow-hidden border border-[#E5E5E5] flex flex-col relative group h-full cursor-pointer hover:border-[#3B3B2B]/30 transition-colors"
    >
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Supprimer la ressource"
        message="Voulez-vous vraiment supprimer définitivement ce document ?"
      />
      {/* ACTIONS */}
      {isDashboardView ? (
        <div className="absolute top-3 right-3 z-30">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="w-8 h-8 rounded flex items-center justify-center bg-white border border-[#E5E5E5] text-[#717171] hover:bg-[#F5F5F5] hover:text-[#434343] transition-colors"
          >
            <Icons.MoreVertical />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-[#E5E5E5] overflow-hidden py-1 z-40">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (resource.isDrafted) {
                    router.push(`/dashboard/edit-resource/${resource.id}`); 
                  } else {
                    // On passe automatiquement en brouillon puis on redirige
                    stateMutation.mutate('Draft', {
                      onSuccess: () => {
                        router.push(`/dashboard/edit-resource/${resource.id}`);
                      }
                    });
                  }
                  setShowMenu(false); 
                }}
                disabled={stateMutation.isPending}
                className="w-full text-left px-4 py-2 text-sm text-[#434343] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
              >
                {stateMutation.isPending ? 'Préparation...' : 'Modifier'}
              </button>
              {resource.isDrafted ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); stateMutation.mutate('Publish'); }}
                  disabled={stateMutation.isPending}
                  className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  Publier
                </button>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); stateMutation.mutate('Draft'); }}
                  disabled={stateMutation.isPending}
                  className="w-full text-left px-4 py-2 text-sm text-[#717171] hover:bg-[#F5F5F5] transition-colors"
                >
                  Mettre en brouillon
                </button>
              )}
              <div className="h-px bg-[#E5E5E5] my-1"></div>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsConfirmOpen(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); favoriteMutation.mutate(); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded flex items-center justify-center transition-colors z-30 ${
            isFavorite 
              ? 'bg-red-50 text-red-600 border border-red-100' 
              : 'bg-white border border-[#E5E5E5] text-[#717171] hover:text-red-500 hover:bg-red-50 hover:border-red-100'
          }`}
          title="Ajouter aux favoris"
        >
          <Icons.Heart filled={isFavorite} />
        </button>
      )}
      
      {/* STATUS BADGE */}
      {(isOwner || resource.isSuspended || resource.isDrafted) && (
        <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium z-10 ${status.color}`}>
          {status.label}
        </div>
      )}

      {/* MEDIA AREA */}
      <div className="aspect-16/10 bg-[#F5F5F5] border-b border-[#E5E5E5] relative overflow-hidden">
        {resource.imageUrl ? (
          <img 
            src={resource.imageUrl} 
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#717171]/50">
            <Icons.File />
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-3 mb-1">
          <h3 className="font-medium text-[#434343] text-base leading-snug line-clamp-2 group-hover:underline">
            {resource.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-primary font-bold tracking-widest">{resource.category?.name?.toUpperCase()}</span>
          <span className="text-[#E5E5E5]">|</span>
          <span className="bg-primary/5 border border-primary/20 px-2 py-0.5 rounded text-[9px] text-primary font-medium">
            {resource.type?.name}
          </span>
        </div>
        
        <p className="text-[#717171] text-sm line-clamp-3 leading-relaxed flex-1">
          {resource.description}
        </p>
        
        <div className="flex justify-between items-center text-[11px] text-[#717171] border-t border-[#E5E5E5] pt-3 mt-4">
          <div className="flex items-center gap-1.5">
            <Icons.User />
            <span>{resource.user?.name || 'Auteur inconnu'}</span>
          </div>
          <span>{new Date(resource.insertionTime).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
}
