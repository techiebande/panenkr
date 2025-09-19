import TrpcProvider from "@/lib/trpc/Provider";
import AuthProvider from "@/app/AuthProvider";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Football Predictions",
  description: "The best football predictions.",
  metadataBase: new URL("https://www.panenkr.example"),
  openGraph: {
    title: "Football Predictions",
    description: "The best football predictions.",
    url: "/",
    siteName: "Panenkr",
    type: "website",
  },
};

function orgJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Panenkr",
    url: "https://www.panenkr.example",
    logo: "/favicon.ico",
    sameAs: [
      "https://twitter.com/yourhandle",
      "https://www.facebook.com/yourpage",
      "https://www.instagram.com/yourhandle"
    ]
  };
  return JSON.stringify(data);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${display.variable}`}>
        {/* Organization JSON-LD */}
        <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: orgJsonLd() }} />
        <ThemeProvider>
          <AuthProvider>
            <TrpcProvider>
              {children}
              <Toaster richColors />
            </TrpcProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
