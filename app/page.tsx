"use client";

import { useRouter } from "next/navigation";

const UserList = () => {
  const router = useRouter();

  const users = [
    { userId: "U001", username: "김철수" },
    { userId: "U002", username: "이영희" },
    { userId: "U003", username: "박민수" },
    { userId: "U004", username: "한서연" }, // ✅ 클릭 시 이동
    { userId: "U005", username: "황휘근" },
  ];

  const handleClick = (userId: string) => {
    if (userId === "U004") {
      router.push("/groups"); // ✅ GroupsPage로 이동
    } else {
      alert("로그인 기능이 아직 구현되지 않았습니다.");
    }
  };

  return (
    <div>
      <h2>사용자 목록</h2>
      <ul>
        {users.map((user) => (
          <li
            key={user.userId}
            onClick={() => handleClick(user.userId)}
            style={{ cursor: "pointer", color: user.userId === "U004" ? "blue" : "black" }}
          >
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
