"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/Layout/Drawer";

export default function DrawerWrapper({ onToggle }: { onToggle: (open: boolean) => void }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    onToggle(isDrawerOpen);
    if (isDrawerOpen) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
  }, [isDrawerOpen, onToggle]);

  return <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />;
}
