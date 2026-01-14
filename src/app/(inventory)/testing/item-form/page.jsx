"use client"

import { useState } from "react"
import ItemForm from "./ItemForm/ItemForm"

export default function Page() {
    const [showForm, setShowForm] = useState(false)
    const [items, setItems] = useState([])
    const [activeType, setActiveType] = useState("product")

    const handleAddItem = (item) => {
        setItems([...items, { ...item, id: Date.now(), type: activeType }])
        setShowForm(false)
    }



    return (
        <div className="sm:p-4 p-2">
            <ItemForm
                type={activeType}
                onTypeChange={setActiveType}
                onSubmit={handleAddItem}
                onClose={() => setShowForm(false)}
            />
        </div>
    )
}
