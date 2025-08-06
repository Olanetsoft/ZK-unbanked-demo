import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZK Identity for the Unbanked | Self Protocol Demo",
  description:
    "Building sybil-resistant financial systems without KYC. Privacy-preserving identity for 1 billion unbanked people.",
  keywords:
    "zero knowledge, identity, unbanked, DeFi, Self Protocol, privacy, blockchain",
  authors: [{ name: "ZK Identity Team" }],
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "ZK Identity for the Unbanked",
    description: "Financial freedom through privacy-preserving identity",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZK Identity for the Unbanked",
    description: "Financial freedom through privacy-preserving identity",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
