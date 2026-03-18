import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/context/ToastContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata = {
  title: 'ShopZen – Premium Ecommerce',
  description: 'Discover the best products at unbeatable prices. Shop electronics, fashion, home goods and more.',
  keywords: 'ecommerce, shop, buy online, products, best deals',
  openGraph: {
    title: 'ShopZen – Premium Ecommerce',
    description: 'Discover the best products at unbeatable prices.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
