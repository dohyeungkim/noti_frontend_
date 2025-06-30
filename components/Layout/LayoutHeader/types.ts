"use client";

import { Problem } from "@/components/ProblemPage/ProblemModal/ProblemSelectorModal";


export interface Exam {
  workbook_name: string;
}

interface Group {
  group_name: string;
}

export interface DynamicTitleProps {
  pathname: string;
  userName?: string;
  problem?: Problem;
  exam?: Exam;
  group?: Group;
}

export interface BreadcrumbsProps {
  pathname: string;
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
