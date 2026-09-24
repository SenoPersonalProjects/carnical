import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
