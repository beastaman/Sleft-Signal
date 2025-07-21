"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAnimate } from "framer-motion"
import { Button, buttonVariants } from "@/components/ui/button"
import { HighlighterItem, HighlightGroup, Particles } from "@/components/ui/highlighter"
import { Mail, MessageCircle, Calendar, Sparkles } from "lucide-react"

export function Connect() {
  const [scope, animate] = useAnimate()

  React.useEffect(() => {
    animate(
      [
        ["#pointer", { left: 200, top: 60 }, { duration: 0 }],
        ["#strategy", { opacity: 1 }, { duration: 0.3 }],
        ["#pointer", { left: 50, top: 102 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
        ["#strategy", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
        ["#intelligence", { opacity: 1 }, { duration: 0.3 }],
        ["#pointer", { left: 224, top: 170 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
        ["#intelligence", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
        ["#growth", { opacity: 1 }, { duration: 0.3 }],
        ["#pointer", { left: 88, top: 198 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
        ["#growth", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
        ["#connections", { opacity: 1 }, { duration: 0.3 }],
        ["#pointer", { left: 200, top: 60 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
        ["#connections", { opacity: 0.5 }, { at: "-0.3", duration: 0.1 }],
      ],
      {
        repeat: Number.POSITIVE_INFINITY,
      },
    )
  }, [animate])

  return (
    <section className="relative mx-auto mb-20 mt-6 max-w-5xl">
      <HighlightGroup className="group h-full">
        <div className="group/item h-full md:col-span-6 lg:col-span-12" data-aos="fade-down">
          <HighlighterItem className="rounded-3xl p-6">
            <div className="relative z-20 h-full overflow-hidden rounded-3xl border border-yellow-500/20 bg-black/90 backdrop-blur-sm">
              <Particles
                className="absolute inset-0 -z-10 opacity-10 transition-opacity duration-1000 ease-in-out group-hover/item:opacity-100"
                quantity={200}
                color={"#fbbf24"}
                vy={-0.2}
              />
              <div className="flex justify-center">
                <div className="flex h-full flex-col justify-center gap-10 p-4 md:h-[300px] md:flex-row">
                  <div className="relative mx-auto h-[270px] w-[300px] md:h-[270px] md:w-[300px]" ref={scope}>
                    <Sparkles className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-yellow-500" />
                    <div
                      id="connections"
                      className="absolute bottom-12 left-14 rounded-3xl border border-yellow-500/40 bg-black/80 px-2 py-1.5 text-xs opacity-50 text-yellow-500"
                    >
                      Strategic Connections
                    </div>
                    <div
                      id="intelligence"
                      className="absolute left-2 top-20 rounded-3xl border border-yellow-500/40 bg-black/80 px-2 py-1.5 text-xs opacity-50 text-yellow-500"
                    >
                      Business Intelligence
                    </div>
                    <div
                      id="growth"
                      className="absolute bottom-20 right-1 rounded-3xl border border-yellow-500/40 bg-black/80 px-2 py-1.5 text-xs opacity-50 text-yellow-500"
                    >
                      Growth Opportunities
                    </div>
                    <div
                      id="strategy"
                      className="absolute right-12 top-10 rounded-3xl border border-yellow-500/40 bg-black/80 px-2 py-1.5 text-xs opacity-50 text-yellow-500"
                    >
                      AI Strategy Briefs
                    </div>
                    <div id="pointer" className="absolute">
                      <svg
                        width="16.8"
                        height="18.2"
                        viewBox="0 0 12 13"
                        className="fill-yellow-500"
                        stroke="black"
                        strokeWidth="1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 5.50676L0 0L2.83818 13L6.30623 7.86537L12 5.50676V5.50676Z"
                        />
                      </svg>
                      <span className="relative -top-1 left-3 rounded-3xl bg-yellow-500 px-2 py-1 text-xs text-black font-medium">
                        Sleft
                      </span>
                    </div>
                  </div>
                  <div className="-mt-20 flex h-full flex-col justify-center p-2 md:-mt-4 md:ml-10 md:w-[400px]">
                    <div className="flex flex-col items-center">
                      <h3 className="mt-6 pb-1 font-bold text-white">
                        <span className="text-2xl md:text-4xl">Ready to unlock your business potential?</span>
                      </h3>
                    </div>
                    <p className="mb-4 text-gray-400">
                      Get personalized strategy insights and connect with our team to accelerate your growth.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link href={"#"} target="_blank">
                        <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold">
                          <Calendar className="w-4 h-4 mr-2" />
                          Book a Strategy Call
                        </Button>
                      </Link>
                      <Link
                        href="mailto:hello@sleftsignals.com"
                        target="_blank"
                        className={cn(
                          buttonVariants({
                            variant: "outline",
                            size: "default",
                          }),
                          "border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10",
                        )}
                      >
                        <Mail strokeWidth={1} className="h-4 w-4 mr-2" />
                        Email Us
                      </Link>
                      <Link
                        href="#"
                        target="_blank"
                        className={cn(
                          buttonVariants({
                            variant: "outline",
                            size: "icon",
                          }),
                          "border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10",
                        )}
                      >
                        <MessageCircle strokeWidth={1} className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </HighlighterItem>
        </div>
      </HighlightGroup>
    </section>
  )
}
