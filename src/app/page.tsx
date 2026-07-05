import { Hero } from "@/components/landing/Hero";
import { LandingSections } from "@/components/landing/LandingSections";
import { Footer } from "@/components/landing/Footer";

// Landing page.
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <LandingSections />
      <Footer />
    </main>
  );
}
