import { useState, useEffect } from "react";  //훅, 모듈 추가
import { group_api, problem_api, workbook_api } from "@/lib/api";

export function useDataFetch(groupId: unknown, examId: unknown, problemId: unknown) {//외부에서 groupid examid problemid를 받아서 가져옴
  const [group, setGroup] = useState(null); //각 변수에 정보들 저장
  const [exam, setExam] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState({
    group: false,
    exam: false,
    problem: false,
  });
  const [error, setError] = useState({ //오류발생시 오류상태를 저장
    group: null,
    exam: null,
    problem: null,
  });

  useEffect(() => { //groupid가 바뀔때마다 실행함 id가 없으면 return, 
    async function fetchGroup() {
      if (!groupId) return;
      setLoading((prev) => ({ ...prev, group: true }));
      try {
        const data = await group_api.group_get_by_id(Number(groupId));
        setGroup(data); //데이터 저장
        setError((prev) => ({ ...prev, group: null }));
      } catch (error) { //에러시
        console.error("!!!!!!!!그룹 정보 가져오기 실패:", error);
      }
    }
    fetchGroup();
  }, [groupId]);

  useEffect(() => { //examid갱신시 실행 
    async function fetchExam() {
      if (!examId) return; //examid가 없으면 return
      try {
        const data = await workbook_api.workbook_get_by_id(Number(examId));//api로 data불러오기
        setExam(data); //data저장
      } catch (error) {
        console.error("!!!!!!1시험 정보 가져오기 실패:", error);
      }
    }
    fetchExam();
  }, [examId]);

  useEffect(() => {
    async function fetchProblem() { //problemid갱신시 실행 
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
  return { group, exam, problem, loading, error }; // 5가지 값을 반환

}
