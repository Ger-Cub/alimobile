import { ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import canalPlusImage from "@/assets/product-canalplus.jpg";
import starlinkImage from "@/assets/product-starlink.jpg";
import electronicsImage from "@/assets/product-electronics.jpg";
import accessoriesImage from "@/assets/product-accessories.jpg";

const products = [
  {
    id: 1,
    name: "Décodeur Canal+ 4K",
    category: "Canal+",
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviews: 124,
    image: canalPlusImage,
    badge: "Best-seller",
  },
  {
    id: 2,
    name: "Kit Starlink Standard",
    category: "Starlink",
    price: 499,
    originalPrice: null,
    rating: 4.9,
    reviews: 89,
    image: starlinkImage,
    badge: "Nouveau",
  },
  {
    id: 3,
    name: "Smartphone Pro Max",
    category: "Électronique",
    price: 899,
    originalPrice: 1099,
    rating: 4.7,
    reviews: 256,
    image: electronicsImage,
    badge: "-18%",
  },
  {
    id: 4,
    name: "Pack Accessoires Premium",
    category: "Accessoires",
    price: 79,
    originalPrice: 129,
    rating: 4.6,
    reviews: 312,
    image: accessoriesImage,
    badge: "Populaire",
  },
];

const ProductsSection = () => {
  return (
    <section id="products" className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Produits <span className="gradient-text">Vedettes</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Découvrez nos produits les plus populaires, sélectionnés pour leur qualité exceptionnelle
            </p>
          </div>
          <Button variant="outline" className="mt-6 md:mt-0">
            Voir tout le catalogue
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group glass-card rounded-2xl overflow-hidden hover-lift"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Badge */}
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                  {product.badge}
                </span>

                {/* Quick Actions */}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button className="w-12 h-12 rounded-full bg-foreground/10 backdrop-blur-md border border-foreground/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors duration-300">
                    <Eye className="h-5 w-5 text-foreground" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors duration-300">
                    <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="text-xs text-primary font-medium uppercase tracking-wider">
                  {product.category}
                </span>
                <h3 className="font-semibold text-foreground mt-2 mb-3 line-clamp-1">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews} avis)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
