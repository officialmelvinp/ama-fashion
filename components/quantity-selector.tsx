"use client"

import type React from "react"
import { useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MinusIcon, PlusIcon } from "lucide-react"

interface QuantitySelectorProps {
  productId: string
  value: number // The current quantity, controlled by the parent
  stockLevel: number
  onQuantityChange: (productId: string, quantity: number) => void
  maxQuantity?: number // Overall maximum quantity allowed by the selector (e.g., 99 for UI limit)
  isPreOrderable?: boolean // If true, allows quantity to exceed stockLevel up to maxQuantity
  disabled?: boolean // Disable the entire selector
}

export function QuantitySelector({
  productId,
  value, // Use value prop directly
  stockLevel,
  onQuantityChange,
  maxQuantity = 99, // Default UI max
  isPreOrderable = false,
  disabled = false,
}: QuantitySelectorProps) {
  // Calculate the effective maximum quantity based on stock and pre-order status
  const effectiveMax = useMemo(() => {
    if (isPreOrderable) {
      return maxQuantity // If pre-orderable, allow up to the UI max
    }
    return Math.max(0, stockLevel) // Otherwise, limit to available stock
  }, [isPreOrderable, stockLevel, maxQuantity])

  const handleDecrement = useCallback(() => {
    const newQty = Math.max(1, value - 1) // Minimum quantity is 1
    onQuantityChange(productId, newQty)
  }, [value, onQuantityChange, productId])

  const handleIncrement = useCallback(() => {
    const newQty = Math.min(effectiveMax, value + 1) // Max quantity is effectiveMax
    onQuantityChange(productId, newQty)
  }, [value, effectiveMax, onQuantityChange, productId])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let parsedValue = Number.parseInt(e.target.value, 10)
      if (isNaN(parsedValue) || parsedValue < 1) {
        parsedValue = 1 // Default to 1 if invalid or less than 1
      }
      const newQty = Math.min(effectiveMax, parsedValue) // Clamp to effectiveMax
      onQuantityChange(productId, newQty)
    },
    [effectiveMax, onQuantityChange, productId],
  )

  const isDecrementDisabled = disabled || value <= 1
  const isIncrementDisabled = disabled || value >= effectiveMax

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
        aria-label="Decrease quantity"
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="w-16 text-center"
        min={1}
        max={effectiveMax}
        disabled={disabled}
        aria-live="polite"
        aria-atomic="true"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
        aria-label="Increase quantity"
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
