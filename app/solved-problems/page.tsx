import PageHeader from "@/components/Header/PageHeader";
import MySolvedProblemsClient from "./SolvedClient";

export default function MySolvedProblems() {
  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
             <PageHeader className="animate-slide-in" />
             <MySolvedProblemsClient />  
             </div>
  
    );
}
