import { NextResponse } from "next/server"
import { updateStock, recordOrder } from "@/lib/inventory"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { productId, quantityOrdered, customerName, customerEmail, shippingAddress, phoneNumber, notes } =
      await request.json()

    if (!productId || !quantityOrdered || !customerName || !customerEmail) {
      return NextResponse.json({ error: "Missing required order details." }, { status: 400 })
    }

    // Fetch product details to get price and current stock
    // In a real app, you'd fetch the product from your DB to ensure price integrity
    // For now, we'll assume a fixed price or fetch it from inventory.ts if available
    // For simplicity, let's assume a dummy price for now, or you can fetch it from `getProductInventory`
    // For a robust solution, you should fetch the product's current price from the database here.
    // For this example, I'll use a placeholder. You should replace this with actual price lookup.
    const dummyProductPrice = 100 // Replace with actual product price lookup
    const currency = "AED" // Replace with actual currency lookup

    // Update stock
    const stockUpdateResult = await updateStock(productId, quantityOrdered)

    if (!stockUpdateResult.success) {
      return NextResponse.json({ error: "Failed to update product stock." }, { status: 500 })
    }

    const { quantityFromStock, quantityPreorder } = stockUpdateResult
    const totalAmount = dummyProductPrice * quantityOrdered // Calculate total based on fetched price

    // Record the order in the database
    const orderRecorded = await recordOrder({
      productId,
      customerEmail,
      customerName,
      quantityOrdered,
      quantityFromStock,
      quantityPreorder,
      paymentStatus: "completed", // Assuming payment is completed for simplicity
      amountPaid: totalAmount,
      currency,
      shippingAddress,
      phoneNumber,
      notes,
      orderType: quantityPreorder > 0 ? "preorder" : "standard",
      orderStatus: "new", // Initial overall order status
      totalAmount,
      shippingStatus: "paid", // Initial shipping status for new paid orders
    })

    if (!orderRecorded) {
      return NextResponse.json({ error: "Failed to record order." }, { status: 500 })
    }

    // Send order confirmation email
    // Note: We don't await this to avoid blocking the response, but log errors
    sendOrderConfirmationEmail(
      customerEmail,
      customerName,
      "NEW_ORDER", // Placeholder for order ID, will be actual ID from DB in a real scenario
      productId, // Using product_id as product name for now
      quantityOrdered,
      totalAmount,
      currency,
      "completed",
      "paid",
    ).catch((emailError) => {
      console.error("Error sending order confirmation email:", emailError)
    })

    return NextResponse.json({ message: "Order placed successfully!" }, { status: 200 })
  } catch (error) {
    console.error("Error placing order:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
