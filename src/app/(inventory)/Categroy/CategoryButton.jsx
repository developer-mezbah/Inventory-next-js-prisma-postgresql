/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState } from "react"
import CategorySelector from "./category-selector"
import CategoryDetailsPanel from "./category-details-panel"
import CategoryModal from "./category-modal"
import client_api from "@/utils/API_FETCH"
import { useFetchData } from "@/hook/useFetchData"
import { toast } from "react-toastify"
import { DeleteAlert } from "@/utils/DeleteAlart"
// [
//         {
//             id: 1,
//             name: "Technology",
//             subcategories: [
//                 { id: 1, name: "Software" },
//                 { id: 2, name: "Hardware" },
//                 { id: 3, name: "AI/ML" },
//             ],
//         },
//         {
//             id: 2,
//             name: "Business",
//             subcategories: [
//                 { id: 1, name: "Finance" },
//                 { id: 2, name: "Marketing" },
//                 { id: 3, name: "HR" },
//             ],
//         },
//         {
//             id: 3,
//             name: "Lifestyle",
//             subcategories: [
//                 { id: 1, name: "Fashion" },
//                 { id: 2, name: "Health" },
//                 { id: 3, name: "Travel" },
//             ],
//         },
//         {
//             id: 4,
//             name: "Electronics",
//         },
//     ]
export default function CategroyButton({ onChange, initialData, isOpened, closeModal, isButton = true, refetchCategoryPage }) {
    const [selectedCategory, setSelectedCategory] = useState(initialData?.category || null)
    const [selectedSubcategory, setSelectedSubcategory] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [categories, setCategories] = useState([])
    const {
        isInitialLoading,
        error,
        data = [],
        refetch,
    } = useFetchData("/api/categories", ["category"]);

    useEffect(() => {
        if (isOpened) {
            setIsModalOpen(true)
        }
        if (!isModalOpen) {
           closeModal && closeModal()
        }
    }, [isOpened, isModalOpen])

    useEffect(() => {
        if (data && data.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCategories(data || []);
        }
        if (initialData && data && data.length > 0) {
            const findCat = data.find(item => item?.id === initialData?.categoryId)
            const findSubCat = findCat?.subcategories.find(item => item?.id === initialData?.subCategoryId)
            setSelectedSubcategory(findSubCat)

        }
    }, [data, initialData])

    const handleAddCategory = (newCategory) => {
        client_api.create('/api/categories', 'your_token_here', {
            name: newCategory.name,
            subcategories: newCategory.subcategories.map((sub, i) => ({ id: i + 1, name: sub })),
        }).then((data) => {
            if (data?.error) {
                if (data?.error?.code === "P2002") {
                    toast.error('Category with this name already exists.');
                }
            } else {
                toast.success('Category created successfully!');
                refetch();
                refetchCategoryPage && refetchCategoryPage();
            }
        }).catch((error) => {
            console.error('Error creating category:', error);
        });


        // const categoryWithSubs = {
        //     id: Math.max(...categories.map((c) => c.id), 0) + 1,
        //     name: newCategory.name,
        //     subcategories: newCategory.subcategories.map((sub, idx) => ({
        //         id: idx + 1,
        //         name: sub,
        //     })),
        // }
        // setCategories([categoryWithSubs, ...categories])
    }

    const handleUpdateCategory = (categoryId, updatedData) => {
        client_api.update(`/api/categories/${categoryId}`, 'your_token_here', updatedData).then((data) => {
            if (data?.error) {
                if (data?.error?.code === "P2002") {
                    toast.error('Category with this name already exists.');
                }
            } else {
                toast.success('Category updated successfully!');
                refetch();
                refetchCategoryPage && refetchCategoryPage();
            }
        }).catch((error) => {
            console.error('Error creating category:', error);
        });
        // setCategories(
        //     categories.map((cat) =>
        //         cat.id === categoryId
        //             ? {
        //                 ...cat,
        //                 name: updatedData.name,
        //                 subcategories: updatedData.subcategories.map((sub, idx) => ({
        //                     id: sub.id || idx + 1,
        //                     name: sub.name || sub,
        //                 })),
        //             }
        //             : cat,
        //     ),
        // )
    }

    const handleDeleteCategory = (categoryId) => {
        DeleteAlert(`/api/categories/${categoryId}`, 'your_token_here', 'This will delete all associated subcategories.', '').then((res) => {
            if (res) {
                toast.success('Category deleted successfully!');
                refetch();
                refetchCategoryPage && refetchCategoryPage();
            }
        }).catch((error) => {
            console.error('Error deleting category:', error);
        });
        // setCategories(categories.filter((cat) => cat.id !== categoryId))
        // if (selectedCategory?.id === categoryId) {
        //     setSelectedCategory(null)
        //     setSelectedSubcategory(null)
        // }
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
        onChange("categoryId", category?.id)
        setSelectedCategory(category)
        setSelectedSubcategory(null)
        setIsModalOpen(false)
    }

    const handleSelectSubcategory = (subcategory) => {
        onChange("subCategoryId", subcategory?.id)
        setSelectedSubcategory(subcategory)
    }

    const handleClearCategory = () => {
        onChange("subCategoryId", "")
        onChange("categoryId", "")
        setSelectedCategory(null)
    }
    return (
        <div className="">
            <div className="">
               {isButton && <div className="lg:col-span-1"><CategorySelector
                            category={selectedCategory} onOpen={() => setIsModalOpen(true)} />
                </div>}

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
                            onClearCategory={handleClearCategory}
                        />
                    </div>
                )}
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
