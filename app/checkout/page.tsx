"use client";
import { useState, useRef } from "react";
import { useCart } from "@/lib/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, ShoppingBag, MapPin, Phone, Mail, User, AtSign, Hash, Copy, Check, ImagePlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FormEvent } from "react";

const PAYMENT_METHODS = [
  {
    id: "Easypaisa",
    label: "Easypaisa",
    icon: "💚",
    number: "0315-8124382",
    accountTitle: "Zaid Azeem",
    instructions: "Send payment to this Easypaisa number, then enter your Transaction ID below.",
  },
  {
    id: "Meezan Bank",
    label: "Meezan Bank",
    icon: "🏦",
    number: "02960109592235",
    accountTitle: "Zaid Azeem",
    instructions: "Transfer to this Meezan Bank account, then enter your Transaction ID below.",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-2 text-yellow-500 hover:text-yellow-400 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    instagramId: "",
    address: "",
    city: "",
    paymentMethod: "Easypaisa",
    transactionId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [screenshot, setScreenshot] = useState("");
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const uploadScreenshot = async (file: File) => {
    setUploadingScreenshot(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingScreenshot(false);
    if (data.url) setScreenshot(data.url);
    else alert("Upload failed: " + (data.error || "Unknown error"));
  };

  const selectedPayment = PAYMENT_METHODS.find((p) => p.id === form.paymentMethod)!;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.transactionId.trim()) e.transactionId = "Transaction ID is required after payment";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter valid email";
    return e;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentScreenshot: screenshot,
          total: total(),
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.id);
        clearCart();
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const setField = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Order Confirmed!</h1>
          <p className="text-gray-400 mb-2">Thank you, <span className="text-yellow-400">{form.customerName}</span>!</p>
          <p className="text-gray-500 text-sm mb-1">Order ID: <span className="text-white font-mono text-xs">{orderId}</span></p>
          <p className="text-gray-500 text-sm mb-1">Payment: <span className="text-yellow-400">{form.paymentMethod}</span></p>
          <p className="text-gray-500 text-sm mb-8">We will verify your payment and confirm your order shortly.</p>
          <button
            onClick={() => router.push("/products")}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all text-sm"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center gap-4">
        <ShoppingBag className="w-16 h-16 text-gray-700" />
        <p className="text-gray-400">Your cart is empty</p>
        <button onClick={() => router.push("/products")} className="text-yellow-400 hover:text-yellow-300 text-sm underline">
          Browse Products
        </button>
      </div>
    );
  }

  const inputClass = (key: string) =>
    `w-full bg-[#111111] border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none transition-colors ${
      errors[key] ? "border-red-500/50" : "border-white/10 focus:border-yellow-600/50"
    }`;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 space-y-6">

              {/* Delivery Info */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <User className="w-4 h-4 text-yellow-500" /> Delivery Information
                </h2>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input type="text" value={form.customerName} onChange={(e) => setField("customerName", e.target.value)} placeholder="Your full name" className={inputClass("customerName")} />
                    </div>
                    {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input type="text" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="03001234567" className={inputClass("phone")} />
                    </div>
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Instagram ID */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Instagram ID (optional)</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input type="text" value={form.instagramId} onChange={(e) => setField("instagramId", e.target.value)} placeholder="@your_instagram" className={inputClass("instagramId")} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Email (optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="you@email.com" className={inputClass("email")} />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Full Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input type="text" value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder="House/Street/Area" className={inputClass("address")} />
                    </div>
                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">City *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input type="text" value={form.city} onChange={(e) => setField("city", e.target.value)} placeholder="Lahore, Karachi..." className={inputClass("city")} />
                    </div>
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-5">Payment Method</h2>
                <div className="space-y-3 mb-5">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        form.paymentMethod === m.id
                          ? "border-yellow-500/50 bg-yellow-500/5"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={form.paymentMethod === m.id}
                        onChange={() => setForm({ ...form, paymentMethod: m.id })}
                        className="accent-yellow-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{m.icon} {m.label}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{m.instructions}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Payment details box */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPayment.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-5"
                  >
                    <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      {selectedPayment.label} Account Details
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">Account Number</span>
                        <span className="text-white text-sm font-mono font-bold flex items-center">
                          {selectedPayment.number}
                          <CopyButton text={selectedPayment.number.replace(/-/g, "")} />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">Account Title</span>
                        <span className="text-white text-sm font-semibold">{selectedPayment.accountTitle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">Amount to Pay</span>
                        <span className="text-yellow-400 text-sm font-bold">PKR {total().toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Transaction ID */}
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Payment Transaction ID *</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="text"
                      value={form.transactionId}
                      onChange={(e) => setField("transactionId", e.target.value)}
                      placeholder="Enter transaction ID after payment"
                      className={inputClass("transactionId")}
                    />
                  </div>
                  {errors.transactionId && <p className="text-red-400 text-xs mt-1">{errors.transactionId}</p>}
                  <p className="text-gray-600 text-xs mt-1">Send the payment first, then paste your Transaction ID here</p>
                </div>

                {/* Payment Screenshot Upload */}
                <div className="mt-5">
                  <label className="block text-gray-400 text-xs mb-1.5">Payment Screenshot <span className="text-gray-600">(optional but recommended)</span></label>
                  {screenshot ? (
                    <div className="relative inline-block">
                      <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-yellow-500/30">
                        <Image src={screenshot} alt="Payment screenshot" fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setScreenshot("")}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => screenshotInputRef.current?.click()}
                      disabled={uploadingScreenshot}
                      className="w-full border-2 border-dashed border-white/10 hover:border-yellow-500/40 rounded-xl py-6 flex flex-col items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {uploadingScreenshot ? (
                        <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
                      ) : (
                        <>
                          <ImagePlus className="w-6 h-6 text-gray-600" />
                          <span className="text-gray-500 text-sm">Upload Payment Screenshot</span>
                          <span className="text-gray-700 text-xs">PNG, JPG supported</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={screenshotInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadScreenshot(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 sticky top-24">
                <h2 className="text-white font-semibold mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.svg"; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{item.name}</p>
                        <p className="text-gray-500 text-xs">x{item.quantity}</p>
                      </div>
                      <span className="text-yellow-400 text-sm font-medium">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-white">PKR {total().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Delivery</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-base font-bold mt-3">
                    <span className="text-white">Total</span>
                    <span className="text-yellow-400">PKR {total().toLocaleString()}</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-xl shadow-yellow-500/20 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Placing Order..." : "Confirm Order"}
                </motion.button>
                <p className="text-gray-600 text-xs text-center mt-3">
                  Your order will be confirmed after payment verification
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
