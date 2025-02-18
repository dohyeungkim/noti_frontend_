import PageHeader from "@/components/Header/PageHeader";
import MyPage from "./myPageClient";

export default function MySolvedProblemsPage() {
  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
             <PageHeader className="animate-slide-in" />
             <MyPage />  
             </div>
  
    );
}
