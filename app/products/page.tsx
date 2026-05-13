"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "next/navigation";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { Suspense } from "react";

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

const categories = ["all", "cases", "screen-guards", "chargers", "earphones", "power-banks", "cables", "accessories"];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (category && category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      if (sort) params.set("sort", sort);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [category, search, sort]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            All <span className="gold-gradient">Products</span>
          </h1>
          <p className="text-gray-500 text-sm">{products.length} products found</p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-600/50"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-600/50 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                category === cat
                  ? "bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/25"
                  : "bg-[#111111] text-gray-400 hover:text-white border border-white/10 hover:border-yellow-600/30"
              }`}
            >
              {cat === "all" ? "All Products" : cat.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#111111] rounded-2xl h-72 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-lg">No products found</p>
            <button
              onClick={() => { setCategory("all"); setSearch(""); }}
              className="mt-4 text-yellow-400 hover:text-yellow-300 text-sm underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-gray-400">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
