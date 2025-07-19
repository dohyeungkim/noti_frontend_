// hooks/usePageInfo.ts
import { useParams, usePathname } from "next/navigation";
import { useAuth } from "@/stores/auth";

export default function usePageInfo() {
  const { groupId, examId, problemId, resultId } = useParams() as {
    groupId?: string;
    examId?: string;
    problemId?: string;
    resultId?: string;
  };
  const { userName } = useAuth();
  const pathname = usePathname();

  return { groupId, examId, problemId, resultId, userName, pathname };
}