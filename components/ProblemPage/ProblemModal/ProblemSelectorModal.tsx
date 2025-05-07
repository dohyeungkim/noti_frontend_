import { useRouter } from "next/navigation";
import { problem_api } from "@/lib/api";
import { Dispatch, SetStateAction, useEffect, useState, useCallback, useRef } from "react";
import { X } from "lucide-react";

export interface Problem {
  problem_id: number;
  title: string;
  description: string;
  attempt_count: number;
  pass_count: number;
  is_like: boolean;
}

interface ProblemSelectorProps {
  groupId: number;
  workbookId: number;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedProblems: Problem[];
  setSelectedProblems: Dispatch<SetStateAction<Problem[]>>;
  refresh: boolean;
  setRefresh:  React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProblemSelector({
  groupId,
  workbookId,
  isModalOpen,
  setIsModalOpen,
  selectedProblems,
  setSelectedProblems,
  refresh,
  setRefresh,
}: ProblemSelectorProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadySelected, setIsAlreadySelected] = useState<Problem[]>([]);
  const [newlyAddedProblemIds, setNewlyAddedProblemIds] = useState<Set<number>>(new Set()); // Track newly added problems by ID
  const isFetched = useRef(false);

  const handleSelect = (problem: Problem) => {
    setSelectedProblems((prevSelected) => {
      const isSelected = prevSelected.some((p) => p.problem_id === problem.problem_id);
      const isAlreadySelectedProblem = isAlreadySelected.some(
        (p) => p.problem_id === problem.problem_id
      );

      if (isAlreadySelectedProblem) {
        console.log("🚫 이미 선택된 문제는 해제할 수 없습니다:", problem.title);
        return prevSelected;
      }

      if (isSelected) {
        // Allow removing only newly added problems
        if (newlyAddedProblemIds.has(problem.problem_id)) {
          setNewlyAddedProblemIds((prev) => {
            const updatedSet = new Set(prev);
            updatedSet.delete(problem.problem_id); // Remove from the set
            return updatedSet;
          });
          return prevSelected.filter((p) => p.problem_id !== problem.problem_id);
        }
        return prevSelected;
      } else {
        setNewlyAddedProblemIds((prev) => new Set(prev.add(problem.problem_id))); // Add to the newly added set
        return [...prevSelected, problem];
      }
    });
  };

  // 문제 가져오기 함수 (useCallback 적용)
  const fetchProblem = useCallback(async () => {
    try {
      console.log("📢 문제 가져오기 요청 시작!");
      const res = await problem_api.problem_get();

      if (Array.isArray(res)) {
        setProblems(res);
        const alreadySelected = res.filter((problem) =>
          selectedProblems.some((p) => p.problem_id === problem.problem_id)
        );
        setIsAlreadySelected(alreadySelected);
      } else {
        console.error("응답 데이터 형식이 예상과 다릅니다:", res);
      }
    } catch (error) {
      console.error("❌ 문제를 가져오는 데 실패했습니다.", error);
      setProblems([]);
    }
  }, [selectedProblems, refresh]); // Use refresh to trigger a re-fetch

  // 모달이 열릴 때 fetchProblem 실행
  useEffect(() => {
    if (isModalOpen && !isFetched.current) {
      fetchProblem();
      isFetched.current = true;
    }
  }, [isModalOpen, fetchProblem]); // useCallback을 활용하여 함수 참조 고정
  
  // Re-fetch problems when refresh prop changes
  useEffect(() => {
    if (refresh) {
      fetchProblem(); // Re-fetch when refresh is toggled
    }
  }, [refresh, fetchProblem]); // Re-fetch when refresh prop changes

  const handleAddProblemButton = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const makeSelectedProblems = selectedProblems
        .filter((p) => !isAlreadySelected.some((selected) => selected.problem_id === p.problem_id))
        .map((p) => p.problem_id);

      await fetch("/api/proxy/problems_ref", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: Number(groupId),
          workbook_id: Number(workbookId),
          problem_id: makeSelectedProblems,
        }),
      });

      const newlyAdded = problems.filter((p) =>
        makeSelectedProblems.includes(p.problem_id)
      );
      setSelectedProblems((prev) => [...prev, ...newlyAdded]);

      await fetch("/api/proxy/problems_ref", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: Number(groupId),
          workbook_id: Number(workbookId),
          problem_id: makeSelectedProblems,
        }),
      });

      setRefresh((prev) => !prev);  
      setIsModalOpen(false);

    } catch (error) {
      console.error("문제지 - 문제 링크에 실패했습니다.", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const router = useRouter();
  const MakeProblemClick = () => {
    router.push("/registered-problems/create");
  };

  return (
    isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setIsModalOpen(false)}>
            <X className="w-6 h-6" />
          </button>

          <div className="p-6">
            <div className="flex gap-x-6">
              {/* 🔹 문제 리스트 */}
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">문제 목록</h2>
                <ul className="border p-4 rounded-md shadow-md bg-white h-64 overflow-y-auto">
                  {problems.map((problem) => {
                    const isDisabled = isAlreadySelected.some(
                      (p) => p.problem_id === problem.problem_id
                    );
                    return (
                      <li
                        key={problem.problem_id}
                        onClick={() => !isDisabled && handleSelect(problem)}
                        className={`cursor-pointer rounded-md p-2 border-b transition ${
                          isDisabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : selectedProblems.some((p) => p.problem_id === problem.problem_id)
                            ? "bg-mygreen text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}>
                        📌{" "}
                        {problem.title.length > 18
                          ? `${problem.title.slice(0, 18)}...`
                          : problem.title}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* 🔹 선택한 문제 리스트 */}
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">선택한 문제</h2>
                <ul className="border p-4 rounded-md shadow-md bg-white h-64 overflow-y-auto">
                  {selectedProblems.length > 0 ? (
                    selectedProblems.map((selected) => {
                      const newProblem = problems.find((p) => p.problem_id === selected.problem_id);
                      return (
                        <li
                          key={selected.problem_id}
                          onClick={() => handleSelect(selected)}
                          className="p-2 border-b rounded-md cursor-pointer hover:bg-red-200">
                          📌{" "}
                          {newProblem
                            ? newProblem.title.length > 18
                              ? `${newProblem.title.slice(0, 18)}...`
                              : newProblem.title
                            : "알 수 없는 문제"}
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-gray-500">선택한 문제가 없습니다.</li>
                  )}
                </ul>
              </div>
            </div>
            {/* 🔹 Submit 버튼 */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={MakeProblemClick}
                className="bg-mydarkgreen text-white px-4 py-2 mr-2 rounded hover:bg-opacity-80 transition">
                문제 만들기
              </button>
              <button
                onClick={handleAddProblemButton}
                disabled={isSubmitting}
                className="bg-mygreen text-white px-4 py-2 rounded hover:bg-opacity-80 transition">
                문제 추가하기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
