"use client"

import { useState } from "react"
import { HomeScreen } from "@/components/paire/home-screen"
import { CaptureScreen } from "@/components/paire/capture-screen"
import { LoadingScreen } from "@/components/paire/loading-screen"
import { PreferenceScreen } from "@/components/paire/preference-screen"
import { RecommendationScreen } from "@/components/paire/recommendation-screen"
import { DrinkDetailScreen } from "@/components/paire/drink-detail-screen"
import { MenuInputScreen } from "@/components/paire/menu-input-screen"

type Screen = 
  | "home" 
  | "capture" 
  | "loading" 
  | "preference" 
  | "recommendation" 
  | "detail"
  | "menu-input"

interface Drink {
  id: string
  name: string
  type: string
  description: string
  tastingNotes: string[]
  image: string
  price: string
}

export default function PairePage() {
  const [screen, setScreen] = useState<Screen>("home")
  const [capturedImage, setCapturedImage] = useState<string>("")
  const [preferences, setPreferences] = useState<{ occasion: string; tastes: string[] }>({
    occasion: "",
    tastes: [],
  })
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null)
  const [menuText, setMenuText] = useState<string>("")

  const handleCaptureFood = () => {
    setScreen("capture")
  }

  const handleMenuInput = () => {
    setScreen("menu-input")
  }

  const handleCapture = (imageUrl: string) => {
    setCapturedImage(imageUrl)
    setScreen("loading")
  }

  const handleLoadingComplete = () => {
    setScreen("preference")
  }

  const handlePreferenceSubmit = (prefs: { occasion: string; tastes: string[] }) => {
    setPreferences(prefs)
    setScreen("recommendation")
  }

  const handleSelectDrink = (drink: Drink) => {
    setSelectedDrink(drink)
    setScreen("detail")
  }

  const handleMenuSubmit = (menu: string) => {
    setMenuText(menu)
    // Use a placeholder image for menu input flow
    setCapturedImage("/images/paire-fairy.png")
    setScreen("preference")
  }

  const handleAddToCart = () => {
    // In a real app, this would add to cart
    alert("Added to cart! (Demo)")
  }

  const handleRefresh = () => {
    // In a real app, this would fetch new recommendations
  }

  const goHome = () => {
    setScreen("home")
    setCapturedImage("")
    setMenuText("")
    setPreferences({ occasion: "", tastes: [] })
    setSelectedDrink(null)
  }

  return (
    <main className="min-h-screen bg-background">
      {screen === "home" && (
        <HomeScreen 
          onCaptureFood={handleCaptureFood} 
          onMenuInput={handleMenuInput}
        />
      )}
      
      {screen === "capture" && (
        <CaptureScreen 
          onCapture={handleCapture} 
          onBack={goHome}
        />
      )}
      
      {screen === "loading" && (
        <LoadingScreen 
          imageUrl={capturedImage} 
          onComplete={handleLoadingComplete}
        />
      )}
      
      {screen === "preference" && (
        <PreferenceScreen 
          onSubmit={handlePreferenceSubmit} 
          onBack={() => menuText ? setScreen("menu-input") : setScreen("capture")}
        />
      )}
      
      {screen === "recommendation" && (
        <RecommendationScreen 
          imageUrl={capturedImage}
          preferences={preferences}
          onSelect={handleSelectDrink}
          onBack={() => setScreen("preference")}
          onRefresh={handleRefresh}
        />
      )}
      
      {screen === "detail" && selectedDrink && (
        <DrinkDetailScreen 
          drink={selectedDrink}
          onBack={() => setScreen("recommendation")}
          onAddToCart={handleAddToCart}
        />
      )}

      {screen === "menu-input" && (
        <MenuInputScreen 
          onSubmit={handleMenuSubmit}
          onBack={goHome}
        />
      )}
    </main>
  )
}
