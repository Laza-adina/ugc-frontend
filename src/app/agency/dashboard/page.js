// src/app/agency/dashboard/page.js
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/layout/PageHeader/PageHeader';
import Card from '@/components/ui/Card/Card';
import Badge from '@/components/ui/Badge/Badge';
import styles from './dashboard.module.css';

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.campaigns.list(),
      api.brands.list(),
    ]).then(([c, b]) => {
      setCampaigns(c.data?.campaigns || []);
      setBrands(b.data?.brands || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Campagnes actives', value: campaigns.filter(c => c.status === 'IN_PROGRESS').length },
    { label: 'Total campagnes', value: campaigns.length },
    { label: 'Brands', value: brands.length },
    { label: 'Campagnes terminees', value: campaigns.filter(c => c.status === 'COMPLETED').length },
  ];

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${user?.firstName || 'Agence'}`}
        subtitle="Vue generale de votre activite"
      />

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <Card key={s.label}>
            <div className={styles.statValue}>{loading ? '--' : s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Campagnes recentes</h2>
        <Card>
          {loading ? (
            <div className={styles.empty}>Chargement...</div>
          ) : campaigns.length === 0 ? (
            <div className={styles.empty}>Aucune campagne pour le moment</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Statut</th>
                  <th>Collaborateurs</th>
                  <th>Date de creation</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.slice(0, 5).map((c) => (
                  <tr key={c.id}>
                    <td className={styles.campaignName}>{c.name}</td>
                    <td><Badge status={c.status} /></td>
                    <td>{c._count?.collaborations || 0} createur(s)</td>
                    <td>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}