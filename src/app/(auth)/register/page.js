// src/app/(auth)/register/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '', password: '', role: 'AGENCY',
    firstName: '', lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    
    e.preventDefault();
    console.log("FRONTEND DATA:", JSON.stringify(form, null, 2));
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.register(form);
      login(res.data.user, res.data.tokens);
      if (res.data.user.role === 'AGENCY') router.replace('/agency/dashboard');
      else router.replace('/creator/dashboard');
    } catch (err) {
      setError(err.message || 'Erreur lors de la creation du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>UGCPlatform</div>
        <h1 className={styles.title}>Creer un compte</h1>
        <p className={styles.subtitle}>Rejoignez la plateforme UGC</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.roleToggle}>
            {['AGENCY', 'CREATOR'].map((r) => (
              <button
                key={r}
                type="button"
                className={`${styles.roleBtn} ${form.role === r ? styles.roleBtnActive : ''}`}
                onClick={() => setForm({ ...form, role: r })}
              >
                {r === 'AGENCY' ? 'Agence' : 'Createur'}
              </button>
            ))}
          </div>

          <div className={styles.row}>
            <Input
              label="Prenom"
              placeholder="Jean"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="Nom"
              placeholder="Dupont"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <Input
            label="Adresse email"
            type="email"
            placeholder="vous@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="Min. 8 caracteres avec majuscule et special"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" full disabled={loading}>
            {loading ? 'Creation...' : 'Creer mon compte'}
          </Button>
        </form>

        <p className={styles.link}>
          Deja un compte ? <Link href="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}