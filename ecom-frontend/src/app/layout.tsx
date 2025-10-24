// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./components/Providers";
import Navbar from "@/app/components/Navbar";
import { Toolbar } from "@mui/material";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "E-commerce App",
  description: "My Next.js + NestJS Shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Providers>
          <Navbar />
          <Toolbar className="mb-0"/>
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
