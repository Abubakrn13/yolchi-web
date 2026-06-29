import { Star } from 'lucide-react';

export default function RatingStars({
  value,
  count,
  showValue = false,
  size = 16,
}: {
  value: number;
  count?: number;
  showValue?: boolean;
  size?: number;
}) {
  const rounded = Math.round(value);
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          color="#e6a934"
          fill={i <= rounded ? '#e6a934' : 'none'}
          strokeWidth={1.6}
        />
      ))}
      {showValue && <span className="stars__num">{value.toFixed(1)}</span>}
      {showValue && count !== undefined && <span className="stars__count">({count})</span>}
    </span>
  );
}
