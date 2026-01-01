const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

export interface PokemonBasic {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export interface PokemonMove {
  name: string;
  level: number;
  learnMethod: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  damageClass: string;
  effect: string;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
  effect: string;
}

export interface PokemonStat {
  name: string;
  base: number;
}

export interface PokemonEvolution {
  name: string;
  id: number;
  sprite: string;
  trigger: string;
  minLevel?: number;
  item?: string;
}

export interface PokemonDetailed extends PokemonBasic {
  height: number;
  weight: number;
  baseExperience: number;
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  moves: PokemonMove[];
  sprites: {
    front: string;
    back: string;
    frontShiny: string;
    backShiny: string;
    officialArtwork: string;
    officialArtworkShiny: string;
  };
  species: {
    genus: string;
    flavorText: string;
    habitat: string | null;
    generation: string;
    captureRate: number;
    baseHappiness: number;
    growthRate: string;
    eggGroups: string[];
    genderRate: number;
    isLegendary: boolean;
    isMythical: boolean;
  };
  evolutions: PokemonEvolution[];
}

// Cache for API responses
const cache = new Map<string, any>();

async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const data = await response.json();
  cache.set(url, data);
  return data;
}

export async function fetchPokemonList(limit = 151, offset = 0): Promise<PokemonBasic[]> {
  const listData = await fetchWithCache<{ results: { name: string; url: string }[] }>(
    `${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`
  );

  const pokemonPromises = listData.results.map(async (pokemon) => {
    const data = await fetchWithCache<any>(pokemon.url);
    return {
      id: data.id,
      name: data.name,
      sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
      types: data.types.map((t: any) => t.type.name),
    };
  });

  return Promise.all(pokemonPromises);
}

