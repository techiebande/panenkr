// src/components/layout/Header.tsx
import Link from "next/link";
import AuthButton from "@/features/auth/AuthButton";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-foreground">
              Panenkr
            </Link>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/predictions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Predictions
            </Link>
            <Link href="/articles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Articles
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
