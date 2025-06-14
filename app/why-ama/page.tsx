import Image from "next/image"
import Header from "@/components/header"

export default function WhyAMAPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />

      <div className="container mx-auto py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-8 text-[#2c2824]">Why AMA</h1>
            <blockquote className="text-xl md:text-2xl italic opacity-80 text-[#2c2824]">
              For women who know the quiet power of presence.
              <br />
              Every thread a prayer. Every silhouette, a sanctuary.
            </blockquote>
          </div>

          {/* Reduced gap on mobile from gap-24 to gap-12, keep gap-24 on md+ */}
          <div className="grid gap-12 md:gap-24">
            {/* Our Lineage */}
            <section>
              <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-4 text-[#2c2824] text-center md:text-left">
                Our Lineage
              </h2>
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <div className="text-center md:text-left">
                  <div className="mb-6">
                    <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824] mb-6">
                      AMA is born of four generations, beginning with Princess Adétọ́lá of Òkè-Igbó. Raised in a palace
                      and draped in adìrẹ, ankara, and handwoven cloths, her elegance became legacy.
                    </p>
                    <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824]">
                      Her granddaughter, Olásùbọ̀mí, created AMA in her memory carrying that lineage from Nigeria to the
                      UK to the UAE. She named her daughter Amariah, meaning "God has promised" a name that holds
                      spiritual intention and the weight of inheritance. AMA, at its core, is a manifestation of that
                      promise: legacy preserved, reimagined in cloth.
                    </p>
                  </div>
                  <p className="text-xl md:text-lg italic opacity-80 text-[#2c2824]">
                    Fabric as archive. Migration as muse. Womanhood as sacred inheritance.
                  </p>
                </div>
                {/* Reduced heritage image top margin on mobile */}
                <div className="relative w-full h-64 md:h-80 mt-6 md:-mt-8">
                  <Image
                    src="/images/craft.jpeg"
                    alt="Princess Adétọ́lá heritage"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </div>
            </section>

            {/* Our Craft */}
            <section>
              {/* Further reduced negative margin for mobile */}
              <section className="-mt-8 md:-mt-20"></section>
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                {/* Text content - will be first on mobile, second on desktop */}
                <div className="order-1 md:order-2 text-center md:text-left md:mt-36">
                  <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-2 text-[#2c2824]">Our Craft</h2>
                  <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824]">
                    Hand-dyed batiks. Heritage adìrẹ. Timeless linen. Each garment is a ritual, crafted in honor of
                    those who wore them before, and those who still shape them by hand. Slowness is our devotion. Craft
                    is our offering.
                  </p>
                </div>
                {/* Image - further reduced top margin on mobile */}
                <div className="relative aspect-square order-2 md:order-1 -mt-1 md:mt-0">
                  <Image
                    src="/images/subs.jpeg"
                    alt="Artisan hands working with fabric"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </div>
            </section>

            {/* Manifestation and Materials Side by Side */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 -mt-8 md:-mt-20">
              {/* Our Manifestation */}
              <section className="flex flex-col text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-4 text-[#2c2824]">
                  Our Manifestation
                </h2>
                <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824]">
                  Minimalism as ancestral editing. Simplicity as sacred space. AMA pieces invite presence quiet,
                  intentional, and enduring.
                </p>
              </section>

              {/* Our Materials - further reduced top margin on mobile */}
              <section className="flex flex-col text-center md:text-left mt-4 md:mt-0">
                <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-4 text-[#2c2824]">Our Materials</h2>
                <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824]">
                  100% cotton adìrẹ, dyed in tradition. Ankara rich with heritage. Linen that softens with time. All
                  sourced with reverence. All made to carry memory.
                </p>
              </section>
            </div>

            {/* Our Philosophy */}
            <section className="-mt-6 md:-mt-8">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                <div className="text-center md:text-left md:mt-8">
                  <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-4 text-[#2c2824]">Our Philosophy</h2>
                  <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824]">
                    We reject fashion as noise. At AMA, clothing is ritual. Connection. A quiet revolution in thread.
                    This is how a princess becomes a movement.
                  </p>
                </div>
                <div className="relative aspect-video bg-[#f4f0e8] rounded-lg flex items-center justify-center mt-6 md:mt-0">
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
