import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import ProductMockups from "@/components/ProductMockups";
import Vision from "@/components/Vision";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-void text-white min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustStrip />
      <Problem />
      <Solution />
      <HowItWorks />
      <Features />
      <ProductMockups />
      <Vision />
      <Waitlist />
      <Footer />
    </main>
  );
}
