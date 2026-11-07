// Rich content for each service's dedicated detail page.
// Adding a new service later = add one entry here + one in services.js.

export const SERVICE_DETAILS = {
  iron: {
    heroImage: '👕',
    tagline: 'Same-day ironing and machine wash, picked up from your door.',
    avgRating: 4.7,
    reviewCount: 812,
    completedCount: 3120,
    pricingTiers: [
      { label: 'Up to 10 pieces', price: 149, note: 'Shirts, trousers, kurtas' },
      { label: '11–25 pieces', price: 279, note: 'Full weekly laundry load' },
      { label: 'Machine wash + iron', price: 349, note: 'Per load, includes fold' },
    ],
    howItWorks: [
      'Tell us how many pieces and when you need them by',
      'A verified helper nearby accepts and picks up at your door',
      'Get notified when ironing/washing is done',
      'Pay on completion — cash or wallet',
    ],
    faqs: [
      { q: 'Do I need to be home during pickup?', a: 'No — you can leave clothes with a neighbour, security guard, or in a bag outside your door. Just mention this in task notes.' },
      { q: 'What if a piece gets damaged?', a: 'Every helper is covered under our basic service guarantee. Report it within 24 hours via the task tracking screen.' },
      { q: 'Can I get same-day service?', a: 'Yes, if posted before 2 PM most helpers can complete and return same evening, subject to availability.' },
    ],
  },
  vehicle: {
    heroImage: '🚗',
    tagline: 'Doorstep car and bike washing, done in under 30 minutes.',
    avgRating: 4.6,
    reviewCount: 594,
    completedCount: 2140,
    pricingTiers: [
      { label: 'Bike wash', price: 99, note: 'Exterior foam wash' },
      { label: 'Hatchback / Sedan', price: 199, note: 'Exterior + interior vacuum' },
      { label: 'SUV wash', price: 279, note: 'Exterior + interior vacuum' },
    ],
    howItWorks: [
      'Select your vehicle type and preferred time slot',
      'Nearby helper arrives with their own water & equipment',
      'Vehicle washed at your parking spot',
      'Inspect and pay after you\'re satisfied',
    ],
    faqs: [
      { q: 'Do I need to supply water?', a: 'Most helpers carry their own supply, but for larger vehicles a nearby water source helps. This is noted per helper profile.' },
      { q: 'Is this available for two-wheelers only?', a: 'No — we cover bikes, hatchbacks, sedans, and SUVs.' },
      { q: 'Can I book a weekly recurring wash?', a: 'Not yet through the app — for now, post a fresh task each time. Recurring bookings are planned.' },
    ],
  },
  guard: {
    heroImage: '🛡️',
    tagline: 'Verified temporary security for 1–2 days — travel, events, or emergencies.',
    avgRating: 4.8,
    reviewCount: 231,
    completedCount: 640,
    pricingTiers: [
      { label: 'Half-day (6 hrs)', price: 549, note: 'Daytime coverage' },
      { label: 'Full day (12 hrs)', price: 899, note: 'Most popular' },
      { label: '2-day duty', price: 1699, note: 'Overnight travel cover' },
    ],
    howItWorks: [
      'Share dates, duration, and property details',
      'Only ID-verified guards are shown as available for this category',
      'Confirm the assigned guard\'s ID before they start',
      'Rate their service after duty ends',
    ],
    faqs: [
      { q: 'Are guards background verified?', a: 'Yes — this category requires government ID verification before a helper can accept guard duty tasks, shown as a badge on their profile.' },
      { q: 'Can I request the same guard again?', a: 'Yes, you can view their profile from a past booking and request them directly for future tasks.' },
      { q: 'What if I need overnight coverage?', a: 'Mention exact hours in task notes — most guards are comfortable with overnight shifts within the 1-2 day window.' },
    ],
  },
  event: {
    heroImage: '🍽️',
    tagline: 'Cooks and cleaning crew for weddings, engagements, and functions.',
    avgRating: 4.7,
    reviewCount: 168,
    completedCount: 410,
    pricingTiers: [
      { label: 'Cleaning crew (per person/day)', price: 699, note: 'Minimum 2 people recommended' },
      { label: 'Cook — small function (up to 30 guests)', price: 1499, note: 'Per day' },
      { label: 'Cook + crew — full event', price: 2999, note: 'Up to 100 guests' },
    ],
    howItWorks: [
      'Tell us event type, guest count, and date',
      'We match cooks/crew experienced with similar event sizes',
      'Discuss menu or cleaning scope directly in chat before the day',
      'Rate and review after the event',
    ],
    faqs: [
      { q: 'Do cooks bring their own ingredients?', a: 'Typically no — ingredients are usually arranged by the host. Confirm this with your matched cook via chat before the event.' },
      { q: 'How far in advance should I book?', a: 'For wedding season (Nov–Feb), we recommend booking at least 5-7 days ahead as good crews get booked quickly.' },
      { q: 'Can I book for multi-day functions?', a: 'Yes — mention all dates in your task notes, or post a separate task per day for different crew availability.' },
    ],
  },
};
