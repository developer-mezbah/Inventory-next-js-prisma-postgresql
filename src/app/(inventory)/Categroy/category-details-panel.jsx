"use client"

import { useState } from "react"
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck } from "react-icons/fi"

export default function CategoryDetailsPanel({
  category,
  selectedSubcategory,
  onSelectSubcategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubcategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
  onClearCategory
}) {
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false)
  const [newSubcategoryName, setNewSubcategoryName] = useState("")
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null)
  const [editingSubcategoryName, setEditingSubcategoryName] = useState("")

  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim()) {
      onAddSubcategory(category.id, newSubcategoryName.trim())
      setNewSubcategoryName("")
      setIsAddingSubcategory(false)
    }
  }

  const handleUpdateSubcategory = () => {
    if (editingSubcategoryName.trim()) {
      onUpdateSubcategory(category.id, editingSubcategoryId, editingSubcategoryName.trim())
      setEditingSubcategoryId(null)
      setEditingSubcategoryName("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-muted/50 rounded-lg p-4 sm:p-6 mt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Selected Category</p>
            <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{category.name}</p>
            {selectedSubcategory?.name && <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide mt-2">Selected Subcategory</p>}
            {selectedSubcategory?.name && <p className="text-md sm:text-lg font-bold text-foreground mt-1">{selectedSubcategory?.name}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClearCategory(category.id)
              }}
              className="p-2 hover:bg-background rounded-lg transition-colors text-destructive hover:text-destructive/80"
              title="Delete category"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subcategories Section with Accordion */}
      <div>

        {/* Add Subcategory Form */}
        {isAddingSubcategory && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              placeholder="Enter subcategory name"
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddSubcategory()
              }}
            />
            <button
              onClick={handleAddSubcategory}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <FiCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsAddingSubcategory(false)
                setNewSubcategoryName("")
              }}
              className="px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}


      </div>
    </div>
  )
}
