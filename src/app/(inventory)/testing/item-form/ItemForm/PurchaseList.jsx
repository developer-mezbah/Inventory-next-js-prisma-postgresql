"use client"

import { BiTrash } from "react-icons/bi"


export default function PurchaseList({ items, onDelete }) {
  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group p-4 sm:p-6 bg-card border border-border rounded-lg hover:shadow-lg hover:border-primary/50 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="inline-block px-2 py-1 rounded text-xs font-semibold bg-accent/20 text-accent mb-2">
                  {item.type === "product" ? "📦 Product" : "🔧 Service"}
                </div>
                <h3 className="font-semibold text-foreground text-lg line-clamp-2">{item.name}</h3>
              </div>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <BiTrash className="w-4 h-4" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm mb-4">
              {item.code && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Code:</span> {item.code}
                </p>
              )}
              {item.category && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Category:</span> {item.category}
                </p>
              )}
              {item.unit && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Unit:</span> {item.unit}
                </p>
              )}
            </div>

            {/* Pricing */}
            {(item.salePrice || item.purchasePrice) && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Pricing</p>
                <div className="flex justify-between text-sm">
                  {item.salePrice && (
                    <div>
                      <p className="text-muted-foreground text-xs">Sale</p>
                      <p className="font-semibold text-primary">${item.salePrice}</p>
                    </div>
                  )}
                  {item.purchasePrice && (
                    <div>
                      <p className="text-muted-foreground text-xs">Purchase</p>
                      <p className="font-semibold text-primary">${item.purchasePrice}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
