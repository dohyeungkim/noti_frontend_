"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { history } from "@/types/history";

// Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const historyGraph = ({ historys }: { historys: history[] }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const [selectedhistory, setSelectedhistory] = useState<history | null>(null);
  const mygreen = "#589960";

  useEffect(() => {
    if (!ref.current || historys.length === 0) return;

    const root = d3
      .stratify<history>()
      .id((d) => d.problem_id.toString())
      .parentId((d) =>
        d.parent_problem_id === -1 ? null : d.parent_problem_id.toString()
      )(historys);

    const treeLayout = d3
      .tree<history>()
      .size([600, 600]) // 트리의 크기 조정
      .nodeSize([50, 200]); // 각 노드의 수평, 수직 크기 설정

    const rootWithLayout = treeLayout(root);

    const svg = d3
      .select(ref.current)

      .style("overflow", "visible");

    const g = svg.append("g").attr("transform", "translate(40,40)");

    // 간선(링크) 그리기
    g.selectAll(".link")
      .data(rootWithLayout.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)
      )
      .attr("stroke", "#ccc") // 링크 색상
      .attr("fill", "none")
      .attr("stroke-width", 3); // 간선(링크)의 굵기 지정 (기본값은 1)

    // 노드 그리기
    const node = g
      .selectAll(".node")
      .data(rootWithLayout.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => {
        setSelectedhistory(d.data); // 클릭한 노드를 선택된 상태로 변경
      });

    node
      .append("rect")
      .attr("width", 100)
      .attr("height", 40)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("x", -50) // 중앙 정렬
      .attr("y", -20) // 중앙 정렬
      .attr("fill", (d) =>
        selectedhistory?.problem_id === d.data.problem_id ? mygreen : "#D9D9D9"
      ) // 선택된 문제는 초록색
      .attr("stroke-width", "1px");

    node
      .append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text((d) => d.data.title)
      .style("fill", "white");
  }, [historys, selectedhistory]); // 선택된 문제가 변경될 때마다 다시 렌더링

  return (
    <>
      <svg ref={ref} className="pl-20"></svg>
      {/* {selectedhistory && (
        <div>
          <h2>{selectedhistory.title}</h2>
          <p>{selectedhistory.description}</p>
        </div>
      )} */}
    </>
  );
};

export default historyGraph;
