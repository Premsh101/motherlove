import Image from 'next/image';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 36, showText = true, className = '' }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className={className}>
      <Image
        src="/logo.png"
        alt="MotherNest Logo"
        width={size}
        height={size}
        style={{ borderRadius: '12px' }}
        priority
      />
      {showText && (
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: size > 30 ? '20px' : '16px',
          fontWeight: 800,
          color: 'var(--gray-800)',
        }}>
          Mother<span style={{ color: 'var(--pink-500)' }}>Nest</span>
        </span>
      )}
    </div>
  );
}
