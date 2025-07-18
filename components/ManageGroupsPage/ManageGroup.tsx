"use client"

import React, { useEffect, useState, useCallback } from "react"
import Modal from "./Modal/manageModal"
import { useParams, useRouter } from "next/navigation"
import { group_api, group_member_api, workbook_api } from "@/lib/api"

interface GroupMember {
	user_id: string
	username: string
	email: string
	timestamp: string
	timestamp_requested: string // 가입 요청 시각 (추가한거)
	timestamp_approved: string // 가입 수락 시각
}

// 리스트
interface GroupMemberReq {
	user_id: string
	username: string
	timestamp_requested: string
}

interface Workbook {
	workbook_id: number
	group_id: number
	workbook_name: string
	problem_cnt: number
	creation_date: string
	description: string
}

export default function ManageGroup() {
	const router = useRouter()
	const { groupId } = useParams() as { groupId: string }

	// 그룹 관련 상태
	const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
	const [groupInvMembers, setGroupInvMembers] = useState<GroupMemberReq[]>([])
	const [groupName, setGroupName] = useState("")
	const [groupPrivacy, setGroupPrivacy] = useState("public")

	// 그룹장의 ID를 저장
	const [groupOwner, setGroupOwner] = useState<string | null>(null)

	// 모달 및 토글 상태
	const [showMembers, setShowMembers] = useState(false)
	const [showInvitationMembers, setShowInvitationMembers] = useState(false)
	const [showProblemList, setShowProblemList] = useState(false)
	const [showModalBan, setShowModalBan] = useState(false)
	const [showModalDen, setShowModalDen] = useState(false)
	const [showModalAcc, setShowModalAcc] = useState(false)
	const [showModalSave, setShowModalSave] = useState(false)
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

	// 문제지(워크북) 관련 상태 (배열로 여러 문제지 관리)
	const [workbooks, setWorkbooks] = useState<Workbook[]>([])

	// 그룹 멤버 조회
	const fetchGroupMember = useCallback(async () => {
		try {
			const res = await group_member_api.group_get_member(Number(groupId))
			if (!Array.isArray(res)) return
			setGroupMembers(res)
		} catch (err) {
			console.error("그룹 멤버 조회 에러", err)
		}
	}, [groupId])

	const fetchPrivateGroupMemberReq = useCallback(async () => {
		try {
			const res = await group_member_api.group_private_member_req(Number(groupId))
			if (!Array.isArray(res)) return
			setGroupInvMembers(res)
		} catch (err) {
			console.error("그룹 멤버 요청 조회 에러", err)
		}
	}, [groupId])

	useEffect(() => {
		fetchGroupMember()
	}, [fetchGroupMember])

	useEffect(() => {
		fetchPrivateGroupMemberReq()
	}, [fetchPrivateGroupMemberReq])

	// 그룹 추방하기
	const fetchGroupMemberKickoff = useCallback(
		async (userId: string) => {
			if (groupOwner === userId) {
				alert("그룹장은 추방할 수 없습니다.")
				return
			}
			if (!window.confirm(`${userId}님을 정말로 추방하시겠습니까?`)) return

			try {
				const response = await group_member_api.group_member_kickoff(Number(groupId), userId)
				console.log("API 응답:", response)

				const message = response?.message || `${userId}님이 성공적으로 추방되었습니다.`
				alert(message)

				// 그룹원 목록에서 해당 유저 제거
				setGroupMembers((prev) => prev.filter((member) => member.user_id !== userId))
			} catch (error) {
				console.error("그룹원 추방 처리 에러", error)
				alert("그룹원 추방 중 오류 발생")
			}
		},
		[groupId, groupOwner]
	)

	// 그룹 신청 수락/거절 처리
	const fetchGroupMemberReqResponse = useCallback(
		async (userId: string, requestState: boolean) => {
			try {
				const response = await group_member_api.group_member_req_response(Number(groupId), userId, requestState)
				console.log("API 응답:", response)
				const message = response?.message || "요청이 성공적으로 처리되었습니다."
				alert(message)
				setGroupInvMembers((prev) => prev.filter((member) => member.user_id !== userId))
				await fetchPrivateGroupMemberReq()
				if (requestState) {
					await fetchGroupMember()
				}
			} catch (error) {
				console.error("초대 응답 처리 에러", error)
				alert("초대 응답 처리 중 오류 발생")
			}
		},
		[groupId, fetchPrivateGroupMemberReq, fetchGroupMember] //초대 수락 햇ㅇ으닉가 그룹 멤버도 다시 불러와야돼서 fetchGroupMember 추가함.
	)

	// 그룹의 문제지(워크북) 목록 조회 (엔드포인트: /api/proxy/workbook/group_id/{group_id})
	const fetchWorkbooks = useCallback(async () => {
		try {
			const data = await workbook_api.workbook_get(Number(groupId))
			setWorkbooks(data)
		} catch (error) {
			console.error("문제지 목록 조회 에러", error)
		}
	}, [groupId])

	// 그룹 정보 및 문제지(워크북) 목록 조회
	const fetchGroup = useCallback(async () => {
		try {
			const res = await group_api.group_get_by_id(Number(groupId))
			if (res) {
				setGroupName(res.group_name || "")
				setGroupPrivacy(res.group_private_state ? "private" : "public")
				setGroupOwner(res.group_owner || null)
				await fetchWorkbooks()
			}
		} catch (err) {
			console.error("그룹 정보 조회 에러", err)
		}
	}, [groupId, fetchWorkbooks])

	// // ❌ 그룹 삭제 !!!
	// const deleteGroup = async () => {
	//   if (!window.confirm("정말로 이 그룹을 삭제하시겠습니까?")) return;
	//   try {
	//     await group_api.group_delete_by_id(Number(groupId));
	//     alert("그룹이 삭제되었습니다.");
	//     // 그룹 삭제 후 적절한 페이지로 이동 (예: 그룹 목록 페이지)
	//     router.push("/mygroups");
	//   } catch (error) {
	//     console.error("그룹 삭제 에러", error);
	//     alert("그룹 삭제 중 오류 발생");
	//   }
	// };

	// ✅ 그룹 삭제
	const deleteGroup = async () => {
		if (!window.confirm("정말로 이 그룹을 삭제하시겠습니까?")) return

		try {
			console.log("✅ 그룹 삭제 API 호출 시작") // 디버깅 로그
			const res = await group_api.group_delete_by_id(Number(groupId))
			console.log("✅ 그룹 삭제 API 응답", res) // 응답 로그
			alert("그룹이 삭제되었습니다.")
			router.push("/mygroups")
		} catch (error) {
			const err = error as Error
			console.error("❌ 그룹 삭제 중 에러:", err)
			alert("그룹 삭제 중 오류 발생: " + (err.message || "알 수 없는 오류"))
		}
	}

	// 그룹 정보와 문제지(워크북) 정보 업데이트
	const updateGroup = async () => {
		try {
			// 그룹 정보 업데이트
			await group_api.group_update(Number(groupId), groupName, groupPrivacy === "private")
			// 문제지(워크북) 정보 업데이트 (모든 문제지 업데이트)
			if (workbooks.length > 0) {
				await Promise.all(
					workbooks.map((wb) => workbook_api.workbook_update(wb.workbook_id, wb.workbook_name, wb.description))
				)
			}
			await fetchGroup()
			alert("그룹 및 문제지 정보가 성공적으로 업데이트되었습니다.")
			setShowModalSave(false)
		} catch (err) {
			console.error("정보 업데이트 에러", err)
			alert("정보 업데이트 중 오류 발생")
		}
	}

	// // 📌 문제지 삭제 함수
	// // (백엔드 엔드포인트: DELETE /api/proxy/workbook/{group_id}/{workbook_id})
	// const deleteWorkbook = async (workbookId: number) => {
	//   try {
	//     await workbook_api.workbook_delete(Number(groupId), workbookId);
	//     alert("문제지가 삭제되었습니다.");
	//     // 삭제 후 최신 문제지 목록을 갱신하여 삭제된 문제지가 보이지 않도록 함
	//     fetchWorkbooks();
	//   } catch (error) {
	//     console.error("문제지 삭제 에러", error);
	//     alert("문제지 삭제 중 오류 발생");
	//   }
	// };

	// ✅ 문제지 삭제
	const deleteWorkbook = async (workbookId: number) => {
		try {
			console.log(`✅ 문제지 삭제 API 호출 시작: workbookId=${workbookId}`)
			const res = await workbook_api.workbook_delete(Number(groupId), workbookId)
			console.log("✅ 문제지 삭제 API 응답:", res)
			alert("문제지가 삭제되었습니다.")
			fetchWorkbooks()
		} catch (error) {
			const err = error as Error
			console.error("❌ 문제지 삭제 중 에러:", err)
			alert("문제지 삭제 중 오류 발생: " + (err?.message || "알 수 없는 오류"))
		}
	}

	useEffect(() => {
		if (groupId) {
			fetchGroup()
		}
	}, [groupId, fetchGroup])

	const toggleMembers = () => setShowMembers((prev) => !prev)
	const toggleInvMembers = () => setShowInvitationMembers((prev) => !prev)
	const toggleProblemList = () => setShowProblemList((prev) => !prev)

	return (
		<div className="w-full flex flex-col bg-transparent p-5 overflow-auto">
			<h1 className="text-2xl font-bold">{groupId} 그룹 관리 페이지</h1>

			{/* 그룹원 관리 영역 */}
			<div className="mt-[35px]">
				<h3 className="text-gray-500 p-1">그룹원 관리</h3>
				<div
					className="bg-[#E6E6E6] w-full p-[10px] rounded-[10px] flex flex-col"
					style={{ height: showMembers ? "auto" : "50px" }}
				>
					<div className="flex justify-between items-center">
						<h2>그룹원 조회</h2>
						<button className="bg-[#B8B8B8] w-[70px] h-[33px] rounded-[10px]" onClick={toggleMembers}>
							조회
						</button>
					</div>
					{showMembers && (
						<div className="mt-5 overflow-auto max-h-[300px] border border-[#ccc] p-[10px] rounded-[10px]">
							<table className="w-full border-collapse">
								<thead>
									<tr>
										<th className="border border-[#6c6c6c] p-2 text-left">ID</th>
										<th className="border border-[#6c6c6c] p-2 text-left">이름</th>
										<th className="border border-[#6c6c6c] p-2 text-left">이메일</th>
										<th className="border border-[#6c6c6c] p-2 text-left">신청 일자</th>
										<th className="border border-[#6c6c6c] p-2 text-left">가입 일자</th>
										<th className="border border-[#6c6c6c] p-2 text-left">추방</th>
									</tr>
								</thead>
								<tbody>
									{groupMembers.length > 0 ? (
										groupMembers.map((member) => (
											<tr key={member.user_id}>
												<td className="border border-[#6c6c6c] p-2 text-left">{member.user_id}</td>
												<td className="border border-[#6c6c6c] p-2 text-left">{member.username}</td>
												<td className="border border-[#6c6c6c] p-2 text-left">{member.email}</td>
												<td className="border border-[#6c6c6c] p-2 text-left">
													{new Date(member.timestamp_requested).toLocaleDateString()}
												</td>
												<td className="border border-[#6c6c6c] p-2 text-left">
													{new Date(member.timestamp_approved).toLocaleDateString()}
												</td>
												<td className="border border-[#6c6c6c] p-2 text-left">
													<button
														onClick={() => {
															setSelectedUserId(member.user_id)
															setShowModalBan(true)
														}}
													>
														❌
													</button>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={5} className="border border-[#6c6c6c] p-2 text-center">
												그룹원이 없습니다.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* 모달 - 그룹원 추방 */}
				<Modal show={showModalBan}>
					<div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-[1000]">
						<div className="bg-white p-[30px] rounded-[18px] text-center min-w-[300px]">
							<h3 className="text-center">이 멤버를 내보내시겠습니까?</h3>
							<div className="flex justify-center mt-[30px] gap-[5px]">
								<button
									className="bg-myred text-white py-[5px] px-[15px] rounded-[10px]"
									onClick={() => setShowModalBan(false)}
								>
									아니오
								</button>
								<button
									className="bg-mygreen text-white py-[5px] px-[15px] rounded-[10px]"
									onClick={async () => {
										if (selectedUserId) {
											await fetchGroupMemberKickoff(selectedUserId)
											setShowModalBan(false)
										}
									}}
								>
									네
								</button>
							</div>
						</div>
					</div>
				</Modal>
			</div>

			{/* 그룹 초대 수락/거절 영역 */}
			<div
				className="flex flex-col bg-[#E6E6E6] w-full p-[10px] mt-2 rounded-[10px]"
				style={{ height: showInvitationMembers ? "auto" : "50px" }}
			>
				<div className="flex justify-between items-center">
					<h2>그룹 초대 수락</h2>
					<button className="bg-[#B8B8B8] w-[110px] h-[33px] rounded-[10px]" onClick={toggleInvMembers}>
						신청 멤버 조회
					</button>
				</div>
				{showInvitationMembers && (
					<div className="mt-5 overflow-auto max-h-[300px] border border-[#ccc] p-[10px] rounded-[10px]">
						<table className="w-full border-collapse">
							<thead>
								<tr>
									<th className="border border-[#6c6c6c] p-2 text-left">ID</th>
									<th className="border border-[#6c6c6c] p-2 text-left">이름</th>
									<th className="border border-[#6c6c6c] p-2 text-left">신청 일자</th>
									<th className="border border-[#6c6c6c] p-2 text-left">거절</th>
									<th className="border border-[#6c6c6c] p-2 text-left">수락</th>
								</tr>
							</thead>
							<tbody>
								{groupInvMembers.length > 0 ? (
									groupInvMembers.map((member) => (
										<tr key={member.user_id}>
											<td className="border border-[#6c6c6c] p-2 text-left">{member.user_id}</td>
											<td className="border border-[#6c6c6c] p-2 text-left">{member.username}</td>
											{/* 신청 보낸 일자 - 추가되어야함 */}
											<td className="border border-[#6c6c6c] p-2 text-left">
												{new Date(member.timestamp_requested).toLocaleDateString()}
											</td>
											<td className="border border-[#6c6c6c] p-2 text-left">
												<button
													onClick={() => {
														setSelectedUserId(member.user_id)
														setShowModalDen(true)
													}}
												>
													❌
												</button>
											</td>
											<td className="border border-[#6c6c6c] p-2 text-left">
												<button
													onClick={() => {
														setSelectedUserId(member.user_id)
														setShowModalAcc(true)
													}}
												>
													✅
												</button>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={5} className="border border-[#6c6c6c] p-2 text-center">
											신청한 멤버가 없습니다.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}

				{/* 모달 - 초대 요청 거절 */}
				<Modal show={showModalDen}>
					<div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-[1000]">
						<div className="bg-white p-[30px] rounded-[18px] text-center min-w-[300px]">
							<h3 className="text-center">멤버 요청을 거절하시겠습니까?</h3>
							<div className="flex justify-center mt-[30px] gap-[5px]">
								<button
									className="bg-myred text-white py-[5px] px-[15px] rounded-[10px]"
									onClick={() => setShowModalDen(false)}
								>
									아니오
								</button>
								<button
									className="bg-mygreen text-white py-[5px] px-[15px] rounded-[10px]"
									onClick={() => {
										if (selectedUserId) {
											fetchGroupMemberReqResponse(selectedUserId, false)
											setShowModalDen(false)
										}
									}}
								>
									네
								</button>
							</div>
						</div>
					</div>
				</Modal>

				{/* 모달 - 초대 요청 수락 */}
				<Modal show={showModalAcc}>
					<div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-[1000]">
						<div className="bg-white p-[30px] rounded-[18px] text-center min-w-[300px]">
							<h3 className="text-center">멤버 요청을 수락하시겠습니까?</h3>
							<div className="flex justify-center mt-[30px] gap-[5px]">
								<button
									className="bg-myred text-white py-[5px] px-[15px] rounded-[10px]"
									onClick={() => setShowModalAcc(false)}
								>
									아니오
								</button>
								<button
									className="bg-mygreen text-white py-[5px] px-[15px] rounded-[10px]"
									onClick={async () => {
										if (selectedUserId) {
											await fetchGroupMemberReqResponse(selectedUserId, true)
											setShowModalAcc(false)
										}
									}}
								>
									네
								</button>
							</div>
						</div>
					</div>
				</Modal>
			</div>

			{/* 그룹 설정 및 문제지(워크북) 조회 및 수정 영역 */}
			<div className="mt-10">
				<h3 className="text-gray-500 p-1">그룹 설정</h3>
				<div className="flex justify-between items-center bg-[#E6E6E6] w-full h-[50px] p-[10px] rounded-[10px]">
					<h2>그룹 공개 설정</h2>
					<select
						className="bg-[#B8B8B8] rounded-[10px] w-[70px] h-[33px] text-center"
						value={groupPrivacy}
						onChange={(e) => setGroupPrivacy(e.target.value)}
					>
						<option value="public">공개</option>
						<option value="private">비공개</option>
					</select>
				</div>

				<div className="flex justify-between items-center bg-[#E6E6E6] w-full h-[50px] p-[10px] mt-2 rounded-[10px]">
					<h2>그룹 이름 수정</h2>
					<div>
						<input
							type="text"
							className="w-[250px] h-[33px] pl-[10px] resize-none rounded-[10px] text-center"
							placeholder="그룹 이름"
							value={groupName}
							onChange={(e) => setGroupName(e.target.value)}
						/>
					</div>
				</div>

				<div className="flex justify-between items-center bg-[#E6E6E6] w-full h-[50px] p-[10px] mt-[25px] rounded-[10px]">
					<h2>그룹 삭제</h2>
					<button className="bg-[#b99d9d] w-[70px] h-[33px] rounded-[10px]" onClick={deleteGroup}>
						삭제
					</button>
				</div>

				{/* 문제지(워크북) 조회 및 수정 영역 */}
				<div className="mt-[40px]">
					<h2 className="text-gray-500 p-1">문제지 설정</h2>
					{/* 🟡 문제지 공개 비공개 기능 있는거 맞나요?? */}
					{/* 
          <div className="flex justify-between items-center bg-[#E6E6E6] w-full h-[50px] p-[10px] rounded-[10px]">
            <h2>문제지 공개 수정</h2>
            <select className="bg-[#B8B8B8] rounded-[10px] w-[70px] h-[33px] text-center">
              <option value="public">공개</option>
              <option value="private">비공개</option>
            </select>
          </div> */}

					{/* 문제지 목록 카드들을 스크롤 가능한 영역에 나열 */}
					<div
						className="bg-[#E6E6E6] w-full p-[10px] rounded-[10px] overflow-auto"
						style={{ height: showProblemList ? "400px" : "50px" }}
					>
						<div className="flex justify-between items-center mb-6">
							<h2>문제지 정보 설정</h2>
							<button className="bg-[#B8B8B8] w-[110px] h-[33px] rounded-[10px]" onClick={toggleProblemList}>
								문제지 조회
							</button>
						</div>

						{showProblemList && (
							<div className="mt-4">
								{workbooks.length > 0 ? (
									workbooks.map((wb, index) => (
										<div key={wb.workbook_id} className="border border-gray-400 p-3 rounded-md mb-4">
											<div className="flex justify-between items-center">
												<label className="font-bold">문제지 이름</label>
												<input
													type="text"
													className="w-[250px] h-[33px] pl-[10px] resize-none rounded-[10px] text-center"
													value={wb.workbook_name}
													onChange={(e) => {
														const updated = [...workbooks]
														updated[index] = {
															...updated[index],
															workbook_name: e.target.value,
														}
														setWorkbooks(updated)
													}}
												/>
											</div>
											{/* 문제지 소개 */}
											<div className="flex flex-col mt-3">
												<label className="font-bold">문제지 소개</label>
												<textarea
													className="w-full h-[100px] p-[10px] mt-2 resize-none rounded-[10px] overflow-auto"
													value={wb.description}
													onChange={(e) => {
														const updated = [...workbooks]
														updated[index] = {
															...updated[index],
															description: e.target.value,
														}
														setWorkbooks(updated)
													}}
												/>
											</div>
											{/* v0 - 문제지 공개 여부 설정X 문제지 게시 기간으로 변경. 시험모드 아닌경우 항시 랜더링, 시험모드일경우 해당 기간동안만 랜더링 */}
											{/* <div className="mt-5 flex justify-between">
												<label className="font-bold">문제지 공개 설정</label>
												<select className="bg-[#B8B8B8] rounded-[10px] w-[70px] h-[33px] text-center">
													<option value="public">공개</option>
													<option value="private">비공개</option>
												</select>
											</div> */}
											{/* 문제지 삭제 */}
											<div className="flex justify-between mt-5">
												<label className="font-bold">문제지 삭제</label>
												<button
													className="bg-[#b99d9d] w-[70px] h-[33px] rounded-[10px]"
													onClick={() => deleteWorkbook(wb.workbook_id)}
												>
													삭제
												</button>
											</div>
										</div>
									))
								) : (
									<p className="text-center text-gray-500 mt-3">문제지가 존재하지 않습니다.</p>
								)}
							</div>
						)}
					</div>
					{/* 저장 버튼 영역 */}
					<div className="flex justify-center mt-20 gap-[10px]">
						<button className="bg-[#868c88] text-white py-[5px] px-[15px] rounded-[10px]" onClick={() => router.back()}>
							이전
						</button>
						<button
							className="bg-[#497658] text-white py-[5px] px-[15px] rounded-[10px]"
							onClick={() => setShowModalSave(true)}
						>
							변경사항 저장
						</button>
						{showModalSave && (
							<div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-[1000]">
								<div className="bg-white p-[30px] rounded-[18px] text-center min-w-[300px]">
									<h3 className="text-center">변경 사항을 저장하시겠습니까?</h3>
									<div className="flex justify-center mt-[30px] gap-[5px]">
										<button
											className="bg-myred text-white py-[5px] px-[15px] rounded-[10px]"
											onClick={() => setShowModalSave(false)}
										>
											아니오
										</button>
										<button className="bg-mygreen text-white py-[5px] px-[15px] rounded-[10px]" onClick={updateGroup}>
											네
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
