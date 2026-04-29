import HeroSection from '@/components/marketing/HeroSection';
import FeatureCards from '@/components/marketing/FeatureCards';
import BabyTimeline from '@/components/marketing/BabyTimeline';
import AboutSection from '@/components/marketing/AboutSection';
import CTASection from '@/components/marketing/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureCards />
      <BabyTimeline />
      <AboutSection />
      <CTASection />
    </>
  );
}
