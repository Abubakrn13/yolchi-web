'use client';

import { ImagePlus, X } from 'lucide-react';

export default function PhotoUploader({
  photos, onChange, max = 10,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}) {
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = max - photos.length;
    const list = Array.from(files).slice(0, remaining);
    Promise.all(
      list.map(
        (f) =>
          new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.readAsDataURL(f);
          }),
      ),
    ).then((urls) => onChange([...photos, ...urls]));
  };

  return (
    <div className="photo-grid">
      {photos.map((src, i) => (
        <div key={i} className="photo-tile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`photo ${i + 1}`} />
          <button type="button" className="photo-tile__del" onClick={() => onChange(photos.filter((_, idx) => idx !== i))}>
            <X size={14} />
          </button>
        </div>
      ))}
      {photos.length < max && (
        <label className="photo-add">
          <ImagePlus size={22} />
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
        </label>
      )}
    </div>
  );
}
