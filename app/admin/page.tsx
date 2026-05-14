"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ShoppingCart, TrendingUp, Clock, CheckCircle, Truck, XCircle, LogOut, Printer } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  instagramId: string;
  address: string;
  city: string;
  total: number;
  status: string;
  paymentMethod: string;
  transactionId: string;
  paymentScreenshot: string;
  createdAt: string;
  items: { quantity: number; price: number; product: { name: string } }[];
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

const TABS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

function orderHTML(order: Order) {
  const items = order.items.map((i) => `${i.product.name} x${i.quantity} — PKR ${(i.price * i.quantity).toLocaleString()}`).join("\n");
  return `
    <div class="page">
      <h1>PhoneClub.pk — Shipping Label</h1>
      <p class="meta">Order ID: ${order.id} &nbsp;|&nbsp; Date: ${new Date(order.createdAt).toLocaleDateString("en-PK")} &nbsp;|&nbsp; Status: ${order.status.toUpperCase()}</p>
      <div class="divider"></div>
      <div class="label">Customer Name</div><div class="value">${order.customerName}</div>
      <div class="label">Phone</div><div class="value">${order.phone}</div>
      ${order.instagramId ? `<div class="label">Instagram</div><div class="value">${order.instagramId}</div>` : ""}
      ${order.email ? `<div class="label">Email</div><div class="value">${order.email}</div>` : ""}
      <div class="label">Delivery Address</div><div class="value">${order.address}, ${order.city}</div>
      <div class="divider"></div>
      <div class="label">Items Ordered</div>
      <div class="items">${items}</div>
      <div class="divider"></div>
      <div class="label">Payment Method</div><div class="value">${order.paymentMethod}</div>
      <div class="label">Transaction ID</div><div class="value">${order.transactionId || "—"}</div>
      <div class="label">Total Amount</div><div class="total">PKR ${order.total.toLocaleString()}</div>
      <div class="divider"></div>
      <div class="footer">PhoneClub.pk — Premium iPhone & Mobile Accessories</div>
    </div>
  `;
}

const printStyles = `
  <style>
    body { font-family: Arial, sans-serif; color: #000; margin: 0; }
    .page { padding: 32px; page-break-after: always; }
    .page:last-child { page-break-after: avoid; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 0; }
    .label { font-size: 11px; color: #666; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .value { font-size: 14px; font-weight: bold; margin-top: 2px; }
    .divider { border-top: 1px solid #ddd; margin: 16px 0; }
    .items { white-space: pre-line; font-size: 13px; line-height: 1.8; }
    .total { font-size: 18px; font-weight: bold; }
    .footer { margin-top: 24px; font-size: 11px; color: #999; text-align: center; }
    @media print { .page { padding: 24px; } }
  </style>
`;

function printOrder(order: Order) {
  const win = window.open("", "_blank", "width=650,height=750");
  if (!win) return;
  win.document.write(`<html><head><title>Order #${order.id.slice(0, 8)}</title>${printStyles}</head><body>${orderHTML(order)}<script>window.onload=()=>window.print()<\/script></body></html>`);
  win.document.close();
}

function printAllOrders(orders: Order[], label: string) {
  if (orders.length === 0) return;
  const win = window.open("", "_blank", "width=650,height=750");
  if (!win) return;
  const body = orders.map(orderHTML).join("");
  win.document.write(`<html><head><title>${label} Orders — PhoneClub.pk</title>${printStyles}</head><body>${body}<script>window.onload=()=>window.print()<\/script></body></html>`);
  win.document.close();
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

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

  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const filteredOrders = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  const tabCount = (tab: string) => tab === "all" ? orders.length : orders.filter((o) => o.status === tab).length;

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-8 px-4 pb-20">
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
            { icon: TrendingUp, label: "Revenue (PKR)", value: totalRevenue.toLocaleString(), color: "text-yellow-400" },
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

        {/* Orders Section */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">

          {/* Status Tabs */}
          <div className="p-4 border-b border-white/5 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? tab === "all" ? "bg-white/10 text-white"
                        : tab === "pending" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : tab === "confirmed" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : tab === "shipped" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : tab === "delivered" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {tab === "pending" && <Clock className="w-3 h-3" />}
                  {tab === "confirmed" && <CheckCircle className="w-3 h-3" />}
                  {tab === "shipped" && <Truck className="w-3 h-3" />}
                  {tab === "delivered" && <CheckCircle className="w-3 h-3" />}
                  {tab === "cancelled" && <XCircle className="w-3 h-3" />}
                  {tab}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab ? "bg-white/20" : "bg-white/5"}`}>
                    {loading ? "—" : tabCount(tab)}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <button
                onClick={() => printAllOrders(filteredOrders, activeTab === "all" ? "All" : activeTab)}
                disabled={filteredOrders.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black text-xs font-bold rounded-xl transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print All {activeTab === "all" ? "" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders ({loading ? "..." : filteredOrders.length})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Order ID", "Customer", "Items", "Total", "City", "Payment", "Txn ID", "Status", "Update", "Print"].map((h) => (
                    <th key={h} className="text-left text-gray-600 text-xs font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {[...Array(10)].map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-white/5 rounded animate-pulse w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-600 py-16 text-sm capitalize">
                      No {activeTab === "all" ? "" : activeTab} orders yet
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 text-yellow-400 text-xs font-mono">{order.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3">
                        <p className="text-white text-xs font-medium">{order.customerName}</p>
                        <p className="text-gray-600 text-xs">{order.phone}</p>
                        {order.instagramId && <p className="text-gray-600 text-xs">{order.instagramId}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[180px]">
                        {order.items.map((i) => `${i.product.name} x${i.quantity}`).join(", ").slice(0, 50)}
                        {order.items.map((i) => `${i.product.name} x${i.quantity}`).join(", ").length > 50 ? "..." : ""}
                      </td>
                      <td className="px-4 py-3 text-yellow-400 text-xs font-bold whitespace-nowrap">PKR {order.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{order.city}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{order.paymentMethod}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                        <div>{order.transactionId || <span className="text-gray-700">—</span>}</div>
                        {order.paymentScreenshot && (
                          <a href={order.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 text-xs underline mt-1 block">
                            Screenshot
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-500/10 text-gray-400"}`}>
                          {statusIcons[order.status]}{order.status}
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
                      <td className="px-4 py-3">
                        <button
                          onClick={() => printOrder(order)}
                          title="Print shipping label"
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs rounded-lg transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print
                        </button>
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
