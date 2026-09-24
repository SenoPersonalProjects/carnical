import type { Metadata } from "next";
import "./globals.css";
import { PreferencesProvider } from "./preferences";

export const metadata: Metadata = {
  title: "Carniçal — Assistente para Vampiro V5",
  description: "Crie personagens, consulte regras e jogue Vampiro: A Máscara 5ª Edição.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased"><PreferencesProvider>{children}</PreferencesProvider></body>
    </html>
  );
}
