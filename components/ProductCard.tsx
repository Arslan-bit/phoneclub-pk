"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Zap } from "lucide-react";
import { useCart } from "@/lib/store";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  images: string;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  category: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, toggleCart } = useCart();
  const images = JSON.parse(product.images) as string[];
  const image = images[0] || "/images/placeholder.png";
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id: product.id, name: product.name, price: product.price, image });
    toggleCart();
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative"
    >
      <Link href={`/products/${product.id}`}>
        <div className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5 hover:border-yellow-600/40 transition-all duration-300 shadow-xl hover:shadow-yellow-500/10">
          {/* Image */}
          <div className="relative h-52 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] overflow-hidden">
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/placeholder.png";
              }}
            />
            {/* Badge */}
            {product.badge && (
              <span className={`absolute top-3 left-3 px-2 py-0.5 text-xs font-bold rounded-full ${
                product.badge === "Sale"
                  ? "bg-red-500 text-white"
                  : product.badge === "New"
                  ? "bg-blue-500 text-white"
                  : "bg-yellow-500 text-black"
              }`}>
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{product.category}</p>
            <h3 className="text-white text-sm font-semibold line-clamp-2 mb-2 group-hover:text-yellow-400 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}`}
                />
              ))}
              <span className="text-gray-600 text-xs ml-1">({product.reviewCount})</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-yellow-400 font-bold text-lg">
                  PKR {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-gray-600 text-xs line-through ml-2">
                    PKR {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                className="w-8 h-8 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full flex items-center justify-center transition-colors shadow-lg shadow-yellow-500/30"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
