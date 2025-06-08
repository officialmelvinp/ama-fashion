import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import NewsletterForm from "@/components/newsletter-form"

export default function Home() {
  return (
    <main>
      {/* Navigation Header */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8">
        <div className="container mx-auto flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl font-serif tracking-wider text-white">
            AMA
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6 md:space-x-8">
            <Link
              href="/"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-white opacity-100"
            >
              HOME
            </Link>
            <Link
              href="/about"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-white opacity-80"
            >
              ABOUT
            </Link>
            <Link
              href="/shop"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-white opacity-80"
            >
              SHOP
            </Link>
            <Link
              href="/why-ama"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-white opacity-80"
            >
              WHY AMA
            </Link>
            <Link
              href="/contact"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-white opacity-80"
            >
              CONTACT
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center text-white">
        <Image src="/images/ama1.jpeg" alt="Hero Image" fill className="object-cover absolute inset-0 -z-10" />
        <div className="absolute inset-0 bg-black/40 -z-10" />
        <div className="container mx-auto px-8">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-wider leading-tight mb-6 max-w-6xl mx-auto">
            SOULFULLY MADE.
            <br />
            ELEVATED ESSENTIALS.
          </h1>
          <p className="text-lg md:text-xl mb-12 tracking-wide opacity-90">
            Natural Textures 🌿 | Tailored Simplicity ✂️ | Rooted in 🇳🇬 🇦🇪 🇬🇧
          </p>
          <Link href="/why-ama">
            <Button
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border border-white text-white hover:bg-white hover:text-black px-12 py-6 text-base tracking-[0.3em] font-medium transition-all duration-300"
            >
              ENTER THE MANIFESTATION
            </Button>
          </Link>
        </div>
      </section>

      {/* Brand Poem Section */}
      <section className="bg-[#f4f0e8] py-20 md:py-32">
        <div className="container mx-auto px-8 text-center">
          <blockquote className="font-serif text-2xl md:text-4xl text-[#2c2824] leading-relaxed max-w-4xl mx-auto">
            For women who know the quiet power of presence.
            <br />
            Every thread a prayer. Every silhouette, a sanctuary.
          </blockquote>
        </div>
      </section>

      {/* Collections Section */}
      <section className="bg-[#f4f0e8] py-16 md:py-20">
        <div className="container mx-auto px-8">
          <h2 className="font-serif text-4xl md:text-5xl text-center text-[#2c2824] mb-16 tracking-wide">
            COLLECTIONS
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <Link href="/shop#ayaba-bubu" className="group">
              <div className="aspect-[3/4] relative mb-4 overflow-hidden">
                <Image
                  src="/images/ama2.jpeg"
                  alt="Ayaba Bubu Collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-xl text-[#2c2824] text-center">Ayaba Bubu</h3>
            </Link>

            <Link href="/shop#candy-combat" className="group">
              <div className="aspect-[3/4] relative mb-4 overflow-hidden">
                <Image
                  src="/images/ama3.jpeg"
                  alt="Candy Combat Collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-xl text-[#2c2824] text-center">Candy Combat</h3>
            </Link>

            <Link href="/shop#the-manifested-set" className="group">
              <div className="aspect-[3/4] relative mb-4 overflow-hidden">
                <Image
                  src="/images/ama4.jpeg"
                  alt="The Manifested Set Collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-xl text-[#2c2824] text-center">The Manifested Set</h3>
            </Link>

            <Link href="/shop#milkmaid-dress" className="group">
              <div className="aspect-[3/4] relative mb-4 overflow-hidden">
                <Image
                  src="/images/ama5.jpeg"
                  alt="Milkmaid Dress Collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-xl text-[#2c2824] text-center">Milkmaid Dress</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Fabrics of Faith Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-8 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-[#2c2824] mb-12 tracking-wide">FABRICS OF FAITH</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link href="/shop" className="group">
              <div className="aspect-square relative mb-6 overflow-hidden">
                <Image
                  src="/images/ama2.jpeg"
                  alt="OFO Batik fabric"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-2xl text-[#2c2824] mb-2 tracking-wide">OFO BATIK</h3>
              <p className="text-sm text-[#2c2824] opacity-80">100% Cotton</p>
            </Link>
            <Link href="/shop" className="group">
              <div className="aspect-square relative mb-6 overflow-hidden">
                <Image
                  src="/images/ama6.jpeg"
                  alt="Aso Oke fabric"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-2xl text-[#2c2824] mb-2 tracking-wide">ASO OKE</h3>
              <p className="text-sm text-[#2c2824] opacity-80">100% Cotton</p>
            </Link>
            <Link href="/shop" className="group">
              <div className="aspect-square relative mb-6 overflow-hidden">
                <Image
                  src="/images/ama7.jpeg"
                  alt="Adire Eleko fabric"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-2xl text-[#2c2824] mb-2 tracking-wide">ADIRE ELEKO</h3>
              <p className="text-sm text-[#2c2824] opacity-80">100% Cotton</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[#2c2824] py-16 md:py-20">
        <div className="container mx-auto px-8 text-center text-white">
          <NewsletterForm />
        </div>
      </section>

      <footer className="bg-[#2c2824] py-12">
        <div className="container mx-auto px-8">
          <div className="flex justify-center gap-8 mb-8">
            <Link href="/shop" className="text-white hover:opacity-70 transition-opacity">
              Shop
            </Link>
            <Link href="/about" className="text-white hover:opacity-70 transition-opacity">
              Story
            </Link>
            <Link href="/why-ama" className="text-white hover:opacity-70 transition-opacity">
              FAQ
            </Link>
            <Link href="/contact" className="text-white hover:opacity-70 transition-opacity">
              Contact
            </Link>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-sm italic">Fabric is our first memory. The skin before skin.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
