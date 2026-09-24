import type { Metadata } from "next";
import "./globals.css";
import { PreferencesProvider } from "./preferences";

export const metadata: Metadata = {
  title: "Noctis — Criador de Personagens V5",
  description: "Crie personagens de Vampiro: A Máscara V5 com orientação pelas regras e liberdade para homebrew.",
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
