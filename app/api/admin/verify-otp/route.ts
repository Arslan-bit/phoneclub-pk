import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { otp } = await req.json();
  const otpToken = req.cookies.get("otp_token")?.value;

  if (!otpToken) {
    return NextResponse.json({ error: "OTP session expired. Please start again." }, { status: 400 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

  let payload: { hashedOtp: string; otpExpiry: number };
  try {
    const verified = await jwtVerify(otpToken, secret);
    payload = verified.payload as { hashedOtp: string; otpExpiry: number };
  } catch {
    return NextResponse.json({ error: "OTP expired. Please start again." }, { status: 400 });
  }

  if (Date.now() > payload.otpExpiry) {
    return NextResponse.json({ error: "OTP expired. Please start again." }, { status: 400 });
  }

  const inputHash = crypto.createHash("sha256").update(otp).digest("hex");
  if (inputHash !== payload.hashedOtp) {
    return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 401 });
  }

  const sessionToken = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  response.cookies.delete("otp_token");

  return response;
}
