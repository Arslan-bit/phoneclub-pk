import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const adminPassword = process.env.ADMIN_PASSWORD;
  console.log("ENV check - ADMIN_PASSWORD set:", !!adminPassword, "length:", adminPassword?.length);
  console.log("Input length:", password?.length);

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Invalid password", debug: !adminPassword ? "ADMIN_PASSWORD env var not set" : "Password mismatch" }, { status: 401 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  const otpExpiry = Date.now() + 10 * 60 * 1000;

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
  const otpToken = await new SignJWT({ hashedOtp, otpExpiry })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(secret);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"PhoneClub Admin" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: "PhoneClub Admin OTP",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#111;color:#fff;border-radius:12px;">
        <h2 style="color:#f59e0b;margin-bottom:8px;">PhoneClub.pk Admin Access</h2>
        <p style="color:#aaa;margin-bottom:24px;">Your one-time password:</p>
        <div style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#f59e0b;text-align:center;padding:16px;background:#1a1a1a;border-radius:8px;">${otp}</div>
        <p style="color:#666;font-size:12px;margin-top:16px;text-align:center;">Expires in 10 minutes. Do not share this code.</p>
      </div>
    `,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set("otp_token", otpToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return response;
}
