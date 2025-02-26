import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "로그인 화면으로 이동합니다." });
  response.cookies.set("access_token", "", { maxAge: 0 });
  return response;
}
