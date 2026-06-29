'use client';

import { Heart } from 'lucide-react';
import { useAuth, useFavorites } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const ids = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const active = ids.includes(id);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push('/auth'); return; }
    toggle(id);
  };

  return (
    <button type="button" aria-label="favorite" onClick={onClick} className={`fav ${className || ''} ${active ? 'fav--on' : ''}`}>
      <Heart size={18} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
