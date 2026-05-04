"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader/PageHeader";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Badge from "@/components/ui/Badge/Badge";
import Card from "@/components/ui/Card/Card";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./marketplace.module.css";

const NICHES = [
  "BEAUTY",
  "FASHION",
  "TECH",
  "FOOD",
  "TRAVEL",
  "FITNESS",
  "GAMING",
  "LIFESTYLE",
];
const PLATFORMS = ["TIKTOK", "INSTAGRAM", "YOUTUBE", "TWITTER"];
const LEVELS = ["NANO", "MICRO", "MACRO", "MEGA"];

export default function MarketplacePage() {
  const router = useRouter();
  const [creators, setCreators] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    niche: "",
    platform: "",
    level: "",
    location: "",
    isAvailable: false,
    minFollowers: "",
  });

  // Invitation State
  const [inviteModal, setInviteModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [inviteForm, setInviteForm] = useState({ campaignId: "", fee: 0 });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== "" && v !== false),
        );
        const res = await api.creators.search(params);
        setCreators(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    const fetchCampaigns = async () => {
      try {
        const res = await api.campaigns.list({ status: "PUBLISHED" });
        setCampaigns(res.data?.campaigns || res.campaigns || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCreators();
    fetchCampaigns();
  }, [filters]);

  const handleVetting = async (id, status) => {
    try {
      await api.creators.updateVetting(id, { status });
      // Refetch creators after vetting
      setLoading(true);
      try {
        const params = Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== "" && v !== false),
        );
        const res = await api.creators.search(params);
        setCreators(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.campaignId) return alert("Sélectionnez une campagne");
    setInviting(true);
    try {
      await api.collaborations.invite(inviteForm.campaignId, {
        creatorId: selectedCreator.id,
        creatorUsername: selectedCreator.username,
        fee: Number(inviteForm.fee),
      });
      alert("Invitation envoyée !");
      setInviteModal(false);
    } catch (e) {
      alert(e.message || "Erreur lors de l&apos;invitation");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Marketplace"
        subtitle="Recherchez et selectionnez des createurs pour vos campagnes"
      />

      <Card style={{ marginBottom: "var(--space-6)" }}>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={filters.niche}
            onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
          >
            <option value="">Toutes les niches</option>
            {NICHES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={filters.platform}
            onChange={(e) =>
              setFilters({ ...filters, platform: e.target.value })
            }
          >
            <option value="">Toutes les plateformes</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          >
            <option value="">Tous les niveaux</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <Input
            placeholder="Localisation..."
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Min Abonnés"
            value={filters.minFollowers}
            onChange={(e) =>
              setFilters({ ...filters, minFollowers: e.target.value })
            }
            style={{ width: 120 }}
          />
          <label
            className={styles.checkboxItem}
            style={{
              fontSize: "var(--font-size-sm)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <input
              type="checkbox"
              checked={filters.isAvailable}
              onChange={(e) =>
                setFilters({ ...filters, isAvailable: e.target.checked })
              }
            />
            Dispo
          </label>
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
                <div style={{ flex: 1 }}>
                  <div
                    className={styles.username}
                    style={{ cursor: "pointer", color: "var(--color-accent)" }}
                    onClick={() =>
                      router.push(`/agency/marketplace/${creator.id}`)
                    }
                  >
                    {creator.username}
                  </div>
                  <div className={styles.location}>
                    {creator.location || "Non renseigne"}
                  </div>
                </div>
                <Badge status={creator.level} />
              </div>

              <div className={styles.niches}>
                {creator.niches?.map((n) => (
                  <span key={n.niche} className={styles.nicheTag}>
                    {n.niche}
                  </span>
                ))}
              </div>

              <div className={styles.platforms}>
                {creator.platforms?.map((p) => (
                  <div key={p.id} className={styles.platformItem}>
                    <span className={styles.platformName}>{p.platform}</span>
                    <span className={styles.followers}>
                      {p.followers?.toLocaleString("fr-FR")} abonnes
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.vettingRow}>
                <div className={styles.vettingStatus}>
                  <Badge status={creator.vetting?.status || "PENDING"} />
                </div>
                <div className={styles.actions}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      router.push(`/agency/marketplace/${creator.id}`)
                    }
                  >
                    Voir
                  </Button>
                  {creator.vetting?.status === "APPROVED" ? (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => {
                        setSelectedCreator(creator);
                        setInviteModal(true);
                      }}
                    >
                      Inviter
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleVetting(creator.id, "APPROVED")}
                    >
                      Approuver
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {inviteModal && (
        <Modal
          title={`Inviter ${selectedCreator?.username}`}
          onClose={() => setInviteModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setInviteModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleInvite} disabled={inviting}>
                {inviting ? "Envoi..." : "Envoyer l'invitation"}
              </Button>
            </>
          }
        >
          <div className={styles.inviteForm}>
            <label className={styles.label}>Campagne</label>
            <select
              className={styles.select}
              style={{ width: "100%", marginBottom: "var(--space-4)" }}
              value={inviteForm.campaignId}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, campaignId: e.target.value })
              }
            >
              <option value="">Sélectionner une campagne</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <Input
              label="Rémunération proposée (€)"
              type="number"
              value={inviteForm.fee}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, fee: e.target.value })
              }
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
