"use client"
//문제 만들기 추가로 만들어야할 것들..
import React, { useEffect, useMemo, useState } from "react"
import { groups_api, workbooks_api, type MyGroup, type WorkbookSummary } from "@/lib/api"

type Step = "group" | "workbook" | "confirm"

export default function AddToWorkbookModal({
  open,
  onClose,
  selectedProblemIds,
  onDone,
}: {
  open: boolean
  onClose: () => void
  selectedProblemIds: number[]
  onDone?: (opts: { workbookId: number; count: number }) => void
}) {
  const [step, setStep] = useState<Step>("group")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [groups, setGroups] = useState<MyGroup[]>([])
  const [groupQuery, setGroupQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<MyGroup | null>(null)

  const [workbooks, setWorkbooks] = useState<WorkbookSummary[]>([])
  const [wbQuery, setWbQuery] = useState("")
  const [selectedWorkbook, setSelectedWorkbook] = useState<WorkbookSummary | null>(null)

  useEffect(() => {
    if (!open) return
    // 초기화
    setStep("group")
    setError(null)
    setSelectedGroup(null)
    setSelectedWorkbook(null)
    setGroupQuery("")
    setWbQuery("")
    setWorkbooks([])
    ;(async () => {
      try {
        setLoading(true)
        const gs = await groups_api.getMyLeaderGroups()
        setGroups(gs)
      } catch (e: any) {
        setError(e?.message ?? "그룹을 불러오지 못했어요.")
      } finally {
        setLoading(false)
      }
    })()
  }, [open])

  const filteredGroups = useMemo(() => {
    const q = groupQuery.trim().toLowerCase()
    if (!q) return groups
    return groups.filter((g) => g.name.toLowerCase().includes(q))
  }, [groups, groupQuery])

  const filteredWorkbooks = useMemo(() => {
    const q = wbQuery.trim().toLowerCase()
    if (!q) return workbooks
    return workbooks.filter((w) => w.name.toLowerCase().includes(q))
  }, [workbooks, wbQuery])

  const pickGroup = async (g: MyGroup) => {
    setSelectedGroup(g)
    setStep("workbook")
    setError(null)
    try {
      setLoading(true)
      const wbs = await workbooks_api.getByGroup(g.id)
      setWorkbooks(wbs)
    } catch (e: any) {
      setError(e?.message ?? "문제지를 불러오지 못했어요.")
    } finally {
      setLoading(false)
    }
  }

  const pickWorkbook = (wb: WorkbookSummary) => {
    setSelectedWorkbook(wb)
    setStep("confirm")
  }

  const submit = async () => {
    if (!selectedWorkbook) return
    setError(null)
    try {
      setLoading(true)
      await workbooks_api.addProblems(selectedWorkbook.id, selectedProblemIds)
      onDone?.({ workbookId: selectedWorkbook.id, count: selectedProblemIds.length })
      onClose()
    } catch (e: any) {
      setError(e?.message ?? "추가 중 오류가 발생했어요.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal */}
      <div className="relative w-[min(720px,94vw)] max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">기존 문제지에 추가</h3>
          <button className="text-gray-500 hover:text-gray-800" onClick={onClose} aria-label="close">✕</button>
        </div>

        <div className="p-4 space-y-3">
          {/* 스텝 표시 */}
          <div className="flex items-center gap-2 text-xs">
            <StepDot active={step === "group"}>그룹 선택</StepDot>
            <span>›</span>
            <StepDot active={step === "workbook"}>문제지 선택</StepDot>
            <span>›</span>
            <StepDot active={step === "confirm"}>확인</StepDot>
          </div>

          {!!error && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">{error}</div>}

          {step === "group" && (
            <div className="space-y-2">
              <input
                value={groupQuery}
                onChange={(e) => setGroupQuery(e.target.value)}
                placeholder="🔍 내 그룹 검색..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <div className="max-h-[50vh] overflow-auto rounded border">
                {loading ? (
                  <div className="p-4 text-sm text-gray-500">불러오는 중...</div>
                ) : filteredGroups.length === 0 ? (
                  <div className="p-4 text-sm text-gray-400">표시할 그룹이 없어요.</div>
                ) : (
                  <ul className="divide-y">
                    {filteredGroups.map((g) => (
                      <li key={g.id} className="p-3 hover:bg-gray-50 cursor-pointer" onClick={() => pickGroup(g)}>
                        <div className="font-medium">{g.name}</div>
                        <div className="text-xs text-gray-500">group_id: {g.id}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {step === "workbook" && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">선택된 그룹: <b>{selectedGroup?.name}</b></div>
              <input
                value={wbQuery}
                onChange={(e) => setWbQuery(e.target.value)}
                placeholder="🔍 문제지 검색..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <div className="max-h-[50vh] overflow-auto rounded border">
                {loading ? (
                  <div className="p-4 text-sm text-gray-500">불러오는 중...</div>
                ) : filteredWorkbooks.length === 0 ? (
                  <div className="p-4 text-sm text-gray-400">표시할 문제지가 없어요.</div>
                ) : (
                  <ul className="divide-y">
                    {filteredWorkbooks.map((w) => (
                      <li key={w.id} className="p-3 hover:bg-gray-50 cursor-pointer" onClick={() => pickWorkbook(w)}>
                        <div className="font-medium">{w.name}</div>
                        <div className="text-xs text-gray-500">paper_id: {w.id}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button className="text-sm px-3 py-2 border rounded hover:bg-gray-50" onClick={() => setStep("group")}>
                  ← 그룹 다시 선택
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-3">
              <div className="text-sm">
                <div>그룹: <b>{selectedGroup?.name}</b></div>
                <div>문제지: <b>{selectedWorkbook?.name}</b></div>
                <div className="mt-2 text-gray-600">
                  총 <b>{selectedProblemIds.length}</b>개의 문제를 이 문제지에 추가할게?
                </div>
              </div>
              <div className="flex justify-between">
                <button className="text-sm px-3 py-2 border rounded hover:bg-gray-50" onClick={() => setStep("workbook")}>
                  ← 문제지 다시 선택
                </button>
                <button
                  disabled={loading}
                  className={`text-sm px-3 py-2 rounded ${loading ? "bg-gray-300" : "bg-mycheck text-white hover:opacity-90"}`}
                  onClick={submit}
                >
                  {loading ? "추가 중..." : "추가하기"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepDot({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span className={`px-2 py-1 rounded-full border text-[11px] ${active ? "bg-black text-white border-black" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {children}
    </span>
  )
}
