"use client";
import { useState, useEffect } from "react";
import React from "react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className, onClick }) => (
  <button className={`px-6 py-3 rounded-lg ${className}`} onClick={onClick}>
    {children}
  </button>
);

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`p-4 bg-white rounded-xl ${className}`}>{children}</div>
);

export default function LoginPage() {
  return (
    <div className="w-[100vw]">
      <main className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-blue-100 to-white">
        <header className="text-center my-5">
          <p className="text-5xl font-bold text-black">Welcome, everyone!</p>
          <p className="mt-4 text-3xl ">
            <span className="text-black">Try </span>
            <span
              className="font-bold text-blue-900
            ">
              APROFI
            </span>{" "}
            Service.
          </p>
        </header>

        <section className="flex items-center justify-center  w-full px-6 ">
          <Card className="shadow-lg max-w-md w-full bg-white text-center p-8 rounded-2xl">
            <h2 className="text-3xl font-bold text-black mb-8">Login</h2>
            <form className="flex flex-col items-center space-y-6 w-full">
              <input
                id="studentId"
                type="text"
                placeholder="ID"
                className="w-full px-4 py-3 bg-gray-200 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                id="password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 bg-gray-200 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="w-full py-3 text-white bg-black rounded-full hover:bg-gray-800">
                Sign in
              </Button>
            </form>
          </Card>
        </section>
      </main>
    </div>
  );
}
