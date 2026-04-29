'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('mothernest_token');
    const userData = localStorage.getItem('mothernest_user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream-50)',
      }}>
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--gradient-pink)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            marginBottom: '16px',
            animation: 'heartbeat 2s ease-in-out infinite',
          }}>
            💗
          </div>
          <p style={{ color: 'var(--gray-400)' }}>Loading MotherNest...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
