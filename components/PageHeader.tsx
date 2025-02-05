interface PageHeaderProps {
    title: string; // 페이지 제목
  }
  
  export default function PageHeader({ title }: PageHeaderProps) {
    return (
      <header className="flex flex-col items-start w-full mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 
        font-extrabold flex justify-start items-start gap-2 px-4 sm:px-6 md:px-8 lg:px-10 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20">
          {title}
        </h1>
      </header>
    );
  }
  