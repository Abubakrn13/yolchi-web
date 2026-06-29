import AuthGuard from '@/components/AuthGuard';
import AppNav from '@/components/AppNav';
import AppHeader from '@/components/AppHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="shell">
        <AppNav />
        <main className="shell__main">
          <AppHeader />
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
