"use client";
import { useEffect, useState } from "react";
import Drawer from "@/components/layout/Drawer";

export default function DrawerWrapper() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ✅ 사이드바가 열릴 때 body에 class 추가
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
  }, [isDrawerOpen]);

  return <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />;
}
