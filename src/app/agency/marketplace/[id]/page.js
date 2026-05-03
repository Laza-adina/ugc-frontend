'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import PageHeader from '@/components/layout/PageHeader/PageHeader';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import Input from '@/components/ui/Input/Input';
import styles from './creator-detail.module.css';

export default function AgencyCreatorDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params.id;
  const router = useRouter();
  
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vettingComment, setVettingComment] = useState('');

  const loadCreator = async () => {
    try {
      const res = await api.creators.getById(id);
      setCreator(res);
      setVettingComment(res.vetting?.comment || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreator();
  }, [id]);

  const handleVetting = async (status) => {
    try {
      await api.creators.updateVetting(id, { status, comment: vettingComment });
      loadCreator();
      alert(`Statut mis à jour : ${status}`);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>;
  if (!creator) return <div style={{ padding: 40, textAlign: 'center' }}>Créateur introuvable</div>;

  return (
    <div className={styles.container}>
      <PageHeader 
        title={creator.username} 
        subtitle="Détail du profil créateur"
        backTo="/agency/marketplace"
      />

      <div className={styles.header}>
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>{creator.username?.[0]?.toUpperCase()}</div>
          <div className={styles.details}>
            <h1>{creator.username}</h1>
            <div className={styles.location}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {creator.location || 'Localisation non renseignée'}
            </div>
            <div className={styles.niches}>
              {creator.niches?.map(n => <span key={n.niche} className={styles.niche}>{n.niche}</span>)}
            </div>
          </div>
        </div>
        <div className={styles.vettingSection}>
          <div className={styles.vettingCard}>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>VETTING STATUS</label>
              <div style={{ marginTop: 4 }}><Badge status={creator.vetting?.status || 'PENDING'} /></div>
            </div>
            <Input 
              label="Commentaire interne" 
              value={vettingComment} 
              onChange={e => setVettingComment(e.target.value)} 
              placeholder="Notes sur la qualité du contenu..."
            />
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
              <Button size="sm" onClick={() => handleVetting('APPROVED')}>Approuver</Button>
              <Button size="sm" variant="danger" onClick={() => handleVetting('REJECTED')}>Rejeter</Button>
            </div>
          </div>
          <Button variant="accent" style={{ width: '100%' }}>Inviter à une campagne</Button>
        </div>
      </div>

      <h2 style={{ marginBottom: 'var(--space-4)' }}>Statistiques Réseaux</h2>
      <div className={styles.statsGrid}>
        {creator.platforms?.map(p => (
          <Card key={p.id} className={styles.platformCard}>
            <div className={styles.platformHeader}>
              <span>{p.platform}</span>
              <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>{p.handle}</span>
            </div>
            <div className={styles.statRow}>
              <span>Abonnés</span>
              <span className={styles.statValue}>{p.followers?.toLocaleString()}</span>
            </div>
            <div className={styles.statRow}>
              <span>Vues Moy.</span>
              <span className={styles.statValue}>{p.avgViews?.toLocaleString()}</span>
            </div>
            <div className={styles.statRow}>
              <span>Engagement</span>
              <span className={styles.statValue}>{p.engagementRate}%</span>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.bioSection}>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>À propos</h2>
        <Card>
          <p className={styles.bioText}>{creator.bio || 'Aucune biographie renseignée.'}</p>
        </Card>
      </div>

      <h2 style={{ marginBottom: 'var(--space-4)' }}>Portfolio</h2>
      <div className={styles.portfolioGrid}>
        {creator.portfolio?.map(item => (
          <div key={item.id} className={styles.portfolioItem}>
            <img src={item.thumbnail || '/placeholder-ugc.jpg'} className={styles.portfolioThumb} alt={item.title} />
            <div className={styles.portfolioOverlay}>
              <div className={styles.portfolioTitle}>{item.title}</div>
              <div className={styles.portfolioMeta}>{item.platform} • {item.views?.toLocaleString()} vues</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
