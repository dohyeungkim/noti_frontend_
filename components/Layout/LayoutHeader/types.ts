"use client"; //클라이언트 컴포넌트 추가

import { Problem } from "@/components/ProblemPage/ProblemModal/ProblemSelectorModal";
//모듈 훅 추가

export interface Exam { //외부에서 사용가능하게 workbook_name의 정보를 담음
  workbook_name: string;
}

interface Group { //group_name의 정보를 담음
  group_name: string;
}

export interface DynamicTitleProps {// 외부에서 사용가능하게하는 dynamictitleprops의 정보타임들 선언
  pathname: string;
  userName?: string;
  problem?: Problem;
  exam?: Exam;
  group?: Group;
}

export interface BreadcrumbsProps {//breadcrumbs에서 사용하는 props의 타입선언
  userName?: string; // 선택적 속성으로 추가
  group?: {
    group_name: string;
  };
  groupId?: string;
  exam?: {
    workbook_name: string;
  };
  examId?: string;
  problem?: {
    title: string;
  };
  problemId?: string;
}

export interface PageInfo {
  groupId?: string;
  examId?: string;
  problemId?: string;
  resultId?: string;
  userName?: string | null;
  pathname: string;
}

export interface DataFetch {
  group?: { group_name: string } | null;
  exam?: { workbook_name: string } | null;
  problem?: { title: string } | null;
}
