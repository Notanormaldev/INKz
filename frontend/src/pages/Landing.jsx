import { useState, useEffect } from 'react'
import LocomotiveScroll from 'locomotive-scroll'
import Preloader from '../components/common/Preloader'
import Header from '../components/common/Header'
import HeroSection from '../components/common/HeroSection'
import AnimatedFeaturesSection from '../components/common/AnimatedFeaturesSection'
import AboutSection from '../components/common/AboutSection'
import IDEDemoSection from '../components/landing/IDEDemoSection'
import PricingSection from '../components/common/PricingSection'
import FAQSection from '../components/common/FAQSection'
import AnimatedCTASection from '../components/common/AnimatedCTASection'
import Footer from '../components/common/Footer'
import GoogleAuthModal from '../components/landing/GoogleAuthModal'
import './Landing.css'

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    // Initialize Locomotive Scroll for smooth inertia scrolling
    const locomotiveScroll = new LocomotiveScroll({
      lenisOptions: {
        wrapper: window,
        content: document.documentElement,
        lerp: 0.08,
        duration: 1.2,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
      }
    })

    return () => {
      if (locomotiveScroll) locomotiveScroll.destroy()
    }
  }, [])

  return (
    <div className="landing-page-root">
      {/* Live Intro Preloader */}
      <Preloader />

      {/* Top Floating Glass Header with Final INKz Logo */}
      <Header onOpenAuth={() => setAuthOpen(true)} />

      {/* Main Smooth Scroll Page Content */}
      <main className="landing-main-content">
        {/* 1. Lelo Style Hero Section */}
        <HeroSection onOpenAuth={() => setAuthOpen(true)} />

        {/* 2. Bento Box Features Section */}
        <AnimatedFeaturesSection />

        {/* 3. About Us & Architecture Section */}
        <AboutSection />

        {/* 4. Interactive IDE & Live App Preview Showcase */}
        <IDEDemoSection />

        {/* 5. Pricing Section */}
        <PricingSection onOpenAuth={() => setAuthOpen(true)} />

        {/* 6. FAQ Accordion Section */}
        <FAQSection />

        {/* 7. Animated CTA Section */}
        <AnimatedCTASection onOpenAuth={() => setAuthOpen(true)} />
      </main>

      {/* Bottom Footer Navigation */}
      <Footer onOpenAuth={() => setAuthOpen(true)} />

      {/* Google Auth Login Modal */}
      <GoogleAuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  )
}
