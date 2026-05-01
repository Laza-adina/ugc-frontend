// src/components/layout/AgencySidebar/AgencySidebar.js
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './AgencySidebar.module.css';

const NAV = [
  {
    section: 'Vue generale',
    items: [
      { label: 'Dashboard', href: '/agency/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ],
  },
  {
    section: 'Marques',
    items: [
      { label: 'Mes Brands', href: '/agency/brands', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    ],
  },
  {
    section: 'Createurs',
    items: [
      { label: 'Marketplace', href: '/agency/marketplace', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    ],
  },
  {
    section: 'Campagnes',
    items: [
      { label: 'Campagnes', href: '/agency/campaigns', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    ],
  },
  {
    section: 'Contenus',
    items: [
      { label: 'UGC Assets', href: '/agency/ugc', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { label: 'Widgets', href: '/agency/widgets', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
    ],
  },
];

export default function AgencySidebar() {
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
            <div className={styles.userRole}>Agence</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Se deconnecter
        </button>
      </div>
    </aside>
  );
}