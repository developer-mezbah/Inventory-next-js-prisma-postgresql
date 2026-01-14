"use client"

import { FiChevronDown } from "react-icons/fi"

export default function CategorySelector({ category, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-between hover:opacity-90 transition-opacity text-sm sm:text-base"
    >
      <span>{category ? category.name : "Select a Category"}</span>
      <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  )
}
