import pptxgen from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// ── Color Palette ────────────────────────────────────────────────────────────
const BG_DARK = '0F0E17';
const CARD_BG = '1A1A2E';
const SAFFRON = 'F4831F';
const TEAL = '1CA89C';
const WHITE = 'FFFFFF';
const MUTED = '8A869E';
const SOFT = 'A1A0B2';
const EMERALD = '22A355';
const ROSE = 'EF4444';
const PURPLE = '9333EA';

// Helper for Slide Background & Header
function addSlideHeader(slide, title, eyebrow = 'MCA MAJOR PROJECT') {
  slide.background = { color: BG_DARK };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 0.4, w: 0.35, h: 0.35,
    fill: { color: SAFFRON },
    radius: 0.08,
  });
  slide.addText('H', {
    x: 0.6, y: 0.4, w: 0.35, h: 0.35,
    fontSize: 14, fontFace: 'Arial', bold: true, color: WHITE, align: 'center', valign: 'middle'
  });

  slide.addText([
    { text: 'Help', options: { color: WHITE, bold: true } },
    { text: 'जी', options: { color: SAFFRON, bold: true } }
  ], {
    x: 1.05, y: 0.42, w: 1.5, h: 0.35,
    fontSize: 14, fontFace: 'Arial'
  });

  slide.addText(eyebrow, {
    x: 2.2, y: 0.46, w: 3.5, h: 0.25,
    fontSize: 9, fontFace: 'Courier New', color: MUTED, bold: true
  });

  slide.addText(title, {
    x: 0.6, y: 0.95, w: 12.0, h: 0.6,
    fontSize: 24, fontFace: 'Arial', bold: true, color: WHITE
  });
}

// Slide 1: Title
{
  const s = pptx.addSlide();
  s.background = { color: BG_DARK };

  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.2, y: 1.1, w: 4.8, h: 0.4,
    fill: { color: '2A1B10' },
    line: { color: SAFFRON, width: 1 },
    radius: 0.2
  });
  s.addText('MCA FINAL YEAR MAJOR PROJECT PRESENTATION', {
    x: 4.2, y: 1.1, w: 4.8, h: 0.4,
    fontSize: 9, fontFace: 'Courier New', color: SAFFRON, bold: true, align: 'center', valign: 'middle'
  });

  s.addText([
    { text: 'Help', options: { color: WHITE, bold: true } },
    { text: 'जी', options: { color: SAFFRON, bold: true } }
  ], {
    x: 1.0, y: 1.7, w: 11.3, h: 1.2,
    fontSize: 54, fontFace: 'Arial', bold: true, align: 'center'
  });

  s.addText('Hyperlocal Micro-Task & On-Demand Help Platform', {
    x: 1.0, y: 2.9, w: 11.3, h: 0.5,
    fontSize: 18, fontFace: 'Arial', color: SOFT, align: 'center'
  });

  s.addShape(pptx.ShapeType.rect, {
    x: 5.6, y: 3.55, w: 2.1, h: 0.05,
    fill: { color: SAFFRON }
  });

  const cards = [
    { label: 'PRESENTED BY', val1: 'Bipin Kumar Pal', val2: 'MCA Final Year' },
    { label: 'DOMAIN', val1: 'Hyperlocal Marketplace', val2: 'Full-Stack Web App' },
    { label: 'ARCHITECTURE', val1: 'Two-Sided Platform', val2: 'Customer & Helper' },
    { label: 'ACADEMIC YEAR', val1: '2025 – 2026', val2: 'Major Project' },
  ];

  cards.forEach((c, i) => {
    const x = 0.8 + i * 2.95;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 4.1, w: 2.75, h: 1.5,
      fill: { color: CARD_BG },
      line: { color: '2C2C40', width: 1 },
      radius: 0.15
    });

    s.addText(c.label, {
      x: x + 0.2, y: 4.25, w: 2.35, h: 0.25,
      fontSize: 8, fontFace: 'Courier New', color: MUTED, bold: true
    });
    s.addText(c.val1, {
      x: x + 0.2, y: 4.55, w: 2.35, h: 0.4,
      fontSize: 13, fontFace: 'Arial', color: WHITE, bold: true
    });
    s.addText(c.val2, {
      x: x + 0.2, y: 4.95, w: 2.35, h: 0.3,
      fontSize: 10, fontFace: 'Arial', color: SOFT
    });
  });
}

