import { useState, useEffect } from "react";
import { group_api, problem_api, workbook_api } from "@/lib/api";

export function useDataFetch(groupId: unknown, examId: unknown, problemId: unknown) {
  const [group, setGroup] = useState(null);
  const [exam, setExam] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState({
    group: false,
    exam: false,
    problem: false,
  });
  const [error, setError] = useState({
    group: null,
    exam: null,
    problem: null,
  });

  useEffect(() => {
    async function fetchGroup() {
      if (!groupId) return;
      setLoading((prev) => ({ ...prev, group: true }));
      try {
        const data = await group_api.group_get_by_id(Number(groupId));
        setGroup(data);
        setError((prev) => ({ ...prev, group: null }));
      } catch (error) {
        console.error("!!!!!!!!그룹 정보 가져오기 실패:", error);
      }
    }
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    async function fetchExam() {
      if (!examId) return;
      try {
        const data = await workbook_api.workbook_get_by_id(Number(examId));
        setExam(data);
      } catch (error) {
        console.error("!!!!!!1시험 정보 가져오기 실패:", error);
      }
    }
    fetchExam();
  }, [examId]);

  useEffect(() => {
    async function fetchProblem() {
      if (!problemId) return;
      try {
        const data = await problem_api.problem_get_by_id(Number(problemId));
        setProblem(data);
      } catch (error) {
        console.error("!!!!!!!!1문제 정보 가져오기 실패:", error);
      }
    }
    fetchProblem();
  }, [problemId]);

  console.log("!!!!!!!!!", group, exam, problem);
  return { group, exam, problem, loading, error };

}
