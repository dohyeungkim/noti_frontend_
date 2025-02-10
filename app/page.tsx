"use client";

// app/page.tsx (또는 app/page.js)
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/mypage"); // 즉시 리디렉트
}
