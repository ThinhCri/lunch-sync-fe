import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, noFooter = false, title }) {
  return (
    <div className="min-h-screen bg-[#fdf9f4] font-body text-[#1c1c19] flex flex-col">
      <Header title={title} />
      <main className="flex-grow pt-20">
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}
