import { useState } from 'react';
import { Smartphone, X } from 'lucide-react';
import { scrollToSection } from '../../utils/search';

const INFO_CONTENT = {
  careers: {
    title: 'Careers at HelpJi',
    body: 'We\'re a small team building hyperlocal help in Jaipur. No open roles right now — follow us on LinkedIn for updates when we hire.',
  },
  blog: {
    title: 'HelpJi Blog',
    body: 'Stories from helpers and customers in Jaipur. Our blog launches soon — check back for neighbourhood tips, helper spotlights, and product updates.',
  },
  press: {
    title: 'Press & Media',
    body: 'For press enquiries, email press@helpji.in with your publication and deadline. We\'ll share our media kit and founder availability.',
  },
  terms: {
    title: 'Terms of Service',
    body: 'By using HelpJi you agree to post accurate task details, treat helpers respectfully, and pay agreed amounts upon completion. Helpers agree to arrive on time and complete tasks safely. Disputes are handled by our support team within 48 hours.',
  },
  privacy: {
    title: 'Privacy Policy',
    body: 'We collect phone numbers, locations, and task details to match helpers with customers. Data is never sold to third parties. You can request deletion of your account by contacting support@helpji.in.',
  },
};

function InfoModal({ title, body, onClose }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-5">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lift">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-ink pr-4">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-paper-card shrink-0" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full bg-ink text-white py-3 rounded-xl font-semibold text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function DownloadApp() {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | submitted | error
  const [errorMsg, setErrorMsg] = useState('');

  const phoneDigits = phone.replace(/\D/g, '');
  const phoneError =
    phone.trim() && phoneDigits.length !== 10
      ? 'Enter a valid 10-digit Indian mobile number.'
      : '';
  const canSubmit = phoneDigits.length === 10 && status !== 'loading';

  const handleNotify = () => {
    if (!canSubmit) {
      setStatus('error');
      setErrorMsg(phoneError || 'Enter your 10-digit mobile number.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    setTimeout(() => setStatus('submitted'), 700);
  };

  const resetForm = () => {
    setPhone('');
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-10 pb-20">
      <div className="bg-ink rounded-3xl p-10 sm:p-14 grid lg:grid-cols-2 gap-8 items-center overflow-hidden relative">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-marigold/10" />
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-marigold/15 flex items-center justify-center mb-5">
            <Smartphone size={22} className="text-marigold" />
          </div>
          <h2 className="font-display text-[28px] font-bold text-white mb-3">
            The HelpJi app is on its way.
          </h2>
          <p className="text-indigo-200/70 text-[14.5px] mb-6 max-w-md">
            We're currently live as a web app so every helper and household can join without needing
            a download. The native app is in development — leave your number and we'll notify you at launch.
          </p>

          {status === 'submitted' ? (
            <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-5 py-4 max-w-sm">
              <span className="text-2xl">✅</span>
              <div>
                <div className="text-white text-sm font-semibold">You're on the list!</div>
                <div className="text-indigo-200/70 text-xs">We'll notify you when the app launches.</div>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 max-w-sm">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNotify()}
                placeholder="Your phone number"
                className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-indigo-200/50 outline-none"
                disabled={status === 'loading'}
              />
              <button
                onClick={handleNotify}
                disabled={!phone.trim() || status === 'loading'}
                className="bg-marigold text-ink font-semibold text-sm px-5 py-3 rounded-xl shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-marigold-deep hover:text-white transition-colors"
              >
                {status === 'loading' ? 'Saving…' : 'Notify me'}
              </button>
            </div>
          )}
        </div>
        <div className="hidden lg:flex justify-center relative">
          <div className="w-56 h-96 rounded-[36px] border-8 border-white/10 bg-gradient-to-b from-white/5 to-transparent" />
        </div>
      </div>
    </section>
  );
}

export function Footer({ onSelectService, onGetStarted }) {
  const [infoModal, setInfoModal] = useState(null);

  const openLink = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  const serviceLinks = [
    { label: 'Ironing & Wash', action: () => onSelectService?.('iron') },
    { label: 'Vehicle Wash', action: () => onSelectService?.('vehicle') },
    { label: 'Temporary Guard', action: () => onSelectService?.('guard') },
    { label: 'Event Staff', action: () => onSelectService?.('event') },
  ];

  const companyLinks = [
    { label: 'About us', action: () => scrollToSection('about') },
    { label: 'Careers', action: () => setInfoModal('careers') },
    { label: 'Blog', action: () => setInfoModal('blog') },
    { label: 'Press', action: () => setInfoModal('press') },
  ];

  const supportLinks = [
    { label: 'Help Centre', action: () => scrollToSection('faq') },
    { label: 'Safety', action: () => scrollToSection('faq') },
    { label: 'Terms of Service', action: () => setInfoModal('terms') },
    { label: 'Privacy Policy', action: () => setInfoModal('privacy') },
  ];

  return (
    <footer className="bg-white border-t border-line pt-16 pb-8 relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-display text-xl font-bold text-ink mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-marigold" />
              HelpJi
            </div>
            <p className="text-ink-soft text-sm max-w-xs leading-relaxed">
              Jo kaam koi nahi karta, hum karte hain. Hyperlocal help for the small, occasional things
              your neighbourhood can't always solve alone.
            </p>
            <button
              onClick={() => onGetStarted?.()}
              className="mt-4 bg-ink text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-ink/90 transition-colors"
            >
              Get started free
            </button>
          </div>

          <FooterCol title="Services" links={serviceLinks} />
          <FooterCol title="Company" links={companyLinks} />
          <FooterCol title="Support" links={supportLinks} />
        </div>

        <div className="pt-6 border-t border-line flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-ink-soft">© 2026 HelpJi. Built in Jaipur, for Jaipur.</p>
          <div className="flex gap-4 text-xs text-ink-soft">
            <button
              onClick={() => openLink('https://instagram.com/helpji')}
              className="hover:text-marigold-deep transition-colors cursor-pointer"
            >
              Instagram
            </button>
            <button
              onClick={() => openLink('https://wa.me/919829012345')}
              className="hover:text-marigold-deep transition-colors cursor-pointer"
            >
              WhatsApp
            </button>
            <button
              onClick={() => openLink('https://linkedin.com/company/helpji')}
              className="hover:text-marigold-deep transition-colors cursor-pointer"
            >
              LinkedIn
            </button>
          </div>
        </div>
      </div>

      {infoModal && (
        <InfoModal
          title={INFO_CONTENT[infoModal].title}
          body={INFO_CONTENT[infoModal].body}
          onClose={() => setInfoModal(null)}
        />
      )}
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-xs font-mono uppercase tracking-wide text-ink-soft font-semibold mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <button
              type="button"
              onClick={l.action}
              className="text-sm text-ink hover:text-marigold-deep transition-colors cursor-pointer text-left"
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
