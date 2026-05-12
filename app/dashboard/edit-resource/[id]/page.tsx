'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthGuard from '@/components/auth/AuthGuard';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories } from '@/api/categories';
import { fetchTypes } from '@/api/types';
import { fetchResourceById, updateResource } from '@/api/resources';
import { uploadFile } from '@/api/upload';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function EditResourcePage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    categoryId: '',
    typeId: '',
    imageUrl: '',
  });

  const [uploading, setUploading] = useState(false);

  // RÉCUPÉRATION DE LA RESSOURCE À ÉDITER
  const { data: resource, isLoading: isResLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => fetchResourceById(parseInt(id as string)),
    enabled: !!id && !isNaN(parseInt(id as string)),
  });

  // RÉCUPÉRATION DES DONNÉES DYNAMIQUES
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: types = [] } = useQuery({
    queryKey: ['types'],
    queryFn: fetchTypes,
  });

  // INITIALISATION DU FORMULAIRE
  useEffect(() => {
    if (resource) {
      console.log('Resource loaded:', resource); // Debug
      setFormData({
        title: resource.title || '',
        description: resource.description || '',
        content: resource.content || '',
        categoryId: resource.categoryId?.toString() || '',
        typeId: resource.typeId?.toString() || '',
        imageUrl: resource.imageUrl || '',
      });
    }
  }, [resource]);

  // MUTATION POUR LA MISE À JOUR
  const mutation = useMutation({
    mutationFn: (data: any) => updateResource(parseInt(id as string), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource', id] });
      queryClient.invalidateQueries({ queryKey: ['my-resources'] });
      router.push('/dashboard');
    },
  });

  const handleIllustrationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadFile(file);
      setFormData({ ...formData, imageUrl: res.url });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    mutation.mutate({ 
      ...formData, 
      categoryId: parseInt(formData.categoryId),
      typeId: parseInt(formData.typeId),
      isDrafted: isDraft,
      isSuspended: true 
    });
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image', 'clean']
      ],
    }
  };

  const isSubmitting = mutation.isPending;

  if (isResLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-grey mt-4">Récupération des données...</p>
      </div>
    );
  }

  if (!resource && !isResLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-red-500 mb-4 font-bold">Impossible de charger la ressource.</div>
        <Link href="/dashboard" className="text-primary hover:underline">Retour au tableau de bord</Link>
      </div>
    );
  }

  return (
    <AuthGuard>
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="text-grey hover:text-primary transition-colors text-sm">
              ← Retour au tableau de bord
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-medium text-grey">Modifier la ressource</h1>
            <p className="text-sm text-text-light mt-2 italic">Note : Toute modification entraîne une mise en brouillon et une nouvelle demande de validation.</p>
          </div>

          <div className="bg-white rounded-3xl p-12 shadow-md border border-grey/5">
            <div className="space-y-8">
              {/* TITRE */}
              <div>
                <label className="block text-sm font-medium mb-3 text-grey">Titre de la ressource</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full p-4 rounded-xl border border-grey/10 bg-[#F5F5F5]/50 text-grey focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>

              {/* DESCRIPTION COURTE */}
              <div>
                <label className="block text-sm font-medium mb-3 text-grey">Description courte (aperçu)</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows={2}
                  className="w-full p-4 rounded-xl border border-grey/10 bg-[#F5F5F5]/50 text-grey focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CATEGORIE */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-grey">Catégorie</label>
                  <select 
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    required
                    className="w-full p-4 rounded-xl border border-grey/10 bg-[#F5F5F5]/50 text-grey focus:ring-2 focus:ring-primary outline-none transition-all"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* TYPE */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-grey">Type de ressource</label>
                  <select 
                    value={formData.typeId}
                    onChange={(e) => setFormData({...formData, typeId: e.target.value})}
                    required
                    className="w-full p-4 rounded-xl border border-grey/10 bg-[#F5F5F5]/50 text-grey focus:ring-2 focus:ring-primary outline-none transition-all"
                  >
                    <option value="">Sélectionner un type</option>
                    {types.map((type: any) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-grey">Image d'illustration</label>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-2xl bg-[#F5F5F5]/50 border-2 border-dashed border-grey/10 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl text-grey/20">📷</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleIllustrationUpload}
                      className="hidden"
                      id="illustration-upload"
                    />
                    <label 
                      htmlFor="illustration-upload"
                      className={`inline-block px-6 py-3 rounded-xl border border-grey text-sm font-medium cursor-pointer transition-all hover:bg-grey/5 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {uploading ? 'Upload en cours...' : 'Changer la photo'}
                    </label>
                  </div>
                </div>
              </div>

              {/* CONTENU PRINCIPAL */}
              <div>
                <label className="block text-sm font-medium mb-3 text-grey">Contenu de la ressource</label>
                <div className="bg-[#F5F5F5]/50 rounded-xl border border-grey/10 overflow-hidden min-h-[300px]">
                  <ReactQuill 
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData({...formData, content})}
                    modules={modules}
                    className="h-full border-none"
                  />
                </div>
              </div>

              <style jsx global>{`
                .ql-container.ql-snow {
                  border: none !important;
                  font-family: 'Inter', sans-serif;
                  font-size: 1rem;
                  color: #434343;
                  min-height: 250px;
                }
                .ql-toolbar.ql-snow {
                  border: none !important;
                  border-bottom: 1px solid rgba(67, 67, 67, 0.1) !important;
                  background: rgba(255, 255, 255, 0.5);
                }
                .ql-editor {
                  min-height: 250px;
                }
              `}</style>

              {/* BOUTONS */}
              <div className="flex justify-end gap-4 pt-6">
                <Link 
                  href="/dashboard"
                  className="px-8 py-3 rounded-xl font-medium text-grey hover:bg-grey/5 transition-all"
                >
                  Annuler
                </Link>
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  className="bg-primary text-white px-10 py-3 rounded-xl font-medium hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Envoi...' : 'Mettre à jour la ressource'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </AuthGuard>
  );
}
