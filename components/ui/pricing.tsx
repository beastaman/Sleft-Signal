"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { buttonVariants } from "@/components/ui/button"
import { Check, Star } from "lucide-react"

interface PricingPlan {
  name: string
  price: string
  yearlyPrice: string
  period: string
  features: string[]
  description: string
  buttonText: string
  href: string
  isPopular: boolean
}

interface PricingProps {
  plans: PricingPlan[]
  title?: string
  description?: string
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you. All plans include access to our AI-powered platform and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true)

  return (
    <div className="container py-20">
      <header className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">{title}</h2>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto whitespace-pre-line">{description}</p>

        <div className="flex justify-center items-center gap-4 pt-4">
          <span className="text-gray-400">Monthly</span>
          <Switch
            checked={!isMonthly}
            onCheckedChange={(checked) => setIsMonthly(!checked)}
            className="data-[state=checked]:bg-yellow-500"
          />
          <span className="text-gray-400">
            Annual <span className="text-yellow-500 font-semibold">(Save 20%)</span>
          </span>
        </div>
      </header>

      {/* plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className={cn(
              "relative rounded-2xl p-8 bg-black/50 backdrop-blur-sm border flex flex-col",
              plan.isPopular ? "border-yellow-500 border-2" : "border-yellow-500/20",
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 py-1 px-4 rounded-full flex items-center shadow-lg">
                <Star className="h-4 w-4 text-black fill-current mr-1" />
                <span className="text-sm font-semibold text-black">Most Popular</span>
              </div>
            )}

            <h3 className="text-lg font-semibold text-yellow-500 mb-6">{plan.name}</h3>

            <div className="mb-6">
              <span className="text-5xl font-bold text-white">${isMonthly ? plan.price : plan.yearlyPrice}</span>
              <span className="text-sm font-semibold text-gray-400 ml-2">/ {plan.period}</span>
            </div>

            <p className="text-xs text-gray-400 mb-6">{isMonthly ? "billed monthly" : "billed annually"}</p>

            <ul className="space-y-3 flex-1 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-gray-300">
                  <Check className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-center py-3 text-lg font-semibold",
                plan.isPopular
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black border-yellow-500"
                  : "border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10",
              )}
            >
              {plan.buttonText}
            </Link>

            <p className="mt-6 text-xs text-gray-400">{plan.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
