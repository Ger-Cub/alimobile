import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ProductsSection from "@/components/ProductsSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AliMobile - Accessoires Canal+, Starlink & Électronique | Goma & Bukavu</title>
        <meta
          name="description"
          content="AliMobile, votre destination premium pour les accessoires Canal+, équipements Starlink et appareils électroniques à Goma et Bukavu. Livraison mondiale."
        />
        <meta
          name="keywords"
          content="Canal+, Starlink, électronique, accessoires, Goma, Bukavu, RDC, téléphone, smartphone"
        />
        <link rel="canonical" href="https://alimobile.com" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <CategoriesSection />
          <ProductsSection />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
