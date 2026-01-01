import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GenerationFilterProps {
  selected: number;
  onChange: (gen: number) => void;
}

const generations = [
  { id: 0, label: 'All', range: [1, 1025] },
  { id: 1, label: 'Gen I', range: [1, 151] },
  { id: 2, label: 'Gen II', range: [152, 251] },
  { id: 3, label: 'Gen III', range: [252, 386] },
  { id: 4, label: 'Gen IV', range: [387, 493] },
  { id: 5, label: 'Gen V', range: [494, 649] },
  { id: 6, label: 'Gen VI', range: [650, 721] },
  { id: 7, label: 'Gen VII', range: [722, 809] },
  { id: 8, label: 'Gen VIII', range: [810, 905] },
  { id: 9, label: 'Gen IX', range: [906, 1025] },
];

export function GenerationFilter({ selected, onChange }: GenerationFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {generations.map((gen) => (
        <Button
          key={gen.id}
          variant={selected === gen.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(gen.id)}
          className={cn(
            'min-w-[4rem]',
            selected === gen.id && 'shadow-md'
          )}
        >
          {gen.label}
        </Button>
      ))}
    </div>
  );
}

export function getGenerationRange(genId: number): [number, number] {
  const gen = generations.find(g => g.id === genId);
  return gen ? [gen.range[0], gen.range[1]] : [1, 1025];
}
