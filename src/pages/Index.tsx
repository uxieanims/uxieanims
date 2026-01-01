import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { PokemonCard, PokemonCardSkeleton } from '@/components/PokemonCard';
import { PokemonModal } from '@/components/PokemonModal';
import { SearchBar } from '@/components/SearchBar';
import { GenerationFilter, getGenerationRange } from '@/components/GenerationFilter';
import { TypeFilter } from '@/components/TypeFilter';
import { PokemonBasic, fetchPokemonList } from '@/lib/pokemon-api';
import { Button } from '@/components/ui/button';

const BATCH_SIZE = 100;

export default function Index() {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonBasic | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [generation, setGeneration] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(BATCH_SIZE);

  const [startId, endId] = getGenerationRange(generation);
  const totalInRange = endId - startId + 1;

  const { data: allPokemon = [], isLoading, error } = useQuery({
    queryKey: ['pokemon-list', generation],
    queryFn: () => fetchPokemonList(totalInRange, startId - 1),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Reset loaded count when generation changes
  useEffect(() => {
    setLoadedCount(BATCH_SIZE);
  }, [generation]);

  const filteredPokemon = useMemo(() => {
    let result = allPokemon;

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.id.toString().includes(searchLower)
      );
    }

    // Filter by type
    if (typeFilter) {
      result = result.filter((p) => p.types.includes(typeFilter));
    }

    return result;
  }, [allPokemon, search, typeFilter]);

  const displayedPokemon = filteredPokemon.slice(0, loadedCount);
  const hasMore = displayedPokemon.length < filteredPokemon.length;

  const handleSelectPokemon = (pokemon: PokemonBasic) => {
    setSelectedPokemon(pokemon);
    setModalOpen(true);
  };

  const handleLoadMore = () => {
    setLoadedCount((prev) => Math.min(prev + BATCH_SIZE, filteredPokemon.length));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                  <span className="inline-block w-8 h-8 rounded-full bg-primary" />
                  Pokédex
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete encyclopedia of all Pokémon
                </p>
              </div>
              <SearchBar value={search} onChange={setSearch} />
            </div>

            <GenerationFilter selected={generation} onChange={setGeneration} />
            
            <div className="border-t border-border pt-4">
              <TypeFilter selected={typeFilter} onChange={setTypeFilter} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-destructive">
            <p className="text-lg font-medium">Failed to load Pokémon data</p>
            <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <PokemonCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPokemon.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No Pokémon found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {displayedPokemon.length} of {filteredPokemon.length} Pokémon
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayedPokemon.map((pokemon, index) => (
                <div
                  key={pokemon.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 20, 300)}ms` }}
                >
                  <PokemonCard pokemon={pokemon} onClick={handleSelectPokemon} />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button onClick={handleLoadMore} size="lg" className="min-w-[200px]">
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      <PokemonModal
        pokemon={selectedPokemon}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelectPokemon={handleSelectPokemon}
      />
    </div>
  );
}
