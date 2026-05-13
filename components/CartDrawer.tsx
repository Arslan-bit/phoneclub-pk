"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#0d0d0d] border-l border-yellow-600/20 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-yellow-400" />
                <h2 className="text-white font-semibold text-lg">Cart ({items.length})</h2>
              </div>
              <button
                onClick={toggleCart}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <ShoppingBag className="w-16 h-16 text-gray-700" />
                  <p className="text-gray-500 text-sm">Your cart is empty</p>
                  <button
                    onClick={toggleCart}
                    className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-3 bg-white/5 rounded-xl p-3"
                  >
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/placeholder.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-yellow-400 text-sm font-bold mt-0.5">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-yellow-500/20 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-yellow-500/20 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors self-start"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="text-yellow-400 text-xl font-bold">
                    PKR {total().toLocaleString()}
                  </span>
                </div>
                <Link href="/checkout" onClick={toggleCart}>
                  <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-500/20 text-sm">
                    Proceed to Checkout
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
