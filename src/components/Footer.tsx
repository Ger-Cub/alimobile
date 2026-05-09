import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { name: "Canal+", href: "#" },
      { name: "Starlink", href: "#" },
      { name: "Électronique", href: "#" },
      { name: "Accessoires", href: "#" },
    ],
    company: [
      { name: "À propos", href: "#about" },
      { name: "Contact", href: "#contact" },
      { name: "Nos boutiques", href: "#" },
      { name: "Carrières", href: "#" },
    ],
    support: [
      { name: "FAQ", href: "#" },
      { name: "Garantie", href: "#" },
      { name: "Livraison", href: "#" },
      { name: "Retours", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <a href="#home" className="flex items-center gap-2 mb-6">
              <img 
                src="/logo-alimobile.png" 
                alt="AliMobile Logo" 
                className="w-12 h-12 object-contain"
              />
              <span className="text-xl font-bold text-foreground">
                Ali<span className="gradient-text">Mobile</span>
              </span>
            </a>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Votre partenaire de confiance pour tous vos besoins en technologie
              et connectivité depuis Goma et Bukavu.
            </p>
            <div className="space-y-3">
              <a href="tel:+243822100111" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-4 w-4 text-primary" />
                +243 822 100 111
              </a>
              <a href="mailto:christiankikuba11@gmail.com" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4 text-primary" />
                christiankikuba11@gmail.com
              </a>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Goma & Bukavu, RDC
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Produits</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Entreprise</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AliMobile. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <social.icon className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
