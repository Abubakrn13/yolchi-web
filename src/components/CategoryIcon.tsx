import { BedDouble, Utensils, ShoppingBag, Pill, Landmark, MapPin, type LucideIcon } from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  hotel: BedDouble,
  restaurant: Utensils,
  shop: ShoppingBag,
  pharmacy: Pill,
  attraction: Landmark,
};

export default function CategoryIcon({ slug, size = 16 }: { slug: string; size?: number }) {
  const Icon = MAP[slug] ?? MapPin;
  return <Icon size={size} />;
}
