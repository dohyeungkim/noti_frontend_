import { useEffect, useState } from "react";

export function usePresence(pageId: string) {
  const [participantsCount, setParticipantsCount] = useState<number>(0);

  useEffect(() => {
    const ws = new WebSocket(`wss://210.115.227.15/ws/presence/${pageId}`);

    ws.onopen = () => {
      console.log("WebSocket 연결됨");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "participants") {
        // 여기가 핵심
        setParticipantsCount(data.count);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket 연결 종료됨");
    };

    return () => {
      ws.close();
    };
  }, [pageId]);

  return participantsCount;
}
