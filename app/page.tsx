"use client" 
import Image from "next/image"
import Link from "next/link"
// import NewsletterForm from "@/components/newsletter-form"
import Header from "@/components/header"
import HeroSlider from "@/components/hero-slider"
import dynamic from "next/dynamic"

// Disable SSR for NewsletterForm (to prevent hydration mismatch)
const NewsletterForm = dynamic(() => import("@/components/newsletter-form"), { ssr: false })

export default function Home() {
  return (
    <main>
      {/* Navigation Header */}
      <Header />

      {/* Hero Section with Slider */}
      <HeroSlider />

      {/* Brand Poem Section */}
      <section className="bg-[#f4f0e8] py-20 md:py-24">
        <div className="container mx-auto px-8 text-center">
          <blockquote className="font-serif text-2xl md:text-4xl text-[#2c2824] leading-relaxed max-w-4xl mx-auto">
            For women who know the quiet power of presence.
            <br />
            Every thread a prayer. Every silhouette, a sanctuary.
          </blockquote>
        </div>
      </section>

      {/* Collections Section */}
      <section className="bg-[#f4f0e8] py-6 md:py-10">
        <div className="container mx-auto px-8">
          <h2 className="font-serif text-4xl md:text-5xl text-center text-[#2c2824] mb-16 tracking-wide">COLLECTION</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <Link href="/shop#the-manifested-set" className="group">
              <div className="aspect-[3/4] relative mb-4 overflow-hidden">
                <Image
                  src="/images/ama22.jpeg"
                  alt="The Manifested Set Collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-xl text-[#2c2824] text-center">The Manifested Set</h3>
            </Link>

            <Link href="/shop#ayomide" className="group">
              <div className="aspect-[3/4] relative mb-4 overflow-hidden">
                <Image
                  src="/images/cols.jpeg"
                  alt="Ayomide Dress Collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-xl text-[#2c2824] text-center">Ayọ̀mídé</h3>
            </Link>
            <Link href="/shop#ayaba-bubu" className="group">
              <div className="aspect-[3/4] relative mb-4 overflow-hidden">
                <Image
                  src="/images/ama4.jpeg"
                  alt="Ayaba Bubu Collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-xl text-[#2c2824] text-center">Àyaba</h3>
            </Link>

            <Link href="/shop#candy-combat" className="group">
              <div className="aspect-[3/4] relative mb-4 overflow-hidden">
                <Image
                  src="/images/ama5.jpeg"
                  alt="Candy Combat Collection"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-xl text-[#2c2824] text-center">Candy Combat</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Fabrics of Faith Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-8 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-[#2c2824] mb-12 tracking-wide">FABRICS OF FAITH</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link href="/" className="group">
              <div className="aspect-square relative mb-6 overflow-hidden">
                <Image
                  src="/images/ama2.jpeg"
                  alt="Batik fabric"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-2xl text-[#2c2824] mb-2 tracking-wide">BATIK</h3>
              <p className="text-sm text-[#2c2824] opacity-80">100% Cotton</p>
            </Link>
            <Link href="/" className="group">
              <div className="aspect-square relative mb-6 overflow-hidden">
                <Image
                  src="/images/ama9.jpeg"
                  alt="Adire fabric"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-2xl text-[#2c2824] mb-2 tracking-wide">ADIRE</h3>
              <p className="text-sm text-[#2c2824] opacity-80">100% Cotton</p>
            </Link>
            <Link href="/" className="group">
              <div className="aspect-square relative mb-6 overflow-hidden">
                <Image
                  src="/images/ama7.jpeg"
                  alt="Linen fabric"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-2xl text-[#2c2824] mb-2 tracking-wide">LINEN</h3>
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
            <Link href="/why-ama" className="text-white hover:opacity-70 transition-opacity">
              Story
            </Link>
            <Link href="/contact" className="text-white hover:opacity-70 transition-opacity">
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


// import Image from "next/image"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import NewsletterForm from "@/components/newsletter-form"
// import Header from "@/components/header"

// export default function Home() {
//   return (
//     <main>
//       {/* Navigation Header */}
//       <Header />

//       {/* Hero Section */}
//       <section className="relative h-screen flex items-center justify-center text-center text-white">
//         <Image src="/images/ama22.jpeg" alt="Hero Image" fill className="object-cover absolute inset-0 -z-10" />
//         <div className="absolute inset-0 bg-black/40 -z-10" />
//         <div className="container mx-auto px-8">
//           <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-wider leading-tight mb-6 max-w-6xl mx-auto">
//             SOULFULLY MADE.
//             <br />
//             ELEVATED ESSENTIALS.
//           </h1>
//           <div className="text-center">
//             {/* Mobile: Stack vertically, Desktop: Single line */}
//             <div className="text-lg md:text-xl mb-12 tracking-wide opacity-90">
//               <div className="block md:hidden space-y-2">
//                 <p>Natural Textures 🌿</p>
//                 <p>Tailored Simplicity ✂️</p>
//                 <p>Rooted in 🇳🇬 🇦🇪 🇬🇧</p>
//               </div>
//               <p className="hidden md:block">Natural Textures 🌿 | Tailored Simplicity ✂️ | Rooted in 🇳🇬 🇦🇪 🇬🇧</p>
//             </div>

//             <Link href="/shop">
//               <Button
//                 variant="outline"
//                 className="bg-white/10 backdrop-blur-sm border border-white text-white hover:bg-white hover:text-black px-6 md:px-12 py-4 md:py-6 text-sm md:text-base tracking-[0.2em] md:tracking-[0.3em] font-medium transition-all duration-300"
//               >
//                 ENTER THE MANIFESTATION
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Brand Poem Section */}
//       <section className="bg-[#f4f0e8] py-20 md:py-24">
//         <div className="container mx-auto px-8 text-center">
//           <blockquote className="font-serif text-2xl md:text-4xl text-[#2c2824] leading-relaxed max-w-4xl mx-auto">
//             For women who know the quiet power of presence.
//             <br />
//             Every thread a prayer. Every silhouette, a sanctuary.
//           </blockquote>
//         </div>
//       </section>

//       {/* Collections Section */}
//       <section className="bg-[#f4f0e8] py-6 md:py-10">
//         <div className="container mx-auto px-8">
//           <h2 className="font-serif text-4xl md:text-5xl text-center text-[#2c2824] mb-16 tracking-wide">
//             COLLECTION
//           </h2>
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
//             <Link href="/shop#the-manifested-set" className="group">
//               <div className="aspect-[3/4] relative mb-4 overflow-hidden">
//                 <Image
//                   src="/images/ama22.jpeg"
//                   alt="The Manifested Set Collection"
//                   fill
//                   className="object-cover transition-transform duration-500 group-hover:scale-105"
//                 />
//               </div>
//               <h3 className="font-serif text-xl text-[#2c2824] text-center">The Manifested Set</h3>
//             </Link>

//             <Link href="/shop#ayomide" className="group">
//               <div className="aspect-[3/4] relative mb-4 overflow-hidden">
//                 <Image
//                   src="/"
//                   alt="Ayomide Dress Collection"
//                   fill
//                   className="object-cover transition-transform duration-500 group-hover:scale-105"
//                 />
//               </div>
//               <h3 className="font-serif text-xl text-[#2c2824] text-center">Ayọ̀mídé</h3>
//             </Link>
//             <Link href="/shop#ayaba-bubu" className="group">
//               <div className="aspect-[3/4] relative mb-4 overflow-hidden">
//                 <Image
//                   src="/images/ama4.jpeg"
//                   alt="Ayaba Bubu Collection"
//                   fill
//                   className="object-cover transition-transform duration-500 group-hover:scale-105"
//                 />
//               </div>
//               <h3 className="font-serif text-xl text-[#2c2824] text-center">Àyaba</h3>
//             </Link>

//             <Link href="/shop#candy-combat" className="group">
//               <div className="aspect-[3/4] relative mb-4 overflow-hidden">
//                 <Image
//                   src="/images/ama5.jpeg"
//                   alt="Candy Combat Collection"
//                   fill
//                   className="object-cover transition-transform duration-500 group-hover:scale-105"
//                 />
//               </div>
//               <h3 className="font-serif text-xl text-[#2c2824] text-center">Candy Combat</h3>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Fabrics of Faith Section */}
//       <section className="py-16 md:py-20">
//         <div className="container mx-auto px-8 text-center">
//           <h2 className="font-serif text-4xl md:text-5xl text-[#2c2824] mb-12 tracking-wide">FABRICS OF FAITH</h2>
//           <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
//             <Link href="/" className="group">
//               <div className="aspect-square relative mb-6 overflow-hidden">
//                 <Image
//                   src="/images/ama2.jpeg"
//                   alt="Batik fabric"
//                   fill
//                   className="object-cover transition-transform duration-500 group-hover:scale-105"
//                 />
//               </div>
//               <h3 className="font-serif text-2xl text-[#2c2824] mb-2 tracking-wide">BATIK</h3>
//               <p className="text-sm text-[#2c2824] opacity-80">100% Cotton</p>
//             </Link>
//             <Link href="/" className="group">
//               <div className="aspect-square relative mb-6 overflow-hidden">
//                 <Image
//                   src="/images/ama9.jpeg"
//                   alt="Adire fabric"
//                   fill
//                   className="object-cover transition-transform duration-500 group-hover:scale-105"
//                 />
//               </div>
//               <h3 className="font-serif text-2xl text-[#2c2824] mb-2 tracking-wide">ADIRE</h3>
//               <p className="text-sm text-[#2c2824] opacity-80">100% Cotton</p>
//             </Link>
//             <Link href="/" className="group">
//               <div className="aspect-square relative mb-6 overflow-hidden">
//                 <Image
//                   src="/images/ama7.jpeg"
//                   alt="Linen fabric"
//                   fill
//                   className="object-cover transition-transform duration-500 group-hover:scale-105"
//                 />
//               </div>
//               <h3 className="font-serif text-2xl text-[#2c2824] mb-2 tracking-wide">LINEN</h3>
//               <p className="text-sm text-[#2c2824] opacity-80">100% Cotton</p>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Newsletter Section */}
//       <section className="bg-[#2c2824] py-16 md:py-20">
//         <div className="container mx-auto px-8 text-center text-white">
//           <NewsletterForm />
//         </div>
//       </section>

//       <footer className="bg-[#2c2824] py-12">
//         <div className="container mx-auto px-8">
//           <div className="flex justify-center gap-8 mb-8">
//             <Link href="/shop" className="text-white hover:opacity-70 transition-opacity">
//               Shop
//             </Link>
//             <Link href="/why-ama" className="text-white hover:opacity-70 transition-opacity">
//               Story
//             </Link>
//             <Link href="/contact" className="text-white hover:opacity-70 transition-opacity">
//               FAQ
//             </Link>
//             <Link href="/contact" className="text-white hover:opacity-70 transition-opacity">
//               Contact
//             </Link>
//           </div>
//           <div className="text-center">
//             <p className="text-white/60 text-sm italic">Fabric is our first memory. The skin before skin.</p>
//           </div>
//         </div>
//       </footer>
//     </main>
//   )
// }