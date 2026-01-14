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
      <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Selected Category</p>
            <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{category.name}</p>
            <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide mt-2">Selected Subcategory</p>
            <p className="text-md sm:text-lg font-bold text-foreground mt-1">{selectedSubcategory?.name}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm(`Delete category "${category.name}"?`)) {
                  onDeleteCategory(category.id)
                }
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
            Subcategories ({category.subcategories.length})
          </h3>
          <button
            onClick={() => setIsAddingSubcategory(!isAddingSubcategory)}
            className="flex items-center gap-2 px-3 py-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
          >
            <FiPlus className="w-4 h-4" />
            Add
          </button>
        </div>

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

        {/* Subcategories List */}
        <div className="space-y-2">
          {category.subcategories.length > 0 ? (
            category.subcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                onClick={() => onSelectSubcategory(subcategory)}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedSubcategory?.id === subcategory.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/50 hover:border-primary hover:bg-muted"
                }`}
              >
                {editingSubcategoryId === subcategory.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingSubcategoryName}
                      onChange={(e) => setEditingSubcategoryName(e.target.value)}
                      className="flex-1 px-2 py-1 bg-background border border-border rounded text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleUpdateSubcategory()
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUpdateSubcategory()
                      }}
                      className="px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-foreground text-sm sm:text-base font-medium">{subcategory.name}</span>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setEditingSubcategoryId(subcategory.id)
                          setEditingSubcategoryName(subcategory.name)
                        }}
                        className="p-1.5 hover:bg-background rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit subcategory"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${subcategory.name}"?`)) {
                            onDeleteSubcategory(category.id, subcategory.id)
                          }
                        }}
                        className="p-1.5 hover:bg-background rounded transition-colors text-destructive hover:text-destructive/80"
                        title="Delete subcategory"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">No subcategories yet</div>
          )}
        </div>
      </div>

      {/* Selected Subcategory Info */}
      {selectedSubcategory && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Selected Subcategory</p>
          <p className="text-lg sm:text-xl font-semibold text-foreground mt-2">{selectedSubcategory.name}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">Under: {category.name}</p>
        </div>
      )}
    </div>
  )
}
