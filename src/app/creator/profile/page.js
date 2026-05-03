'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/layout/PageHeader/PageHeader';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Modal from '@/components/ui/Modal/Modal';
import styles from './profile.module.css';

const NICHES = ['BEAUTY', 'FASHION', 'TECH', 'FOOD', 'TRAVEL', 'FITNESS', 'GAMING', 'LIFESTYLE', 'PARENTING', 'FINANCE', 'EDUCATION', 'OTHER'];
const PLATFORMS = ['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'LINKEDIN', 'PINTEREST'];
const LEVELS = ['NANO', 'MICRO', 'MACRO', 'MEGA'];

export default function CreatorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    username: '',
    bio: '',
    location: '',
    level: 'NANO',
    isAvailable: true,
    niches: [],
    platforms: []
  });

  // Portfolio state
  const [portfolioModal, setPortfolioModal] = useState(false);
  const [newPortfolioItem, setNewPortfolioItem] = useState({ title: '', url: '', thumbnail: '', platform: 'TIKTOK', views: 0 });

  const loadProfile = async () => {
    try {
      const res = await api.creators.me();
      if (res) {
        setProfile(res);
        setForm({
          username: res.username || '',
          bio: res.bio || '',
          location: res.location || '',
          level: res.level || 'NANO',
          isAvailable: res.isAvailable ?? true,
          niches: res.niches?.map(n => n.niche) || [],
          platforms: res.platforms || []
        });
      }
    } catch (e) {
      if (e.status !== 404) console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (profile) {
        await api.creators.update({
          bio: form.bio,
          location: form.location,
          level: form.level,
          isAvailable: form.isAvailable
        });
      } else {
        await api.creators.create(form);
      }
      alert('Profil enregistré !');
      loadProfile();
    } catch (e) {
      alert(e.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const toggleNiche = (niche) => {
    setForm(prev => ({
      ...prev,
      niches: prev.niches.includes(niche) 
        ? prev.niches.filter(n => n !== niche)
        : [...prev.niches, niche]
    }));
  };

  const addPlatform = () => {
    setForm(prev => ({
      ...prev,
      platforms: [...prev.platforms, { platform: 'INSTAGRAM', handle: '', followers: 0, avgViews: 0, engagementRate: 0 }]
    }));
  };

  const updatePlatform = (index, data) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.map((p, i) => i === index ? { ...p, ...data } : p)
    }));
  };

  const removePlatform = (index) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.filter((_, i) => i !== index)
    }));
  };

  const handleAddPortfolio = async () => {
    try {
      await api.creators.addPortfolio(newPortfolioItem);
      setPortfolioModal(false);
      setNewPortfolioItem({ title: '', url: '', thumbnail: '', platform: 'TIKTOK', views: 0 });
      loadProfile();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeletePortfolio = async (itemId) => {
    if (!confirm('Supprimer cet item ?')) return;
    try {
      await api.creators.deletePortfolio(itemId);
      loadProfile();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>;

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Mon Profil Créateur" 
        subtitle="Gérez votre identité et votre portfolio pour attirer les marques"
        actions={<Button onClick={handleSaveProfile} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer le profil'}</Button>}
      />

      <div className={styles.profileGrid}>
        <div className={styles.sidebar}>
          <Card title="Informations de base" style={{ marginBottom: 'var(--space-6)' }}>
            <Input 
              label="Username" 
              value={form.username} 
              onChange={e => setForm({...form, username: e.target.value})}
              disabled={!!profile}
              placeholder="lucas_ugc"
            />
            <Input 
              label="Localisation" 
              value={form.location} 
              onChange={e => setForm({...form, location: e.target.value})}
              placeholder="Paris, France"
            />
            <div className={styles.formGroup}>
              <label className={styles.label}>Niveau</label>
              <select className={styles.select} value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkboxItem}>
                <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({...form, isAvailable: e.target.checked})} />
                Disponible pour des missions
              </label>
            </div>
          </Card>

          <Card title="Niches">
            <div className={styles.checkboxGrid}>
              {NICHES.map(n => (
                <label key={n} className={styles.checkboxItem}>
                  <input type="checkbox" checked={form.niches.includes(n)} onChange={() => toggleNiche(n)} />
                  {n}
                </label>
              ))}
            </div>
          </Card>
        </div>

        <div className={styles.main}>
          <Card title="Biographie" style={{ marginBottom: 'var(--space-6)' }}>
            <Input 
              textarea 
              rows={4} 
              value={form.bio} 
              onChange={e => setForm({...form, bio: e.target.value})} 
              placeholder="Parlez de votre expérience, de votre style..."
            />
          </Card>

          <Card title="Réseaux Sociaux" style={{ marginBottom: 'var(--space-6)' }}>
            <div className={styles.platformsList}>
              {form.platforms.map((p, index) => (
                <div key={index} className={styles.platformCard}>
                  <div className={styles.platformHeader}>
                    <select className={styles.select} style={{ width: 'auto' }} value={p.platform} onChange={e => updatePlatform(index, { platform: e.target.value })}>
                      {PLATFORMS.map(plat => <option key={plat} value={plat}>{plat}</option>)}
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => removePlatform(index)}>Supprimer</Button>
                  </div>
                  <div className={styles.platformGrid}>
                    <Input label="Handle" value={p.handle} onChange={e => updatePlatform(index, { handle: e.target.value })} placeholder="@username" />
                    <Input label="Abonnés" type="number" value={p.followers} onChange={e => updatePlatform(index, { followers: Number(e.target.value) })} />
                    <Input label="Vues Moyennes" type="number" value={p.avgViews} onChange={e => updatePlatform(index, { avgViews: Number(e.target.value) })} />
                    <Input label="Taux d'engagement (%)" type="number" step="0.1" value={p.engagementRate} onChange={e => updatePlatform(index, { engagementRate: Number(e.target.value) })} />
                  </div>
                </div>
              ))}
              <button className={styles.addPlatformBtn} onClick={addPlatform}>+ Ajouter un réseau social</button>
            </div>
          </Card>

          <Card title="Portfolio">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
              <Button variant="secondary" size="sm" onClick={() => setPortfolioModal(true)}>Ajouter un item</Button>
            </div>
            <div className={styles.portfolioGrid}>
              {profile?.portfolio?.map(item => (
                <div key={item.id} className={styles.portfolioItem}>
                  <img src={item.thumbnail || '/placeholder-ugc.jpg'} className={styles.portfolioThumb} alt={item.title} />
                  <div className={styles.portfolioOverlay}>
                    <div className={styles.portfolioTitle}>{item.title}</div>
                    <Button variant="danger" size="sm" className={styles.deleteBtn} onClick={() => handleDeletePortfolio(item.id)}>Supprimer</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {portfolioModal && (
        <Modal title="Ajouter au portfolio" onClose={() => setPortfolioModal(false)} footer={
          <>
            <Button variant="secondary" onClick={() => setPortfolioModal(false)}>Annuler</Button>
            <Button onClick={handleAddPortfolio}>Ajouter</Button>
          </>
        }>
          <Input label="Titre" value={newPortfolioItem.title} onChange={e => setNewPortfolioItem({...newPortfolioItem, title: e.target.value})} placeholder="Reel Nike collab" />
          <Input label="URL" value={newPortfolioItem.url} onChange={e => setNewPortfolioItem({...newPortfolioItem, url: e.target.value})} placeholder="https://..." />
          <Input label="Thumbnail URL" value={newPortfolioItem.thumbnail} onChange={e => setNewPortfolioItem({...newPortfolioItem, thumbnail: e.target.value})} placeholder="https://..." />
          <div className={styles.formGroup}>
            <label className={styles.label}>Plateforme</label>
            <select className={styles.select} value={newPortfolioItem.platform} onChange={e => setNewPortfolioItem({...newPortfolioItem, platform: e.target.value})}>
              {PLATFORMS.map(plat => <option key={plat} value={plat}>{plat}</option>)}
            </select>
          </div>
          <Input label="Vues" type="number" value={newPortfolioItem.views} onChange={e => setNewPortfolioItem({...newPortfolioItem, views: Number(e.target.value)})} />
        </Modal>
      )}
    </div>
  );
}
