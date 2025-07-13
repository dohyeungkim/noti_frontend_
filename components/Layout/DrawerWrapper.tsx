"use client";//클라이언트 동작 명시

import { useEffect, useState } from "react"; // 훅, 모듈 추가
import Drawer from "@/components/Layout/Drawer";

export default function DrawerWrapper({ onToggle }: { onToggle: (open: boolean) => void }) {//외부접근가능하도록 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); //deaweropen값 변경

  useEffect(() => {
    onToggle(isDrawerOpen);//??
    if (isDrawerOpen) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
  }, [isDrawerOpen, onToggle]); //갱신시 실행

  return <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />;
}
