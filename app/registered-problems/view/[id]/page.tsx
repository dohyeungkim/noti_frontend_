import PageHeader from "@/components/Header/PageHeader";
import ViewQuestionPage from "./viewClient";

export default function ViewQuestionPageClient() {
  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
             <PageHeader className="animate-slide-in" />
             <ViewQuestionPage></ViewQuestionPage>
             </div>
  
    );
}
