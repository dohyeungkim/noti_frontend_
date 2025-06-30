"use client";

import Breadcrumbs from "./Breadcrumbs";
import DynamicTitle from "./DynamicTitle";
import { useDataFetch } from "./useDataFetch";
import usePageInfo from "./usePageInfo";
import { PageInfo, DataFetch } from "./types";

export default function Mysol() {
  const { groupId, examId, problemId, userName, pathname }: PageInfo = usePageInfo();
  const { group, exam, problem }: DataFetch = useDataFetch(groupId, examId, problemId);

  return (
<header className="flex flex-col items-start w-full mb-4 sm:mb-3 md:mb-4 lg:mb-4 mt-2 sm:mt-2 md:mt-2 lg:mt-4">    <Breadcrumbs
        pathname={pathname}
        group={group ?? undefined}
        groupId={groupId}
        exam={exam ?? undefined}
        examId={examId}
        problem={problem ?? undefined}
        problemId={problemId}
      />

      <DynamicTitle
        pathname={pathname}
        userName={userName ?? undefined}
        problem={problem ?? undefined}
        exam={exam ?? undefined}
        group={group ?? undefined}
      />
    </header>
  );
}