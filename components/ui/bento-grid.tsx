"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { TrendingUp, Zap, Users, Globe, Brain, Target } from "lucide-react"

export interface BentoItem {
  title: string
  description: string
  icon: React.ReactNode
  status?: string
  tags?: string[]
  meta?: string
  cta?: string
  colSpan?: number
  hasPersistentHover?: boolean
}

interface BentoGridProps {
  items: BentoItem[]
}

const itemsSample: BentoItem[] = [
  {
    title: "Your Edge Analysis",
    meta: "AI-Powered",
    description: "Discover your unique competitive advantages using advanced AI analysis of your business data",
    icon: <TrendingUp className="w-4 h-4 text-yellow-500" />,
    status: "Live",
    tags: ["Analysis", "Competitive", "AI"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Leverage Opportunities",
    meta: "Growth Focus",
    description: "Identify immediate monetization and growth opportunities tailored to your business",
    icon: <Zap className="w-4 h-4 text-yellow-500" />,
    status: "Active",
    tags: ["Growth", "Revenue"],
  },
  {
    title: "Strategic Connections",
    meta: "Network Building",
    description: "Get warm introductions to potential partners, customers, and strategic tools",
    icon: <Users className="w-4 h-4 text-yellow-500" />,
    tags: ["Networking", "Partnerships"],
    colSpan: 2,
  },
  {
    title: "Global Intelligence",
    meta: "Market Insights",
    description: "Access real-time market data and trends from across the globe",
    icon: <Globe className="w-4 h-4 text-yellow-500" />,
    status: "Beta",
    tags: ["Market", "Intelligence"],
  },
  {
    title: "AI Strategy Briefs",
    meta: "Premium Reports",
    description: "Receive consultant-grade strategy briefs powered by GPT-4 and real business data",
    icon: <Brain className="w-4 h-4 text-yellow-500" />,
    status: "Premium",
    tags: ["AI", "Strategy"],
  },
  {
    title: "Targeted Insights",
    meta: "Precision Focus",
    description: "Get laser-focused recommendations based on your industry and location",
    icon: <Target className="w-4 h-4 text-yellow-500" />,
    status: "New",
    tags: ["Insights", "Precision"],
  },
]

function BentoGrid({ items = itemsSample }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-7xl mx-auto">
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
            "border border-yellow-500/20 bg-black/50 backdrop-blur-sm",
            "hover:shadow-[0_2px_12px_rgba(251,191,36,0.1)] hover:border-yellow-500/40",
            "hover:-translate-y-0.5 will-change-transform",
            item.colSpan || "col-span-1",
            item.colSpan === 2 ? "md:col-span-2" : "",
            {
              "shadow-[0_2px_12px_rgba(251,191,36,0.1)] -translate-y-0.5 border-yellow-500/40": item.hasPersistentHover,
            },
          )}
        >
          <div
            className={`absolute inset-0 ${
              item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } transition-opacity duration-300`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
          </div>
          <div className="relative flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-all duration-300">
                {item.icon}
              </div>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
                  "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
                  "transition-colors duration-300 group-hover:bg-yellow-500/20",
                )}
              >
                {item.status || "Active"}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-white tracking-tight text-[15px]">
                {item.title}
                <span className="ml-2 text-xs text-yellow-500/70 font-normal">{item.meta}</span>
              </h3>
              <p className="text-sm text-gray-300 leading-snug font-[425]">{item.description}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2 text-xs text-yellow-500/70">
                {item.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm transition-all duration-200 hover:bg-yellow-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-yellow-500/70 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.cta || "Explore →"}
              </span>
            </div>
          </div>
          <div
            className={`absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-yellow-500/20 to-transparent ${
              item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } transition-opacity duration-300`}
          />
        </div>
      ))}
    </div>
  )
}

export { BentoGrid }
