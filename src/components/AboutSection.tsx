import { CheckCircle2, MapPin, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Produits Authentiques",
    description: "100% produits originaux avec garantie officielle",
  },
  {
    icon: Clock,
    title: "Livraison Rapide",
    description: "Service de livraison express dans toute la RDC",
  },
  {
    icon: MapPin,
    title: "Présence Locale",
    description: "Boutiques physiques à Goma et Bukavu",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-[80px]" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              À propos de nous
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6">
              Votre partenaire tech de{" "}
              <span className="gradient-text">confiance</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              AliMobile est votre destination privilégiée pour tous vos besoins en technologie
              et connectivité. Basés à Goma et Bukavu, nous servons des clients à travers
              le monde avec des produits de qualité premium.
            </p>

            {/* Features List */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mt-10">
              {["Canal+ Certifié", "Starlink Autorisé", "Service 24/7"].map(
                (badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{badge}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="relative">
            <div className="glass-card rounded-3xl p-8 md:p-12 glow-effect">
              <div className="grid grid-cols-2 gap-8">
                {[
                  { value: "5+", label: "Années d'expérience" },
                  { value: "10K+", label: "Produits vendus" },
                  { value: "2", label: "Boutiques" },
                  { value: "98%", label: "Clients satisfaits" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-2xl blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-2xl blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
