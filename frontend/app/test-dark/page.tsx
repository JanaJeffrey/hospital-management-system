"use client";

import { useTheme } from "../context/ThemeContext";

export default function TestDarkPage() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-black dark:text-white">Dark mode test</h1>
      <p className="text-gray-700 dark:text-gray-300">Current theme: {theme}</p>
      <button onClick={toggleTheme} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Toggle
      </button>
      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
        This box should change color
      </div>
    </div>
  );
}