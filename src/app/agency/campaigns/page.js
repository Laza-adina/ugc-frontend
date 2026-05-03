'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import PageHeader from '@/components/layout/PageHeader/PageHeader';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Badge from '@/components/ui/Badge/Badge';
import Modal from '@/components/ui/Modal/Modal';
import styles from './campaigns.module.css';

const STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];
const EMPTY_FORM = {
  name: '',
  description: '',
  brandId: '',
  budget: '',
  startDate: '',
  endDate: '',
  deadline: '',
};

const toIso = (value) => (value ? new Date(value).toISOString() : undefined);
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-');
const formatCurrency = (value) =>
  typeof value === 'number'
    ? value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
    : '-';

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({ status: '', brandId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [products, setProducts] = useState([{ productId: '', productName: '' }]);
  const [formError, setFormError] = useState('');

  const loadBrands = async () => {
    try {
      const res = await api.brands.list();
      setBrands(res.data?.brands || res.brands || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCampaigns = async (activeFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(
        Object.entries(activeFilters).filter(([, value]) => value)
      );
      const res = await api.campaigns.list(params);
      setCampaigns(res.data?.campaigns || res.campaigns || []);
    } catch (e) {
      setError(e.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
    loadCampaigns();
  }, []);

  const handleArchive = async (id) => {
    if (!window.confirm('Archiver cette campagne ?')) return;
    try {
      await api.campaigns.archive(id);
      loadCampaigns();
    } catch (e) {
      alert(e.message || 'Impossible d\'archiver');
    }
  };

  const addProductRow = () => {
    setProducts((prev) => [...prev, { productId: '', productName: '' }]);
  };

  const updateProduct = (index, patch) => {
    setProducts((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const removeProduct = (index) => {
    setProducts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setProducts([{ productId: '', productName: '' }]);
    setFormError('');
  };

  const handleCreate = async () => {
    setFormError('');
    if (!form.name || !form.brandId) {
      setFormError('Nom et brand requis.');
      return;
    }
    setCreating(true);
    try {
      const cleanedProducts = products
        .filter((p) => p.productId || p.productName)
        .map((p) => ({
          productId: p.productId || undefined,
          productName: p.productName || undefined,
        }));

      const payload = {
        name: form.name,
        description: form.description || undefined,
        brandId: form.brandId,
        budget: form.budget ? Number(form.budget) : undefined,
        startDate: toIso(form.startDate),
        endDate: toIso(form.endDate),
        deadline: toIso(form.deadline),
        products: cleanedProducts.length ? cleanedProducts : undefined,
      };

      await api.campaigns.create(payload);
      setCreateModal(false);
      resetForm();
      loadCampaigns();
    } catch (e) {
      setFormError(e.message || 'Erreur lors de la creation');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Campagnes"
        subtitle="Gerez vos campagnes UGC et suivez leur progression"
        actions={(
          <Button variant="accent" onClick={() => setCreateModal(true)}>
            Nouvelle campagne
          </Button>
        )}
      />

      <Card style={{ marginBottom: 'var(--space-6)' }}>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={filters.brandId}
            onChange={(e) => setFilters({ ...filters, brandId: e.target.value })}
          >
            <option value="">Toutes les brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <Button onClick={() => loadCampaigns(filters)}>Filtrer</Button>
        </div>
      </Card>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {loading ? (
        <div className={styles.empty}>Chargement...</div>
      ) : campaigns.length === 0 ? (
        <div className={styles.empty}>Aucune campagne pour le moment</div>
      ) : (
        <Card>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Statut</th>
                <th>Brand</th>
                <th>Budget</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className={styles.campaignName}>{campaign.name}</td>
                  <td><Badge status={campaign.status} /></td>
                  <td>{campaign.brand?.name || '—'}</td>
                  <td>{formatCurrency(campaign.budget)}</td>
                  <td>
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Button size="sm" onClick={() => router.push(`/agency/campaigns/${campaign.id}`)}>
                        Ouvrir
                      </Button>
                      {campaign.status !== 'ARCHIVED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleArchive(campaign.id)}
                        >
                          Archiver
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {createModal && (
        <Modal
          title="Nouvelle campagne"
          onClose={() => {
            setCreateModal(false);
            resetForm();
          }}
          footer={(
            <>
              <Button variant="secondary" onClick={() => { setCreateModal(false); resetForm(); }}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Creation...' : 'Creer'}
              </Button>
            </>
          )}
        >
          {formError && <div className={styles.errorAlert}>{formError}</div>}
          <Input
            label="Nom de la campagne"
            placeholder="Campagne ete 2026"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            textarea
            placeholder="Objectif, contexte, KPIs..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label}>Brand</label>
              <select
                className={styles.select}
                value={form.brandId}
                onChange={(e) => setForm({ ...form, brandId: e.target.value })}
              >
                <option value="">Selectionner</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Budget (EUR)"
              type="number"
              min="0"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
            <Input
              label="Date de debut"
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="Date de fin"
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
            <Input
              label="Deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          <div className={styles.productSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Produits</span>
              <Button size="sm" variant="secondary" onClick={addProductRow}>
                Ajouter
              </Button>
            </div>
            {products.map((product, index) => (
              <div key={index} className={styles.productRow}>
                <Input
                  placeholder="Product name"
                  value={product.productName}
                  onChange={(e) => updateProduct(index, { productName: e.target.value })}
                />
                <Input
                  placeholder="Product ID"
                  value={product.productId}
                  onChange={(e) => updateProduct(index, { productId: e.target.value })}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeProduct(index)}
                  disabled={products.length === 1}
                >
                  Retirer
                </Button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
