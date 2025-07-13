"use client";//클라이언트 동작명시

import Mysol from "./LayoutHeader/Mysol";//모듈 훅 추가

export default function PageHeaderWrapper() {//외부접근 가능하도록 pageaheaderwrapper로 mysol을 반환 
  return <Mysol />;
}
