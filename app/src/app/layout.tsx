import type { Metadata } from "next";
import { Inter, Caveat, Permanent_Marker, Dancing_Script, Indie_Flower } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const caveat = Caveat({ subsets: ["latin"], variable: '--font-caveat' });
const permanentMarker = Permanent_Marker({ weight: '400', subsets: ["latin"], variable: '--font-permanent-marker' });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: '--font-dancing-script' });
const indieFlower = Indie_Flower({ weight: '400', subsets: ["latin"], variable: '--font-indie-flower' });

export const metadata: Metadata = {
  title: "Collaborative Notes",
  description: "Real-time collaborative note-taking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${caveat.variable} ${permanentMarker.variable} ${dancingScript.variable} ${indieFlower.variable} font-sans`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
