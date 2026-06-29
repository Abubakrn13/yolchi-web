'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, Send } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useAuth, useToasts } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { api, type ServerReview } from '@/lib/api';

export default function ReviewSection({
  placeId, initialReviews, onChange,
}: {
  placeId: string;
  initialReviews: ServerReview[];
  onChange?: (r: ServerReview[], rating: { ratingAvg: number; ratingCount: number } | null) => void;
}) {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focus = searchParams.get('focus');
  const user = useAuth((s) => s.user);
  const pushToast = useToasts((s) => s.push);
  const [reviews, setReviews] = useState<ServerReview[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // initialReviews o'zgarganda (qayta yuklanganda) yangilash
  useEffect(() => { setReviews(initialReviews); }, [initialReviews]);

  // URLда ?focus=review bo'lsa, sharh formasiga skroll qilamiz va belgilab qo'yamiz
  useEffect(() => {
    if (focus === 'review' && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (formRef.current) formRef.current.classList.add('review-form--highlight');
        setTimeout(() => formRef.current?.classList.remove('review-form--highlight'), 2000);
      }, 300);
    }
  }, [focus]);

  const submit = async () => {
    if (!user) { router.push('/auth'); return; }
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await api.createReview(placeId, rating, text.trim());
      const updated = [res.review, ...reviews];
      setReviews(updated);
      onChange?.(updated, res.rating);
      setText('');
      setRating(5);
      pushToast(t.profile.saved, 'success');
    } catch (e: any) { pushToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="detail__section" ref={sectionRef}>
      <h2>{t.reviews.title} {reviews.length > 0 ? `(${reviews.length})` : ''}</h2>

      <div className="review-form" ref={formRef}>
        <h3>{t.reviews.leave}</h3>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: n <= rating ? '#e6a934' : 'var(--border)', padding: 2 }}>
              <Star size={26} fill={n <= rating ? 'currentColor' : 'none'} strokeWidth={1.6} />
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t.reviews.placeholder} rows={3} />
        <button className="btn" onClick={submit} disabled={loading || !text.trim()} style={{ marginTop: 8 }}>
          <Send size={15} /> {t.reviews.submit}
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="empty">{t.reviews.none}</div>
      ) : (
        <div className="reviews">
          {reviews.map((r) => (
            <div key={r.id} className="review">
              <div className="review__head">
                <span className="review__author">{r.authorName}</span>
                <span className="review__rating">{Array.from({ length: r.rating }).map((_, i) => (<Star key={i} size={14} fill="currentColor" />))}</span>
              </div>
              <p className="review__text">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
