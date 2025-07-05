import { compareSync } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'

/**
 * This function is used to authenticate the user
 * 
 * @param request body: { password: string }
 * @returns The token used to authenticate the user
 */
export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!process.env.MASTER_PASSWORD || !process.env.JWT_SECRET) {
    const body = { message: "No master password or jwt secret set" };
    return new NextResponse(JSON.stringify(body), {
      status: 500,
    });
  }

  if (!password) {
    const body = { message: "No password given" };
    return new NextResponse(JSON.stringify(body), {
      status: 400,
    });
  }

  if (!compareSync(password, process.env.MASTER_PASSWORD)) {
    const body = { message: "Password don't match" };
    return new NextResponse(JSON.stringify(body), {
      status: 401,
    });
  }
  const token = jwt.sign({ authenticated: true }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return NextResponse.json(token)
}