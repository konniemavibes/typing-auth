import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: 'ASYV typing - Speed Test & Typing Practice',
    template: '%s | Typing Test'
  },
  description: 'Improve your typing speed and accuracy with our free typing test. Practice your keyboard skills with real-time feedback and track your progress.',
  keywords: ['typing test', 'typing speed', 'typing practice', 'keyboard skills', 'wpm test', 'typing tutor'],
  authors: [{ name: 'konnie' }],
  openGraph: {
    title: 'Typing - Free Online Typing Speed Test',
    description: 'Measure and improve your typing speed with our interactive typing practice tool. Get real-time results and track your progress!',
    url: 'https://asyvtyping.vercel.app',
    siteName: 'Typing Boi',
    images: [
      {
        url: 'https://asyvtyping.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Typing - Free Online Typing Speed Test',
    description: 'Test and improve your typing speed with instant results!',
    images: ['https://asyvtyping.vercel.app/twitter-image.png'],
  },
  alternates: {
    canonical: 'https://asyvtyping.vercel.app',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${dmSans.variable} ${dmSans.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}