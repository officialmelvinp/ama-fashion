"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectFade, Pagination } from "swiper/modules"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

import "swiper/css"
import "swiper/css/effect-fade"
import "swiper/css/pagination"

// Hero images array
const heroImages = [
  { src: "/images/ama3.jpeg", alt: "Hero Image 1" },
  { src: "/images/ama11.jpeg", alt: "Hero Image 2" },
  { src: "/images/ama333.jpeg", alt: "Hero Image 3" },
  { src: "/images/amaxz.jpeg", alt: "Hero Image 4" },
  { src: "/images/amajjj.jpeg", alt: "Hero Image 5" },
  { src: "/images/ama444.jpeg", alt: "Hero Image 6" },
  { src: "/images/hero.jpeg", alt: "Hero Image 7" },
  { src: "/images/ama999.jpeg", alt: "Hero Image 8" },
  { src: "/images/subs.jpeg", alt: "Hero Image 9" },
]

export default function HeroSlider() {
  return (
    <section className="relative w-full flex items-center pt-28 md:pt-32">
      {/* Container */}
      <div className="container mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center md:items-stretch justify-between gap-12">
        
        {/* Left: Hero Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-center relative z-20"
        >
          {/* Colorful background for desktop only */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-tr from-[#FDE68A] via-[#FECACA] to-[#FBBF24] -z-10 rounded-3xl shadow-2xl opacity-95" />

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-wider leading-tight mb-6 text-[#2c2824]">
            SOULFULLY MADE.
            <br />
            ELEVATED ESSENTIALS.
          </h1>
          <p className="text-lg md:text-xl opacity-80 mb-8">
            Natural Textures 🌿 | Tailored Simplicity ✂️ | Rooted in 🇳🇬 🇦🇪 🇬🇧
          </p>
        </motion.div>

        {/* Right: Hero Slider */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-full md:w-1/2 h-[350px] md:h-[450px] lg:h-[500px] relative rounded-3xl overflow-hidden shadow-xl"
        >
          <Swiper
            modules={[Autoplay, EffectFade, Pagination]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
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
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-black/10 md:bg-transparent" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Centered button */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <Link href="/shop" className="pointer-events-auto">
              <Button
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border border-[#2c2824] text-[#2c2824] hover:bg-[#2c2824] hover:text-white px-6 md:px-12 py-4 md:py-6 text-sm md:text-base tracking-[0.2em] md:tracking-[0.3em] font-medium transition-all duration-300"
              >
                ENTER THE MANIFESTATION
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Pagination CSS */}
      <style jsx global>{`
        .hero-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
          margin: 0 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .hero-pagination-bullet-active {
          background: rgba(0,0,0,0.8);
          width: 30px;
          border-radius: 5px;
        }
        .swiper-pagination {
          bottom: 20px !important;
          z-index: 30;
        }
        @media (max-width: 768px) {
          .swiper-pagination {
            bottom: 100px !important;
          }
        }
      `}</style>
    </section>
  )
}
