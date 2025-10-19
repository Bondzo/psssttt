import { Button } from '@/components/ui/button';
import { Crown, Bike, CircleDot, Zap, Framer, Accessibility, Tangent, LoaderPinwheel } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'All', icon: Crown },
  { id: 'fixie', label: 'Fixie', icon: Bike },
  { id: 'velg', label: 'Velg', icon: LoaderPinwheel },
  { id: 'ban', label: 'Ban', icon: CircleDot },
  { id: 'gear', label: 'Gear', icon: Zap },
  { id: 'frame', label: 'Frame', icon: Framer },
  { id: 'saddle', label: 'Saddle', icon: Accessibility },
  { id: 'stang', label: 'Stang', icon: Tangent },
];

export const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  return (
    <div className="sticky top-[64px] z-40 border-b border-border/40 bg-background/80 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground dark:text-muted-foreground dark:hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};