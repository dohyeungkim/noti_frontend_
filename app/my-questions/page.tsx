"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/Header/PageHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import SearchBar from "@/components/Header/SearchBar";
import ViewToggle from "@/components/Header/ViewToggle";
import SortButton from "@/components/Header/SortButton";

// ✅ Question 인터페이스 정의
interface Question {
  id: number;
  title: string;
  group: string;
  paper: string;
  solvedCount: number;
}

export default function MyQuestionsPage() {
  const router = useRouter();

  // 🔹 검색어 상태
  const [search, setSearch] = useState("");
  // 🔹 API에서 가져온 문제 목록 상태
  const [questions, setQuestions] = useState<Question[]>([]);

  // ✅ API에서 문제 불러오기 (GET 요청)
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://210.115.227.15:8000/api/problems"); // 🔹 서버 API 주소
        if (!response.ok)
          throw new Error("문제 목록을 불러오는 데 실패했습니다.");

        const data = await response.json();

        // 🔹 서버 응답을 클라이언트에서 사용하기 쉽게 변환
        const formattedData: Question[] = data.map(
          (q: { id: any; name: any }) => ({
            id: q.id,
            title: q.name,
            group: "기본 그룹", // 🔹 (필요하면 서버에서 받아오는 필드로 수정)
            paper: "문제지 없음",
            solvedCount: 0, // 🔹 (현재 풀린 횟수 정보 없음 → 필요하면 서버에서 추가)
          })
        );

        setQuestions(formattedData);
      } catch (error) {
        console.error("문제 목록 불러오기 오류:", error);
      }
    };

    fetchQuestions();
  }, []);

  // 🔹 검색어에 따라 필터링
  const filteredData: Question[] = questions.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 문제 등록 페이지로 이동
  const handleNavigate = () => {
    router.push("my-questions/create");
  };

  // ✅ 문제 수정 함수 (PUT 요청)

  // ✅ 문제 삭제 함수 (DELETE 요청)
  const deleteQuestion = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `http://210.115.227.15:8000/api/problems/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("문제 삭제 실패");

      alert("문제가 삭제되었습니다.");

      // 🔹 상태 업데이트
      setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
    } catch (error) {
      console.error("문제 삭제 오류:", error);
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"gallery" | "table">("gallery");
  const [sortOrder, setSortOrder] = useState("제목순");

  return (
    <div className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8">
      <PageHeader className="animate-slide-in" />
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={handleNavigate}
          className="flex items-center bg-black text-white px-4 py-1.5 rounded-xl m-2 text-md cursor-pointer
                hover:bg-gray-500 transition-all duration-200 ease-in-out
                active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          문제 만들기
        </button>
      </div>

      {/* 검색바 & 정렬 버튼 & 보기 방식 토글 */}
      <div className="flex items-center gap-4 mb-4 w-full">
        <div className="flex-grow min-w-0">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            className="animate-fade-in"
          />
        </div>
        <ViewToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
          className="animate-fade-in"
        />
        <SortButton onSortChange={setSortOrder} className="animate-fade-in" />
      </div>

      <h2 className="text-2xl font-bold mb-4 m-2 pt-4">나의 문제</h2>
      <hr className="border-b-1 border-gray-300 my-4 m-2" />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #ddd", padding: "0.5rem" }}>
              문제 제목
            </th>
            <th style={{ borderBottom: "2px solid #ddd", padding: "0.5rem" }}>
              그룹명
            </th>
            <th style={{ borderBottom: "2px solid #ddd", padding: "0.5rem" }}>
              문제지
            </th>
            <th style={{ borderBottom: "2px solid #ddd", padding: "0.5rem" }}>
              푼 사람 수
            </th>
            <th style={{ borderBottom: "2px solid #ddd", padding: "0.5rem" }}>
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item.id}>
                <td
                  style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
                >
                  {item.title}
                </td>
                <td
                  style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
                >
                  {item.group}
                </td>
                <td
                  style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
                >
                  {item.paper}
                </td>
                <td
                  style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
                >
                  {item.solvedCount}
                </td>
                <td
                  style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
                >
                  <button
                    onClick={() => router.push(`/my-questions/view/${item.id}`)} // ✅ 문제 보기 페이지로 이동
                    style={{
                      backgroundColor: "blue",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: "0.5rem",
                    }}
                  >
                    보기
                  </button>

                  <button
                    onClick={() => deleteQuestion(item.id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                등록된 문제가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
