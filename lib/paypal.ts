// Simple client-side function to call our API
export async function createPayPalOrder(productId: string, amount: number) {
  const response = await fetch("/api/paypal/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, amount }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create PayPal order")
  }

  return response.json()
}

// Capture PayPal payment (server-side API call)
export async function capturePayPalOrder(orderId: string) {
  const response = await fetch("/api/paypal/capture-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to capture PayPal order")
  }

  return response.json()
}
