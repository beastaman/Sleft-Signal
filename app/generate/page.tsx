"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  Loader2,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Globe,
  Building2,
  Target,
  Brain,
  Rocket,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const industries = [
  "Restaurant & Food Service",
  "Retail & E-commerce",
  "Professional Services",
  "Healthcare & Medical",
  "Fitness & Wellness",
  "Beauty & Personal Care",
  "Real Estate",
  "Technology & Software",
  "Manufacturing",
  "Automotive",
  "Education & Training",
  "Financial Services",
  "Legal Services",
  "Marketing & Advertising",
  "Construction",
  "Other",
]

const steps = [
  { id: 1, title: "Business Info", icon: Building2 },
  { id: 2, title: "AI Analysis", icon: Brain },
  { id: 3, title: "Strategy Brief", icon: Target },
]

export default function GeneratePage() {
  const [formData, setFormData] = useState({
    businessName: "",
    websiteUrl: "",
    industry: "",
    location: "",
    customGoal: "",
    networkingKeyword: "", // New field for meetup events
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCurrentStep(2)

    try {
      console.log("Submitting form data:", formData)
      // Use the frontend API route which will proxy to backend
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate brief")
      }

      setCurrentStep(3)
      
      // Redirect to the correct route
      router.push(`/briefs/${data.briefId}`)
      
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
      setCurrentStep(1)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const isFormValid = formData.businessName && formData.websiteUrl && formData.industry && formData.location

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-yellow-500/20 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <ArrowLeft className="w-5 h-5 text-yellow-500 group-hover:-translate-x-1 transition-transform" />
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent">
                Sleft Signals
              </span>
            </Link>

            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.id ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-sm font-medium ${currentStep >= step.id ? "text-yellow-500" : "text-gray-400"}`}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${currentStep > step.id ? "bg-yellow-500" : "bg-gray-800"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {/* Hero Section */}
              <div className="text-center mb-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500 font-medium">AI-Powered Business Intelligence</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-100 to-yellow-500 bg-clip-text text-transparent"
                >
                  Generate Your Strategy Brief
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
                >
                  Get personalized business strategy briefs that reveal your competitive edge, growth opportunities, and
                  valuable connections.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="flex flex-wrap justify-center gap-8 mb-12"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-yellow-500" />
                    </div>
                    <span className="text-gray-300">Your Edge</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-500" />
                    </div>
                    <span className="text-gray-300">Your Leverage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-yellow-500" />
                    </div>
                    <span className="text-gray-300">Your Connections</span>
                  </div>
                </motion.div>
              </div>

              {/* Form Section */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm shadow-2xl">
                  <CardContent className="p-8">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-400">{error}</span>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="businessName" className="text-white flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-yellow-500" />
                            Business Name *
                          </Label>
                          <Input
                            id="businessName"
                            value={formData.businessName}
                            onChange={(e) => handleInputChange("businessName", e.target.value)}
                            placeholder="Enter your business name"
                            required
                            className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-400 focus:border-yellow-500 transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="websiteUrl" className="text-white flex items-center gap-2">
                            <Globe className="w-4 h-4 text-yellow-500" />
                            Website URL *
                          </Label>
                          <Input
                            id="websiteUrl"
                            type="url"
                            value={formData.websiteUrl}
                            onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                            placeholder="https://yourbusiness.com"
                            required
                            className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-400 focus:border-yellow-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="industry" className="text-white flex items-center gap-2">
                            <Target className="w-4 h-4 text-yellow-500" />
                            Industry / Business Type *
                          </Label>
                          <Select
                            value={formData.industry}
                            onValueChange={(value) => handleInputChange("industry", value)}
                          >
                            <SelectTrigger className="bg-black/50 border-yellow-500/30 text-white focus:border-yellow-500">
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-yellow-500/30 max-h-60">
                              {industries.map((industry) => (
                                <SelectItem key={industry} value={industry} className="text-white hover:bg-gray-800">
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-white flex items-center gap-2">
                            <Globe className="w-4 h-4 text-yellow-500" />
                            Location *
                          </Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            placeholder="City, State or ZIP code"
                            required
                            className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-400 focus:border-yellow-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customGoal" className="text-white flex items-center gap-2">
                          <Rocket className="w-4 h-4 text-yellow-500" />
                          Custom Goal or Comment (Optional)
                        </Label>
                        <Textarea
                          id="customGoal"
                          value={formData.customGoal}
                          onChange={(e) => handleInputChange("customGoal", e.target.value)}
                          placeholder="Tell us about your specific goals or challenges..."
                          rows={3}
                          className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-400 focus:border-yellow-500 resize-none transition-colors"
                        />
                      </div>

                      {/* New Networking Keyword Field */}
                      <div className="space-y-2">
                        <Label htmlFor="networkingKeyword" className="text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          Networking Interest (Optional)
                        </Label>
                        <Input
                          id="networkingKeyword"
                          value={formData.networkingKeyword}
                          onChange={(e) => handleInputChange("networkingKeyword", e.target.value)}
                          placeholder="e.g., entrepreneurship, AI, marketing, networking..."
                          className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-500 transition-colors"
                        />
                        <p className="text-sm text-gray-500">
                          Find relevant networking events and meetups in your area
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={!isFormValid}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-4 text-lg h-auto transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate My Strategy Brief
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center mt-12"
              >
                <p className="text-gray-400 text-sm mb-4">Trusted by businesses worldwide</p>
                <div className="flex justify-center items-center gap-8 opacity-50">
                  <div className="text-gray-500 font-semibold">AI-Powered</div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <div className="text-gray-500 font-semibold">Data-Driven</div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <div className="text-gray-500 font-semibold">Actionable</div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-12 h-12 text-yellow-500 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Analyzing Your Business</h2>
                  <p className="text-gray-300 mb-8">
                    Our AI is analyzing your business, competitors, and market trends to create your personalized
                    strategy brief.
                  </p>
                </div>

                <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                        <span className="text-white">Scraping competitor data...</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                        <span className="text-white">Analyzing industry trends...</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                        <span className="text-white">Generating AI insights...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Brief Generated Successfully!</h2>
                <p className="text-gray-300 mb-8">Your personalized strategy brief is ready. Redirecting you now...</p>
                <div className="flex justify-center">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
