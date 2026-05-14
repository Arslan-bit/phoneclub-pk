"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Save, Loader2, Upload, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  brand: string;
  stock: number;
  images: string;
  featured: boolean;
  badge?: string | null;
  description: string;
  rating: number;
  reviewCount: number;
}

const empty = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "cases",
  brand: "",
  stock: "",
  images: '["https://via.placeholder.com/400x400?text=Product"]',
  featured: false,
  badge: "",
  videoUrl: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingImage(false);
    if (data.url) {
      const current = JSON.parse(form.images) as string[];
      setForm({ ...form, images: JSON.stringify([...current, data.url]) });
    } else {
      alert("Upload failed: " + (data.error || "Unknown error"));
    }
  };

  const removeImage = (index: number) => {
    const current = JSON.parse(form.images) as string[];
    current.splice(index, 1);
    setForm({ ...form, images: JSON.stringify(current) });
  };

  const fetchProducts = () => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); });
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      category: p.category,
      brand: p.brand,
      stock: String(p.stock),
      images: p.images,
      featured: p.featured,
      badge: p.badge || "",
      videoUrl: (p as Product & { videoUrl?: string }).videoUrl || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      category: form.category,
      brand: form.brand,
      stock: parseInt(form.stock),
      images: form.images,
      featured: form.featured,
      badge: form.badge || null,
      videoUrl: form.videoUrl || "",
      rating: 0,
      reviewCount: 0,
    };

    if (editId) {
      await fetch(`/api/products/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setSaving(false);
    setShowForm(false);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-8 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-gray-600 hover:text-yellow-400 text-xs mb-2 block transition-colors">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-white">Products</h1>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded-xl hover:bg-yellow-400 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Product", "Category", "Price", "Stock", "Featured", "Actions"].map((h) => (
                    <th key={h} className="text-left text-gray-600 text-xs font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-white/5 rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.map((p) => {
                  const imgs = JSON.parse(p.images) as string[];
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                            <Image src={imgs[0] || "/images/placeholder.png"} alt={p.name} fill className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.png"; }} />
                          </div>
                          <div>
                            <p className="text-white text-xs font-medium">{p.name}</p>
                            <p className="text-gray-600 text-xs">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs capitalize">{p.category}</td>
                      <td className="px-4 py-3 text-yellow-400 text-xs font-bold">PKR {p.price.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${p.featured ? "text-yellow-400" : "text-gray-600"}`}>
                          {p.featured ? "★ Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-yellow-400 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-10 bg-[#111111] border border-white/10 rounded-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-lg">{editId ? "Edit Product" : "Add Product"}</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Product Name *" },
                    { key: "brand", label: "Brand *" },
                    { key: "price", label: "Price (PKR) *", type: "number" },
                    { key: "originalPrice", label: "Original Price (PKR)" , type: "number" },
                    { key: "stock", label: "Stock *", type: "number" },
                    { key: "badge", label: "Badge (New/Hot/Sale)" },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-gray-400 text-xs mb-1.5">{label}</label>
                      <input
                        type={type || "text"}
                        value={(form as Record<string, unknown>)[key] as string}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-600/50"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-600/50 cursor-pointer"
                    >
                      {["cases", "screen-guards", "chargers", "earphones", "power-banks", "cables", "accessories"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-5">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="accent-yellow-500 w-4 h-4"
                    />
                    <label htmlFor="featured" className="text-gray-400 text-sm">Featured on homepage</label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-400 text-xs mb-1.5">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-600/50 resize-none"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-400 text-xs mb-1.5">YouTube Video URL <span className="text-gray-600">(optional)</span></label>
                  <input
                    type="url"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-600/50"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-400 text-xs mb-1.5">Product Images</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {(JSON.parse(form.images) as string[]).map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group">
                        <Image src={url} alt="" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 hover:border-yellow-500/50 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                      ) : (
                        <>
                          <ImagePlus className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-600 text-xs">Upload</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file);
                      e.target.value = "";
                    }}
                  />
                  <p className="text-gray-600 text-xs">Click the + box to upload images. Hover an image to remove it.</p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-black text-sm font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
