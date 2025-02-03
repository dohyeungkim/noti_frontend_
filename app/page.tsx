import { redirect } from "next/navigation";

export default function Home() {
  redirect("/groups"); // 그룹 페이지로 리다이렉트
}
