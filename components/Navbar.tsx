"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Smartphone, Search } from "lucide-react";
import { useCart } from "@/lib/store";
import CartDrawer from "./CartDrawer";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { count, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/products?category=cases", label: "Cases" },
    { href: "/products?category=chargers", label: "Chargers" },
    { href: "/products?category=accessories", label: "Accessories" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-yellow-600/20 shadow-lg shadow-black/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:shadow-yellow-500/50 transition-all">
                <Smartphone className="w-4 h-4 text-black" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Phone<span className="text-yellow-400">Club</span>
                <span className="text-yellow-600">.pk</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-yellow-400 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="hidden md:flex w-8 h-8 items-center justify-center text-gray-400 hover:text-yellow-400 transition-colors">
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={toggleCart}
                className="relative flex items-center justify-center w-9 h-9 text-gray-300 hover:text-yellow-400 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {count() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {count()}
                  </motion.span>
                )}
              </button>

              <button
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 border-t border-yellow-600/20 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-gray-300 hover:text-yellow-400 py-2 text-sm font-medium border-b border-white/5 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <CartDrawer />
    </>
  );
}
