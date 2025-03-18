"use client";

import React, { useEffect, useState, useCallback } from "react";
import Modal from "./Modal/manageModal";
import { useParams, useRouter } from "next/navigation";
import "../../styles/manageStyles.css";
import { group_api, group_member_api } from "@/lib/api";

interface GroupMember {
  user_id: string;
  username: string;
  email: string;
  timestamp: string;
}

interface GroupMemberReq {
  user_id: string;
  username: string;
  timestamp: string;
}

export default function ManageGroup() {
  const router = useRouter();
  const { groupId } = useParams() as { groupId: string };
  const [showMembers, setShowMembers] = useState(false);
  const [showInvitationMembers, setShowInvitationMembers] = useState(false);
  const [showModalBan, setShowModalBan] = useState(false);
  const [showModalDen, setShowModalDen] = useState(false);
  const [showModalAcc, setShowModalAcc] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupInvMembers, setGroupInvMembers] = useState<GroupMemberReq[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState("public");
  const [showModalSave, setShowModalSave] = useState(false); // 저장 모달 상태

  const fetchGroupMember = useCallback(async () => {
    try {
      const res = await group_member_api.group_get_member(Number(groupId));
      if (!Array.isArray(res)) {
        return;
      }
      setGroupMembers(res);
    } catch (err) {
      console.error("그룹 정보 가져오는데 에러 발생", err);
    }
  }, [groupId]); // groupId가 변경될 때만 함수가 새로 생성됨

  const fetchPrivateGroupMemberReq = useCallback(async () => {
    try {
      const res = await group_member_api.group_private_member_req(Number(groupId));
      if (!Array.isArray(res)) {
        return;
      }
      setGroupInvMembers(res);
    } catch (err) {
      console.error("그룹 멤버 요청 가져오는데 에러 발생", err);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupMember();
  }, [fetchGroupMember]);

  useEffect(() => {
    fetchPrivateGroupMemberReq();
  }, [fetchPrivateGroupMemberReq]);

  // 그룹 정보 가지고 오기
  const fetchGroup = async () => {
    try {
      const res = await group_api.group_get_by_id(Number(groupId));
      if (res) {
        setGroupName(res.group_name || ""); // 그룹 이름 저장
        setGroupPrivacy(res.group_private_state ? "private" : "public"); // 공개 여부 설정
      }
    } catch (err) {
      console.error("그룹 정보를 가져오는데 실패", err);
    }
  };

  // 그룹 정보 업데이트 하기
  const updateGroup = async () => {
    try {
      await group_api.group_update(Number(groupId), groupName, groupPrivacy === "private");
      alert("그룹 정보가 성공적으로 업데이트되었습니다.");
      await fetchGroup();
      setShowModalSave(false);
    } catch (err) {
      console.error("그룹 정보 업데이트 실패", err);
      alert("그룹 정보 업데이트 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  const toggleMembers = () => setShowMembers((prev) => !prev);
  const toggleInvMembers = () => setShowInvitationMembers((prev) => !prev);

  return (
    <div className="container">
      <h1>{groupId} 그룹 관리 페이지</h1>
      <div className="group_container">
        <h3 style={{ color: "rgb(162, 162, 162)", padding: "5px" }}>그룹원 관리</h3>
        <div className="man_group" style={{ height: showMembers ? "auto" : "50px" }}>
          <div className="man_group_menu">
            <h2>그룹원 조회</h2>
            <button className="btn_info1" onClick={toggleMembers}>
              조회
            </button>
          </div>

          {showMembers && (
            <div className="members_table_container">
              <table className="members_table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>이름</th>
                    <th>가입 일자</th>
                    <th>이메일</th>
                    <th>추방</th>
                  </tr>
                </thead>
                <tbody>
                  {groupMembers.length > 0 ? (
                    groupMembers.map((member) => (
                      <tr key={member.user_id}>
                        <td>{member.user_id}</td>
                        <td>{member.username}</td>
                        <td>{new Date(member.timestamp).toLocaleDateString()}</td>
                        <td>{member.email}</td>
                        <td>
                          <button onClick={() => setShowModalBan(true)}>❌</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        그룹원이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Modal show={showModalBan}>
            <div className="modal_overlay">
              <div className="modal_content">
                <h3 className="modal_content_txt">이 멤버를 내보내시겠습니까?</h3>
                <div className="modal_btn_container">
                  <button className="modal_btn_no" onClick={() => setShowModalBan(false)}>
                    아니오
                  </button>
                  <button className="modal_btn_yes" onClick={() => setShowModalBan(false)}>
                    네
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </div>

        {/* 그룹 초대 수락/거절 */}
        <div className="man_stu" style={{ height: showInvitationMembers ? "auto" : "50px" }}>
          <div className="man_group_menu">
            <h2>그룹 초대 수락</h2>
            <button className="btn_info2" onClick={toggleInvMembers}>
              신청 멤버 조회
            </button>
          </div>

          {showInvitationMembers && (
            <div className="members_table_container">
              <table className="members_table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>이름</th>
                    <th>신청 일자</th>
                    <th>거절</th>
                    <th>수락</th>
                  </tr>
                </thead>
                <tbody>
                  {groupInvMembers.length > 0 ? (
                    groupInvMembers.map((member) => (
                      <tr key={member.user_id}>
                        <td>{member.user_id}</td>
                        <td>{member.username}</td>
                        <td>{new Date(member.timestamp).toLocaleDateString()}</td>
                        <td>
                          <button onClick={() => setShowModalDen(true)}>❌</button>
                        </td>
                        <td>
                          <button onClick={() => setShowModalAcc(true)}>✅</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        신청한 멤버가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Modal show={showModalDen}>
            <div className="modal_overlay">
              <div className="modal_content">
                <h3 className="modal_content_txt">멤버 요청을 거절하시겠습니까?</h3>
                <div className="modal_btn_container">
                  <button className="modal_btn_no" onClick={() => setShowModalDen(false)}>
                    아니오
                  </button>
                  <button className="modal_btn_yes" onClick={() => setShowModalDen(false)}>
                    네
                  </button>
                </div>
              </div>
            </div>
          </Modal>
          {/* 수락 눌렀을 때의 모달 */}

          <Modal show={showModalAcc}>
            <div className="modal_overlay">
              <div className="modal_content">
                <h3 className="modal_content_txt">멤버 요청을 수락하시겠습니까?</h3>
                <div className="modal_btn_container">
                  <button className="modal_btn_no" onClick={() => setShowModalAcc(false)}>
                    아니오
                  </button>
                  <button className="modal_btn_yes" onClick={() => setShowModalAcc(false)}>
                    네
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
      <div className="setting_container">
        <h3 style={{ color: "rgb(162, 162, 162)", padding: "5px" }}>그룹 설정</h3>
        {/* ✅ 그룹 공개 설정 */}
        <div className="man_public">
          <h2>그룹 공개 설정</h2>
          <select
            className="sel_pub"
            value={groupPrivacy}
            onChange={(e) => setGroupPrivacy(e.target.value)} // 수정 가능하게 변경
          >
            <option value="public">공개</option>
            <option value="private">비공개</option>
          </select>
        </div>

        {/* ✅ 그룹 이름 수정 */}
        <div className="man_edit">
          <h2>그룹 이름 수정</h2>
          <div>
            <input
              type="text"
              className="edit_name"
              placeholder="그룹 이름"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)} // 수정 가능하게 변경
            />
          </div>
        </div>
        <div className="man_delete">
          <h2>그룹 삭제</h2>
          <button className="btn_del">삭제</button>
        </div>
        {/* 문제지 관리 */}
        <div className="problem_container">
          <h3 style={{ color: "rgb(162, 162, 162)", padding: "5px" }}>문제지 관리</h3>
          <div className="man_group">
            <div className="man_group_menu">
              <h2>문제지 공개 수정</h2>
              <select
                className="sel_pub"
                // value={problemPrivacy}
                // onChange={(e) => setGroupPrivacy(e.target.value)} // 수정 가능하게 변경
              >
                <option value="public">공개</option>
                <option value="private">비공개</option>
              </select>
            </div>
          </div>

          {/* 문제지 정보 수정 */}
          <div className="man_problem">
            <div className="man_problem_menu">
              <h2>문제지 정보 수정</h2>
              <div className="problem_table_container">
                <div className="man_problem_name">
                  <h2>
                    <strong>문제지 이름</strong>
                  </h2>
                  <div>
                    <input
                      type="text"
                      className="edit_name"
                      placeholder="문제지 이름"
                      // value={groupName}
                      // onChange={(e) => setGroupName(e.target.value)} // 수정 가능하게 변경
                    />
                  </div>
                </div>
                {/* 문제지 소개 */}
                <div className="man_problem_intro">
                  <h2>
                    <strong>문제지 소개</strong>
                  </h2>
                  <div className="man_problem_intro">
                    <textarea
                      className="edit_intro"
                      placeholder="문제지 소개"
                      // value={groupName}
                      // onChange={(e) => setGroupName(e.target.value)} // 수정 가능하게 변경
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="buttons_container">
        <button className="btn_cancle" onClick={() => router.back()}>
          이전
        </button>
        <button className="btn_save" onClick={() => setShowModalSave(true)}>
          변경사항 저장
        </button>
        {showModalSave && (
          <div className="modal_overlay">
            <div className="modal_content">
              <h3 className="modal_content_txt">변경 사항을 저장하시겠습니까?</h3>
              <div className="modal_btn_container">
                <button className="modal_btn_no" onClick={() => setShowModalSave(false)}>
                  아니오
                </button>
                <button className="modal_btn_yes" onClick={updateGroup}>
                  네
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
