"use client"; //클라이언트 컴포넌트

import React from "react"; //훅, 모듈 추가

interface ModalProps {//modalprops의 props선언
  show: boolean; 
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, children }) => {//modalprops에서 show와children을 가져옴
  if (!show) return null; // show 가 false 이면 모달창 안 띄움

  return <div>{children}</div>; //아닌경우 children 사용자에게 보여줌
};

export default Modal; //modal을 외부에서 접근가능하게
