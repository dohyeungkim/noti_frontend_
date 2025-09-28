"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import ProblemSelector from "@/components/ProblemPage/ProblemModal/ProblemSelectorModal";
import OpenModalButton from "@/components/ui/OpenModalButton";
import SearchBar from "@/components/ui/SearchBar";
import ViewToggle from "@/components/ui/ViewToggle";
import ProblemGallery from "@/components/ProblemPage/ProblemGallery";
import { motion } from "framer-motion";
import ProblemList from "./ProblemList";
import { useAuth } from "@/stores/auth";
import { group_api, problem_ref_api, workbook_api } from "@/lib/api";
import { Calendar, FileCheck } from "lucide-react"; // Lucide 아이콘 추가
import { useRouter } from "next/navigation"; // useRouter 추가



interface ProblemRef {
  problem_id: number;
  title: string;
  description: string;
  problemType: string;
  attempt_count: number; // 리스트뷰에만 UI상으로 존재 👻
  pass_count: number; // 리스트뷰에만 UI상으로 존재 👻
  points: number;
  // is_like: boolean
}

// 게시기간 띄워야됨
type Workbook = {
  workbook_id: number;
  group_id: number;
  workbook_name: string;
  problem_cnt: number;
  description: string;
  creation_date: string;
  // 시험모드 관련 필드 추가
  is_test_mode: boolean;
  test_start_time: any;
  test_end_time: any;
  publication_start_time: any;
  publication_end_time: any;
  workbook_total_points: number;
};

