import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartToast from '@/components/cart/CartToast';

export default function StorefrontLayout({ children }) {
  return (
    <>
      <Header />
      <CartToast />
      <main>{children}</main>
      <Footer />
    </>
  );
}
