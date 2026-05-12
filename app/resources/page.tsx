'use client';

import { fetchCategories } from '@/api/categories';
import { fetchResources } from '@/api/resources';
import { fetchMyFavorites } from '@/api/users';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import ResourceCard from '@/components/resources/ResourceCard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// --- ICONS ---
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Filter: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Info: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch all validated resources
  const { data, isLoading } = useQuery({
    queryKey: ['resources', currentPage, searchTerm, selectedCategory, selectedType, sortOrder],
    queryFn: () => fetchResources({
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      searchTerm,
      categoryId: selectedCategory,
      typeId: selectedType,
      sortOrder
    })
  });

  const resources = data?.resources || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Fetch favorites if logged in
  const { data: favorites = [] } = useQuery({
    queryKey: ['my-favorites'],
    queryFn: fetchMyFavorites,
    enabled: !!user
  });

  const favoriteIds = favorites.map((f: any) => f.resourceId);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="mb-12">
            <h1 className="text-3xl lg:text-4xl font-semibold text-[#434343] mb-4">
              Catalogue des Ressources
            </h1>
            <p className="text-[#717171] max-w-2xl leading-relaxed">
              Accédez au référentiel partagé du Ministère de la Santé. Filtrez les ressources par thématique ou type de contenu pour faciliter vos recherches professionnelles.
            </p>
          </div>

          {/* FILTERS BAR */}
          <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-sm mb-10">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              
              <div className="flex-1 w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717171]">
                  <Icons.Search />
                </div>
                <input 
                  type="text" 
                  placeholder="Rechercher par titre ou mot-clé..." 
                  value={searchTerm}
                  onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-md pl-10 pr-4 py-2.5 text-sm text-[#434343] outline-none focus:border-[#3B3B2B] focus:ring-1 focus:ring-[#3B3B2B] transition-shadow"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <div className="relative">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
                    className="appearance-none bg-white border border-[#E5E5E5] rounded-md pl-4 pr-10 py-2.5 text-sm text-[#434343] font-medium outline-none focus:border-[#3B3B2B] cursor-pointer min-w-[180px]"
                  >
                    <option value="">Toutes les thématiques</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#717171]"><Icons.ChevronDown /></div>
                </div>

                <div className="relative">
                  <select 
                    value={selectedType}
                    onChange={(e) => handleFilterChange(setSelectedType, e.target.value)}
                    className="appearance-none bg-white border border-[#E5E5E5] rounded-md pl-4 pr-10 py-2.5 text-sm text-[#434343] font-medium outline-none focus:border-[#3B3B2B] cursor-pointer min-w-[150px]"
                  >
                    <option value="">Tous les types</option>
                    <option value="1">Articles</option>
                    <option value="2">Vidéos</option>
                    <option value="3">Exercices</option>
                    <option value="4">Documents PDF</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#717171]"><Icons.ChevronDown /></div>
                </div>

                <div className="relative">
                  <select 
                    value={sortOrder}
                    onChange={(e) => handleFilterChange(setSortOrder, e.target.value)}
                    className="appearance-none bg-white border border-[#E5E5E5] rounded-md pl-4 pr-10 py-2.5 text-sm text-[#434343] font-medium outline-none focus:border-[#3B3B2B] cursor-pointer"
                  >
                    <option value="desc">Les plus récents</option>
                    <option value="asc">Les plus anciens</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#717171]"><Icons.ChevronDown /></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
               <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">{totalCount} ressource(s) trouvée(s)</span>
            </div>
          </div>

          {/* RESOURCES GRID */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-16/14 bg-white border border-[#E5E5E5] rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-lg border border-dashed border-[#E5E5E5]">
              <div className="mx-auto w-12 h-12 text-[#717171]/30 mb-4"><Icons.Info /></div>
              <h3 className="text-lg font-medium text-[#434343] mb-1">Aucune ressource disponible</h3>
              <p className="text-[#717171] text-sm">Modifiez vos critères de recherche ou vos filtres pour obtenir des résultats.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {resources.map((resource: any) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  isFavorite={favoriteIds.includes(resource.id)}
                />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-16 flex flex-col items-center gap-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-[#E5E5E5] rounded bg-white text-[#434343] text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-[#F5F5F5] transition-colors"
                >
                  Précédent
                </button>
                
                <div className="flex items-center gap-1 mx-4">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded text-[10px] font-bold transition-all ${currentPage === i + 1 ? 'bg-[#3B3B2B] text-white shadow-lg' : 'bg-white text-[#434343] border border-[#E5E5E5] hover:border-[#3B3B2B]'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-[#E5E5E5] rounded bg-white text-[#434343] text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-[#F5F5F5] transition-colors"
                >
                  Suivant
                </button>
              </div>
              <span className="text-[10px] font-bold text-[#717171] uppercase tracking-widest">
                Page {currentPage} sur {totalPages} — {totalCount} ressources au total
              </span>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
