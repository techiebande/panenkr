import TrpcProvider from "@/lib/trpc/Provider";
import AuthProvider from "@/app/AuthProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Football Predictions",
  description: "The best football predictions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TrpcProvider>
            {children}
            <Toaster richColors />
          </TrpcProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
