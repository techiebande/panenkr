// src/components/layout/Footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background text-foreground border-t border-border/60">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold">Panenkr</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              The future of football predictions.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Navigation</h3>
            <ul className="mt-4 space-y-4">
              <li><Link href="/predictions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Predictions</Link></li>
              <li><Link href="/articles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Articles</Link></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About Us</h3>
            <ul className="mt-4 space-y-4">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              {/* Add social media links here */}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border/60 pt-8">
          <p className="text-sm text-muted-foreground text-center">&copy; {new Date().getFullYear()} Panenkr. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
