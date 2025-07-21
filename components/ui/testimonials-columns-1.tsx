"use client"
import { motion } from "framer-motion"

export interface Testimonial {
  text: string
  image: string
  name: string
  role: string
}

// Business Intelligence focused testimonials that match your app
const defaultTestimonials: Testimonial[] = [
  {
    text: "Sleft Signals transformed our business strategy. The AI-powered insights revealed opportunities we never knew existed.",
    image: "/testimonials/user1.jpg",
    name: "Briana Patton",
    role: "Operations Manager"
  },
  {
    text: "The strategic connections feature helped us find the perfect partners. Our revenue increased by 40% in just 3 months.",
    image: "/testimonials/user2.jpg",
    name: "Bilal Ahmed",
    role: "CEO"
  },
  {
    text: "The competitive edge analysis was spot-on. We repositioned our business and gained significant market share.",
    image: "/testimonials/user3.jpg",
    name: "Saman Malik",
    role: "Strategy Director"
  },
  {
    text: "Sleft Signals' leverage opportunities helped us identify new revenue streams we hadn't considered before.",
    image: "/testimonials/user4.jpg",
    name: "Omar Raza",
    role: "Business Development"
  },
  {
    text: "The AI-powered briefs are incredibly detailed and actionable. It's like having a consultant on demand.",
    image: "/testimonials/user5.jpg",
    name: "Zainab Hussain",
    role: "Project Manager"
  },
  {
    text: "The platform's insights helped us optimize our operations and reduce costs by 25% while increasing efficiency.",
    image: "/testimonials/user6.jpg",
    name: "Aliza Khan",
    role: "Business Analyst"
  },
  {
    text: "Outstanding platform! The strategic recommendations were game-changing for our marketing approach.",
    image: "/testimonials/user7.jpg",
    name: "Farhan Siddiqui",
    role: "Marketing Director"
  },
  {
    text: "Sleft Signals helped us identify key partnerships that accelerated our growth beyond expectations.",
    image: "/testimonials/user8.jpg",
    name: "Sana Sheikh",
    role: "Sales Manager"
  },
  {
    text: "The AI analysis provided insights that helped us pivot our business model and achieve 3x growth.",
    image: "/testimonials/user9.jpg",
    name: "Hassan Ali",
    role: "E-commerce Manager"
  },
  {
    text: "The market intelligence feature gave us the edge we needed to outperform our competitors consistently.",
    image: "/testimonials/user10.jpg",
    name: "Fatima Sheikh",
    role: "Market Research Lead"
  }
]

export const TestimonialsColumn = ({
  className,
  testimonials = defaultTestimonials,
  duration = 15,
}: {
  className?: string
  testimonials?: Testimonial[]
  duration?: number
}) => {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {/* Duplicate testimonials for seamless loop */}
        {[...Array(2)].flatMap((_, dupIdx) =>
          testimonials.map(({ text, image, name, role }, i) => (
            <div
              key={`${dupIdx}-${i}`}
              className="p-6 rounded-3xl border border-yellow-500/20 bg-black/50 backdrop-blur-sm shadow-lg shadow-yellow-500/5 max-w-xs w-full hover:border-yellow-500/40 transition-colors duration-300"
            >
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{text}</p>
              <div className="flex items-center gap-3">
                <img
                  src={image}
                  width={40}
                  height={40}
                  alt={`${name} - ${role}`}
                  className="h-10 w-10 rounded-full border border-yellow-500/30 object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                  }}
                />
                <div className="flex flex-col">
                  <span className="font-medium tracking-tight leading-5 text-white">{name}</span>
                  <span className="leading-5 opacity-60 tracking-tight text-yellow-500 text-sm">{role}</span>
                </div>
              </div>
            </div>
          )),
        )}
      </motion.div>
    </div>
  )
}