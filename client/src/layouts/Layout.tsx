import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      {/* Ми ПРИБРАЛИ тут 'container mx-auto', 
         щоб LandingPage.tsx міг займати 100% ширини.
         Тепер відступи треба додавати всередині кожної сторінки окремо.
      */}
      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
}