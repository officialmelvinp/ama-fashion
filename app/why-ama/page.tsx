import Image from "next/image"
import Header from "@/components/header"

export default function WhyAMAPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />

      <div className="container mx-auto py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-8 text-[#2c2824]">Why AMA</h1>
            <blockquote className="text-xl md:text-2xl italic opacity-80 text-[#2c2824]">
              For women who know the quiet power of presence.
              <br />
              Every thread a prayer. Every silhouette, a sanctuary.
            </blockquote>
          </div>

          <div className="grid gap-24">
            {/* Our Roots */}
            <section>
              <h2 className="text-2xl font-serif mb-8 text-[#2c2824]">Our Roots</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="opacity-80 leading-relaxed text-[#2c2824]">
                    AMA is born from Nigeria, UK, UAE — crafted from migration, memory, and spirit. Our designs carry
                    the essence of these diverse landscapes, honoring the journey of fabric across borders and
                    generations.
                  </p>
                  <p className="opacity-80 leading-relaxed mt-4 text-[#2c2824]">
                    We believe that clothing is more than adornment—it is a living archive of cultural memory, a tactile
                    connection to ancestry, and a daily ritual of self-expression.
                  </p>
                </div>
                <div className="relative aspect-square">
                  <Image
                    src="/images/ama4.jpeg?height=600&width=600"
                    alt="West African landscape"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            </section>

            {/* Our Craft */}
            <section>
              <h2 className="text-2xl font-serif mb-8 text-[#2c2824]">Our Craft</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative aspect-square md:order-1">
                  <Image
                    src="/images/ama5.jpeg?height=600&width=600"
                    alt="Artisan hands working with fabric"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <p className="opacity-80 leading-relaxed text-[#2c2824]">
                    Hand-dyed batiks. Heritage Ankaras. Timeless linen. Every piece is a ritual. Our garments are
                    created with reverence for traditional techniques and the skilled hands that bring them to life.
                  </p>
                  <p className="opacity-80 leading-relaxed mt-4 text-[#2c2824]">
                    We honor the slow, intentional process of creation—from the careful selection of materials to the
                    meditative practice of dyeing and stitching. Each step is an offering, a prayer made visible through
                    craft.
                  </p>
                </div>
              </div>
            </section>

            {/* Our Manifestation */}
            <section>
              <h2 className="text-2xl font-serif mb-8 text-[#2c2824]">Our Manifestation</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="opacity-80 leading-relaxed text-[#2c2824]">
                    Minimalism isn&apos;t emptiness — it&apos;s memory curated. Intention woven fiber by fiber. Our
                    designs embrace simplicity as a canvas for presence, allowing the inherent beauty of our materials
                    and the spirit of the wearer to speak without distraction.
                  </p>
                  <p className="opacity-80 leading-relaxed mt-4 text-[#2c2824]">
                    We believe in creating garments that transcend trends, that become more meaningful with each wear,
                    and that honor the body as a sacred vessel. This is clothing as manifestation—bringing intention
                    into material form.
                  </p>
                </div>
                <div className="relative aspect-square">
                  <Image
                    src="/images/ama3.jpeg?height=600&width=600"
                    alt="Elegant minimalist garment"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
