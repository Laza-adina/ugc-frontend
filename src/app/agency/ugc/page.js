'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/layout/PageHeader/PageHeader';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import Input from '@/components/ui/Input/Input';
import Modal from '@/components/ui/Modal/Modal';
import styles from './ugc.module.css';

const SOURCES = ['CAMPAIGN', 'HASHTAG', 'MENTION', 'REVIEW_REQUEST', 'MANUAL'];
const MEDIA_TYPES = ['VIDEO', 'PHOTO', 'CAROUSEL', 'TESTIMONIAL_VIDEO', 'TEXT_REVIEW'];

export default function UgcAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ brandId: '', status: '', source: '' });
  
  // Tagging Modal
  const [tagModal, setTagModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tags, setTags] = useState([]);

  const loadBrands = async () => {
    try {
      const res = await api.brands.list();
      setBrands(res.data?.brands || res.brands || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAssets = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await api.ugc.list(params);
      setAssets(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
    loadAssets();
  }, []);

  const handleModerate = async (id, status) => {
    try {
      await api.moderation.moderate(id, { status });
      loadAssets();
    } catch (e) {
      alert(e.message);
    }
  };

  const openTagging = (asset) => {
    setSelectedAsset(asset);
    setTags(asset.productTags || []);
    setTagModal(true);
  };

  const handleSaveTags = async () => {
    try {
      await api.ugc.updateTags(selectedAsset.id, { tags });
      setTagModal(false);
      loadAssets();
    } catch (e) {
      alert(e.message);
    }
  };

  const addTag = () => {
    setTags([...tags, { productId: '', productName: '', posX: 50, posY: 50 }]);
  };

  const updateTag = (index, data) => {
    setTags(tags.map((t, i) => i === index ? { ...t, ...data } : t));
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      <PageHeader 
        title="UGC Assets" 
        subtitle="Gérez et modérez les contenus collectés pour vos marques"
      />

      <Card style={{ marginBottom: 'var(--space-6)' }}>
        <div className={styles.filters}>
          <select className={styles.select} value={filters.brandId} onChange={e => setFilters({...filters, brandId: e.target.value})}>
            <option value="">Toutes les Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className={styles.select} value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})}>
            <option value="">Toutes les Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button onClick={loadAssets}>Filtrer</Button>
        </div>
      </Card>

      {loading ? (
        <div className={styles.empty}>Chargement...</div>
      ) : assets.length === 0 ? (
        <div className={styles.empty}>Aucun contenu trouvé</div>
      ) : (
        <div className={styles.grid}>
          {assets.map(asset => (
            <Card key={asset.id} className={styles.assetCard}>
              <div className={styles.assetPreview}>
                {asset.mediaType === 'VIDEO' ? (
                  <video src={asset.url} className={styles.media} />
                ) : (
                  <img src={asset.url} className={styles.media} alt={asset.caption} />
                )}
                <div className={styles.sourceBadge}><Badge status={asset.source} /></div>
              </div>
              
              <div className={styles.assetInfo}>
                <div className={styles.authorRow}>
                  <span className={styles.author}>{asset.authorHandle || 'Anonyme'}</span>
                  <Badge status={asset.moderationStatus} />
                </div>
                <p className={styles.caption}>{asset.caption}</p>
                
                <div className={styles.assetActions}>
                  {asset.moderationStatus === 'PENDING' && (
                    <>
                      <Button size="sm" onClick={() => handleModerate(asset.id, 'APPROVED')}>Approuver</Button>
                      <Button size="sm" variant="danger" onClick={() => handleModerate(asset.id, 'REJECTED')}>Rejeter</Button>
                    </>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => openTagging(asset)}>Tags</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tagModal && selectedAsset && (
        <Modal title="Taguer les produits" onClose={() => setTagModal(false)} footer={
          <>
            <Button variant="secondary" onClick={() => setTagModal(false)}>Annuler</Button>
            <Button onClick={handleSaveTags}>Enregistrer</Button>
          </>
        }>
          <div className={styles.taggingContent}>
            <div className={styles.previewContainer}>
              <img src={selectedAsset.url} className={styles.tagPreview} alt="Tagging preview" />
              {tags.map((tag, i) => (
                <div key={i} className={styles.tagPin} style={{ left: `${tag.posX}%`, top: `${tag.posY}%` }}>
                  {i + 1}
                </div>
              ))}
            </div>
            
            <div className={styles.tagsList}>
              <div className={styles.sectionHeader}>
                <span>Produits identifiés</span>
                <Button size="sm" onClick={addTag}>+ Ajouter</Button>
              </div>
              {tags.map((tag, i) => (
                <div key={i} className={styles.tagItem}>
                  <div className={styles.tagIndex}>{i + 1}</div>
                  <Input placeholder="Nom du produit" value={tag.productName} onChange={e => updateTag(i, { productName: e.target.value })} />
                  <Input placeholder="ID" value={tag.productId} onChange={e => updateTag(i, { productId: e.target.value })} style={{ width: 80 }} />
                  <Button variant="ghost" size="sm" onClick={() => removeTag(i)}>×</Button>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
