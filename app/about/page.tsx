import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="w-full py-6 px-4 md:px-8 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between max-w-7xl">
          <Link href="/" className="text-2xl md:text-3xl font-serif tracking-wider text-[#2c2824]">
            AMA
          </Link>
          <nav className="flex items-center space-x-6 md:space-x-8">
            <Link
              href="/"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] opacity-80"
            >
              HOME
            </Link>
            <Link
              href="/about"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] opacity-100"
            >
              ABOUT
            </Link>
            <Link
              href="/shop"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] opacity-80"
            >
              SHOP
            </Link>
            <Link
              href="/why-ama"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] opacity-80"
            >
              WHY AMA
            </Link>
            <Link
              href="/contact"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] opacity-80"
            >
              CONTACT
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif mb-12 text-center text-[#2c2824]">About AMA</h1>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-2xl font-serif mb-6 text-[#2c2824]">Our Story</h2>
              <p className="mb-4 opacity-80">
                AMA was born from a deep reverence for heritage textiles and the stories they carry. Our founder,
                drawing from her roots across Nigeria, the UAE, and the UK, created a brand that honors the sacred
                relationship between fabric and identity.
              </p>
              <p className="opacity-80">
                Each piece in our collection is more than clothing—it is a vessel for memory, intention, and the quiet
                power of presence. We believe in the transformative nature of garments crafted with reverence and worn
                with purpose.
              </p>
            </div>
            <div className="relative aspect-square">
              <Image
                src="/images/ama2.jpeg?height=600&width=600"
                alt="Artisan hands working with fabric"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="relative aspect-square md:order-1">
              <Image
                src="/images/ama4.jpeg?height=600&width=600"
                alt="Close-up of fabric texture"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-2xl font-serif mb-6 text-[#2c2824]">Our Materials</h2>
              <p className="mb-4 opacity-80">
                We source our materials with intention, working directly with artisans who practice traditional dyeing
                and weaving techniques. Our batiks and ankaras are 100% cotton, hand-dyed using methods passed down
                through generations.
              </p>
              <p className="opacity-80">
                Our linen pieces offer a complementary texture—breathable, durable, and becoming more beautiful with
                each wear. We believe in creating garments that age gracefully, developing character and deepening their
                relationship with the wearer over time.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-serif mb-6 text-[#2c2824]">Our Philosophy</h2>
              <p className="mb-4 opacity-80">
                At AMA, we reject the notion of fashion as mere consumption. Instead, we embrace clothing as ritual—each
                garment an opportunity to connect with ancestry, intention, and self.
              </p>
              <p className="opacity-80">
                Our designs embrace minimalism not as emptiness, but as carefully curated memory. We believe in the
                power of simplicity to amplify presence, allowing the wearer&apos;s spirit to shine through unencumbered
                by excess.
              </p>
            </div>
            <div className="relative aspect-square">
              <Image
                src="/images/ama9.jpeg?height=600&width=600"
                alt="Serene landscape with earth tones"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
