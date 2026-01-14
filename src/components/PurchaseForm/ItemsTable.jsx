"use client"

import { FiTrash2, FiPlus } from "react-icons/fi"

export default function ItemsTable({ items, onAddItem, onUpdateItem, onDeleteItem }) {
  const units = ["NONE", "KG", "L", "PCS", "BOX", "BAG"]


  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">#</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">ITEM</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">QTY</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">UNIT</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">PRICE/UNIT</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">AMOUNT</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.item}
                    onChange={(e) => onUpdateItem(item.id, "item", e.target.value)}
                    placeholder="Item name"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    value={item.qty}
                    onChange={(e) => onUpdateItem(item.id, "qty", Number.parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={item.unit}
                    onChange={(e) => onUpdateItem(item.id, "unit", e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => onUpdateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">${(item.amount || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="inline-flex items-center justify-center p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={onAddItem}
        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm"
      >
        <FiPlus className="w-4 h-4" />
        ADD ROW
      </button>
    </div>
  )
}
