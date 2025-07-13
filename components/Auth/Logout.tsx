"use client"; //클라이언트 컴포넌트

import React, { forwardRef, useImperativeHandle } from "react";
import { useAuth } from "@/stores/auth";
import { auth_api } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export interface LogoutHandles {//외부에서 제어가능하게
  logout: () => void;
}

const Logout = forwardRef<LogoutHandles>((props, ref) => {//외부에서도 함수를 사용할 수 있게.. ref를 이용하여
  const { setIsAuth } = useAuth();

  const handleLogout = async () => { //서버에 로그아웃 요청함수 
    try { 
      await auth_api.logout(); //로그아웃 요청
      setIsAuth(false); 
    } catch (error) { //에러
      console.error("로그아웃 실패:", error); 
    }
  };

  useImperativeHandle(ref, () => ({ //??..
    logout: handleLogout,
  }));

  return (  //사용자에게 보여지는 로그아웃 아이콘
    <FontAwesomeIcon 
      icon={faRightFromBracket} 
      className="text-gray-500"
      style={{ cursor: "pointer" }}
    />
  );
});

Logout.displayName = "Logout";//??
export default Logout;
