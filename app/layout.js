import { Bricolage_Grotesque } from 'next/font/google';
import Nav from '@/components/Nav';
import './globals.css';

const font = Bricolage_Grotesque({ subsets: ['latin'] });

export const metadata = { title: 'myShop', description: 'Online store' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
