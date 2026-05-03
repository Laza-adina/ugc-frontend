"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader/PageHeader";
import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";
import Badge from "@/components/ui/Badge/Badge";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./widgets.module.css";

const LAYOUTS = ["GRID", "MASONRY", "CAROUSEL", "SHOP_THE_LOOK"];

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrandId, setSelectedBrandId] = useState("");

  // Widget Modal
  const [widgetModal, setWidgetModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    layout: "GRID",
    title: "",
    description: "",
    brandId: "",
  });

  // Items Modal
  const [itemsModal, setItemsModal] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  const loadBrands = async () => {
    try {
      const res = await api.brands.list();
      setBrands(res.data?.brands || res.brands || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadWidgets = async () => {
    setLoading(true);
    try {
      const res = await api.widgets.list(selectedBrandId);
      const widgetsList = Array.isArray(res?.data)
        ? res.data
        : res?.data?.widgets || res?.widgets || [];
      setWidgets(Array.isArray(widgetsList) ? widgetsList : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
    loadWidgets();
  }, [selectedBrandId]);

  const handleSaveWidget = async () => {
    try {
      if (editingWidget) {
        await api.widgets.update(editingWidget.id, form);
      } else {
        await api.widgets.create(form);
      }
      setWidgetModal(false);
      loadWidgets();
    } catch (e) {
      alert(e.message);
    }
  };

  const openItemsModal = async (widget) => {
    setSelectedWidget(widget);
    setSelectedAssetIds(widget.items?.map((i) => i.ugcAssetId) || []);
    setItemsModal(true);
    try {
      const res = await api.ugc.list({
        brandId: widget.brandId,
        moderationStatus: "APPROVED",
      });
      const assetsList = Array.isArray(res?.data)
        ? res.data
        : res?.data?.assets || res?.assets || [];
      setAvailableAssets(Array.isArray(assetsList) ? assetsList : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveItems = async () => {
    try {
      const items = selectedAssetIds.map((id, index) => ({
        ugcAssetId: id,
        position: index,
      }));
      await api.widgets.updateItems(selectedWidget.id, { items });
      setItemsModal(false);
      loadWidgets();
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleAsset = (id) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Widgets e-commerce"
        subtitle="Créez et configurez vos galeries UGC pour votre site"
        actions={
          <Button
            onClick={() => {
              setEditingWidget(null);
              setForm({
                name: "",
                slug: "",
                layout: "GRID",
                title: "",
                description: "",
                brandId: selectedBrandId,
              });
              setWidgetModal(true);
            }}
          >
            Nouveau Widget
          </Button>
        }
      />

      <Card style={{ marginBottom: "var(--space-6)" }}>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
          >
            <option value="">Toutes les Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <div className={styles.empty}>Chargement...</div>
      ) : widgets.length === 0 ? (
        <div className={styles.empty}>Aucun widget configuré</div>
      ) : (
        <div className={styles.grid}>
          {widgets.map((widget) => (
            <Card key={widget.id} className={styles.widgetCard}>
              <div className={styles.widgetHeader}>
                <div>
                  <div className={styles.widgetLayout}>{widget.layout}</div>
                  <h3 className={styles.widgetName}>{widget.name}</h3>
                </div>
                <Badge status={widget.isActive ? "APPROVED" : "REJECTED"} />
              </div>

              <div className={styles.widgetMeta}>
                <div>
                  <strong>Slug:</strong> {widget.slug}
                </div>
                <div>
                  <strong>Embed Key:</strong>{" "}
                  <code className={styles.code}>{widget.embedKey}</code>
                </div>
                <div>
                  <strong>Contenus:</strong>{" "}
                  {widget._count?.items || widget.items?.length || 0}
                </div>
              </div>

              <div className={styles.widgetActions}>
                <Button size="sm" onClick={() => openItemsModal(widget)}>
                  Gérer les contenus
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingWidget(widget);
                    setForm(widget);
                    setWidgetModal(true);
                  }}
                >
                  Configurer
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {widgetModal && (
        <Modal
          title={editingWidget ? "Configurer le Widget" : "Nouveau Widget"}
          onClose={() => setWidgetModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setWidgetModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveWidget}>Enregistrer</Button>
            </>
          }
        >
          <div className={styles.modalGrid}>
            <Input
              label="Nom"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Galerie Home Page"
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="home-gallery"
              disabled={!!editingWidget}
            />
          </div>

          {!editingWidget && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <label className={styles.label}>Brand</label>
              <select
                className={styles.select}
                style={{ width: "100%" }}
                value={form.brandId}
                onChange={(e) => setForm({ ...form, brandId: e.target.value })}
              >
                <option value="">Sélectionner une Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: "var(--space-4)" }}>
            <label className={styles.label}>Layout</label>
            <select
              className={styles.select}
              style={{ width: "100%" }}
              value={form.layout}
              onChange={(e) => setForm({ ...form, layout: e.target.value })}
            >
              {LAYOUTS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Titre affiché"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ce que nos clients disent"
          />
          <Input
            textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Modal>
      )}

      {itemsModal && selectedWidget && (
        <Modal
          title={`Contenus du widget - ${selectedWidget.name}`}
          onClose={() => setItemsModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setItemsModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveItems}>
                Enregistrer la sélection
              </Button>
            </>
          }
        >
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-muted)",
              marginBottom: 16,
            }}
          >
            Sélectionnez les contenus à afficher dans ce widget. Seuls les
            contenus approuvés sont listés.
          </p>
          <div className={styles.assetSelectionGrid}>
            {availableAssets.map((asset) => (
              <div
                key={asset.id}
                className={`${styles.assetSelectCard} ${selectedAssetIds.includes(asset.id) ? styles.assetSelected : ""}`}
                onClick={() => toggleAsset(asset.id)}
              >
                <img
                  src={asset.url}
                  alt=""
                  className={styles.assetSelectThumb}
                />
                {selectedAssetIds.includes(asset.id) && (
                  <div className={styles.checkIcon}>âœ“</div>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
