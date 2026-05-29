import type {Metadata} from 'next';
import { Inter, Lora, Poppins, Fredoka } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Evangelho no Lar — Guia de Luz e Paz',
  description: 'Um guia interativo e meditativo para a realização do Evangelho no Lar.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${lora.variable} ${poppins.variable} ${fredoka.variable}`}>
      <body suppressHydrationWarning className="font-sans bg-[#FAF8F5] text-[#2D2B2A] antialiased min-h-screen selection:bg-amber-100 selection:text-[#5F4628]">
        {children}
      </body>
    </html>
  );
}