export default function ProblemStructure({
  params,
}: {
  params: { groupId: string; examId: string };
}) {
  const router = useRouter(); // useRouter 훅 사용
  // 게시기간 띄워야됨.
  const [workbook, setWorkbook] = useState<Workbook | null>(null); // workbook_get으로 받은 정보가 여기 workbook에 저장됨
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<ProblemRef[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<ProblemRef[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // const [viewMode, setViewMode] = useState<"gallery" | "table">("table")
  const { groupId, examId } = params; // 현재 문제지
  const { userId } = useAuth();

  const numericGroupId = useMemo(() => Number(groupId), [groupId]);
  const numericExamId = useMemo(() => Number(examId), [examId]);

  const [refresh, setRefresh] = useState(false);

  // 그룹 오너 정보 상태
  const [groupOwner, setGroupOwner] = useState<string | null>(null);
  const isGroupOwner = userId === groupOwner;

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 그룹 오너 정보 가져오기
  const fetchMyOwner = useCallback(async () => {
    try {
      const data = await group_api.my_group_get();
      const currentGroup = data.find(
        (group: { group_id: number; group_owner: string }) =>
          group.group_id === Number(groupId)
      );
      setGroupOwner(currentGroup?.group_owner || null);
    } catch (error) {
      console.error("그룹장 불러오기 중 오류:", error);
    }
  }, [groupId]);

  // 문제지 - 기간 관련 정보 받아와야됨.
  const fetchWorkbook = useCallback(async () => {
    try {
      const wb = await workbook_api.workbook_get_by_id(numericExamId); // <- 실제 함수명에 맞춰 수정
      setWorkbook(wb);
    } catch (e) {
      console.error("문제지 정보 불러오기 실패:", e);
      setWorkbook(null);
    }
  }, [numericExamId]);

  useEffect(() => {
    fetchWorkbook();
  }, [fetchWorkbook]);

  const fetchProblems = useCallback(async () => {
    try {
      const data = await problem_ref_api.problem_ref_get(
        numericGroupId,
        numericExamId
      );
      const adapted: ProblemRef[] = (Array.isArray(data) ? data : []).map(
        adaptProblemRef
      );
      setSelectedProblems(adapted);
      setFilteredProblems(adapted);
    } catch (error) {
      console.error("문제 불러오기 중 오류 발생:", error);
    }
  }, [numericGroupId, numericExamId]);

  const normalizeProblemType = (v?: string) => {
    const s = (v ?? "").toLowerCase().trim();
    switch (s) {
      case "코딩":
      case "디버깅":
      case "객관식":
      case "단답형":
      case "주관식":
        return v!;
      default:
        return "-"; // 미확인 값
    }
  };

  // 응답이 어떤 키로 오든 안전하게 매핑
  type RawProblemRef = any; // 실제 타입 있다면 여기에 맞춰 선언

  const adaptProblemRef = (dto: RawProblemRef): ProblemRef => {
    const rawType = dto.problemType ?? dto.problem_type ?? dto.type;
    return {
      problem_id: dto.problem_id ?? dto.id,
      title: dto.title ?? "",
      description: dto.description ?? "",
      problemType: normalizeProblemType(rawType), // ✅ 한글 라벨 보장
      attempt_count: dto.attempt_count ?? dto.attempts ?? 0,
      pass_count: dto.pass_count ?? dto.passes ?? 0,
      points: dto.points ?? dto.score ?? 0, // ✅ 배점 없으면 0 기본
    };
  };

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems, refresh]);

  useEffect(() => {
    if (groupId) {
      fetchMyOwner();
    }
  }, [groupId, fetchMyOwner]);

  useEffect(() => {
    const filtered = selectedProblems.filter((problem) =>
      problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProblems(filtered);
  }, [searchQuery, selectedProblems, refresh]);

  // 채점하기 버튼 클릭 핸들러
  const handleGrading = () => {
    router.push(`/mygroups/${groupId}/exams/${examId}/grading`);
  };
  const handleStatus = () => {
    router.push(`/mygroups/${groupId}/exams/${examId}/watching`);
  };

  return (
    <>
      {/* 상단 영역: 게시 기간 표시 및 버튼들 */}
      <motion.div
        className="flex items-center mb-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* 왼쪽: 게시 기간 정보 (그룹장일 때만 표시) */}
        {workbook?.is_test_mode && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-1" />
            <span className="font-medium">게시 기간:</span>
            <span className="ml-2">
              {workbook?.publication_start_time
                ? formatDate(workbook.publication_start_time)
                : "-"}{" "}
              ~{" "}
              {workbook?.publication_end_time
                ? formatDate(workbook.publication_end_time)
                : "-"}
              {/* {formatDate(examInfo.publicationStartDate)} ~ {formatDate(examInfo.publicationEndDate)} */}
            </span>
            <span className="mx-3">|</span>
            <span className="font-medium">제출 기간:</span>
            <span className="ml-2">
              {workbook?.test_start_time
                ? formatDate(workbook.test_start_time)
                : "-"}{" "}
              ~{" "}
              {workbook?.test_end_time
                ? formatDate(workbook.test_end_time)
                : "-"}
            </span>
          </div>
        )}

        {/* 오른쪽: 버튼 영역 */}
        <div className="flex items-center gap-2 ml-auto">
          {/* 채점하기 버튼: 그룹장일 때만 표시, 일반 시험지는 채점할 필요가없어서*/}
          {/* 자 도형님과 형준님께 알립니다. 이거 바로 아래에 있는 주석이 그냥 테스트용이고, 실제에선 두번째꺼 씁니다. */}
          {/* ✅ 현황보기 버튼: 그룹장일 때만 표시 */}
          {isGroupOwner && (
            <button
              onClick={handleStatus}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-xl text-md cursor-pointer
        transition-all duration-200 ease-in-out active:scale-95"
            >
              현황보기
            </button>
          )}
          {isGroupOwner && (
            <button
              onClick={handleGrading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-xl text-md cursor-pointer
								transition-all duration-200 ease-in-out active:scale-95 flex items-center"
            >
              <FileCheck size={18} className="mr-1" />
              채점하기
            </button>
          )}

          {/* {isGroupOwner && workbook?.is_test_mode && (
						<button
							onClick={handleGrading}
							className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-xl text-md cursor-pointer
								transition-all duration-200 ease-in-out active:scale-95 flex items-center"
						>
							<FileCheck size={18} className="mr-1" />
							채점하기
						</button>
					)} */}

          {/* 문제 추가 버튼: 그룹장일 때만 표시 */}
          {isGroupOwner && (
            <OpenModalButton
              onClick={() => setIsModalOpen(true)}
              label="문제 추가하기"
            />
          )}
        </div>
      </motion.div>

      {/* 문제지 검색바 & 보기 방식 토글 */}
      <motion.div
        className="flex items-center gap-4 mb-4 w-full"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: -10 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
        }}
      >
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {/* <ViewToggle viewMode={viewMode} setViewMode={setViewMode} /> */}
      </motion.div>

      <h2 className="text-2xl font-bold mb-4 m-2 pt-2">나의 문제들</h2>
      <hr className="border-b-1 border-gray-300 my-4 m-2" />

      {filteredProblems.length === 0 ? (
        searchQuery ? (
          <p className="text-center text-gray-500 mt-10">
            🔍 <strong>&quot;{searchQuery}&quot;</strong>에 대한 검색 결과가
            없습니다.
          </p>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            📭 등록된 문제가 없습니다. 문제를 추가해보세요!
          </p>
        )
      ) : (
        // ) : viewMode === "gallery" ? (
        // 	<ProblemGallery
        // 		problems={filteredProblems}
        // 		groupId={numericGroupId}
        // 		workbookId={numericExamId}
        // 		isGroupOwner={isGroupOwner}
        // 		refresh={refresh}
        // 		setRefresh={setRefresh}
        // 	/>
        <ProblemList
          problems={filteredProblems}
          groupId={numericGroupId}
          workbookId={numericExamId}
          isGroupOwner={isGroupOwner}
          refresh={refresh}
          setRefresh={setRefresh}
          isTestMode={!!workbook?.is_test_mode} 
        />
      )}
      <ProblemSelector
        groupId={numericGroupId}
        workbookId={numericExamId}
        selectedProblems={selectedProblems}
        setSelectedProblems={setSelectedProblems}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        refresh={refresh}
        setRefresh={setRefresh}
      />
      <div className="mb-10"></div>
    </>
  );
}
