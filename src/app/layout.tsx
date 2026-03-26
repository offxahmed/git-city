import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Git City — 3D GitHub Profile Visualization",
  description: "Every GitHub developer is a building in a vibrant 3D city. Your contributions shape the skyline.",
  keywords: ["github", "3d", "visualization", "developer", "open source", "city"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
