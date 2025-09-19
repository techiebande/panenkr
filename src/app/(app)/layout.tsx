import type { ReactNode } from 'react';
import { Header } from "@/components/layout/PublicHeader";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-14">{children}</main>
    </div>
  );
}