// Slide 2: Problem
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Everyday Problems, But No Simple Way to Get Help', 'PROBLEM DISCOVERY');

  const problems = [
    {
      num: '01',
      title: 'Micro-Tasks Are Ignored',
      desc: 'Small 10-15 minute chores (urgent medicine pickup, printouts, steam ironing, carrying bags) are too small for enterprise platforms like Urban Company or Uber.',
      impact: 'High personal time loss for minor chores',
      color: ROSE,
    },
    {
      num: '02',
      title: 'High Minimum Costs & Rigidity',
      desc: 'Traditional service aggregators mandate expensive minimum visit fees (₹400–₹800), making quick neighborhood assistance economically impractical.',
      impact: 'Overpaying or doing it yourself begrudgingly',
      color: SAFFRON,
    },
    {
      num: '03',
      title: 'Informal & Untrusted Solutions',
      desc: 'Relying on informal contacts, society guards, or WhatsApp groups creates friction: zero accountability, uncertain pricing, and lack of identity verification.',
      impact: 'Trust deficit, delays, and security risk',
      color: TEAL,
    },
  ];

  problems.forEach((p, i) => {
    const x = 0.8 + i * 3.95;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.8, w: 3.75, h: 3.8,
      fill: { color: CARD_BG },
      line: { color: p.color, width: 1.5 },
      radius: 0.15
    });

    s.addText(p.num, {
      x: x + 0.3, y: 2.0, w: 3.15, h: 0.4,
      fontSize: 18, fontFace: 'Courier New', color: p.color, bold: true
    });
    s.addText(p.title, {
      x: x + 0.3, y: 2.45, w: 3.15, h: 0.55,
      fontSize: 14, fontFace: 'Arial', color: WHITE, bold: true
    });
    s.addText(p.desc, {
      x: x + 0.3, y: 3.05, w: 3.15, h: 1.4,
      fontSize: 10.5, fontFace: 'Arial', color: SOFT, lineSpacing: 14
    });
    s.addShape(pptx.ShapeType.line, {
      x: x + 0.3, y: 4.6, w: 3.15, h: 0,
      line: { color: '2C2C40', width: 1 }
    });
    s.addText(`Result: ${p.impact}`, {
      x: x + 0.3, y: 4.75, w: 3.15, h: 0.6,
      fontSize: 9.5, fontFace: 'Courier New', color: p.color, bold: true
    });
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 5.85, w: 11.7, h: 0.7,
    fill: { color: '1C1628' },
    line: { color: SAFFRON, width: 1 },
    radius: 0.1
  });
  s.addText('💡 Key Insight: Small problems still consume significant daily time, mental energy, and personal productivity.', {
    x: 1.0, y: 5.95, w: 11.3, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: WHITE, bold: true
  });
}

