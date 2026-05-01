// src/app/creator/layout.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CreatorSidebar from '@/components/layout/CreatorSidebar/CreatorSidebar';
import styles from './creator.module.css';

export default function CreatorLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'CREATOR')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className={styles.layout}>
      <CreatorSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}