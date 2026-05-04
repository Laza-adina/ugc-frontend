"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader/PageHeader";
import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";
import Badge from "@/components/ui/Badge/Badge";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./reviews.module.css";

export default function ReviewsPage() {
  const [requests, setRequests] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState("");

  // Request Modal
  const [requestModal, setRequestModal] = useState(false);
  const [form, setForm] = useState({
    customerEmail: "",
    customerName: "",
    productName: "",
    orderId: "",
    brandId: "",
  });

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.brands.list();
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.brands || data?.items || [];
        setBrands(list);
      } catch (e) {
        console.error(e);
        setBrands([]);
      }
    };
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await api.reviews.listRequests({ brandId });
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.reviews || data?.requests || [];
        setRequests(list);
      } catch (e) {
        console.error(e);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
    fetchRequests();
  }, [brandId]);

  const handleCreateRequest = async () => {
    try {
      await api.reviews.createRequest(form);
      setRequestModal(false);
      // Refetch requests after creating
      setLoading(true);
      try {
        const res = await api.reviews.listRequests({ brandId });
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.reviews || data?.requests || [];
        setRequests(list);
      } catch (e) {
        console.error(e);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleMarkAsSent = async (id) => {
    try {
      await api.reviews.markAsSent(id);
      // Refetch requests after marking as sent
      setLoading(true);
      try {
        const res = await api.reviews.listRequests({ brandId });
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.reviews || data?.requests || [];
        setRequests(list);
      } catch (e) {
        console.error(e);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Avis Clients"
        subtitle="Sollicitez et gérez les avis de vos clients après achat"
        actions={
          <Button
            onClick={() => {
              setForm({ ...form, brandId });
              setRequestModal(true);
            }}
          >
            Nouvelle demande
          </Button>
        }
      />

      <Card style={{ marginBottom: "var(--space-6)" }}>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
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
      ) : requests.length === 0 ? (
        <div className={styles.empty}>Aucune demande d&apos;avis trouvée</div>
      ) : (
        <Card>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Produit</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div className={styles.customerName}>
                      {req.customerName || "N/A"}
                    </div>
                    <div className={styles.customerEmail}>
                      {req.customerEmail}
                    </div>
                  </td>
                  <td>{req.productName}</td>
                  <td>
                    <Badge status={req.status} />
                  </td>
                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      {req.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleMarkAsSent(req.id)}
                        >
                          Marquer comme envoyé
                        </Button>
                      )}
                      {req.status === "COMPLETED" && (
                        <Button size="sm" variant="ghost">
                          Voir l&apos;avis
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

      {requestModal && (
        <Modal
          title="Demander un avis"
          onClose={() => setRequestModal(false)}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setRequestModal(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateRequest}>Envoyer la demande</Button>
            </>
          }
        >
          <div className={styles.modalGrid}>
            <Input
              label="Email Client"
              value={form.customerEmail}
              onChange={(e) =>
                setForm({ ...form, customerEmail: e.target.value })
              }
              placeholder="client@email.com"
            />
            <Input
              label="Nom Client"
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
              placeholder="Jean Dupont"
            />
          </div>
          <div className={styles.modalGrid}>
            <Input
              label="Produit"
              value={form.productName}
              onChange={(e) =>
                setForm({ ...form, productName: e.target.value })
              }
              placeholder="Air Max 2024"
            />
            <Input
              label="ID Commande"
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
              placeholder="#12345"
            />
          </div>
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
        </Modal>
      )}
    </div>
  );
}
