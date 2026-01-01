import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TypeFilterProps {
  selected: string | null;
  onChange: (type: string | null) => void;
}

const types = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export function TypeFilter({ selected, onChange }: TypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        variant={selected === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange(null)}
        className="text-xs"
      >
        All Types
      </Button>
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onChange(selected === type ? null : type)}
          className={cn(
            'type-badge transition-all',
            `type-${type}`,
            selected === type 
              ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground/50 scale-105' 
              : 'opacity-70 hover:opacity-100'
          )}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
