import type { Metadata } from "next"
import Image from "next/image"
import Header from "@/components/header"
import { generateMetaTags, generateBreadcrumbSchema } from "@/lib/seo"

// SEO metadata for Why AMA page
export const metadata: Metadata = generateMetaTags({
  title: "Why AMA | Our Story - African Fashion Heritage from Nigeria to Dubai & UK",
  description:
    "Discover the story behind AMA - from Princess Adétọ́lá of Òkè-Igbó to modern luxury African fashion in Dubai and the UK. Four generations of heritage, spirituality, and conscious design rooted in West African tradition.",
  keywords: [
    "African fashion heritage",
    "Nigerian fashion history",
    "Princess Adétọ́lá",
    "Òkè-Igbó royalty",
    "African diaspora fashion",
    "West African textile tradition",
    "adire heritage",
    "ankara history",
    "African fashion Dubai story",
    "Nigerian fashion UK",
    "conscious luxury fashion story",
    "spiritual fashion brand",
    "African fashion lineage",
    "heritage fashion brand",
  ],
  url: "/why-ama",
})

export default function WhyAMAPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Why AMA", url: "/why-ama" },
  ])

  return (
    <div className="min-h-screen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

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

          {/* Uniform gap on mobile, keep gap-24 on md+ */}
          <div className="grid gap-12 md:gap-24">
            {/* Our Lineage - Enhanced for SEO */}
            <section>
              <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-4 text-amber-800 text-center md:text-left">
                Our Lineage
              </h2>
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <div className="text-center md:text-left">
                  <div className="mb-6">
                    <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824] mb-6">
                      AMA is born of four generations, beginning with <strong>Princess Adétọ́lá of Òkè-Igbó</strong>.
                      Raised in a palace and draped in <em>adìrẹ, ankara, and handwoven cloths</em>, her elegance became
                      legacy.
                    </p>
                    <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824]">
                      Her granddaughter, <strong>Olásùbọ̀mí</strong>, created AMA in her memory carrying that lineage
                      from <em>Nigeria to the UK to the UAE</em>. She named her daughter{" "}
                      <strong>Amariah, meaning "God has promised"</strong> a name that holds spiritual intention and the
                      weight of inheritance. AMA, at its core, is a manifestation of that promise: legacy preserved,
                      reimagined in cloth.
                    </p>
                  </div>
                  <p className="text-lg md:text-base italic opacity-80 text-[#2c2824]">
                    Fabric as archive. Migration as muse. Womanhood as sacred inheritance.
                  </p>
                </div>
                {/* Heritage image */}
                <div className="relative w-full h-64 md:h-80 mt-2 md:-mt-8">
                  <Image
                    src="/images/craft.jpeg"
                    alt="Princess Adétọ́lá heritage - Traditional Nigerian royal textiles and adire fabrics representing four generations of African fashion lineage"
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </section>

            {/* Our Craft - Enhanced for SEO */}
            <section className="md:-mt-20">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                {/* Text content */}
                <div className="order-1 md:order-2 text-center md:text-left md:mt-36">
                  <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-4 text-amber-800 text-center md:text-left">
                    Our Craft
                  </h2>
                  <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824]">
                    <strong>Hand-dyed batiks. Heritage adìrẹ. Timeless linen.</strong> Each garment is a ritual, crafted
                    in honor of those who wore them before, and those who still shape them by hand.{" "}
                    <em>Slowness is our devotion. Craft is our offering.</em>
                  </p>
                </div>
                {/* Image */}
                <div className="relative aspect-square order-2 md:order-1 -mt-10 md:mt-0">
                  <Image
                    src="/images/subs.jpeg"
                    alt="Artisan hands working with traditional African textiles - Hand-dyed batik and adire fabric craftsmanship in Dubai and UK"
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </section>

            {/* Manifestation and Materials Side by Side - Enhanced for SEO */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 -mt-10 md:-mt-20">
              {/* Our Manifestation */}
              <section className="flex flex-col text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-4 text-amber-800 text-center md:text-left">
                  Our Manifestation
                </h2>
                <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824]">
                  <strong>Minimalism as ancestral editing.</strong> Simplicity as sacred space. AMA pieces invite
                  presence quiet, intentional, and enduring.
                </p>
              </section>

              {/* Our Materials */}
              <section className="flex flex-col text-center md:text-left mt-0 md:mt-0">
                <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-4 text-amber-800 text-center md:text-left">
                  Our Materials
                </h2>
                <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824]">
                  <strong>
                    100% cotton adìrẹ, dyed in tradition. Ankara rich with heritage. Linen that softens with time.
                  </strong>{" "}
                  All sourced with reverence. All made to carry memory.
                </p>
              </section>
            </div>

            {/* Our Philosophy - Enhanced for SEO */}
            <section className="-mt-6 md:-mt-8">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                <div className="text-center md:text-left md:mt-8">
                  <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-4 text-amber-800 text-center md:text-left">
                    Our Philosophy
                  </h2>
                  <p className="text-xl md:text-1xl italic opacity-80 text-[#2c2824]">
                    We reject fashion as noise. At AMA,{" "}
                    <strong>clothing is ritual. Connection. A quiet revolution in thread.</strong> This is how a
                    princess becomes a movement.
                  </p>
                </div>
                <div className="relative aspect-video bg-[#f4f0e8] rounded-lg flex items-center justify-center mt-4 md:mt-0">
                  {/* Placeholder for video */}
                  <div className="text-center">
                    <p className="text-[#2c2824] opacity-60 mb-2">Video Coming Soon</p>
                    <p className="text-sm text-[#2c2824] opacity-40">Reel/Video to be added here</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Global Presence Section - New for SEO */}
            <section className="bg-[#f4f0e8] -mx-4 px-4 py-12 md:py-16 rounded-lg">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-serif tracking-wider mb-4 text-amber-800">
                  From Nigeria to the World
                </h2>
                <p className="text-lg md:text-xl italic text-[#2c2824] opacity-80 max-w-3xl mx-auto">
                  AMA's journey spans continents, bringing authentic African fashion to global communities while
                  honoring our roots.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Nigeria - Our Roots */}
                <div className="text-center">
                  <div className="text-4xl mb-4">🇳🇬</div>
                  <h3 className="font-serif text-xl text-[#2c2824] mb-3">Nigeria - Our Roots</h3>
                  <p className="text-[#2c2824] opacity-80 text-sm">
                    Born in the palace of Òkè-Igbó, rooted in Yoruba textile traditions of adìrẹ and ankara. Where
                    Princess Adétọ́lá's legacy began.
                  </p>
                </div>

                {/* UAE - Our Present */}
                <div className="text-center">
                  <div className="text-4xl mb-4">🇦🇪</div>
                  <h3 className="font-serif text-xl text-[#2c2824] mb-3">UAE - Our Present</h3>
                  <p className="text-[#2c2824] opacity-80 text-sm">
                    Serving the vibrant African diaspora in Dubai and across the Emirates with conscious luxury fashion
                    that honors heritage.
                  </p>
                </div>

                {/* UK - Our Expansion */}
                <div className="text-center">
                  <div className="text-4xl mb-4">🇬🇧</div>
                  <h3 className="font-serif text-xl text-[#2c2824] mb-3">UK - Our Expansion</h3>
                  <p className="text-[#2c2824] opacity-80 text-sm">
                    Celebrating African heritage in Britain, from London to Essex, connecting diaspora communities
                    through meaningful fashion.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
