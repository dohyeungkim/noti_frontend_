import PageHeader from "@/components/Header/PageHeader";
import CreatePage from "./createClient";

export default function MyQuestionsPageClient() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl w-full">
        <PageHeader className="animate-slide-in" />
        <CreatePage />
      </div>
    </div>
  );
}
