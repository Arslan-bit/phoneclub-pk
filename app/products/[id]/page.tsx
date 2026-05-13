"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Star, Shield, Truck, ArrowLeft, Plus, Minus } from "lucide-react";
import { useCart } from "@/lib/store";
import Link from "next/link";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  images: string;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  category: string;
  brand: string;
  stock: number;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem, toggleCart } = useCart();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="text-gray-500">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Product not found</p>
        <Link href="/products" className="text-yellow-400 hover:text-yellow-300 text-sm underline">
          Back to products
        </Link>
      </div>
    );
  }

  const images = JSON.parse(product.images) as string[];
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, image: images[0] || "/images/placeholder.png" });
    }
    toggleCart();
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/products" className="inline-flex items-center gap-1 text-gray-500 hover:text-yellow-400 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative h-96 bg-[#111111] rounded-2xl border border-white/5 overflow-hidden mb-4"
            >
              <Image
                src={images[selectedImage] || "/images/placeholder.png"}
                alt={product.name}
                fill
                className="object-contain p-8"
                onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.png"; }}
              />
              {discount > 0 && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  -{discount}%
                </span>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImage ? "border-yellow-500" : "border-white/10 hover:border-yellow-500/40"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.png"; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-yellow-600 text-xs uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="text-3xl font-bold text-white mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}`} />
                ))}
              </div>
              <span className="text-gray-500 text-sm">({product.reviewCount} reviews)</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${product.stock > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-yellow-400 text-4xl font-bold">PKR {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-gray-600 text-lg line-through">PKR {product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-8">{product.description}</p>

            {/* Brand */}
            <div className="flex gap-6 mb-8">
              <div>
                <p className="text-gray-600 text-xs mb-1">Brand</p>
                <p className="text-white text-sm font-medium">{product.brand}</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-400 text-sm">Quantity</span>
              <div className="flex items-center gap-3 bg-[#111111] border border-white/10 rounded-xl px-3 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-400 hover:text-white transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-white font-medium w-6 text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="text-gray-400 hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-xl shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm mb-4"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart — PKR {(product.price * qty).toLocaleString()}
            </motion.button>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[
                { icon: Shield, text: "Genuine Product" },
                { icon: Truck, text: "Fast Delivery" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-[#111111] rounded-xl p-3 border border-white/5">
                  <Icon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-400 text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
