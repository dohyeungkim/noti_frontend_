"use client";

import React from "react";

interface ModalProps {
  show: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, children }) => {
  if (!show) return null; // show 가 false 이면 모달창 안 띄움

  return <div>{children}</div>;
};

export default Modal;
