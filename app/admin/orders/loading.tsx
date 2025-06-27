export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[#f8f3ea] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
        <p className="text-[#2c2824]">Loading orders...</p>
      </div>
    </div>
  )
}
