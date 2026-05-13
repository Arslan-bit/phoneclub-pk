"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ShoppingCart, TrendingUp, Clock, CheckCircle, Truck, XCircle, LogOut } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  phone: string;
  instagramId: string;
  city: string;
  total: number;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  items: { quantity: number; product: { name: string } }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  confirmed: <CheckCircle className="w-3 h-3" />,
  shipped: <Truck className="w-3 h-3" />,
  delivered: <CheckCircle className="w-3 h-3" />,
  cancelled: <XCircle className="w-3 h-3" />,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([o, p]) => {
      setOrders(o);
      setProductCount(p.length);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">PhoneClub.pk — Store Management</p>
          </div>
          <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <button className="px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded-xl hover:bg-yellow-400 transition-colors">
              + Add Product
            </button>
          </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: ShoppingCart, label: "Total Orders", value: orders.length, color: "text-blue-400" },
            { icon: TrendingUp, label: "Revenue (PKR)", value: `${totalRevenue.toLocaleString()}`, color: "text-yellow-400" },
            { icon: Clock, label: "Pending Orders", value: pendingCount, color: "text-orange-400" },
            { icon: Package, label: "Total Products", value: productCount, color: "text-purple-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-[#111111] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-xs">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{loading ? "..." : value}</p>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-semibold">Recent Orders</h2>
            <span className="text-gray-500 text-xs">{orders.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Order ID", "Customer", "Instagram", "Items", "Total", "City", "Payment", "Txn ID", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-gray-600 text-xs font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {[...Array(8)].map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-white/5 rounded animate-pulse w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-600 py-12 text-sm">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 text-yellow-400 text-xs font-mono">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-xs font-medium">{order.customerName}</p>
                        <p className="text-gray-600 text-xs">{order.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {order.instagramId || <span className="text-gray-700">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {order.items.map((i) => `${i.product.name} x${i.quantity}`).join(", ").slice(0, 35)}...
                      </td>
                      <td className="px-4 py-3 text-yellow-400 text-xs font-bold">
                        PKR {order.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{order.city}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{order.paymentMethod}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                        {order.transactionId || <span className="text-gray-700">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-500/10 text-gray-400"}`}>
                          {statusIcons[order.status]}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-yellow-600/50 cursor-pointer"
                        >
                          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
