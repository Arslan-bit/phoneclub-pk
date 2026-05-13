import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (featured === "true") where.featured = true;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { brand: { contains: search } },
    ];
  }

  const orderBy: Record<string, string> =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
      ? { price: "desc" }
      : sort === "rating"
      ? { rating: "desc" }
      : { createdAt: "desc" };

  const products = await prisma.product.findMany({ where, orderBy });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const product = await prisma.product.create({ data: body });
  return NextResponse.json(product, { status: 201 });
}
