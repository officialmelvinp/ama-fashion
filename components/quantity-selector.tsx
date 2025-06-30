"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus } from "lucide-react"

interface QuantitySelectorProps {
  stockLevel: number
  onQuantityChange: (quantity: number) => void
  initialQuantity?: number
  maxQuantity?: number
}

export function QuantitySelector({
  stockLevel,
  onQuantityChange,
  initialQuantity = 1,
  maxQuantity = 999,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity)

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity))
    setQuantity(validQuantity)
    onQuantityChange(validQuantity)
  }

  const increment = () => handleQuantityChange(quantity + 1)
  const decrement = () => handleQuantityChange(quantity - 1)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 1
    handleQuantityChange(value)
  }

  const getOrderTypeText = () => {
    if (quantity <= stockLevel) {
      return `${quantity} piece${quantity > 1 ? "s" : ""} available`
    } else {
      const inStock = stockLevel
      const preOrder = quantity - stockLevel
      return `${inStock} in stock + ${preOrder} pre-order`
    }
  }

  return (
    <div className="space-y-3 flex flex-col items-center">
      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={decrement}
          disabled={quantity <= 1}
          className="h-8 w-8 p-0 bg-transparent"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Input
          type="number"
          min="1"
          max={maxQuantity}
          value={quantity}
          onChange={handleInputChange}
          className="w-20 text-center"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={increment}
          disabled={quantity >= maxQuantity}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm text-gray-600 text-center">
        <p className="font-medium">{getOrderTypeText()}</p>
        {stockLevel > 0 && (
          <p className="text-xs mt-1">
            {stockLevel} piece{stockLevel > 1 ? "s" : ""} in stock
            {quantity > stockLevel && " • Rest will be pre-ordered"}
          </p>
        )}
        {stockLevel === 0 && <p className="text-xs mt-1 text-orange-600">All pieces will be pre-ordered</p>}
      </div>
    </div>
  )
}
