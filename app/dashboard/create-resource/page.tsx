'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthGuard from '@/components/auth/AuthGuard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories } from '@/api/categories';
import { fetchTypes } from '@/api/types';
import { createResource } from '@/api/resources';
import { uploadFile } from '@/api/upload';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function CreateResourcePage() {
  const router = useRouter();
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

  // RÉCUPÉRATION DES DONNÉES DYNAMIQUES
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: types = [] } = useQuery({
    queryKey: ['types'],
    queryFn: fetchTypes,
  });

  // MUTATION POUR LA CRÉATION
  const mutation = useMutation({
    mutationFn: (data: any) => createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
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
    mutation.mutate({ ...formData, isDrafted: isDraft });
  };

  // CONFIGURATION QUILL AVEC IMAGE HANDLER
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

  return (
    <AuthGuard>
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="text-grey hover:text-primary transition-colors">
              ← Retour au tableau de bord
            </Link>
          </div>

          <h1 className="text-3xl font-medium text-grey mb-10">Créer une nouvelle ressource</h1>

          <div className="bg-white rounded-3xl p-12 shadow-md border border-grey/5">
            <div className="space-y-8">
              {/* TITRE */}
              <div>
                <label className="block text-sm font-medium mb-3 text-grey">Titre de la ressource</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Comment mieux communiquer en équipe" 
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
                  placeholder="Un court résumé qui apparaîtra sur la carte..." 
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
                      {uploading ? 'Upload en cours...' : 'Choisir une photo'}
                    </label>
                    <p className="text-[10px] text-grey/40 mt-2 italic">Format recommandé : JPG, PNG (max. 5Mo)</p>
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
                    placeholder="Rédigez votre article ou insérez votre lien ici..."
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
                  className="bg-white text-grey border border-grey px-8 py-3 rounded-xl font-medium hover:bg-grey/5 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? '...' : 'Enregistrer en brouillon'}
                </button>
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={isSubmitting}
                  className="bg-grey text-white px-10 py-3 rounded-xl font-medium hover:bg-[#333333] transition-all shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Envoi...' : 'Publier la ressource'}
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
