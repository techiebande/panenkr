"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Predictions",
    href: "/dashboard/predictions",
    icon: FileText,
  },
  {
    name: "Evaluations",
    href: "/dashboard/evaluations",
    icon: Target,
  },
  {
    name: "Articles",
    href: "/dashboard/articles",
    icon: FileText,
  },
  {
    name: "Matches",
    href: "/dashboard/matches",
    icon: Calendar,
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
              ${
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }
            `}
          >
            <item.icon
              className={`
                mr-3 h-5 w-5 flex-shrink-0
                ${
                  isActive
                    ? "text-muted-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                }
              `}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>
              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Check if user has admin/editor role
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to access the admin panel.
          </p>
          <Button onClick={() => signOut({ callbackUrl: "/" })}>
            Go back to homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Admin Panel</h2>
            </div>
            <div className="flex-1 px-4 py-4">
              <AdminNavigation />
            </div>
          </div>
        </SheetContent>

        {/* Desktop sidebar */}
          <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow border-r border-border bg-background overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-border">
              <h1 className="text-xl font-bold text-foreground">
                Admin Panel
              </h1>
            </div>
            <div className="flex-grow px-4 py-4">
              <AdminNavigation />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top navigation */}
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-background shadow border-b border-border">
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm" 
                className="px-4 border-r border-border text-muted-foreground md:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            
            <div className="flex-1 px-4 flex justify-between items-center">
              <div className="flex-1 flex">
                {/* You can add search or breadcrumbs here */}
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <UserMenu user={session.user} />
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </Sheet>
    </div>
  );
}