"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/predictions", label: "Predictions" },
  { href: "/articles", label: "Articles" },
  { href: "/matches", label: "Matches" },
  { href: "/about", label: "About" },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {links.map((l) => {
        const active = l.href === "/" ? pathname === "/" : (pathname === l.href || pathname.startsWith(l.href + "/"));
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onClick}
            className={`relative px-1 py-2 text-[15px] font-medium transition-all duration-300 ${
              active
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent after:content-['']"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="container mx-auto flex h-20 items-center justify-between">
        <div className="flex items-center gap-12">
          <Link 
            href="/" 
            className="group flex items-center space-x-2 transition-all duration-300 hover:scale-105"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Panenkr
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Premium
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-8 px-2">
            <NavLinks />
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button 
            asChild 
            variant="gold" 
            size="sm" 
            className="hidden sm:inline-flex"
          >
            <Link href="/subscribe">
              <span className="mr-2">✨</span>
              Get Premium
            </Link>
          </Button>
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-foreground/5">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-xl px-6">
                <div className="flex flex-col gap-6 mt-12">
                  <div className="flex flex-col gap-2">
                    <NavLinks onClick={() => {}} />
                  </div>
                  <div className="border-t border-border/40 pt-6">
                    <Button asChild variant="gold" className="w-full">
                      <Link href="/subscribe">
                        <span className="mr-2">✨</span>
                        Get Premium
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
