"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectFade, Pagination } from "swiper/modules"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import "swiper/css"
import "swiper/css/effect-fade"
import "swiper/css/pagination"

// Array of hero images - you can easily add more images here (up to 10)
const heroImages = [
  { src: "/images/ama3.jpeg", alt: "Hero Image 1" },
  { src: "/images/ama11.jpeg", alt: "Hero Image 2" },
  { src: "/images/ama333.jpeg", alt: "Hero Image 3" },
  { src: "/images/amaxy.jpeg", alt: "Hero Image 4" },
  { src: "/images/amaxz.jpeg", alt: "Hero Image 5" },
  { src: "/images/amajjj.jpeg", alt: "Hero Image 5" },
  { src: "/images/ama444.jpeg", alt: "Hero Image 6" },
  { src: "/images/ama999.jpeg", alt: "Hero Image 7" },
  { src: "/images/subs.jpeg", alt: "Hero Image 8" },
  // Add more images here as needed (max 10)
]

export default function HeroSlider() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center text-white">
      {/* Swiper Background Slider */}
      <div className="absolute inset-0 -z-10">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={1500}
          pagination={{
            clickable: true,
            bulletClass: "hero-pagination-bullet",
            bulletActiveClass: "hero-pagination-bullet-active",
          }}
          className="w-full h-full"
        >
          {heroImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-8 relative z-20">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-wider leading-tight mb-6 max-w-6xl mx-auto">
          SOULFULLY MADE.
          <br />
          ELEVATED ESSENTIALS.
        </h1>
        <div className="text-center">
          {/* Mobile: Stack vertically, Desktop: Single line */}
          <div className="text-lg md:text-xl mb-12 tracking-wide opacity-90">
            <div className="block md:hidden space-y-2">
              <p>Natural Textures 🌿</p>
              <p>Tailored Simplicity ✂️</p>
              <p>Rooted in 🇳🇬 🇦🇪 🇬🇧</p>
            </div>
            <p className="hidden md:block">Natural Textures 🌿 | Tailored Simplicity ✂️ | Rooted in 🇳🇬 🇦🇪 🇬🇧</p>
          </div>

          <Link href="/shop">
            <Button
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border border-white text-white hover:bg-white hover:text-black px-6 md:px-12 py-4 md:py-6 text-sm md:text-base tracking-[0.2em] md:tracking-[0.3em] font-medium transition-all duration-300"
            >
              ENTER THE MANIFESTATION
            </Button>
          </Link>
        </div>
      </div>

      {/* Custom CSS for pagination dots */}
      <style jsx global>{`
        .hero-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          margin: 0 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-block;
          opacity: 1;
        }
        
        .hero-pagination-bullet-active {
          background: rgba(255, 255, 255, 0.95);
          width: 30px;
          border-radius: 5px;
        }

        .swiper-pagination {
          bottom: 30px !important;
          z-index: 30;
        }

        @media (max-width: 768px) {
          .swiper-pagination {
            bottom: 120px !important;
          }
        }
      `}</style>
    </section>
  )
}
