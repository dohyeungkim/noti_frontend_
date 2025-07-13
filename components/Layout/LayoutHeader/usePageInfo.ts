// hooks/usePageInfo.ts
import { useParams, usePathname } from "next/navigation"; //모듈, 훅 추가
import { useAuth } from "@/stores/auth";

export default function usePageInfo() { //훅을 다론곳에서 수용할 수 있게..
  const { groupId, examId, problemId, resultId } = useParams() as { //groupid, examid...추출
    groupId?: string;
    examId?: string;
    problemId?: string;
    resultId?: string;
  };
  const { userName } = useAuth(); //사용자 이름추출
  const pathname = usePathname(); //경로 추출

  return { groupId, examId, problemId, resultId, userName, pathname }; //6가지 정보 반환
}