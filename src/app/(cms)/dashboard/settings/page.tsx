import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, User, Bell, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    return (
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access settings.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences.</p>
      </div>

      {/* Profile Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your basic account information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-sm text-gray-900">{session.user.name || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900">{session.user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <div>
                <Badge variant="default">{session.user.role}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <p className="text-xs text-gray-500 font-mono">{session.user.id}</p>
            </div>
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button disabled variant="outline">
              Edit Profile (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how you want to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Notification settings will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      {session.user.role === "ADMIN" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage security settings and privacy options.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Shield className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-4">
                Security settings will be available soon.
              </p>
              <div className="text-xs text-gray-500">
                <p className="mb-2">Planned features:</p>
                <ul className="text-left inline-block">
                  <li>• Two-factor authentication</li>
                  <li>• Password change</li>
                  <li>• Active sessions management</li>
                  <li>• Account security logs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Settings */}
      {session.user.role === "ADMIN" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Application Settings
            </CardTitle>
            <CardDescription>
              System-wide configuration and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Database className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-4">
                Application settings will be available soon.
              </p>
              <div className="text-xs text-gray-500">
                <p className="mb-2">Planned features:</p>
                <ul className="text-left inline-block">
                  <li>• Site configuration</li>
                  <li>• Default user roles</li>
                  <li>• Email templates</li>
                  <li>• API rate limits</li>
                  <li>• Backup settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}