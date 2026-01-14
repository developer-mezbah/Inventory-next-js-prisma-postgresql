"use client"

import { useState, useMemo } from "react"
import { FiSearch, FiX, FiEdit2, FiTrash2, FiChevronDown, FiPlus, FiCheck } from "react-icons/fi"
import CreateCategoryForm from "./create-category-form"

export default function CategoryModal({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  selectedSubcategory,
  onSelect,
  onAddCategory,
  onSelectSubcategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState("browse")
  const [expandedCategoryId, setExpandedCategoryId] = useState(null)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [editSubcategories, setEditSubcategories] = useState([])
  const [newSubInput, setNewSubInput] = useState("")

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories
    const query = searchQuery.toLowerCase()
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.subcategories && cat.subcategories.some((sub) => sub.name.toLowerCase().includes(query)),
    )
  }, [searchQuery, categories])

  const handleStartEdit = (category) => {
    setEditingCategoryId(category.id)
    setEditCategoryName(category.name)
    setEditSubcategories(category.subcategories ? [...category.subcategories] : [])
    setNewSubInput("")
  }

  const handleCancelEdit = () => {
    setEditingCategoryId(null)
    setEditCategoryName("")
    setEditSubcategories([])
    setNewSubInput("")
  }

  const handleSaveEdit = (categoryId) => {
    if (!editCategoryName.trim()) return
    if (editSubcategories.length === 0) return

    onUpdateCategory(categoryId, {
      name: editCategoryName.trim(),
      subcategories: editSubcategories,
    })
    handleCancelEdit()
  }

  const handleAddSubInEdit = () => {
    if (newSubInput.trim()) {
      setEditSubcategories([
        ...editSubcategories,
        {
          id: Math.max(...editSubcategories.map((s) => s.id || 0), 0) + 1,
          name: newSubInput.trim(),
        },
      ])
      setNewSubInput("")
    }
  }

  const handleRemoveSubInEdit = (index) => {
    setEditSubcategories(editSubcategories.filter((_, i) => i !== index))
  }

  const handleUpdateSubInEdit = (index, newName) => {
    const updated = [...editSubcategories]
    updated[index] = { ...updated[index], name: newName }
    setEditSubcategories(updated)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Manage Categories</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Browse, create, edit, or delete categories
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border bg-muted/50">
            <button
              onClick={() => {
                setActiveTab("browse")
                setShowCreateForm(false)
                handleCancelEdit()
              }}
              className={`flex-1 px-4 sm:px-6 py-3 font-medium text-sm sm:text-base transition-colors ${activeTab === "browse"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Browse
            </button>
            <button
              onClick={() => {
                setActiveTab("create")
                setShowCreateForm(true)
                handleCancelEdit()
              }}
              className={`flex-1 px-4 sm:px-6 py-3 font-medium text-sm sm:text-base transition-colors ${activeTab === "create"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Create New
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {showCreateForm ? (
              <CreateCategoryForm
                onSuccess={(newCategory) => {
                  onAddCategory(newCategory)
                  setShowCreateForm(false)
                  setActiveTab("browse")
                  onClose()
                }}
              />
            ) : (
              <div className="p-4 sm:p-6 space-y-4">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search categories or subcategories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                </div>

                {/* Categories List with Accordion */}
                <div className="space-y-3">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <div key={category.id} className="border border-border rounded-lg overflow-hidden">
                        {/* Category Header / Edit Mode */}
                        {editingCategoryId === category.id ? (
                          <div className="bg-primary/5 p-4 space-y-4">
                            <div>
                              <label className="text-xs font-semibold text-foreground mb-2 block">Category Name</label>
                              <input
                                type="text"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-foreground mb-2 block">Subcategories</label>
                              <div className="space-y-2">
                                {editSubcategories.map((sub, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={sub.name}
                                      onChange={(e) => handleUpdateSubInEdit(idx, e.target.value)}
                                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    />
                                    <button
                                      onClick={() => handleRemoveSubInEdit(idx)}
                                      className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                      <FiX className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  value={newSubInput}
                                  onChange={(e) => setNewSubInput(e.target.value)}
                                  placeholder="Add new subcategory"
                                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") handleAddSubInEdit()
                                  }}
                                />
                                <button
                                  onClick={handleAddSubInEdit}
                                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                                >
                                  <FiPlus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleSaveEdit(category.id)}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm flex items-center justify-center gap-2"
                              >
                                <FiCheck className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Category Item */}
                            <div className="flex items-center gap-3">
                              {/* Checkbox */}
                              <input
                                type="checkbox"
                                className="w-5 h-5 accent-primary cursor-pointer rounded border-muted-foreground ml-2"
                                // optionally control state:
                                checked={selectedCategory?.id === category?.id ? true : false}
                                onChange={() =>
                                  onSelect(category)}

                              />

                              {/* Category Button */}
                              <button
                                onClick={() =>
                                  setExpandedCategoryId(
                                    expandedCategoryId === category.id ? null : category.id
                                  )
                                }
                                className="flex-1 w-full p-4 hover:bg-muted transition-colors flex items-center justify-between gap-4 rounded-lg hover:border-border cursor-pointer"
                              >
                                <div className="flex-1 text-left">
                                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                                    {category.name}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                    {category?.subcategories?.length || 0} subcategories
                                  </p>
                                </div>
                                <div
                                  className={`transition-transform ${expandedCategoryId === category.id ? "rotate-180" : ""
                                    }`}
                                >
                                  <FiChevronDown className="w-5 h-5 text-muted-foreground" />
                                </div>
                              </button>
                            </div>


                            {/* Category Actions */}

                            <div className="height-effect" style={{
                              gridTemplateRows: expandedCategoryId === category.id ? "1fr" : "0fr",
                              marginTop: expandedCategoryId === category.id ? "0px" : "-25px",
                              opacity: expandedCategoryId === category.id ? "1" : "0"
                            }}>
                              <div className="border-t border-border px-4 py-3 flex items-center justify-end gap-2 bg-muted/30">
                                <button
                                  onClick={() => handleStartEdit(category)}
                                  className="p-2 hover:bg-background rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                  title="Edit category"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Delete category "${category.name}"? This will also delete all subcategories.`,
                                      )
                                    ) {
                                      onDeleteCategory(category.id)
                                    }
                                  }}
                                  className="p-2 cursor-pointer hover:bg-background rounded-lg transition-colors text-destructive hover:text-destructive/80"
                                  title="Delete category"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>


                            {/* Expanded Subcategories */}
                            <div className="height-effect" style={{
                              gridTemplateRows: expandedCategoryId === category.id ? "1fr" : "0fr",
                              marginTop: expandedCategoryId === category.id ? "0px" : "-25px",
                              opacity: expandedCategoryId === category.id ? "1" : "0"
                            }}>
                              <div className="bg-background/50 cursor-pointer border-t border-border px-4 py-4 space-y-2">
                                {category.subcategories && category.subcategories.length > 0 ? (
                                  category.subcategories.map((sub) => (
                                    <button
                                      key={sub.id}
                                      onClick={() => {
                                        onSelect(category)
                                        onSelectSubcategory(sub);
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors text-sm font-medium text-foreground"
                                      style={{
                                        border: selectedSubcategory?.id === sub.id && selectedSubcategory?.name === sub?.name ? "2px solid #3b82f6" : "2px solid transparent",
                                      }}
                                    >
                                      {sub.name}
                                    </button>
                                  ))
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">No subcategories</p>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <p className="text-muted-foreground text-sm sm:text-base">
                        No categories found matching &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
