import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
  }

  const cloud = new FormData();
  cloud.append("file", file);
  cloud.append("upload_preset", uploadPreset);
  cloud.append("folder", "phoneclub-products");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: cloud,
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.error?.message || "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ url: data.secure_url });
}
