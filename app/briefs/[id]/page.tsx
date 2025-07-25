import { notFound } from "next/navigation"
import BriefDisplay from "@/components/brief-display"

const BACKEND_URL = process.env.BACKEND_URL || "https://sleft-signal.onrender.com"

interface BriefPageProps {
  params: Promise<{ id: string }>
}

async function getBrief(id: string) {
  try {
    const fetchUrl = `${BACKEND_URL}/api/briefs/${id}`
    console.log(`Fetching brief from: ${fetchUrl}`)
    
    const response = await fetch(fetchUrl, {
      cache: "no-store", // Always fetch fresh data
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch brief: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    console.log('Brief data received:', data)
    return data.brief
  } catch (error) {
    console.error("Error fetching brief:", error)
    return null
  }
}

export default async function BriefPage({ params }: BriefPageProps) {
  const { id } = await params
  
  console.log(`Loading brief page for ID: ${id}`)
  
  const brief = await getBrief(id)

  if (!brief) {
    console.log(`Brief not found for ID: ${id}`)
    notFound()
  }

  return <BriefDisplay brief={brief} />
}

// Optional: Add metadata
export async function generateMetadata({ params }: BriefPageProps) {
  const { id } = await params
  
  return {
    title: `Business Brief - ${id} | Sleft Signals`,
    description: "Your personalized AI-powered business strategy brief",
  }
}