// Slide 3: Why HelpJi
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Why Did We Build Helpजी? — Two-Sided Marketplace', 'MARKET OPPORTUNITY');

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 5.0, h: 4.2,
    fill: { color: CARD_BG },
    line: { color: SAFFRON, width: 1.5 },
    radius: 0.15
  });
  s.addText('DEMAND SIDE · CUSTOMERS', {
    x: 1.1, y: 2.05, w: 4.4, h: 0.3,
    fontSize: 9, fontFace: 'Courier New', color: SAFFRON, bold: true
  });
  s.addText('People Who Need Quick Local Help', {
    x: 1.1, y: 2.35, w: 4.4, h: 0.5,
    fontSize: 15, fontFace: 'Arial', color: WHITE, bold: true
  });
  s.addText([
    { text: '• Busy professionals ', options: { bold: true } },
    { text: 'with no time for daily errands\n' },
    { text: '• Students & hostelers ', options: { bold: true } },
    { text: 'needing printouts and supplies\n' },
    { text: '• Elderly residents ', options: { bold: true } },
    { text: 'requiring medicine & grocery runs\n' },
    { text: '• Families ', options: { bold: true } },
    { text: 'needing urgent doorstep assistance' }
  ], {
    x: 1.1, y: 2.9, w: 4.4, h: 2.0,
    fontSize: 10.5, fontFace: 'Arial', color: SOFT, lineSpacing: 16
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.0, y: 2.7, w: 1.3, h: 2.0,
    fill: { color: '201C33' },
    line: { color: '3F3B5C', width: 1 },
    radius: 0.15
  });
  s.addText('⇄', {
    x: 6.0, y: 2.9, w: 1.3, h: 0.5,
    fontSize: 24, fontFace: 'Arial', color: SAFFRON, align: 'center'
  });
  s.addText('Helpजी\nEngine', {
    x: 6.0, y: 3.5, w: 1.3, h: 0.8,
    fontSize: 10, fontFace: 'Arial', color: WHITE, bold: true, align: 'center'
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 7.5, y: 1.8, w: 5.0, h: 4.2,
    fill: { color: CARD_BG },
    line: { color: TEAL, width: 1.5 },
    radius: 0.15
  });
  s.addText('SUPPLY SIDE · HELPERS', {
    x: 7.8, y: 2.05, w: 4.4, h: 0.3,
    fontSize: 9, fontFace: 'Courier New', color: TEAL, bold: true
  });
  s.addText('People Wanting Flexible Income', {
    x: 7.8, y: 2.35, w: 4.4, h: 0.5,
    fontSize: 15, fontFace: 'Arial', color: WHITE, bold: true
  });
  s.addText([
    { text: '• Local college students ', options: { bold: true } },
    { text: 'seeking part-time earning\n' },
    { text: '• Gig workers ', options: { bold: true } },
    { text: 'monetizing idle neighborhood hours\n' },
    { text: '• Neighborhood helpers ', options: { bold: true } },
    { text: 'wanting supplemental income\n' },
    { text: '• Immediate daily UPI payouts ', options: { bold: true } },
    { text: 'without barrier' }
  ], {
    x: 7.8, y: 2.9, w: 4.4, h: 2.0,
    fontSize: 10.5, fontFace: 'Arial', color: SOFT, lineSpacing: 16
  });
}

// Slide 4: Solution
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Introducing Helpजी — Hyperlocal Micro-Task Marketplace', 'PRODUCT VISION');

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 5.6, h: 4.2,
    fill: { color: CARD_BG },
    line: { color: SAFFRON, width: 1.5 },
    radius: 0.15
  });
  s.addText('01 · FOR CUSTOMERS', {
    x: 1.1, y: 2.05, w: 5.0, h: 0.3,
    fontSize: 9, fontFace: 'Courier New', color: SAFFRON, bold: true
  });
  s.addText('Effortless Local Delegation', {
    x: 1.1, y: 2.35, w: 5.0, h: 0.4,
    fontSize: 15, fontFace: 'Arial', color: WHITE, bold: true
  });
  s.addText('• Instant Service Discovery (Ironing, Errands, Cleaning, Wash)\n• Transparent Fixed Estimates with zero surge pricing\n• Live Task Pulse Tracking from dispatch to finish', {
    x: 1.1, y: 2.85, w: 5.0, h: 2.5,
    fontSize: 11, fontFace: 'Arial', color: SOFT, lineSpacing: 18
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.9, y: 1.8, w: 5.6, h: 4.2,
    fill: { color: CARD_BG },
    line: { color: TEAL, width: 1.5 },
    radius: 0.15
  });
  s.addText('02 · FOR HELPERS', {
    x: 7.2, y: 2.05, w: 5.0, h: 0.3,
    fontSize: 9, fontFace: 'Courier New', color: TEAL, bold: true
  });
  s.addText('Dignified Hyperlocal Work', {
    x: 7.2, y: 2.35, w: 5.0, h: 0.4,
    fontSize: 15, fontFace: 'Arial', color: WHITE, bold: true
  });
  s.addText('• Job Radar Proximity Feed (5–10 km neighborhood radius)\n• 1-Tap Work Acceptance with upfront payout visibility\n• Earnings Journey with instant UPI & bank withdrawals', {
    x: 7.2, y: 2.85, w: 5.0, h: 2.5,
    fontSize: 11, fontFace: 'Arial', color: SOFT, lineSpacing: 18
  });
}

