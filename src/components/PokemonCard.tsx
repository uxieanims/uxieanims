import { PokemonBasic, formatPokemonId, formatPokemonName } from '@/lib/pokemon-api';
import { TypeBadge } from './TypeBadge';
import { cn } from '@/lib/utils';

interface PokemonCardProps {
  pokemon: PokemonBasic;
  onClick: (pokemon: PokemonBasic) => void;
}

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const primaryType = pokemon.types[0];

  return (
    <button
      onClick={() => onClick(pokemon)}
      className={cn(
        'group relative w-full rounded-xl border border-border bg-card p-4',
        'pokemon-card-hover cursor-pointer text-left',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        `type-gradient-${primaryType}`
      )}
    >
      <div className="absolute top-3 right-3 font-mono text-xs text-muted-foreground">
        {formatPokemonId(pokemon.id)}
      </div>
      
      <div className="relative mx-auto mb-3 aspect-square w-24 sm:w-28">
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <h3 className="mb-2 text-center text-sm font-semibold capitalize text-card-foreground">
        {formatPokemonName(pokemon.name)}
      </h3>

      <div className="flex flex-wrap justify-center gap-1">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>
    </button>
  );
}

export function PokemonCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="absolute top-3 right-3">
        <div className="h-4 w-12 rounded skeleton-shimmer" />
      </div>
      
      <div className="mx-auto mb-3 aspect-square w-24 sm:w-28 rounded-lg skeleton-shimmer" />
      
      <div className="mx-auto mb-2 h-5 w-20 rounded skeleton-shimmer" />
      
      <div className="flex justify-center gap-1">
        <div className="h-5 w-14 rounded-full skeleton-shimmer" />
        <div className="h-5 w-14 rounded-full skeleton-shimmer" />
      </div>
    </div>
  );
}
