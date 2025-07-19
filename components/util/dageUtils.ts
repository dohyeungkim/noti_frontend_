// utils/dateUtils.ts
import { format as tzFormat, toZonedTime } from 'date-fns-tz';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const TIMEZONE = 'Asia/Seoul'; // 한국 시간대 지정

// 주어진 Date 객체를 한국 시간대에 맞춰 포맷하는 함수
export const formatDate = (date: Date, formatStr: string): string => {
  const zonedDate = toZonedTime(date, TIMEZONE); // UTC 날짜를 한국 시간대로 변환
  return tzFormat(zonedDate, formatStr, { timeZone: TIMEZONE }); // 변환된 날짜를 주어진 포맷으로 출력
};

// 타임스탬프를 받아서 한국 시간대에 맞는 문자열로 변환하는 함수
export const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return "방금 전"; // 타임스탬프가 없으면 "방금 전"을 반환

  const date = new Date(timestamp + 'Z'); // ISO 문자열에 'Z'를 추가하여 UTC로 해석되도록 함
  const today = formatDate(new Date(), "yyyy-MM-dd"); // 오늘 날짜를 "yyyy-MM-dd" 포맷으로
  const dateStr = formatDate(date, "yyyy-MM-dd"); // 입력된 날짜를 "yyyy-MM-dd" 포맷으로

  if (dateStr === today) {
    return `오늘 ${formatDate(date, "HH:mm")}`; // 오늘의 경우 "오늘 HH:mm" 포맷으로 출력
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1); // 어제 날짜 계산
  const yesterdayStr = formatDate(yesterday, "yyyy-MM-dd");

  if (dateStr === yesterdayStr) {
    return `어제 ${formatDate(date, "HH:mm")}`; // 어제인 경우 "어제 HH:mm" 포맷으로 출력
  }

  const relativeTime = formatDistanceToNow(date, { addSuffix: true, locale: ko }); // 상대적 시간 표시
  if (relativeTime.includes("일 전") || relativeTime.includes("시간 전") || relativeTime.includes("분 전")) {
    return relativeTime;
  }

  return tzFormat(date, "yyyy-MM-dd HH:mm", { timeZone: TIMEZONE }); // 그 외의 경우에는 일반적인 날짜 포맷으로 출력
};
