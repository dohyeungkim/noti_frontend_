import PageHeader from "@/components/Header/PageHeader";
import MyQuestionsPage from "./registeredPage";

export default function MyQuestionsPageClient() {
  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
             <PageHeader className="animate-slide-in" />
             <MyQuestionsPage/>  
             </div>
  
    );
}
