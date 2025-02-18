"use client";
import ExamSidebar from "@/components/layout/ExamSidebar";
import { useExamMode } from "@/hooks/useExamMode";
import { useState } from "react";

export default function ExamSidebarWrapper() {
  const { isExamMode, groupId, examId } = useExamMode();
  const [isExamSidebarOpen, setIsExamSidebarOpen] = useState(false);

  if (!isExamMode) return null; // 시험 모드가 아니면 렌더링 안함

  return (
    <ExamSidebar
      groupId={groupId ?? "default-group"}
      examId={examId ?? "default-exam"}
      isOpen={isExamSidebarOpen}
      setIsOpen={setIsExamSidebarOpen}
    />
  );
}