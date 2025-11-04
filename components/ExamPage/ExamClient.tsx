"use client";

import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";

import ExamGallery from "@/components/ExamPage/ExamGallery";
import ExamTable from "@/components/ExamPage/ExamTable";
import WorkBookCreateModal from "./ExamModal";
import { AnimatePresence, motion } from "framer-motion";
// import SortButton from "../ui/SortButton";
import ViewToggle from "../ui/ViewToggle";
import SearchBar from "../ui/SearchBar";
import OpenModalButton from "../ui/OpenModalButton";
import { useAuth } from "@/stores/auth";
import { group_api, workbook_api } from "@/lib/api";

interface WorkbookType {
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
}

// ✅ 시험 접근 가능 여부를 판단하는 타입
interface WorkbookWithAccess extends WorkbookType {
  canAccessTest: boolean; // 시험에 접근 가능한지 (제출 기간 내)
  isPublished: boolean; // 게시 기간 내인지
}

export default function ExamsClient() {
  const router = useRouter();
  const { userId } = useAuth();
  const { groupId } = useParams() as {
    groupId: string;
  };

  const [workbooks, setWorkbooks] = useState<WorkbookType[]>([]); // workbook_get으로 받은 정보가 여기 workbook에 저장됨
  const [groupOwner, setGroupOwner] = useState<string | null>(null); // 그룹장의 유저명 저장 (해당 그룹의 그룹장 ID를 저장)
  const isGroupOwner = userId === groupOwner; // 그룹장인지 확인하는 함수

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [workBookName, setWorkBookName] = useState("");
  const [workBookDescription, setWorkBookDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  const [filteredWorkbooks, setFilteredWorkbooks] = useState<WorkbookWithAccess[]>(
    []
  );
  const [refresh, setRefresh] = useState(false);
  
  // ✅ 현재 시간을 1초마다 업데이트하는 상태 추가
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // ✅ 이전 필터링 결과를 저장하는 ref
  const prevFilteredRef = useRef<string>("");

  // 시험 모드 아닌 것과 시험 모드인 것 분리 - 위아래 다르게 랜더링
  const normalList = filteredWorkbooks.filter((wb) => !wb.is_test_mode);
  const testList = filteredWorkbooks.filter((wb) => wb.is_test_mode);

  const fetchWorkbooks = useCallback(async () => {
    try {
      const data = await workbook_api.workbook_get(Number(groupId));
      setWorkbooks(data);
    } catch (error) {
      console.error("문제지 데이터를 가져오는 데 실패했습니다:", error);
    }
  }, [groupId]);

  // 그룹장 정보 가져오기.
  const fetchMyOwner = useCallback(async () => {
    try {
      const data = await group_api.my_group_get();
      const currentGroup = data.find(
        (group: { group_id: number }) => group.group_id === Number(groupId)
      );
      setGroupOwner(currentGroup?.group_owner || null);
    } catch (error) {
      console.error("그룹장 불러오기 중 오류:", error);
    }
  }, [groupId]);

  // ▼▼▼ 추가: 상세 페이지에서 is_test_mode를 바로 활용할 수 있도록 sessionStorage에 저장 + 라우팅
  const goToWorkbook = (workbookId: number, isTestMode: boolean) => {
    try {
      // 상세 페이지(문제 리스트 페이지)에서 사용할 수 있도록 저장
      // 예: 상세 페이지에서 sessionStorage.getItem(`wb_is_test_mode_${workbookId}`) === "true"
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `wb_is_test_mode_${workbookId}`,
          String(isTestMode)
        );
      }
    } catch {
      // sessionStorage 사용 불가해도 라우팅은 진행
    }
    router.push(`/mygroups/${groupId}/exams/${workbookId}`);
  };

  // 기존 핸들러는 시그니처 유지하면서 내부에서 test/normal을 구분해 주입
  const handleEnterExamNormal = (workbookId: number) => {
    goToWorkbook(workbookId, false);
  };
  const handleEnterExamTest = (workbookId: number) => {
    goToWorkbook(workbookId, true);
  };
  // ▲▲▲ 추가 끝

  const handleClick = () => {
    router.push(`/manage/${groupId}`);
  };

  // ✅ 1초마다 현재 시간 업데이트 (실시간 체크)
  // ✅ 모달이 열려있을 때는 타이머 중지
  useEffect(() => {
    // 모달이 열려있으면 타이머를 설정하지 않음
    if (isModalOpen) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1초마다 업데이트

    return () => clearInterval(timer);
  }, [isModalOpen]); // ✅ isModalOpen 의존성 추가

  useEffect(() => {
    fetchWorkbooks(); // 혹은 fetchProblemRefs()
    fetchMyOwner();
  }, [groupId, isGroupOwner, refresh]);

  // ✅ 최종적으로 화면에 보여줄 문제지만 필터링 (게시 기간 & 제출 기간 체크)
  // ✅ currentTime을 의존성 배열에 추가하여 1초마다 재계산
  useEffect(() => {
    // ✅ 모달이 열려있으면 필터링 로직 실행하지 않음
    if (isModalOpen) {
      return;
    }

    const now = currentTime; // 실시간 업데이트되는 시간 사용
    
    const filtered = workbooks
      // 1) 같은 그룹의 문제지만
      .filter((wb) => wb.group_id === Number(groupId))
      // 2) 검색어 일치
      .filter((wb) =>
        wb.workbook_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      // 3) 그룹장일 땐 모두 보이지만, 아니면 게시 기간 체크
      .filter((wb) => {
        if (isGroupOwner) return true;
        
        // 일반 문제지는 항상 보임
        if (!wb.is_test_mode) return true;
        
        // ✅ 시험 모드 문제지는 게시 기간 내에만 보임
        if (!wb.publication_start_time || !wb.publication_end_time) {
          return false;
        }
        
        const pubStart = new Date(wb.publication_start_time);
        const pubEnd = new Date(wb.publication_end_time);
        
        const isPublished = now >= pubStart && now <= pubEnd;
        
        return isPublished;
      })
      // 4) ✅ 접근 가능 여부 추가 (제출 기간 체크)
      .map((wb): WorkbookWithAccess => {
        // 일반 문제지는 항상 접근 가능
        if (!wb.is_test_mode) {
          return {
            ...wb,
            canAccessTest: true,
            isPublished: true,
          };
        }
        
        // ✅ 시험 모드 문제지의 접근 가능 여부 체크
        const pubStart = wb.publication_start_time ? new Date(wb.publication_start_time) : null;
        const pubEnd = wb.publication_end_time ? new Date(wb.publication_end_time) : null;
        const testStart = wb.test_start_time ? new Date(wb.test_start_time) : null;
        const testEnd = wb.test_end_time ? new Date(wb.test_end_time) : null;
        
        // 게시 기간 체크
        const isPublished = pubStart && pubEnd 
          ? now >= pubStart && now <= pubEnd 
          : false;
        
        // ✅ 제출 기간(시험 기간) 체크
        const canAccessTest = testStart && testEnd 
          ? now >= testStart && now <= testEnd 
          : false;
        
        return {
          ...wb,
          canAccessTest: isGroupOwner || canAccessTest, // 그룹장은 항상 접근 가능
          isPublished,
        };
      });
    
    // ✅ 필터링 결과를 문자열로 변환하여 비교 (실제 변경이 있을 때만 업데이트)
    const filteredString = JSON.stringify(
      filtered.map((wb) => ({
        id: wb.workbook_id,
        canAccess: wb.canAccessTest,
        isPublished: wb.isPublished,
      }))
    );
    
    // ✅ 이전 결과와 다를 때만 상태 업데이트
    if (filteredString !== prevFilteredRef.current) {
      prevFilteredRef.current = filteredString;
      setFilteredWorkbooks(filtered);
      console.log("✅ 필터링된 문제지 업데이트:", filtered.length, "개");
    }
  }, [searchQuery, workbooks, groupId, isGroupOwner, currentTime, isModalOpen]); // ✅ isModalOpen 추가

  useEffect(() => {
    if (!groupId) return;
    fetchWorkbooks();
    fetchMyOwner();
  }, [refresh, groupId, fetchWorkbooks, fetchMyOwner]);

  return (
    <div>
      <motion.div>
        <div>
          {/* ✅ 문제지 생성 버튼 (그룹장일 때만 활성화) */}
          <motion.div
            className="flex items-center gap-2 justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isGroupOwner && (
              <OpenModalButton
                onClick={() => setIsModalOpen(true)}
                label="문제지 생성하기"
              />
            )}
            {isGroupOwner && (
              <button
                className="bg-gray-800 text-white px-4 py-1.5 rounded-xl text-md cursor-pointer
      hover:bg-gray-500 transition-all duration-200 ease-in-out
      active:scale-95"
                onClick={handleClick}
              >
                ⚙️ 설정
              </button>
            )}
          </motion.div>
        </div>
        {/* 검색 & 정렬 & 보기 방식 변경 */}
        <motion.div
          className="flex items-center gap-4 mb-4 w-full"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: -10 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* 뷰모드 없애기 */}
          {/* <motion.div className="flex-grow min-w-0" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
						<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
					</motion.div>
					<motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
						<ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
					</motion.div> */}
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            {/* <SortButton onSortChange={setSortOrder} /> */}
          </motion.div>
        </motion.div>
        {/* 문제지 목록 */}
        <h2 className="text-2xl font-bold mb-4 m-2 pt-2">나의 문제지</h2>
        <hr className="border-b-1 border-gray-300 my-4 m-2" />
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {/* 일반 문제지 */}
          {viewMode === "gallery" && normalList.length > 0 && (
            <section>
              <h3 className="text-xl font-bold pt-3 pl-4 text-green-800">
                일반 문제지
              </h3>
              <ExamGallery
                workbooks={normalList}
                // 기존 시그니처 유지: ExamGallery는 workbookId만 넘겨줘도 됨
                // 내부에서 normal 섹션은 항상 false로 세팅된 핸들러를 사용
                handleEnterExam={handleEnterExamNormal}
                isGroupOwner={isGroupOwner}
              />
            </section>
          )}

          {/* 시험모드 문제지 */}
          <h3 className="text-xl font-bold pt-3 pl-4 text-red-800 mt-10">
            시험 모드 문제지
          </h3>
          {viewMode === "gallery" && testList.length > 0 ? (
            <section>
              <ExamGallery
                workbooks={testList}
                // 시험 모드 섹션은 항상 true로 세팅된 핸들러를 사용
                handleEnterExam={handleEnterExamTest}
                isGroupOwner={isGroupOwner}
              />
            </section>
          ) : (
            <p className="text-center text-gray-500 text-lg mt-10">
              {isGroupOwner 
                ? "현재 시험모드인 문제지가 없습니다."
                : "현재 게시 기간 내 시험모드 문제지가 없습니다."}
            </p>
          )}
        </motion.div>
        {/* 모달 */}
        <AnimatePresence>
          {isModalOpen && (
            <WorkBookCreateModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              WorkBookName={workBookName}
              setWorkBookName={setWorkBookName}
              WorkBookDescription={workBookDescription}
              setWorkBookDescription={setWorkBookDescription}
              group_id={Number(groupId)}
              refresh={refresh}
              setRefresh={setRefresh}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}