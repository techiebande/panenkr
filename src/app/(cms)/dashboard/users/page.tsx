import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Only ADMIN can manage users
  if (session.user.role !== "ADMIN") {
    return (
      <div className="p-4 sm:p-8">
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only administrators can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions.</p>
        </div>
        <Button disabled>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Including you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-sm">
              {session.user.role}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            User Management - Coming Soon
          </CardTitle>
          <CardDescription>
            Comprehensive user and role management system for your football predictions platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              User Management System
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Here you&apos;ll be able to manage all users, assign roles, handle permissions,
              and monitor user activity. This feature is under development.
            </p>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Planned features:</p>
              <ul className="text-left inline-block">
                <li>• View all registered users</li>
                <li>• Assign roles (USER, EDITOR, ADMIN)</li>
                <li>• Manage user permissions</li>
                <li>• User activity monitoring</li>
                <li>• Bulk user operations</li>
                <li>• User registration analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}