// Slide 5 to 16 remaining definitions
// Slide 9: Tech Stack
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Technology Stack & Engineering Architecture', 'ENGINEERING ARCHITECTURE');

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 5.6, h: 4.2,
    fill: { color: CARD_BG },
    line: { color: SAFFRON, width: 1.5 },
    radius: 0.15
  });
  s.addText('CURRENT IMPLEMENTED FRONTEND (WORKING MVP)', {
    x: 1.1, y: 2.05, w: 5.0, h: 0.3,
    fontSize: 9, fontFace: 'Courier New', color: SAFFRON, bold: true
  });
  s.addText('• React 19 & Vite 8 SPA (Fast HMR & minimal bundle)\n• Tailwind CSS 3.4 + Custom Token Design System\n• React Context API (AuthContext, AppContext, Theme, i18n)\n• React Router v7 & Lucide Icons', {
    x: 1.1, y: 2.5, w: 5.0, h: 3.0,
    fontSize: 11, fontFace: 'Arial', color: SOFT, lineSpacing: 20
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.9, y: 1.8, w: 5.6, h: 4.2,
    fill: { color: CARD_BG },
    line: { color: TEAL, width: 1.5 },
    radius: 0.15
  });
  s.addText('BACKEND & SERVICES LAYER (ARCHITECTURE-READY)', {
    x: 7.2, y: 2.05, w: 5.0, h: 0.3,
    fontSize: 9, fontFace: 'Courier New', color: TEAL, bold: true
  });
  s.addText('• Node.js & Express 5 REST API with JWT Auth\n• MongoDB & Mongoose Database Schemas\n• Socket.IO WebSockets for Live Radar and Status\n• Razorpay UPI Escrow & Rate Limiting Security', {
    x: 7.2, y: 2.5, w: 5.0, h: 3.0,
    fontSize: 11, fontFace: 'Arial', color: SOFT, lineSpacing: 20
  });
}

// Slide 16: Conclusion
{
  const s = pptx.addSlide();
  s.background = { color: BG_DARK };

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.1, y: 1.0, w: 1.1, h: 1.1,
    fill: { color: SAFFRON },
    radius: 0.25
  });
  s.addText('H', {
    x: 6.1, y: 1.0, w: 1.1, h: 1.1,
    fontSize: 42, fontFace: 'Arial', bold: true, color: WHITE, align: 'center', valign: 'middle'
  });

  s.addText([
    { text: 'Help', options: { color: WHITE, bold: true } },
    { text: 'जी', options: { color: SAFFRON, bold: true } },
    { text: ' — More Than Just an App', options: { color: WHITE, bold: true } }
  ], {
    x: 1.0, y: 2.3, w: 11.3, h: 0.7,
    fontSize: 28, fontFace: 'Arial', bold: true, align: 'center'
  });

  s.addText('“What if getting help for a small task was as easy as requesting one?”', {
    x: 1.5, y: 3.1, w: 10.3, h: 0.5,
    fontSize: 14, fontFace: 'Arial', color: SOFT, italic: true, align: 'center'
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.4, y: 4.4, w: 4.5, h: 0.7,
    fill: { color: SAFFRON },
    radius: 0.35
  });
  s.addText('Thank You · Questions & Discussion', {
    x: 4.4, y: 4.4, w: 4.5, h: 0.7,
    fontSize: 12, fontFace: 'Arial', bold: true, color: WHITE, align: 'center', valign: 'middle'
  });

  s.addText('Presenter: Bipin Kumar Pal  |  MCA Major Project 2025–2026', {
    x: 1.0, y: 5.4, w: 11.3, h: 0.4,
    fontSize: 10, fontFace: 'Courier New', color: MUTED, align: 'center'
  });
}

// ── Save Presentation inside presentation folder ─────────────────────────────
const outputPath = path.resolve(__dirname, '..', 'presentation', 'HelpJi_MCA_Major_Project.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`PowerPoint Presentation generated successfully at: ${outputPath}`);
  })
  .catch((err) => {
    console.error('Error generating PowerPoint presentation:', err);
    process.exit(1);
  });
