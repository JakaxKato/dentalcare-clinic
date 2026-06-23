import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppFAB from './WhatsAppFAB';

const PublicLayout = () => (
  <div className="flex min-h-[100dvh] flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <WhatsAppFAB />
  </div>
);

export default PublicLayout;
