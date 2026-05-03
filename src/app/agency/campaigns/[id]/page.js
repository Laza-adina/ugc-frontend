'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import PageHeader from '@/components/layout/PageHeader/PageHeader';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Badge from '@/components/ui/Badge/Badge';
import Modal from '@/components/ui/Modal/Modal';
import styles from '../campaigns.module.css'; // Reusing some styles
import localStyles from './campaign-detail.module.css';

const TABS = [
  { id: 'summary', label: 'Résumé' },
  { id: 'brief', label: 'Brief Créatif' },
  { id: 'collaborators', label: 'Collaborateurs' },
  { id: 'contents', label: 'Contenus' },
];

const FORMATS = ['VIDEO_VERTICAL', 'VIDEO_HORIZONTAL', 'UGC_TESTIMONIAL', 'PHOTO', 'CAROUSEL', 'STORY', 'REEL'];
const STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];

export default function CampaignDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params.id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');
  const [campaign, setCampaign] = useState(null);
  const [brief, setBrief] = useState(null);
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Campaign Form (Edit)
  const [editMode, setEditMode] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    budget: '',
    status: '',
  });
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Brief Form
  const [briefForm, setBriefForm] = useState({
    objectives: '',
    contentFormat: 'VIDEO_VERTICAL',
    hook: '',
    tone: '',
    guidelines: '',
    deadline: '',
  });
  const [savingBrief, setSavingBrief] = useState(false);

  // Review State
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'APPROVED', revisionNote: '' });

  // Messaging State
  const [chatModal, setChatModal] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [campRes, briefRes, collRes] = await Promise.all([
        api.campaigns.getById(id),
        api.campaigns.getBrief(id).catch(() => ({ data: null })), // Might not exist yet
        api.collaborations.list(id),
      ]);

      setCampaign(campRes.data);
      setCampaignForm({
        name: campRes.data.name,
        description: campRes.data.description || '',
        budget: campRes.data.budget || '',
        status: campRes.data.status,
      });

      if (briefRes.data) {
        setBrief(briefRes.data);
        setBriefForm({
          objectives: briefRes.data.objectives || '',
          contentFormat: briefRes.data.contentFormat || 'VIDEO_VERTICAL',
          hook: briefRes.data.hook || '',
          tone: briefRes.data.tone || '',
          guidelines: briefRes.data.guidelines || '',
          deadline: briefRes.data.deadline ? new Date(briefRes.data.deadline).toISOString().slice(0, 16) : '',
        });
      }
      setCollaborations(collRes.data || []);
    } catch (e) {
      setError(e.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const handleSaveCampaign = async () => {
    setSavingCampaign(true);
    try {
      await api.campaigns.update(id, {
        ...campaignForm,
        budget: campaignForm.budget ? Number(campaignForm.budget) : undefined,
      });
      setEditMode(false);
      loadAll();
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleSaveBrief = async () => {
    setSavingBrief(true);
    try {
      await api.campaigns.upsertBrief(id, {
        ...briefForm,
        deadline: briefForm.deadline ? new Date(briefForm.deadline).toISOString() : undefined,
      });
      loadAll();
      alert('Brief mis à jour');
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingBrief(false);
    }
  };

  const handleReview = async () => {
    try {
      await api.contents.review(selectedContent.id, reviewForm);
      setReviewModal(false);
      loadAll();
    } catch (e) {
      alert(e.message);
    }
  };

  const openChat = async (collab) => {
    setSelectedCollab(collab);
    setChatModal(true);
    try {
      const res = await api.messages.list(collab.id);
      setMessages(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      await api.messages.send(selectedCollab.id, { body: newMessage });
      setNewMessage('');
      const res = await api.messages.list(selectedCollab.id);
      setMessages(res.data || []);
    } catch (e) {
      alert(e.message);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) return <div className={styles.empty}>Chargement...</div>;
  if (error) return <div className={styles.errorAlert}>{error}</div>;
  if (!campaign) return <div className={styles.empty}>Campagne introuvable</div>;

  return (
    <div>
      <PageHeader
        title={campaign.name}
        subtitle={`Brand: ${campaign.brand?.name || '—'} | Statut: ${campaign.status}`}
        backTo="/agency/campaigns"
        actions={
          <div className={styles.actions}>
             <Button variant="secondary" onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Annuler' : 'Modifier'}
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/agency/campaigns`)}>
              Retour
            </Button>
          </div>
        }
      />

      <div className={localStyles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${localStyles.tab} ${activeTab === tab.id ? localStyles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={localStyles.tabContent}>
        {activeTab === 'summary' && (
          <div className={localStyles.summaryGrid}>
            <Card title="Détails de la campagne">
              {editMode ? (
                <div className={styles.formGrid}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <Input
                      label="Nom"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <Input
                      label="Description"
                      textarea
                      value={campaignForm.description}
                      onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Budget (€)"
                    type="number"
                    value={campaignForm.budget}
                    onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                  />
                  <div>
                    <label className={styles.label}>Statut</label>
                    <select
                      className={styles.select}
                      style={{ width: '100%' }}
                      value={campaignForm.status}
                      onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                    <Button onClick={handleSaveCampaign} disabled={savingCampaign}>
                      {savingCampaign ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={localStyles.detailRow}>
                    <span className={localStyles.detailLabel}>Description</span>
                    <p className={localStyles.detailValue}>{campaign.description || 'Aucune description'}</p>
                  </div>
                  <div className={localStyles.detailRow}>
                    <span className={localStyles.detailLabel}>Budget</span>
                    <span className={localStyles.detailValue}>
                      {campaign.budget?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '—'}
                    </span>
                  </div>
                  <div className={localStyles.detailRow}>
                    <span className={localStyles.detailLabel}>Dates</span>
                    <span className={localStyles.detailValue}>
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </Card>

            <Card title="Produits">
              {campaign.products?.length > 0 ? (
                <ul className={localStyles.productList}>
                  {campaign.products.map((p, i) => (
                    <li key={i} className={localStyles.productItem}>
                      {p.productName} <small>({p.productId})</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.empty}>Aucun produit rattaché</div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'brief' && (
          <Card title="Édition du Brief Créatif">
            <div className={styles.formGrid}>
              <div style={{ gridColumn: 'span 2' }}>
                <Input
                  label="Objectifs"
                  textarea
                  placeholder="Quels sont les objectifs de cette campagne ?"
                  value={briefForm.objectives}
                  onChange={(e) => setBriefForm({ ...briefForm, objectives: e.target.value })}
                />
              </div>
              <div>
                <label className={styles.label}>Format de contenu</label>
                <select
                  className={styles.select}
                  style={{ width: '100%' }}
                  value={briefForm.contentFormat}
                  onChange={(e) => setBriefForm({ ...briefForm, contentFormat: e.target.value })}
                >
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Accroche (Hook)"
                placeholder="L'accroche suggérée..."
                value={briefForm.hook}
                onChange={(e) => setBriefForm({ ...briefForm, hook: e.target.value })}
              />
              <Input
                label="Ton"
                placeholder="Ex: Authentique, Énergique..."
                value={briefForm.tone}
                onChange={(e) => setBriefForm({ ...briefForm, tone: e.target.value })}
              />
              <Input
                label="Deadline Créateur"
                type="datetime-local"
                value={briefForm.deadline}
                onChange={(e) => setBriefForm({ ...briefForm, deadline: e.target.value })}
              />
              <div style={{ gridColumn: 'span 2' }}>
                <Input
                  label="Guidelines Additionnelles"
                  textarea
                  placeholder="Choses à faire ou à ne pas faire..."
                  value={briefForm.guidelines}
                  onChange={(e) => setBriefForm({ ...briefForm, guidelines: e.target.value })}
                />
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleSaveBrief} disabled={savingBrief}>
                {savingBrief ? 'Enregistrement...' : 'Enregistrer le Brief'}
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'collaborators' && (
          <Card title="Créateurs Invités">
            {collaborations.length === 0 ? (
              <div className={styles.empty}>
                <p>Aucun créateur invité pour le moment.</p>
                <Button variant="accent" onClick={() => router.push('/agency/marketplace')}>
                  Trouver des créateurs
                </Button>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Créateur</th>
                    <th>Statut</th>
                    <th>Rémunération</th>
                    <th>Contenus</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collaborations.map((collab) => (
                    <tr key={collab.id}>
                      <td>{collab.creatorUsername || collab.creatorId}</td>
                      <td><Badge status={collab.status} /></td>
                      <td>{collab.fee} €</td>
                      <td>{collab.contents?.length || 0}</td>
                      <td>
                        <Button size="sm" variant="ghost" onClick={() => openChat(collab)}>Message</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {activeTab === 'contents' && (
          <div className={localStyles.contentsGrid}>
            {collaborations.flatMap(collab => collab.contents || []).length === 0 ? (
              <div className={styles.empty} style={{ gridColumn: 'span 3' }}>Aucun contenu soumis</div>
            ) : (
              collaborations.flatMap(collab => (collab.contents || []).map(content => ({ ...content, collab }))).map((content) => (
                <Card key={content.id} className={localStyles.contentCard}>
                  <div className={localStyles.contentPreview}>
                    {content.format?.includes('VIDEO') ? (
                       <video src={content.url} controls className={localStyles.video} />
                    ) : (
                      <img src={content.url} alt="UGC Content" className={localStyles.image} />
                    )}
                  </div>
                  <div className={localStyles.contentInfo}>
                    <div className={localStyles.contentMeta}>
                      <Badge status={content.status} />
                      <span className={localStyles.creatorName}>par {content.collab.creatorUsername}</span>
                    </div>
                    <div className={localStyles.contentActions}>
                      <Button size="sm" variant="secondary" onClick={() => {
                        setSelectedContent(content);
                        setReviewForm({ status: 'REVISION_REQUESTED', revisionNote: '' });
                        setReviewModal(true);
                      }}>
                        Révision
                      </Button>
                      <Button size="sm" onClick={() => {
                        setSelectedContent(content);
                        setReviewForm({ status: 'APPROVED', revisionNote: '' });
                        setReviewModal(true);
                      }}>
                        Approuver
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {reviewModal && (
        <Modal
          title={`Review du contenu`}
          onClose={() => setReviewModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setReviewModal(false)}>Annuler</Button>
              <Button onClick={handleReview}>Confirmer</Button>
            </>
          }
        >
          <div className={localStyles.reviewModalBody}>
             <p>Vous allez marquer ce contenu comme <strong>{reviewForm.status === 'APPROVED' ? 'Approuvé' : 'Demande de révision'}</strong>.</p>
             {reviewForm.status === 'REVISION_REQUESTED' && (
               <Input
                 label="Note de révision"
                 textarea
                 placeholder="Expliquez au créateur ce qu'il doit modifier..."
                 value={reviewForm.revisionNote}
                 onChange={(e) => setReviewForm({ ...reviewForm, revisionNote: e.target.value })}
                 required
               />
             )}
          </div>
        </Modal>
      )}

      {chatModal && (
        <Modal
          title={`Chat avec ${selectedCollab?.creatorUsername}`}
          onClose={() => setChatModal(false)}
          footer={
            <div className={localStyles.chatFooter}>
               <Input
                 placeholder="Écrivez un message..."
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
               />
               <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                 {sendingMessage ? '...' : 'Envoyer'}
               </Button>
            </div>
          }
        >
          <div className={localStyles.messageList}>
            {messages.length === 0 ? (
              <div className={styles.empty}>Aucun message</div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`${localStyles.messageItem} ${msg.senderId === selectedCollab.creatorUserId ? localStyles.messageOther : localStyles.messageMe}`}>
                   <div className={localStyles.messageBody}>{msg.body}</div>
                   <div className={localStyles.messageTime}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

