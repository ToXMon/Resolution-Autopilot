import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resolution Autopilot - AI That Prevents Resolution Failure",
  description: "Custom AI agent system that prevents resolution failure through real-time behavioral pattern detection and proactive micro-interventions at decision points.",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
