import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import HeroClient from "@/components/HeroClient";
import { Shield, Truck, RotateCcw, Zap, Star, ArrowRight, ChevronRight } from "lucide-react";

type FeaturedProduct = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({ where: { featured: true }, take: 8 });
  } catch {
    return [];
  }
}

const categories = [
  { name: "iPhone Cases", icon: "📱", slug: "cases", count: "50+ styles" },
  { name: "Screen Guards", icon: "🛡️", slug: "screen-guards", count: "Anti-scratch" },
  { name: "Chargers", icon: "⚡", slug: "chargers", count: "Fast charging" },
  { name: "Earphones", icon: "🎧", slug: "earphones", count: "Premium sound" },
  { name: "Power Banks", icon: "🔋", slug: "power-banks", count: "High capacity" },
  { name: "Cables", icon: "🔌", slug: "cables", count: "All types" },
];

const features = [
  { icon: Shield, title: "100% Genuine", desc: "All products are authentic and quality-tested" },
  { icon: Truck, title: "Free Delivery in 2 Days", desc: "Free nationwide delivery within just 2 working days" },
  { icon: RotateCcw, title: "Easy Return in 10 Days", desc: "10-day hassle-free return policy" },
  { icon: Zap, title: "Advance Payment", desc: "Secure advance payment via Easypaisa or Meezan Bank" },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080808] via-[#0d0d0d] to-[#080808]" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs font-medium mb-6">
                <Star className="w-3 h-3 fill-yellow-400" />
                Pakistan&apos;s #1 iPhone Accessories Store
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-white">Premium</span>
                <br />
                <span className="gold-gradient">iPhone</span>
                <br />
                <span className="text-white">Accessories</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
                Discover our premium collection of iPhone cases, chargers, screen guards, and more. Authentic products, delivered fast across Pakistan.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products">
                  <button className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-xl shadow-yellow-500/25 text-sm">
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/products?featured=true">
                  <button className="flex items-center gap-2 px-8 py-3.5 border border-yellow-600/40 text-yellow-400 font-semibold rounded-xl hover:bg-yellow-500/10 transition-all text-sm">
                    View Featured <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="flex gap-8 mt-12">
                {[
                  { value: "10K+", label: "Happy Customers" },
                  { value: "500+", label: "Products" },
                  { value: "4.9★", label: "Rating" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-yellow-400 font-bold text-2xl">{s.value}</div>
                    <div className="text-gray-600 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <HeroClient />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Shop by <span className="gold-gradient">Category</span>
            </h2>
            <p className="text-gray-500 text-sm">Find exactly what you need</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`}>
                <div className="group bg-[#111111] border border-white/5 hover:border-yellow-600/40 rounded-2xl p-5 text-center transition-all hover:bg-yellow-500/5 cursor-pointer hover:-translate-y-1 duration-300">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                  <p className="text-white text-xs font-semibold mb-1">{cat.name}</p>
                  <p className="text-gray-600 text-xs">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-20 px-4 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Featured <span className="gold-gradient">Products</span>
                </h2>
                <p className="text-gray-500 text-sm">Our best selling items</p>
              </div>
              <Link href="/products">
                <button className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors">
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product: FeaturedProduct) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#111111] border border-white/5 rounded-2xl p-6 text-center hover:border-yellow-600/30 transition-all group">
                <div className="w-12 h-12 mx-auto mb-4 bg-yellow-500/10 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-white font-semibold mb-2 text-sm">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-r from-yellow-900/20 via-yellow-800/10 to-yellow-900/20 border border-yellow-600/20 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Protect Your <span className="gold-gradient">iPhone</span> Today
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Browse 500+ premium accessories designed for iPhone. Free delivery in just 2 days across Pakistan.
            </p>
            <Link href="/products">
              <button className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-xl shadow-yellow-500/25 text-sm">
                Shop All Products
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
