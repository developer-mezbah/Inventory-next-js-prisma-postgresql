"use client"

import { useState } from "react"
import CategorySelector from "./category-selector"
import CategoryDetailsPanel from "./category-details-panel"
import CategoryModal from "./category-modal"

export default function Home() {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedSubcategory, setSelectedSubcategory] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [categories, setCategories] = useState([
        {
            id: 1,
            name: "Technology",
            subcategories: [
                { id: 1, name: "Software" },
                { id: 2, name: "Hardware" },
                { id: 3, name: "AI/ML" },
            ],
        },
        {
            id: 2,
            name: "Business",
            subcategories: [
                { id: 1, name: "Finance" },
                { id: 2, name: "Marketing" },
                { id: 3, name: "HR" },
            ],
        },
        {
            id: 3,
            name: "Lifestyle",
            subcategories: [
                { id: 1, name: "Fashion" },
                { id: 2, name: "Health" },
                { id: 3, name: "Travel" },
            ],
        },
        {
            id: 4,
            name: "Electronics",
        },
    ])

    const handleAddCategory = (newCategory) => {
        const categoryWithSubs = {
            id: Math.max(...categories.map((c) => c.id), 0) + 1,
            name: newCategory.name,
            subcategories: newCategory.subcategories.map((sub, idx) => ({
                id: idx + 1,
                name: sub,
            })),
        }
        setCategories([...categories, categoryWithSubs])
    }

    const handleUpdateCategory = (categoryId, updatedData) => {
        setCategories(
            categories.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        name: updatedData.name,
                        subcategories: updatedData.subcategories.map((sub, idx) => ({
                            id: sub.id || idx + 1,
                            name: sub.name || sub,
                        })),
                    }
                    : cat,
            ),
        )
    }

    const handleDeleteCategory = (categoryId) => {
        setCategories(categories.filter((cat) => cat.id !== categoryId))
        if (selectedCategory?.id === categoryId) {
            setSelectedCategory(null)
            setSelectedSubcategory(null)
        }
    }

    const handleAddSubcategory = (categoryId, subcategoryName) => {
        setCategories(
            categories.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        subcategories: [
                            ...cat.subcategories,
                            {
                                id: Math.max(...cat.subcategories.map((s) => s.id), 0) + 1,
                                name: subcategoryName,
                            },
                        ],
                    }
                    : cat,
            ),
        )
    }

    const handleUpdateSubcategory = (categoryId, subcategoryId, newName) => {
        setCategories(
            categories.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        subcategories: cat.subcategories.map((sub) =>
                            sub.id === subcategoryId ? { ...sub, name: newName } : sub,
                        ),
                    }
                    : cat,
            ),
        )
    }

    const handleDeleteSubcategory = (categoryId, subcategoryId) => {
        setCategories(
            categories.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        subcategories: cat.subcategories.filter((sub) => sub.id !== subcategoryId),
                    }
                    : cat,
            ),
        )
        if (selectedSubcategory?.id === subcategoryId) {
            setSelectedSubcategory(null)
        }
    }

    const handleSelectCategory = (category) => {
        setSelectedCategory(category)
        setSelectedSubcategory(null)
        setIsModalOpen(false)
    }

    const handleSelectSubcategory = (subcategory) => {
        setSelectedSubcategory(subcategory)
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">Category Manager</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Organize your content with categories and subcategories
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left: Select Category */}
                        <div className="lg:col-span-1">
                            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Select Category</h2>
                            <CategorySelector category={selectedCategory} onOpen={() => setIsModalOpen(true)} />
                        </div>

                        {/* Right: Info */}
                        {selectedCategory && (
                            <div className="lg:col-span-2">
                                <CategoryDetailsPanel
                                    category={selectedCategory}
                                    selectedSubcategory={selectedSubcategory}
                                    onSelectSubcategory={handleSelectSubcategory}
                                    onUpdateCategory={handleUpdateCategory}
                                    onDeleteCategory={handleDeleteCategory}
                                    onAddSubcategory={handleAddSubcategory}
                                    onUpdateSubcategory={handleUpdateSubcategory}
                                    onDeleteSubcategory={handleDeleteSubcategory}
                                />
                            </div>
                        )}
                    </div>

                    {/* Categories Overview */}
                    <div className="mt-8 sm:mt-12">
                        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                            All Categories ({categories.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`border rounded-lg p-4 transition-all cursor-pointer ${selectedCategory?.id === cat.id
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary hover:bg-muted/50"
                                        }`}
                                    onClick={() => handleSelectCategory(cat)}
                                >
                                    <h3 className="font-medium text-foreground text-sm sm:text-base mb-2">{cat.name}</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{cat?.subcategories && cat?.subcategories.length} subcategories</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                onSelect={handleSelectCategory}
                onAddCategory={handleAddCategory}
                onSelectSubcategory={handleSelectSubcategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
            />
        </div>
    )
}
