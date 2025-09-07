import { format as tzFormat, toZonedTime } from "date-fns-tz"
import { parseISO, isValid } from "date-fns"

export const TIMEZONE = "Asia/Seoul"

/** string | number | Date → 안전하게 Date로 변환 (실패 시 null) */
function toSafeDate(value?: string | number | Date): Date | null {
	if (!value) return null
	if (value instanceof Date) return isValid(value) ? value : null

	if (typeof value === "number") {
		const d = new Date(value)
		return isValid(d) ? d : null
	}

	// string 처리
	// 1) 표준 ISO 시도
	let d = parseISO(value)
	if (!isValid(d)) {
		// 2) 마이크로초가 3자 초과하는 경우 잘라서 재시도 (예: .868000Z -> .868Z)
		const trimmed = value.replace(/(\.\d{3})\d+(Z)?$/, "$1$2")
		d = parseISO(trimmed)
	}
	if (!isValid(d)) {
		// 3) 마지막 시도로 브라우저 파서
		d = new Date(value)
	}
	return isValid(d) ? d : null
}

export function formatDate(dateLike: string | number | Date, formatStr: string): string {
	const d = toSafeDate(dateLike)
	if (!d) return "" // 실패 시 빈 문자열 반환(혹은 "방금 전" 등)
	const zoned = toZonedTime(d, TIMEZONE)
	return tzFormat(zoned, formatStr, { timeZone: TIMEZONE })
}

export function formatTimestamp(ts?: string | number | Date): string {
	// 기본 포맷은 yyyy-MM-dd HH:mm
	return formatDate(ts ?? new Date(), "yyyy-MM-dd HH:mm")
}
