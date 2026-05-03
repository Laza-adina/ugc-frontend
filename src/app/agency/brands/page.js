"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader/PageHeader";
import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./brands.module.css";

const CATEGORIES = [
  "BEAUTY",
  "FASHION",
  "TECH",
  "FOOD",
  "TRAVEL",
  "FITNESS",
  "GAMING",
  "LIFESTYLE",
  "OTHER",
];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const buildBrandPayload = (form, isEdit) => {
  const name = form.name ? form.name.trim() : "";
  let slug = form.slug ? form.slug.trim() : "";
  if (!isEdit && !slug && name) {
    slug = slugify(name);
  }

  const payload = { ...form, name, slug };
  return Object.fromEntries(
    Object.entries(payload)
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
      .filter(
        ([, value]) => value !== "" && value !== null && value !== undefined,
      ),
  );
};

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Brand Modal
  const [brandModal, setBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandForm, setBrandForm] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    website: "",
    category: "BEAUTY",
    legalName: "",
    vatNumber: "",
    country: "France",
  });

  // Product Modal
  const [productModal, setProductModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    url: "",
    imageUrl: "",
  });

  const loadBrands = async () => {
    try {
      const res = await api.brands.list();
      setBrands(res.data?.brands || res.brands || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleSaveBrand = async () => {
    try {
      const payload = buildBrandPayload(brandForm, !!editingBrand);
      if (!payload.name) {
        alert("Nom requis");
        return;
      }
      if (!editingBrand && !payload.slug) {
        alert("Slug requis");
        return;
      }

      if (editingBrand) {
        await api.brands.update(editingBrand.id, payload);
      } else {
        await api.brands.create(payload);
      }
      setBrandModal(false);
      loadBrands();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!confirm("Désactiver cette brand ?")) return;
    try {
      await api.brands.delete(id);
      loadBrands();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAddProduct = async () => {
    try {
      await api.brands.addProduct(selectedBrand.id, productForm);
      setProductForm({ name: "", description: "", url: "", imageUrl: "" });
      // Refresh the specific brand in the list if needed, or just reload all
      loadBrands();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteProduct = async (brandId, productId) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await api.brands.deleteProduct(brandId, productId);
      loadBrands();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>Chargement...</div>
    );

  return (
    <div>
      <PageHeader
        title="Mes Brands"
        subtitle="Gérez les profils des marques que vous représentez"
        actions={
          <Button
            onClick={() => {
              setEditingBrand(null);
              setBrandForm({
                name: "",
                slug: "",
                description: "",
                logo: "",
                website: "",
                category: "BEAUTY",
                legalName: "",
                vatNumber: "",
                country: "France",
              });
              setBrandModal(true);
            }}
          >
            Nouvelle Brand
          </Button>
        }
      />

      <div className={styles.brandsGrid}>
        {brands.map((brand) => (
          <Card key={brand.id} className={styles.brandCard}>
            <div className={styles.brandHeader}>
              <img
                src={brand.logo || "/placeholder-logo.png"}
                className={styles.brandLogo}
                alt={brand.name}
              />
              <div>
                <div className={styles.brandCategory}>{brand.category}</div>
                <div className={styles.brandName}>{brand.name}</div>
              </div>
            </div>

            <div className={styles.brandMeta}>
              <div>
                <strong>Website:</strong> {brand.website || "N/A"}
              </div>
              <div>
                <strong>Pays:</strong> {brand.country}
              </div>
              <div>
                <strong>Slug:</strong> {brand.slug}
              </div>
            </div>

            <div className={styles.productsSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>
                  Produits ({brand.products?.length || 0})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBrand(brand);
                    setProductModal(true);
                  }}
                >
                  Gérer
                </Button>
              </div>
              <div className={styles.productList}>
                {brand.products?.slice(0, 2).map((p) => (
                  <div key={p.id} className={styles.productItem}>
                    <span className={styles.productName}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.brandActions}>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditingBrand(brand);
                  setBrandForm(brand);
                  setBrandModal(true);
                }}
              >
                Modifier
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDeleteBrand(brand.id)}
              >
                Désactiver
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {brandModal && (
        <Modal
          title={editingBrand ? "Modifier la Brand" : "Nouvelle Brand"}
          onClose={() => setBrandModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setBrandModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveBrand}>Enregistrer</Button>
            </>
          }
        >
          <div className={styles.modalGrid}>
            <Input
              label="Nom"
              value={brandForm.name}
              onChange={(e) =>
                setBrandForm({ ...brandForm, name: e.target.value })
              }
              placeholder="Nike France"
            />
            <Input
              label="Slug"
              value={brandForm.slug}
              onChange={(e) =>
                setBrandForm({ ...brandForm, slug: e.target.value })
              }
              placeholder="nike-france"
              disabled={!!editingBrand}
            />
          </div>
          <Input
            label="Website"
            value={brandForm.website}
            onChange={(e) =>
              setBrandForm({ ...brandForm, website: e.target.value })
            }
            placeholder="https://..."
          />
          <div style={{ marginBottom: "var(--space-4)" }}>
            <label
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 500,
                display: "block",
                marginBottom: 4,
              }}
            >
              Catégorie
            </label>
            <select
              className={styles.select}
              value={brandForm.category}
              onChange={(e) =>
                setBrandForm({ ...brandForm, category: e.target.value })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Input
            textarea
            label="Description"
            value={brandForm.description}
            onChange={(e) =>
              setBrandForm({ ...brandForm, description: e.target.value })
            }
          />
          <div className={styles.modalGrid}>
            <Input
              label="Nom légal"
              value={brandForm.legalName}
              onChange={(e) =>
                setBrandForm({ ...brandForm, legalName: e.target.value })
              }
            />
            <Input
              label="Numéro TVA"
              value={brandForm.vatNumber}
              onChange={(e) =>
                setBrandForm({ ...brandForm, vatNumber: e.target.value })
              }
            />
          </div>
          <Input
            label="Pays"
            value={brandForm.country}
            onChange={(e) =>
              setBrandForm({ ...brandForm, country: e.target.value })
            }
          />
        </Modal>
      )}

      {productModal && selectedBrand && (
        <Modal
          title={`Gérer les produits - ${selectedBrand.name}`}
          onClose={() => setProductModal(false)}
          footer={
            <Button onClick={() => setProductModal(false)}>Fermer</Button>
          }
        >
          <Card
            title="Ajouter un produit"
            style={{ marginBottom: "var(--space-6)" }}
          >
            <div className={styles.modalGrid}>
              <Input
                label="Nom du produit"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                placeholder="Air Max 2024"
              />
              <Input
                label="Image URL"
                value={productForm.imageUrl}
                onChange={(e) =>
                  setProductForm({ ...productForm, imageUrl: e.target.value })
                }
              />
            </div>
            <Input
              label="URL Produit"
              value={productForm.url}
              onChange={(e) =>
                setProductForm({ ...productForm, url: e.target.value })
              }
            />
            <Button
              onClick={handleAddProduct}
              style={{ width: "100%", marginTop: "var(--space-2)" }}
            >
              Ajouter le produit
            </Button>
          </Card>

          <div className={styles.productList}>
            {selectedBrand.products?.map((p) => (
              <div key={p.id} className={styles.productItem}>
                <span className={styles.productName}>{p.name}</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteProduct(selectedBrand.id, p.id)}
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
