import { google } from "googleapis";

export async function appendOrderToSheet(order: {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  instagramId: string;
  address: string;
  city: string;
  total: number;
  status: string;
  paymentMethod: string;
  transactionId: string;
  items: string;
  createdAt: string;
}) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !rawKey || !sheetId) {
    console.error("Google Sheets env vars missing:", { email: !!email, key: !!rawKey, sheetId: !!sheetId });
    return;
  }

  // Handle both \n literal (from .env files) and actual newlines (from Vercel UI)
  const key = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const values = [[
    order.id,
    order.createdAt,
    order.customerName,
    order.phone,
    order.instagramId,
    order.email,
    order.address,
    order.city,
    order.items,
    `PKR ${order.total.toLocaleString()}`,
    order.paymentMethod,
    order.transactionId,
    order.status,
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:M",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}
