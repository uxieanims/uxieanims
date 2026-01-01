import { useEffect, useState } from 'react';
import { X, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  PokemonBasic, 
  PokemonDetailed, 
  fetchPokemonDetails,
  formatPokemonId,
  formatPokemonName,
  formatStatName,
  getStatColor
} from '@/lib/pokemon-api';
import { TypeBadge } from './TypeBadge';
import { cn } from '@/lib/utils';

interface PokemonModalProps {
  pokemon: PokemonBasic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPokemon: (pokemon: PokemonBasic) => void;
}

export function PokemonModal({ pokemon, open, onOpenChange, onSelectPokemon }: PokemonModalProps) {
  const [details, setDetails] = useState<PokemonDetailed | null>(null);
  const [loading, setLoading] = useState(false);
  const [showShiny, setShowShiny] = useState(false);

  useEffect(() => {
    if (pokemon && open) {
      setLoading(true);
      setShowShiny(false);
      fetchPokemonDetails(pokemon.id)
        .then(setDetails)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [pokemon, open]);

  if (!pokemon) return null;

  const primaryType = pokemon.types[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden bg-background">
        <DialogTitle className="sr-only">{formatPokemonName(pokemon.name)} Details</DialogTitle>
        
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : details ? (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className={cn('relative p-6 pb-4', `type-gradient-${primaryType}`)}>
              <button
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 rounded-full p-1 hover:bg-black/10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Sprite */}
                <div className="relative mx-auto md:mx-0 flex-shrink-0">
                  <div className="relative w-48 h-48">
                    <img
                      src={showShiny ? details.sprites.officialArtworkShiny : details.sprites.officialArtwork}
                      alt={details.name}
                      className="h-full w-full object-contain drop-shadow-lg"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShiny(!showShiny)}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    {showShiny ? 'Normal' : 'Shiny'}
                  </Button>
                </div>

                {/* Basic Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-1 font-mono text-sm text-muted-foreground">
                    {formatPokemonId(details.id)}
                  </div>
                  <h2 className="mb-2 text-3xl font-bold capitalize">
                    {formatPokemonName(details.name)}
                  </h2>
                  <p className="mb-3 text-sm text-muted-foreground italic">
                    {details.species.genus}
                  </p>
                  <div className="mb-4 flex flex-wrap justify-center md:justify-start gap-2">
                    {details.types.map((type) => (
                      <TypeBadge key={type} type={type} size="lg" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                    {details.species.flavorText}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="stats" className="flex-1 flex flex-col min-h-0">
              <TabsList className="mx-6 mt-4 grid w-auto grid-cols-5 bg-muted">
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="moves">Moves</TabsTrigger>
                <TabsTrigger value="abilities">Abilities</TabsTrigger>
                <TabsTrigger value="evolution">Evolution</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>

              <div className="flex-1 min-h-0 px-6 py-4">
                <TabsContent value="stats" className="h-full mt-0">
                  <StatsTab stats={details.stats} />
                </TabsContent>

                <TabsContent value="moves" className="h-full mt-0">
                  <MovesTab moves={details.moves} />
                </TabsContent>

                <TabsContent value="abilities" className="h-full mt-0">
                  <AbilitiesTab abilities={details.abilities} />
                </TabsContent>

                <TabsContent value="evolution" className="h-full mt-0">
                  <EvolutionTab 
                    evolutions={details.evolutions} 
                    currentId={details.id}
                    onSelectPokemon={(evo) => {
                      onSelectPokemon({ id: evo.id, name: evo.name, sprite: evo.sprite, types: [] });
                    }}
                  />
                </TabsContent>

                <TabsContent value="info" className="h-full mt-0">
                  <InfoTab details={details} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function StatsTab({ stats }: { stats: PokemonDetailed['stats'] }) {
  const maxStat = 255;
  const total = stats.reduce((sum, s) => sum + s.base, 0);

  return (
    <div className="space-y-4">
      {stats.map((stat) => (
        <div key={stat.name} className="flex items-center gap-4">
          <div className="w-20 text-sm font-medium text-right">
            {formatStatName(stat.name)}
          </div>
          <div className="w-10 text-sm font-bold text-right tabular-nums">
            {stat.base}
          </div>
          <div className="flex-1 stat-bar">
            <div
              className={cn('stat-fill', getStatColor(stat.base))}
              style={{ width: `${(stat.base / maxStat) * 100}%` }}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <div className="w-20 text-sm font-bold text-right">Total</div>
        <div className="w-10 text-sm font-bold text-right tabular-nums text-primary">
          {total}
        </div>
      </div>
    </div>
  );
}

function MovesTab({ moves }: { moves: PokemonDetailed['moves'] }) {
  const levelUpMoves = moves.filter(m => m.learnMethod === 'level-up');
  const tmMoves = moves.filter(m => m.learnMethod === 'machine');
  const eggMoves = moves.filter(m => m.learnMethod === 'egg');
  const otherMoves = moves.filter(m => !['level-up', 'machine', 'egg'].includes(m.learnMethod));

  return (
    <ScrollArea className="h-[300px] pr-4 scrollbar-thin">
      <div className="space-y-6">
        {levelUpMoves.length > 0 && (
          <MoveSection title="Level Up Moves" moves={levelUpMoves} showLevel />
        )}
        {tmMoves.length > 0 && (
          <MoveSection title="TM/HM Moves" moves={tmMoves} />
        )}
        {eggMoves.length > 0 && (
          <MoveSection title="Egg Moves" moves={eggMoves} />
        )}
        {otherMoves.length > 0 && (
          <MoveSection title="Other Moves" moves={otherMoves} />
        )}
      </div>
    </ScrollArea>
  );
}

function MoveSection({ title, moves, showLevel = false }: { 
  title: string; 
  moves: PokemonDetailed['moves']; 
  showLevel?: boolean;
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h4>
      <div className="space-y-2">
        {moves.map((move, idx) => (
          <div
            key={`${move.name}-${idx}`}
            className="rounded-lg border border-border bg-card p-3"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {showLevel && move.level > 0 && (
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                    Lv.{move.level}
                  </span>
                )}
                <span className="font-medium capitalize">
                  {formatPokemonName(move.name)}
                </span>
              </div>
              <TypeBadge type={move.type} size="sm" />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground mb-2">
              <span>Power: {move.power ?? '—'}</span>
              <span>Acc: {move.accuracy ? `${move.accuracy}%` : '—'}</span>
              <span>PP: {move.pp}</span>
              <span className="capitalize">{move.damageClass}</span>
            </div>
            <p className="text-xs text-muted-foreground">{move.effect}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbilitiesTab({ abilities }: { abilities: PokemonDetailed['abilities'] }) {
  return (
    <div className="space-y-4">
      {abilities.map((ability) => (
        <div
          key={ability.name}
          className={cn(
            'rounded-lg border border-border bg-card p-4',
            ability.isHidden && 'border-accent/50 bg-accent/5'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold capitalize">
              {formatPokemonName(ability.name)}
            </h4>
            {ability.isHidden && (
              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                Hidden
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{ability.effect}</p>
        </div>
      ))}
    </div>
  );
}

function EvolutionTab({ 
  evolutions, 
  currentId,
  onSelectPokemon 
}: { 
  evolutions: PokemonDetailed['evolutions']; 
  currentId: number;
  onSelectPokemon: (evo: PokemonDetailed['evolutions'][0]) => void;
}) {
  if (evolutions.length <= 1) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        This Pokémon does not evolve.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {evolutions.map((evo, idx) => (
        <div key={evo.id} className="flex items-center gap-2">
          {idx > 0 && (
            <div className="flex flex-col items-center text-muted-foreground text-xs">
              <ChevronRight className="h-5 w-5" />
              {evo.minLevel && <span>Lv.{evo.minLevel}</span>}
              {evo.item && <span className="capitalize">{formatPokemonName(evo.item)}</span>}
            </div>
          )}
          <button
            onClick={() => onSelectPokemon(evo)}
            className={cn(
              'flex flex-col items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted',
              evo.id === currentId && 'ring-2 ring-primary bg-primary/5'
            )}
          >
            <img
              src={evo.sprite}
              alt={evo.name}
              className="h-20 w-20 object-contain"
            />
            <span className="mt-1 text-sm font-medium capitalize">
              {formatPokemonName(evo.name)}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}

function InfoTab({ details }: { details: PokemonDetailed }) {
  const genderRatio = details.species.genderRate;
  const femalePercent = genderRatio >= 0 ? (genderRatio / 8) * 100 : null;
  const malePercent = femalePercent !== null ? 100 - femalePercent : null;

  const infoItems = [
    { label: 'Height', value: `${details.height / 10} m` },
    { label: 'Weight', value: `${details.weight / 10} kg` },
    { label: 'Base Experience', value: details.baseExperience },
    { label: 'Generation', value: details.species.generation },
    { label: 'Habitat', value: details.species.habitat ? formatPokemonName(details.species.habitat) : 'Unknown' },
    { label: 'Capture Rate', value: details.species.captureRate },
    { label: 'Base Happiness', value: details.species.baseHappiness },
    { label: 'Growth Rate', value: formatPokemonName(details.species.growthRate) },
    { label: 'Egg Groups', value: details.species.eggGroups.map(formatPokemonName).join(', ') || 'None' },
  ];

  return (
    <ScrollArea className="h-[300px] pr-4 scrollbar-thin">
      <div className="space-y-4">
        {/* Special Badges */}
        {(details.species.isLegendary || details.species.isMythical) && (
          <div className="flex gap-2">
            {details.species.isLegendary && (
              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Legendary
              </span>
            )}
            {details.species.isMythical && (
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Mythical
              </span>
            )}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {infoItems.map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card p-3">
              <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
              <div className="font-medium">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Gender Ratio */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground mb-2">Gender Ratio</div>
          {femalePercent !== null && malePercent !== null ? (
            <div className="space-y-2">
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                <div 
                  className="bg-blue-500" 
                  style={{ width: `${malePercent}%` }} 
                />
                <div 
                  className="bg-pink-500" 
                  style={{ width: `${femalePercent}%` }} 
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-500">♂ {malePercent.toFixed(1)}%</span>
                <span className="text-pink-500">♀ {femalePercent.toFixed(1)}%</span>
              </div>
            </div>
          ) : (
            <div className="font-medium">Genderless</div>
          )}
        </div>

        {/* Sprite Gallery */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground mb-3">Sprite Gallery</div>
          <div className="grid grid-cols-4 gap-2">
            {details.sprites.front && (
              <div className="flex flex-col items-center">
                <img src={details.sprites.front} alt="Front" className="h-16 w-16" />
                <span className="text-xs text-muted-foreground">Front</span>
              </div>
            )}
            {details.sprites.back && (
              <div className="flex flex-col items-center">
                <img src={details.sprites.back} alt="Back" className="h-16 w-16" />
                <span className="text-xs text-muted-foreground">Back</span>
              </div>
            )}
            {details.sprites.frontShiny && (
              <div className="flex flex-col items-center">
                <img src={details.sprites.frontShiny} alt="Shiny Front" className="h-16 w-16" />
                <span className="text-xs text-muted-foreground">Shiny</span>
              </div>
            )}
            {details.sprites.backShiny && (
              <div className="flex flex-col items-center">
                <img src={details.sprites.backShiny} alt="Shiny Back" className="h-16 w-16" />
                <span className="text-xs text-muted-foreground">Shiny Back</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
