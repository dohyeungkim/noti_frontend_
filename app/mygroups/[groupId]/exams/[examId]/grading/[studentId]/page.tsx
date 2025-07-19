// app/mygroups/[groupId]/exams/[examId]/grading/[studentId]/page.tsx
import StudentGradingPage from "@/components/GradingPage/StudentGradingPage"

// interface PageProps {
// 	params: {
// 		groupId: string
// 		examId: string
// 		studentId: string
// 	}
// }

export default function Page() {
	// const { groupId, examId, studentId } = params
	return <StudentGradingPage />
}
