"use client";
/**
 * 해당 그룹에 존재하는 학생들 리스트 랜더링
 * -> 이름 (학번)  o x o x o  (2/5 검토)
 *
 * 해당 문제지의 모든 제출(problem_id, score, reviewed) 받아온 후 학생 별로 묶어서 각 행별로 랜더링
 */

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { group_api, grading_api } from "@/lib/api";
import type { SubmissionSummary } from "@/lib/api";

interface GradingStudentSummary {
  studentId: string;
  studentName: string;
  problemScores: (number | null)[];
  problemStatus: boolean[];
}

export default function GradingListPage() {
  const router = useRouter();
  const { userName } = useAuth();
  const { groupId, examId } = useParams<{ groupId: string; examId: string }>();

  // 그룹장 여부
  const [groupOwner, setGroupOwner] = useState<string | null>(null);
  const isGroupOwner = userName === groupOwner;

  // 학생별 요약 데이터
  const [students, setStudents] = useState<GradingStudentSummary[]>([]);

  // 1) 그룹장 정보 조회
  const fetchOwner = useCallback(async () => {
    try {
      const groups: Array<{ group_id: number; group_owner: string }> =
        await group_api.my_group_get();
      const group = groups.find((g) => g.group_id === Number(groupId));
      setGroupOwner(group?.group_owner ?? null);
    } catch (err) {
      console.error("그룹장 정보 로드 실패", err);
    }
  }, [groupId]);

  // 2) 전체 제출 조회 → 학생별 그룹핑 (학생이 제출한 문제 수만큼 컬럼 생성)
  const fetchSubmissions = useCallback(async () => {
    try {
      const subs: SubmissionSummary[] = await grading_api.get_all_submissions(
        Number(groupId),
        Number(examId)
      );

      // user_id 기준으로 묶기
      const byUser = new Map<string, { name: string; items: SubmissionSummary[] }>();
      for (const s of subs) {
        if (!byUser.has(s.user_id)) {
          byUser.set(s.user_id, { name: s.user_name, items: [] });
        }
        byUser.get(s.user_id)!.items.push(s);
      }

      // 학생별 요약(해당 학생이 제출한 문제만 표시)
      const rows: GradingStudentSummary[] = [];
      byUser.forEach(({ name, items }, user_id) => {
        // 보기 좋게 problem_id 오름차순(원하면 정렬 제거 가능)
        items.sort((a, b) => a.problem_id - b.problem_id);

        rows.push({
          studentId: user_id,
          studentName: name,
          problemScores: items.map((it) => it.score ?? null),
          problemStatus: items.map((it) => Boolean(it.reviewed)),
        });
      });

      setStudents(rows);
    } catch (err) {
      console.error("제출 목록 로드 실패", err);
    }
  }, [groupId, examId]);

  // 마운트 시 데이터 로드
  useEffect(() => {
    fetchOwner();
    fetchSubmissions();
  }, [fetchOwner, fetchSubmissions]);

  // 학생 클릭 → 상세 페이지
  const selectStudent = (studentId: string) => {
    router.push(`/mygroups/${groupId}/exams/${examId}/grading/${studentId}`);
  };

  return (
    <div className="pb-10">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">학생 제출물 채점</h1>
      </div>

      {/* 학생 리스트 */}
      <div className="mb-8">
        {students.map((stu) => (
          <motion.div
            key={stu.studentId}
            onClick={(e) => {
              e.stopPropagation();
              selectStudent(stu.studentId);
            }}
            className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-1/4 font-medium text-lg">
              {stu.studentName} ( {stu.studentId} )
            </div>
            <div className="flex-grow flex items-center">
              <div className="flex space-x-2 mr-6">
                {stu.problemScores.map((score, idx) => (
                  <div key={idx} className="w-10 h-10 flex items-center justify-center">
                    <span
                      className={`text-sm font-medium ${
                        score == null ? "text-gray-400" : "text-blue-600"
                      }`}
                    >
                      {score ?? "-"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                {stu.problemStatus.map((ok, idx) => (
                  <div
                    key={idx}
                    className={`w-8 h-8 rounded-full border-2 ${
                      ok ? "bg-green-500 border-green-600" : "bg-gray-200 border-gray-300"
                    } flex items-center justify-center`}
                  >
                    {ok && <span className="text-white text-xs">✓</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-24 text-right">
              {stu.problemStatus.every((s) => s) ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  채점 완료
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  {stu.problemStatus.filter((s) => s).length}/{stu.problemStatus.length} 완료
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
