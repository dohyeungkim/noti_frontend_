// // hooks/usePresence.ts
// import { useEffect, useRef, useState } from "react"

// export interface PresenceUser {
//   userId: string
//   nickname: string
//   joinedAt: string
//   lastActivity: string
//   sessionId?: string
// }

// export interface PresenceData {
//   count: number
//   users: PresenceUser[]
// }

// /** 배포가 HTTPS면 자동으로 wss:// 사용, 같은 오리진으로 프록시 경로로 붙임.
//  *  (백엔드에 직접 붙이고 싶으면 .env에 NEXT_PUBLIC_WS_BACKEND=wss://api.example.com 지정)
//  */
// function buildWsUrl(pageId: string) {
//   if (typeof window === "undefined") return ""
//   const external = process.env.NEXT_PUBLIC_WS_BACKEND
//   if (external) return `${external.replace(/\/+$/,"")}/ws/presence/${pageId}`

//   const scheme = window.location.protocol === "https:" ? "wss" : "ws"
//   const base = `${scheme}://${window.location.host}`
//   // ← 필요에 따라 경로 수정: /api/ws/presence/[pageId] 로 프록시 구성 추천
//   return `${base}/api/proxy/ws/presence/${pageId}`
// }

// export function usePresence(
//   pageId: string,
//   currentUser: { userId: string; nickname: string }
// ) {
//   const [presenceData, setPresenceData] = useState<PresenceData>({ count: 0, users: [] })

//   const wsRef = useRef<WebSocket | null>(null)
//   const heartbeatRef = useRef<number | null>(null)
//   const sessionIdRef = useRef<string>("")

//   useEffect(() => {
//     if (!currentUser.userId || !currentUser.nickname || !pageId) return

//     // 세션ID 고정
//     if (!sessionIdRef.current) {
//       sessionIdRef.current = `${currentUser.userId}-${Date.now()}`
//     }

//     const url = buildWsUrl(pageId)
//     if (!url) return

//     const ws = new WebSocket(url)
//     wsRef.current = ws

//     ws.onopen = () => {
//       // join 알림
//       ws.send(
//         JSON.stringify({
//           type: "join",
//           user: {
//             userId: currentUser.userId,
//             nickname: currentUser.nickname,
//             joinedAt: new Date().toISOString(),
//             lastActivity: new Date().toISOString(),
//             sessionId: sessionIdRef.current,
//           },
//         })
//       )
//       // (옵션) 하트비트
//       heartbeatRef.current = window.setInterval(() => {
//         if (ws.readyState === WebSocket.OPEN) {
//           ws.send(JSON.stringify({ type: "ping", at: Date.now() }))
//         }
//       }, 25000)
//     }

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data)
//         switch (data.type) {
//           case "participants":
//             setPresenceData((prev) => ({ count: data.count ?? prev.count, users: prev.users }))
//             break
//           case "presence_update":
//             setPresenceData({ count: data.count ?? 0, users: data.users || [] })
//             break
//           case "user_joined":
//             setPresenceData((prev) => ({
//               count: data.count ?? prev.count + 1,
//               users: [...prev.users, data.user],
//             }))
//             break
//           case "user_left":
//             setPresenceData((prev) => ({
//               count: Math.max(0, data.count ?? prev.count - 1),
//               users: prev.users.filter((u) => u.userId !== data.userId),
//             }))
//             break
//           default:
//             break
//         }
//       } catch (e) {
//         console.error("WebSocket 메시지 파싱 에러:", e)
//       }
//     }

//     ws.onerror = (err) => {
//       console.error("❌ WebSocket 에러:", err)
//     }

//     ws.onclose = () => {
//       // onclose 시점에는 보내지 말기(이미 닫힘/닫히는 중)
//       if (heartbeatRef.current) {
//         clearInterval(heartbeatRef.current)
//         heartbeatRef.current = null
//       }
//     }

//     // 탭 닫힘 전에 leave 전송 시도
//     const beforeUnload = () => {
//       try {
//         if (ws.readyState === WebSocket.OPEN) {
//           ws.send(JSON.stringify({ type: "leave", userId: currentUser.userId, sessionId: sessionIdRef.current }))
//         }
//       } catch {}
//     }
//     window.addEventListener("beforeunload", beforeUnload)

//     return () => {
//       window.removeEventListener("beforeunload", beforeUnload)
//       if (heartbeatRef.current) {
//         clearInterval(heartbeatRef.current)
//         heartbeatRef.current = null
//       }
//       try {
//         if (ws.readyState === WebSocket.OPEN) {
//           ws.send(JSON.stringify({ type: "leave", userId: currentUser.userId, sessionId: sessionIdRef.current }))
//         }
//       } catch {}
//       ws.close()
//       wsRef.current = null
//     }
//   }, [pageId, currentUser.userId, currentUser.nickname])

//   return presenceData
// }
