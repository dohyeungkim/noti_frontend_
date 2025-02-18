"use client";
import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import PageHeader from '@/components/layout/PageHeader';
import { motion } from 'framer-motion';

export default function CodeComparison() {
  const [myCode, setMyCode] = useState(`def calculate_score(quiz_result):
    score = 0
    consecutive_o = 0

    for char in quiz_result:
        if char == 'O':
            consecutive_o += 1
            score += consecutive_o
        else:
            consecutive_o = 0

    return score

# 테스트 입력
quiz_result = "OOXXOXXOOO"
# 점수 계산
result = calculate_score(quiz_result)
print(f"퀴즈 결과: {quiz_result}")
print(f"🌟 점수: {result}")`);

  const [otherCodes, setOtherCodes] = useState([
    {
      name: 'lauran1',
      code: `def calculate_score(quiz_result):
    score = 0
    consecutive_o = 0

    for char in quiz_result:
        if char == 'O':
            consecutive_o += 1
            score += consecutive_o
        else:
            consecutive_o = 0

    return score

# 테스트 입력
quiz_result = "OOXXOXXOOO"
# 점수 계산
result = calculate_score(quiz_result)
print(f"퀴즈 결과: {quiz_result}")
print(f"🌟 점수: {result}")`,
      submission: 2232
    },
    {
      name: 'lauran2',
      code: `def another_function():
    print("Hello from lauran2")`,
      submission: 2233
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % otherCodes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + otherCodes.length) % otherCodes.length);
  };

  return (
    <motion.div
    className="bg-[#f9f9f9] min-h-screen ml-[3.8rem] p-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <PageHeader className="animate-slide-in" />
    
    <button className="flex items-end bg-black text-white px-4 py-1.5 rounded-xl m-2 text-md cursor-pointer
      hover:bg-gray-500 transition-all duration-200 ease-in-out
      active:scale-95 ml-auto">
  나의 코드 보기
</button>

      

          <div className='flex justify-end'>
        {/* My Code */}
        <div className="bg-white shadow-lg rounded-xl p-4 w-full m-5">
        <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-green-700 font-semibold">맞았습니다!</span>
        </div>
      </div>
          <h2 className="text-xl font-bold mb-2">나의 코드</h2>
          <div className="border-t border-gray-400 my-2"></div>
          <div className="text-xs text-gray-400 text-right">제출 번호: 2243</div>
          <CodeMirror
            value={myCode}
            className="w-full"
            height="auto"
            minHeight="300px"
            extensions={[python()]}
            readOnly={true}
          />
          
        </div>

        {/* Other's Code */}
        <div className="bg-white shadow-lg rounded-xl p-4 w-full m-5">
        <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-green-700 font-semibold">맞았습니다!</span>
        </div>
      </div>
      <div className="relative bg-white shadow-lg rounded-xl p-4 w-full">
          <button className="absolute top-1/2 left-[-2rem] transform -translate-y-1/2 bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center" onClick={handlePrev}>
            &lt;
          </button>
          <h2 className="text-xl font-bold mb-2">{otherCodes[currentIndex].name}님의 코드</h2>
          <div className="border-t border-gray-400 my-2"></div>
          <div className="text-xs text-gray-400 text-right">제출 번호: {otherCodes[currentIndex].submission}</div>
          <CodeMirror
            value={otherCodes[currentIndex].code}
            className="w-full"
            height="auto"
            minHeight="300px"
            extensions={[python()]}
            readOnly={true}
          />
          <button className="absolute top-1/2 right-[-2rem] transform -translate-y-1/2 bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center" onClick={handleNext}>
            &gt;
          </button>
        </div>
      </div>
      </div>
    </motion.div>
  );
}