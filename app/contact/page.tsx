import type { Metadata } from "next"
import Header from "@/components/header"
import ContactForm from "@/components/contact-form"
import { generateMetaTags, generateBreadcrumbSchema } from "@/lib/seo"

// SEO metadata for contact page
export const metadata: Metadata = generateMetaTags({
  title: "Contact AMA | African Fashion Boutique in Dubai & UK - Get in Touch",
  description:
    "Contact AMA for luxury African fashion inquiries. Based in Dubai, UAE and serving the UK. Custom orders, styling consultations, and heritage fashion questions welcome. WhatsApp, email, and social media available.",
  keywords: [
    "contact African fashion Dubai",
    "AMA fashion contact",
    "African fashion boutique Dubai contact",
    "luxury African fashion UK contact",
    "custom African dress orders",
    "African fashion styling consultation",
    "bubu dress custom order",
    "African fashion WhatsApp Dubai",
    "heritage fashion consultation",
    "African fashion customer service",
  ],
  url: "/contact",
})

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ])

  return (
    <div className="min-h-screen bg-[#f8f3ea]">
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
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-8 text-[#2c2824]">Contact AMA</h1>
            <p className="text-xl md:text-2xl italic opacity-80 text-[#2c2824] max-w-3xl mx-auto">
              Connect with us for custom orders, styling consultations, or to learn more about our heritage fashion
              collections.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif mb-6 text-[#2c2824]">Get in Touch</h2>
                <p className="text-lg text-[#2c2824] opacity-80 mb-8">
                  We're here to help you find the perfect piece or answer any questions about our African fashion
                  collections.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                {/* WhatsApp */}
                <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl">📱</div>
                  <div>
                    <h3 className="font-serif text-xl text-[#2c2824] mb-2">WhatsApp</h3>
                    <p className="text-[#2c2824] opacity-80 mb-3">
                      Preferred method for quick responses and order coordination
                    </p>
                    <a
                      href="https://wa.me/+447707783963"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Contact AMA via WhatsApp"
                    >
                      <span>Message us on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h3 className="font-serif text-xl text-[#2c2824] mb-2">Email</h3>
                    <p className="text-[#2c2824] opacity-80 mb-3">For detailed inquiries and custom orders</p>
                    <a
                      href="mailto:support@amariahco.com"
                      className="text-[#2c2824] hover:opacity-70 transition-opacity font-medium"
                    >
                      support@amariahco.com
                    </a>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl">📸</div>
                  <div>
                    <h3 className="font-serif text-xl text-[#2c2824] mb-2">Social Media</h3>
                    <p className="text-[#2c2824] opacity-80 mb-3">Follow our journey and see our latest collections</p>
                    <div className="flex gap-4">
                      <a
                        href="https://www.instagram.com/amariahco?igsh=MTlwd291Ym5uYXFxeg=="
                        className="text-[#2c2824] hover:opacity-70 transition-opacity"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Follow AMA on Instagram"
                      >
                        Instagram
                      </a>
                      <a
                        href="https://facebook.com/amafashion"
                        className="text-[#2c2824] hover:opacity-70 transition-opacity"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Follow AMA on Facebook"
                      >
                        Facebook
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-[#2c2824] text-white p-8 rounded-lg">
                <h3 className="font-serif text-2xl mb-6">Our Locations</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-2">🇦🇪 Dubai, UAE</h4>
                    <p className="opacity-90 text-sm">
                      Serving the vibrant African diaspora across the Emirates with luxury heritage fashion.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-lg mb-2">🇬🇧 United Kingdom</h4>
                    <p className="opacity-90 text-sm">
                      Connecting African communities from London to Essex with conscious luxury fashion.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-serif mb-6 text-[#2c2824]">Send us a Message</h2>
              <ContactForm />
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-serif text-center mb-12 text-[#2c2824]">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-serif text-lg text-[#2c2824] mb-3">Do you offer custom sizing?</h3>
                <p className="text-[#2c2824] opacity-80 text-sm">
                  Yes! We offer custom sizing for all our pieces. Contact us via WhatsApp with your measurements for a
                  personalized fit.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-serif text-lg text-[#2c2824] mb-3">What are your shipping options?</h3>
                <p className="text-[#2c2824] opacity-80 text-sm">
                  We offer delivery across UAE and UK. Shipping costs and times vary by location. Contact us for
                  specific details.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-serif text-lg text-[#2c2824] mb-3">Can I see pieces in person?</h3>
                <p className="text-[#2c2824] opacity-80 text-sm">
                  We offer private styling consultations in Dubai and selected UK locations. WhatsApp us to arrange a
                  viewing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-serif text-lg text-[#2c2824] mb-3">Do you ship internationally?</h3>
                <p className="text-[#2c2824] opacity-80 text-sm">
                  Currently, we serve UAE and UK. For international inquiries, please contact us to discuss options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
