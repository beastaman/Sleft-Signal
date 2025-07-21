"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sparkles } from "lucide-react"

const links = [
  { name: "Home", id: "home" },
  { name: "Features", id: "features" },
  { name: "Pricing", id: "pricing" },
  { name: "Contact", id: "contact" },
]

export function Navbar1() {
  const [open, setOpen] = useState(false)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
    setOpen(false)
  }

  return (
    <header className="flex justify-center w-full py-6 px-4">
      <div className="flex items-center justify-between px-6 py-3 bg-black/80 backdrop-blur-sm border border-yellow-500/20 rounded-full shadow-lg w-full max-w-4xl">
        {/* Brand */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          onClick={() => scrollTo("home")}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg grid place-items-center">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent">
            Sleft Signals
          </span>
        </motion.div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <motion.button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="text-sm text-gray-300 hover:text-yellow-500 transition-colors font-medium"
            >
              {l.name}
            </motion.button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <motion.button
          onClick={() => scrollTo("generate")}
          className="hidden md:inline-flex items-center justify-center px-5 py-2 text-sm text-black bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-all font-semibold"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          Get Started
        </motion.button>

        {/* Mobile menu button */}
        <motion.button className="md:hidden text-yellow-500" onClick={() => setOpen(true)} whileTap={{ scale: 0.9 }}>
          <Menu className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.aside
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 pt-24 px-8 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={() => setOpen(false)}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-yellow-500" />
            </motion.button>

            <div className="flex flex-col gap-8">
              {links.map((l, i) => (
                <motion.button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-xl font-medium text-gray-300 hover:text-yellow-500 transition-colors"
                >
                  {l.name}
                </motion.button>
              ))}

              <motion.button
                onClick={() => scrollTo("generate")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.5 }}
                className="mt-6 inline-flex items-center justify-center w-full px-5 py-3 text-base text-black bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-all font-semibold"
              >
                Get Started
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  )
}
