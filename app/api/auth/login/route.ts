import { NextResponse } from "next/server";
import AuthService from "../auth.service";
import { loginDtoSchema } from "../dto/login.dto";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const parsed = loginDtoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const result = await AuthService.login(parsed.data.password);
  if (!result.ok) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
