// hooks/useRouteLoading.ts
//화면 넘어갈때 이상한거 방지?하려고 만들었는데 아직 제대로 사용안했음
"use client";
import { useTransition, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLoadingStore } from "@/lib/loadingStore"; 

export function useRouteLoading() {
  const router = useRouter();
  const pathname = usePathname();
  const { start, stop } = useLoadingStore();
  const [isPending, startTransition] = useTransition();

  // 경로가 실제로 바뀌면 로딩 종료
  useEffect(() => {
    stop();
  }, [pathname, stop]);

  function push(href: string) {
    start();
    startTransition(() => {
      router.push(href);
    });
  }

  function replace(href: string) {
    start();
    startTransition(() => {
      router.replace(href);
    });
  }

  return { push, replace, isPending };
}
