// src/app/creator/collaborations/page.js
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/layout/PageHeader/PageHeader';
import Card from '@/components/ui/Card/Card';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import Input from '@/components/ui/Input/Input';
import styles from './collaborations.module.css';

export default function CreatorCollaborationsPage() {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitModal, setSubmitModal] = useState(false);
  const [contentUrl, setContentUrl] = useState('');
  const [format, setFormat] = useState('VIDEO_VERTICAL');

  const load = async () => {
    try {
      const res = await api.collaborations.me();
      setCollabs(res.data?.collaborations || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (id, status) => {
    try {
      await api.collaborations.respond(id, { status });
      load();
    } catch (e) { alert(e.message); }
  };

  const handleSubmitContent = async () => {
    try {
      await api.contents.submit(selected.id, {
        url: contentUrl,
        format,
      });
      setSubmitModal(false);
      setContentUrl('');
      load();
    } catch (e) { alert(e.message); }
  };

  const FORMATS = ['VIDEO_VERTICAL','VIDEO_HORIZONTAL','UGC_TESTIMONIAL','PHOTO','CAROUSEL','STORY','REEL'];

  return (
    <div>
      <PageHeader
        title="Mes collaborations"
        subtitle="Suivez vos invitations et soumettez vos contenus"
      />

      {loading ? (
        <div className={styles.empty}>Chargement...</div>
      ) : collabs.length === 0 ? (
        <div className={styles.empty}>Aucune collaboration pour le moment</div>
      ) : (
        <div className={styles.list}>
          {collabs.map((collab) => (
            <Card key={collab.id}>
              <div className={styles.collabHeader}>
                <div>
                  <div className={styles.campaignName}>
                    {collab.campaign?.name || 'Campagne'}
                  </div>
                  <div className={styles.brandInfo}>
                    {collab.campaign?.brief?.contentFormat || 'Brief en cours'}
                  </div>
                </div>
                <Badge status={collab.status} />
              </div>

              {collab.campaign?.brief && (
                <div className={styles.brief}>
                  <div className={styles.briefLabel}>Objectifs</div>
                  <p className={styles.briefText}>{collab.campaign.brief.objectives}</p>
                </div>
              )}

              <div className={styles.contentsCount}>
                {collab.contents?.length || 0} contenu(s) soumis
              </div>

              <div className={styles.actions}>
                {collab.status === 'INVITED' && (
                  <>
                    <Button size="sm" onClick={() => handleRespond(collab.id, 'ACCEPTED')}>
                      Accepter
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleRespond(collab.id, 'DECLINED')}>
                      Decliner
                    </Button>
                  </>
                )}
                {(collab.status === 'ACCEPTED' || collab.status === 'REVISION_REQUESTED') && (
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => { setSelected(collab); setSubmitModal(true); }}
                  >
                    Soumettre un contenu
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {submitModal && (
        <Modal
          title="Soumettre un contenu"
          onClose={() => setSubmitModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSubmitModal(false)}>Annuler</Button>
              <Button onClick={handleSubmitContent} disabled={!contentUrl}>Soumettre</Button>
            </>
          }
        >
          <Input
            label="URL du contenu (Cloudinary, S3...)"
            type="url"
            placeholder="https://res.cloudinary.com/..."
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
          />
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, display: 'block', marginBottom: 4 }}>
              Format
            </label>
            <select
              style={{ height: 38, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 8, width: '100%', fontSize: 14 }}
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}