export async function fetchPokemonDetails(idOrName: number | string): Promise<PokemonDetailed> {
  const pokemonData = await fetchWithCache<any>(`${POKEAPI_BASE}/pokemon/${idOrName}`);
  const speciesData = await fetchWithCache<any>(pokemonData.species.url);
  
  // Get evolution chain
  let evolutions: PokemonEvolution[] = [];
  try {
    const evolutionChainData = await fetchWithCache<any>(speciesData.evolution_chain.url);
    evolutions = await parseEvolutionChain(evolutionChainData.chain);
  } catch (e) {
    console.error('Error fetching evolution chain:', e);
  }

  // Get moves with details
  const moves = await Promise.all(
    pokemonData.moves.slice(0, 50).map(async (move: any) => {
      try {
        const moveData = await fetchWithCache<any>(move.move.url);
        const versionDetails = move.version_group_details.find(
          (v: any) => v.move_learn_method.name === 'level-up'
        ) || move.version_group_details[0];
        
        const effectEntry = moveData.effect_entries?.find(
          (e: any) => e.language.name === 'en'
        );
        
        return {
          name: move.move.name,
          level: versionDetails?.level_learned_at || 0,
          learnMethod: versionDetails?.move_learn_method.name || 'unknown',
          type: moveData.type.name,
          power: moveData.power,
          accuracy: moveData.accuracy,
          pp: moveData.pp,
          damageClass: moveData.damage_class.name,
          effect: effectEntry?.short_effect || 'No effect description available.',
        };
      } catch (e) {
        return {
          name: move.move.name,
          level: 0,
          learnMethod: 'unknown',
          type: 'normal',
          power: null,
          accuracy: null,
          pp: 0,
          damageClass: 'status',
          effect: 'Unable to load move details.',
        };
      }
    })
  );

  // Get abilities with effects
  const abilities = await Promise.all(
    pokemonData.abilities.map(async (ability: any) => {
      try {
        const abilityData = await fetchWithCache<any>(ability.ability.url);
        const effectEntry = abilityData.effect_entries?.find(
          (e: any) => e.language.name === 'en'
        );
        return {
          name: ability.ability.name,
          isHidden: ability.is_hidden,
          effect: effectEntry?.short_effect || 'No effect description available.',
        };
      } catch (e) {
        return {
          name: ability.ability.name,
          isHidden: ability.is_hidden,
          effect: 'Unable to load ability details.',
        };
      }
    })
  );

  const flavorTextEntry = speciesData.flavor_text_entries?.find(
    (e: any) => e.language.name === 'en'
  );
  const genusEntry = speciesData.genera?.find(
    (g: any) => g.language.name === 'en'
  );

  return {
    id: pokemonData.id,
    name: pokemonData.name,
    sprite: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
    types: pokemonData.types.map((t: any) => t.type.name),
    height: pokemonData.height,
    weight: pokemonData.weight,
    baseExperience: pokemonData.base_experience,
    abilities,
    stats: pokemonData.stats.map((s: any) => ({
      name: s.stat.name,
      base: s.base_stat,
    })),
    moves: moves.sort((a, b) => {
      if (a.learnMethod === 'level-up' && b.learnMethod !== 'level-up') return -1;
      if (a.learnMethod !== 'level-up' && b.learnMethod === 'level-up') return 1;
      return a.level - b.level;
    }),
    sprites: {
      front: pokemonData.sprites.front_default,
      back: pokemonData.sprites.back_default,
      frontShiny: pokemonData.sprites.front_shiny,
      backShiny: pokemonData.sprites.back_shiny,
      officialArtwork: pokemonData.sprites.other['official-artwork'].front_default,
      officialArtworkShiny: pokemonData.sprites.other['official-artwork'].front_shiny,
    },
    species: {
      genus: genusEntry?.genus || 'Unknown',
      flavorText: flavorTextEntry?.flavor_text?.replace(/\f/g, ' ').replace(/\n/g, ' ') || 'No Pokédex entry available.',
      habitat: speciesData.habitat?.name || null,
      generation: speciesData.generation?.name?.replace('generation-', 'Gen ').toUpperCase() || 'Unknown',
      captureRate: speciesData.capture_rate,
      baseHappiness: speciesData.base_happiness,
      growthRate: speciesData.growth_rate?.name || 'Unknown',
      eggGroups: speciesData.egg_groups?.map((g: any) => g.name) || [],
      genderRate: speciesData.gender_rate,
      isLegendary: speciesData.is_legendary,
      isMythical: speciesData.is_mythical,
    },
    evolutions,
  };
}

async function parseEvolutionChain(chain: any): Promise<PokemonEvolution[]> {
  const evolutions: PokemonEvolution[] = [];
  
  async function traverse(node: any) {
    try {
      const speciesUrl = node.species.url;
      const speciesId = parseInt(speciesUrl.split('/').filter(Boolean).pop());
      const pokemonData = await fetchWithCache<any>(`${POKEAPI_BASE}/pokemon/${speciesId}`);
      
      const evolutionDetails = node.evolution_details?.[0];
      
      evolutions.push({
        name: node.species.name,
        id: speciesId,
        sprite: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
        trigger: evolutionDetails?.trigger?.name || 'base',
        minLevel: evolutionDetails?.min_level,
        item: evolutionDetails?.item?.name,
      });
      
      for (const child of node.evolves_to || []) {
        await traverse(child);
      }
    } catch (e) {
      console.error('Error parsing evolution:', e);
    }
  }
  
  await traverse(chain);
  return evolutions;
}

export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(4, '0')}`;
}

export function formatPokemonName(name: string): string {
  return name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export function formatStatName(name: string): string {
  const statNames: Record<string, string> = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    'speed': 'Speed',
  };
  return statNames[name] || name;
}

export function getStatColor(value: number): string {
  if (value < 50) return 'bg-red-500';
  if (value < 80) return 'bg-orange-500';
  if (value < 100) return 'bg-yellow-500';
  if (value < 120) return 'bg-green-500';
  return 'bg-emerald-500';
}
