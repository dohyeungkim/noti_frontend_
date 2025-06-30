// "use client";
// import { useState } from "react";

// import { motion } from "framer-motion";
// import CodeLogReplay from "@/components/ResultPage/CodeLogReplay";
// import { codeLogsList, myCodeLogs } from "@/data/codelogdata";

// export default function CodeComparisonClient({
//   params,
// }: {
//   params: { groupId: string; examId: string; problemId: string; resultId: string };
// }) {
//   {
//     const [currentIndex, setCurrentIndex] = useState(1);

//     const handleNext = () => {
//       setCurrentIndex((prev) => (prev + 1) % codeLogsList.length);
//     };

//     const handlePrev = () => {
//       setCurrentIndex((prev) => (prev - 1 + codeLogsList.length) % codeLogsList.length);
//     };

//     return (
//       <motion.div
//         className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}>
//         <button
//           className="flex items-end bg-black text-white px-4 py-1.5 rounded-xl m-2 text-md cursor-pointer
//       hover:bg-gray-500 transition-all duration-200 ease-in-out
//       active:scale-95 ml-auto">
//           나의 코드 보기
//         </button>
//         <div className="flex justify-end">
//           {/* My Code */}
//           <div className="bg-white shadow-lg rounded-xl p-4 w-full m-5">
//             <div className="flex justify-between mb-4">
//               <div className="flex items-center">
//                 <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
//                 <span className="text-green-700 font-semibold">맞았습니다!</span>
//               </div>
//             </div>
//             <h2 className="text-xl font-bold mb-2">나의 코드</h2>
//             <div className="border-t border-gray-400 my-2"></div>
//             <div className="text-xs text-gray-400 text-right">제출 번호: 2243</div>
//             <CodeLogReplay params={params} idx={myCodeLogs.length - 1} />
//           </div>

//           {/* Other's Codes */}
//           <div className="bg-white shadow-lg rounded-xl p-4 w-full m-5">
//             <div className="flex justify-between mb-4">
//               <div className="flex items-center">
//                 <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
//                 <span className="text-green-700 font-semibold">맞았습니다!</span>
//               </div>
//             </div>
//             <div className="relative bg-white shadow-lg rounded-xl p-4 w-full">
//               <button
//                 className="absolute top-1/2 left-[-2rem] transform -translate-y-1/2 bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center"
//                 onClick={handlePrev}>
//                 &lt;
//               </button>
//               <h2 className="text-xl font-bold mb-2">
//                 나와 {currentIndex * 9}% 유사한 {codeLogsList[currentIndex][0].user_id}님의 코드
//               </h2>
//               <div className="border-t border-gray-400 my-2"></div>
//               <div className="text-xs text-gray-400 text-right">제출 번호: 2243</div>
//               <CodeLogReplay params={params} idx={0} />
//               <button
//                 className="absolute top-1/2 right-[-2rem] transform -translate-y-1/2 bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center"
//                 onClick={handleNext}>
//                 &gt;
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     );
//   }
// }
