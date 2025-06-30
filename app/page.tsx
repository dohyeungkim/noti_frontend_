/**
 * 추후 MainPage 컴포넌트로 변경 예정
 * import MyPage from "@/components/MainPage/MyPage";
 * import PageHeader from "@/components/Layout/PageHeader";
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/mygroups"); // 즉시 리디렉트
}
