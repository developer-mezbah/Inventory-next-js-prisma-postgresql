"use client"

import { useState } from "react"
import { FiPlus, FiX } from "react-icons/fi"

export default function CreateCategoryForm({ onSuccess }) {
  const [categoryName, setCategoryName] = useState("")
  const [subcategories, setSubcategories] = useState([""])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddSubcategory = () => {
    setSubcategories([...subcategories, ""])
  }

  const handleRemoveSubcategory = (index) => {
    setSubcategories(subcategories.filter((_, i) => i !== index))
  }

  const handleSubcategoryChange = (index, value) => {
    const updated = [...subcategories]
    updated[index] = value
    setSubcategories(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!categoryName.trim()) {
      setError("Category name is required")
      return
    }

    const validSubcategories = subcategories.filter((sub) => sub.trim())
    if (validSubcategories.length === 0) {
      setError("At least one subcategory is required")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      onSuccess({
        name: categoryName.trim(),
        subcategories: validSubcategories,
      })
      setCategoryName("")
      setSubcategories([""])
      setIsLoading(false)
    }, 500)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Category Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Category Name *</label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="e.g., Technology"
          className="w-full px-4 py-2 sm:py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
        />
      </div>

      {/* Subcategories */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Subcategories *</label>
        <div className="space-y-2 sm:space-y-3">
          {subcategories.map((subcategory, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={subcategory}
                onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                placeholder={`Subcategory ${index + 1}`}
                className="flex-1 px-4 py-2 sm:py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              />
              {subcategories.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSubcategory(index)}
                  className="px-3 sm:px-4 py-2 sm:py-3 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddSubcategory}
          className="mt-3 sm:mt-4 flex items-center gap-2 px-4 py-2 text-primary hover:text-primary/80 transition-colors text-sm sm:text-base font-medium"
        >
          <FiPlus className="w-4 h-4" />
          Add Subcategory
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm sm:text-base"
      >
        {isLoading ? "Creating..." : "Create Category"}
      </button>
    </form>
  )
}
