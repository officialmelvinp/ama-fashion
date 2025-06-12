import Image from "next/image"
import Header from "@/components/header"

export default function WhyAMAPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />

      <div className="container mx-auto py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-8 text-[#2c2824]">Why AMA</h1>
            <blockquote className="text-xl md:text-2xl italic opacity-80 text-[#2c2824]">
              For women who know the quiet power of presence.
              <br />
              Every thread a prayer. Every silhouette, a sanctuary.
            </blockquote>
          </div>

          <div className="grid gap-24">
            {/* Our Lineage */}
            <section>
              <h2 className="text-3xl font-serif mb-8 text-[#8B4513]">Our Lineage</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-lg leading-relaxed text-[#2c2824] mb-6">
                    AMA is born of four generations, beginning with Princess Adétọ́lá of Òkè-Igbó. Raised in a palace and
                    draped in adìrẹ, ankara, and handwoven cloths, her elegance became legacy.
                  </p>
                  <p className="text-lg leading-relaxed text-[#2c2824] mb-6">
                    Her granddaughter, Olásùbọ̀mí, created AMA in her memory carrying that lineage from Nigeria to the UK
                    to the UAE. She named her daughter Amariah, meaning "God has promised" a name that holds spiritual
                    intention and the weight of inheritance. AMA, at its core, is a manifestation of that promise:
                    legacy preserved, reimagined in cloth.
                  </p>
                  <p className="text-lg leading-relaxed text-[#2c2824] italic font-medium">
                    Fabric as archive. Migration as muse. Womanhood as sacred inheritance.
                  </p>
                </div>
                <div className="relative aspect-square">
                  <Image
                    src="/images/iyamuke.jpeg"
                    alt="Princess Adétọ́lá heritage"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            </section>

            {/* Our Craft */}
            <section>
              <h2 className="text-3xl font-serif mb-8 text-[#8B4513]">Our Craft</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative aspect-square md:order-1">
                  <Image
                    src="/images/craft.jpeg"
                    alt="Artisan hands working with fabric"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-lg leading-relaxed text-[#2c2824] mb-6">
                    Hand-dyed batiks. Heritage adìrẹ. Timeless linen. Each garment is a ritual, crafted in honor of
                    those who wore them before, and those who still shape them by hand. Slowness is our devotion. Craft
                    is our offering.
                  </p>
                </div>
              </div>
            </section>

            {/* Our Manifestation */}
            <section>
              <h2 className="text-3xl font-serif mb-8 text-[#8B4513]">Our Manifestation</h2>
              <div className="max-w-4xl">
                <p className="text-lg leading-relaxed text-[#2c2824]">
                  Minimalism as ancestral editing. Simplicity as sacred space. AMA pieces invite presence quiet,
                  intentional, and enduring.
                </p>
              </div>
            </section>

            {/* Our Materials */}
            <section>
              <h2 className="text-3xl font-serif mb-8 text-[#8B4513]">Our Materials</h2>
              <div className="max-w-4xl">
                <p className="text-lg leading-relaxed text-[#2c2824]">
                  100% cotton adìrẹ, dyed in tradition. Ankara rich with heritage. Linen that softens with time. All
                  sourced with reverence. All made to carry memory.
                </p>
              </div>
            </section>

            {/* Our Philosophy */}
            <section>
              <h2 className="text-3xl font-serif mb-8 text-[#8B4513]">Our Philosophy</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-lg leading-relaxed text-[#2c2824]">
                    We reject fashion as noise. At AMA, clothing is ritual. Connection. A quiet revolution in thread.
                    This is how a princess becomes a movement.
                  </p>
                </div>
                <div className="relative aspect-video bg-[#f4f0e8] rounded-lg flex items-center justify-center">
                  {/* Placeholder for video - replace with actual video component when ready */}
                  <div className="text-center">
                    <p className="text-[#2c2824] opacity-60 mb-2">Video Coming Soon</p>
                    <p className="text-sm text-[#2c2824] opacity-40">Reel/Video to be added here</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
