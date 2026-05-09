import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, Phone, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", href: "#home" },
    { name: "Produits", href: "#products" },
    { name: "Catégories", href: "#categories" },
    { name: "À Propos", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <img 
              src="/logo-alimobile.png" 
              alt="AliMobile Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl font-bold text-foreground">
              Ali<span className="gradient-text">Mobile</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="border-primary/20 hover:bg-primary/10 text-primary"
              onClick={() => navigate("/dashboard/login")}
            >
              Connexion
            </Button>
            <Button variant="hero" size="lg">
              <Phone className="h-4 w-4" />
              Nous Contacter
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 z-50 bg-background flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-semibold text-foreground border-b border-border pb-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground font-medium">Changer le thème</span>
                <ThemeToggle />
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-center gap-2 py-6 text-lg border-primary/20"
                  onClick={() => {
                    navigate("/dashboard/login");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <UserCircle className="h-5 w-5" />
                  Espace Admin
                </Button>
                <Button variant="hero" className="w-full justify-center py-6 text-lg">
                  <Phone className="h-5 w-5" />
                  Nous Contacter
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
