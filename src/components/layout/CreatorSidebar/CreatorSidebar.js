// src/components/layout/CreatorSidebar/CreatorSidebar.js
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from '../AgencySidebar/AgencySidebar.module.css';

const NAV = [
  {
    section: 'Vue generale',
    items: [
      { label: 'Dashboard', href: '/creator/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ],
  },
  {
    section: 'Mon espace',
    items: [
      { label: 'Mon profil', href: '/creator/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { label: 'Mes collaborations', href: '/creator/collaborations', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    ],
  },
];

export default function CreatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        UGC<span>Platform</span>
      </div>
      <nav className={styles.nav}>
        {NAV.map((group) => (
          <div key={group.section}>
            <div className={styles.section}>
              <span className={styles.sectionLabel}>{group.section}</span>
            </div>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={`${styles.item} ${pathname === item.href ? styles.itemActive : ''}`}>
                  <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className={styles.userName}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
            </div>
            <div className={styles.userRole}>Createur</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Se deconnecter
        </button>
      </div>
    </aside>
  );
}