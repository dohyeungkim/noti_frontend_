import PageHeader from "@/components/Header/PageHeader";
import GroupsClient from "./client";

export default function GroupsPage() {

  return (
  <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
           <PageHeader className="animate-slide-in" />
  <GroupsClient />
</div>

  );
}
