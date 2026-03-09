import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/lib/contexts/auth.context";
import { FavoritesProvider } from "@/lib/contexts/favorites.context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bloom \u2013 Flower Marketplace",
    template: "%s | Bloom",
  },
  description:
    "Temukan rangkaian bunga terindah dari penjual terpercaya. Marketplace bunga terbaik di Indonesia.",
  metadataBase: new URL("https://bloom.id"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#fdf8f6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <FavoritesProvider>
            <a href="#main-content" className="skip-link">
              Langsung ke konten utama
            </a>
            <Navbar />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <Footer />
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
