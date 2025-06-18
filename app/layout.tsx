import type { Metadata } from "next";
import AuthNavigator from "../components/Auth/AuthNavigator";
import ClientLayout from "../components/layout/ClientLayout";


import "./globals.css";

export const metadata: Metadata = {
  title: "APROFI",
  description: "Teaching with APROFI",
};

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen">
        <AuthNavigator />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
