export default function YolchiLogo({
  size = 40,
  star = '#18B2C6',
  needle = '#D2A24C',
}: {
  size?: number;
  star?: string;
  needle?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon
        points="0,-46 7.39,-17.85 32.53,-32.53 17.85,-7.39 46,0 17.85,7.39 32.53,32.53 7.39,17.85 0,46 -7.39,17.85 -32.53,32.53 -17.85,7.39 -46,0 -17.85,-7.39 -32.53,-32.53 -7.39,-17.85"
        fill={star}
      />
      <polygon points="0,-34 5.5,0 -5.5,0" fill={needle} />
      <polygon points="0,34 5.5,0 -5.5,0" fill={needle} opacity="0.45" />
      <circle cx="0" cy="0" r="6.5" fill={star} />
      <circle cx="0" cy="0" r="2.8" fill={needle} />
    </svg>
  );
}
