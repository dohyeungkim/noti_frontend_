// app/layout.tsx
import type { Metadata } from "next";
import AuthNavigator from "@/components/Auth/AuthNavigator";
import ClientLayout from "@/components/Layout/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOTI",
  description: "Teaching with NOTI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen">
        <AuthNavigator />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
