// src/app/agency/layout.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AgencySidebar from '@/components/layout/AgencySidebar/AgencySidebar';
import styles from './agency.module.css';

export default function AgencyLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'AGENCY')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className={styles.layout}>
      <AgencySidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}