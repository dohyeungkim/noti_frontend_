export default function RootLoading() {
  // 페이지 컨텐츠 자리의 스켈레톤 (전역 오버레이와는 별개)
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
      ))}
    </div>
  )
}
