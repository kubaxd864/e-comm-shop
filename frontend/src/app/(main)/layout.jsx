import Header from "@/components/header";
import Footer from "@/components/footer";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
