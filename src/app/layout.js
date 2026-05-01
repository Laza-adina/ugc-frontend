// src/app/layout.js
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'UGC Platform',
  description: 'Plateforme de gestion de contenus UGC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}