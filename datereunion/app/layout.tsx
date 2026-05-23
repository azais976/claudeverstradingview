import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DateRéunion – Rencontres & Dates en Groupe",
    template: "%s | DateRéunion",
  },
  description:
    "La plateforme de rencontres 1v1, double date et groupes made in La Réunion. Organise tes sorties, rencontre des gens près de chez toi.",
  keywords: ["rencontres", "dates", "La Réunion", "groupe", "double date", "1v1"],
  authors: [{ name: "DateRéunion" }],
  creator: "DateRéunion",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "DateRéunion",
    title: "DateRéunion – Rencontres & Dates en Groupe",
    description: "La plateforme de rencontres made in La Réunion 🌺",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DateRéunion",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: { borderRadius: "1rem", fontFamily: "var(--font-inter)" },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
