import { ArrowUpRight } from "lucide-react";
import canalPlusImage from "@/assets/product-canalplus.jpg";
import starlinkImage from "@/assets/product-starlink.jpg";
import electronicsImage from "@/assets/product-electronics.jpg";
import accessoriesImage from "@/assets/product-accessories.jpg";

const categories = [
  {
    title: "Canal+",
    description: "Décodeurs, télécommandes et accessoires officiels",
    image: canalPlusImage,
    count: "150+ produits",
  },
  {
    title: "Starlink",
    description: "Kits d'installation et équipements satellites",
    image: starlinkImage,
    count: "50+ produits",
  },
  {
    title: "Électronique",
    description: "Smartphones, tablettes et gadgets modernes",
    image: electronicsImage,
    count: "300+ produits",
  },
  {
    title: "Accessoires",
    description: "Câbles, chargeurs et protections",
    image: accessoriesImage,
    count: "500+ produits",
  },
];

const CategoriesSection = () => {
  return (
    <section id="categories" className="py-24 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Nos <span className="gradient-text">Catégories</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explorez notre sélection de produits premium dans chaque catégorie
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <a
              key={index}
              href="#products"
              className="group relative overflow-hidden rounded-2xl glass-card hover-lift cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs text-primary font-medium uppercase tracking-wider">
                      {category.count}
                    </span>
                    <h3 className="text-2xl font-bold text-foreground mt-1">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {category.description}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                    <ArrowUpRight className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
