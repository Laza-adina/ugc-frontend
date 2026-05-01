// src/app/page.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'AGENCY') router.replace('/agency/dashboard');
    if (user.role === 'CREATOR') router.replace('/creator/dashboard');
  }, [user, loading, router]);

  return null;
}