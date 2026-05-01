// src/app/agency/marketplace/page.js
'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/layout/PageHeader/PageHeader';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Badge from '@/components/ui/Badge/Badge';
import Card from '@/components/ui/Card/Card';
import styles from './marketplace.module.css';

const NICHES = ['BEAUTY','FASHION','TECH','FOOD','TRAVEL','FITNESS','GAMING','LIFESTYLE'];
const PLATFORMS = ['TIKTOK','INSTAGRAM','YOUTUBE','TWITTER'];
const LEVELS = ['NANO','MICRO','MACRO','MEGA'];

export default function MarketplacePage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ niche: '', platform: '', level: '', location: '' });

  const search = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await api.creators.search(params);
      setCreators(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []);

  const handleVetting = async (id, status) => {
    try {
      await api.creators.updateVetting(id, { status });
      search();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Marketplace"
        subtitle="Recherchez et selectionnez des createurs pour vos campagnes"
      />

      <Card style={{ marginBottom: 'var(--space-6)' }}>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={filters.niche}
            onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
          >
            <option value="">Toutes les niches</option>
            {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select
            className={styles.select}
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          >
            <option value="">Toutes les plateformes</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            className={styles.select}
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          >
            <option value="">Tous les niveaux</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <Input
            placeholder="Localisation..."
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
          <Button onClick={search}>Rechercher</Button>
        </div>
      </Card>

      {loading ? (
        <div className={styles.empty}>Chargement...</div>
      ) : creators.length === 0 ? (
        <div className={styles.empty}>Aucun createur trouve</div>
      ) : (
        <div className={styles.grid}>
          {creators.map((creator) => (
            <Card key={creator.id}>
              <div className={styles.creatorHeader}>
                <div className={styles.avatar}>
                  {creator.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className={styles.username}>{creator.username}</div>
                  <div className={styles.location}>{creator.location || 'Non renseigne'}</div>
                </div>
                <Badge status={creator.level} />
              </div>

              <div className={styles.niches}>
                {creator.niches?.map(n => (
                  <span key={n.niche} className={styles.nicheTag}>{n.niche}</span>
                ))}
              </div>

              <div className={styles.platforms}>
                {creator.platforms?.map(p => (
                  <div key={p.id} className={styles.platformItem}>
                    <span className={styles.platformName}>{p.platform}</span>
                    <span className={styles.followers}>{p.followers?.toLocaleString('fr-FR')} abonnes</span>
                  </div>
                ))}
              </div>

              <div className={styles.vettingRow}>
                <Badge status={creator.vetting?.status || 'PENDING'} />
                {creator.vetting?.status !== 'APPROVED' && (
                  <Button size="sm" onClick={() => handleVetting(creator.id, 'APPROVED')}>
                    Approuver
                  </Button>
                )}
                {creator.vetting?.status === 'APPROVED' && (
                  <Button size="sm" variant="ghost" onClick={() => handleVetting(creator.id, 'REJECTED')}>
                    Revoquer
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}