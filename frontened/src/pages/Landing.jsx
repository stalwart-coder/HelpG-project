import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import ServiceCategories from '../components/landing/ServiceCategories';
import Spotlight from '../components/landing/Spotlight';
import WhyChooseUs from '../components/landing/WhyChooseUs';
import Testimonials from '../components/landing/Testimonials';
import { PartnerSection, CommunityImpact } from '../components/landing/PartnerSection';
import FAQSection from '../components/landing/FAQSection';
import { DownloadApp, Footer } from '../components/landing/DownloadFooter';

export default function Landing({ onGetStarted, onBecomeHelper, onSelectService }) {
  return (
    <div className="bg-paper">
      <Navbar onGetStarted={onGetStarted} onBecomeHelper={onBecomeHelper} onSelectService={onSelectService} />
      <Hero onGetStarted={onGetStarted} onBecomeHelper={onBecomeHelper} onSelectService={onSelectService} />
      <ServiceCategories onSelect={onSelectService} />
      <Spotlight onSelectService={onSelectService} />
      <WhyChooseUs />
      <CommunityImpact />
      <Testimonials />
      <PartnerSection onBecomeHelper={onBecomeHelper} />
      <DownloadApp />
      <FAQSection />
      <Footer onSelectService={onSelectService} onGetStarted={onGetStarted} />
    </div>
  );
}
