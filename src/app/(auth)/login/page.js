// src/app/(auth)/login/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.auth.login(form);
      const data = res?.data ?? res;
      const user = data?.user ?? res?.user;
      const tokens = data?.tokens ?? res?.tokens ?? data;
      login(user, tokens);
      if (user?.role === "AGENCY") router.replace("/agency/dashboard");
      else if (user?.role === "CREATOR") router.replace("/creator/dashboard");
      else router.replace("/login");
    } catch (err) {
      setError(err.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>UGCPlatform</div>
        <h1 className={styles.title}>Connexion</h1>
        <p className={styles.subtitle}>Acces a votre espace de gestion UGC</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}
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
            placeholder="Votre mot de passe"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" full disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <p className={styles.link}>
          Pas encore de compte ? <Link href="/register">Creer un compte</Link>
        </p>
      </div>
    </div>
  );
}
