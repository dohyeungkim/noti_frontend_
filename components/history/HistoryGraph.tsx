"use client";
//클라이언트 컴포넌트사용 
import React, { useEffect, useRef, useState } from "react"; //모듈 훅 추가
import * as d3 from "d3";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { history } from "@/types/history";
import { HierarchyPointLink, HierarchyPointNode } from "d3-hierarchy";
// Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const HistoryGraph = ({ historys }: { historys: history[] }) => { //histosy타입의 historygraph선언
  const ref = useRef<SVGSVGElement | null>(null);//svg dom을 조작하기위해 ref생성
  const [selectedhistory, setSelectedhistory] = useState<history | null>(null);//선택된 노드 상태저장
  const mygreen = "#589960";// mygreen색 저장

  useEffect(() => { 
    if (!ref.current || historys.length === 0) return;

    const root = d3 //트리 계층구조 만들고 각 노드를 고유한 id로 연결 
      .stratify<history>()
      .id((d) => d.problem_id.toString())
      .parentId((d) => (d.parent_problem_id === -1 ? null : d.parent_problem_id.toString()))(
      historys //-1인 경우  
    );

    const treeLayout = d3 //트리형 노드위치를 계산해주는 함수
      .tree<history>()
      .size([600, 600]) // 트리의 크기 조정
      .nodeSize([50, 200]); // 각 노드의 수평, 수직 크기 설정

    const rootWithLayout = treeLayout(root);// root를 이용하여 생성

    const svg = d3 //d3가 ref를 통해 overflow설정
      .select(ref.current)

      .style("overflow", "visible");

    const g = svg.append("g").attr("transform", "translate(40,40)");//g그룹요소 추가 하고 여백 생성

    // 간선(링크) 그리기
    g.selectAll(".link") 
      .data(rootWithLayout.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal<HierarchyPointLink<history>, HierarchyPointNode<history>>()
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
      .on("click", (d) => {
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

  return ( //사용자 UI
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

export default HistoryGraph;
