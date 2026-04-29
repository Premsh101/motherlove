import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MotherNest – Intelligent Pregnancy Monitoring System",
  description:
    "Monitor your pregnancy with love. Track maternal & fetal health, visualize baby growth in 3D, and get AI-powered risk assessments — all in one beautiful platform.",
  keywords: [
    "pregnancy monitoring",
    "antenatal care",
    "fetal health",
    "maternal health",
    "pregnancy tracking",
    "baby growth",
    "prenatal care",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
