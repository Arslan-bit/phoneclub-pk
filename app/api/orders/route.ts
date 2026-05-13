import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appendOrderToSheet } from "@/lib/googleSheets";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerName, email, phone, instagramId,
    address, city, total, paymentMethod, transactionId, items,
  } = body;

  if (!customerName || !phone || !address || !city || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      customerName,
      email: email || "",
      phone,
      instagramId: instagramId || "",
      address,
      city,
      total,
      paymentMethod: paymentMethod || "Easypaisa",
      transactionId: transactionId || "",
      items: {
        create: items.map((item: { productId: string; quantity: number; price: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  const itemsSummary = order.items
    .map((i: { product: { name: string }; quantity: number }) => `${i.product.name} x${i.quantity}`)
    .join(", ");

  appendOrderToSheet({
    id: order.id,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    instagramId: order.instagramId,
    address: order.address,
    city: order.city,
    total: order.total,
    status: order.status,
    paymentMethod: order.paymentMethod,
    transactionId: order.transactionId,
    items: itemsSummary,
    createdAt: order.createdAt.toISOString(),
  }).catch((err) => console.error("Google Sheets error:", err));

  return NextResponse.json(order, { status: 201 });
}
