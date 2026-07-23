export const SERVICE_DETAILS = {
  iron: {
    heroTitle: 'Doorstep Ironing and Wash Care',
    heroDesc:
      'Verified laundry helpers for everyday pressing, steam finish, bedsheets, curtains, and festival clothing loads.',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80',
    availability: 'Same-day slots in Bengaluru, Jaipur, Pune, and Mumbai',
    completionTime: '45-120 min depending on load',
    providers: ['Ramesh Choudhary', 'Madhav Kulkarni', 'Imran Qureshi'],
    tiers: [
      { name: 'Small load', desc: 'Up to 10 garments, folded and packed', price: 180, eta: '45-60 min' },
      { name: 'Family load', desc: '11-25 garments including kurtas and shirts', price: 360, eta: '70-90 min' },
      { name: 'Festival load', desc: '25+ garments, sarees, bedsheets, curtains', price: 720, eta: '90-120 min' },
    ],
    included: ['Steam press on request', 'Folding and packing', 'Pickup/drop instructions shared before arrival'],
    faqs: [
      { q: 'Do I need to provide an iron?', a: 'No. Helpers bring an iron, extension cord, and basic packing covers.' },
      { q: 'Can I add washing?', a: 'Yes. Mention the fabric type and load size in notes so the helper can confirm the final quote.' },
      { q: 'Are delicate fabrics accepted?', a: 'Silk and embroidered garments are accepted when noted clearly. Dry-clean-only garments are not handled.' },
    ],
  },
  vehicle: {
    heroTitle: 'Car and Bike Wash at Your Parking Spot',
    heroDesc:
      'Exterior foam wash, interior vacuum, dashboard wipe, tyre shine, and bike detailing by trained local providers.',
    imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=80',
    availability: 'Morning slots from 7:00 AM in Mumbai, Hyderabad, Bengaluru, and Pune',
    completionTime: '25-70 min',
    providers: ['Farhan Shaikh', 'Aarav Reddy', 'Suresh Pawar'],
    tiers: [
      { name: 'Bike clean', desc: 'Exterior wash, chain-area wipe, polish finish', price: 160, eta: '25-30 min' },
      { name: 'Car exterior', desc: 'Foam wash, glass wipe, tyre dressing', price: 340, eta: '35-45 min' },
      { name: 'Full car detail', desc: 'Exterior wash, interior vacuum, dashboard clean', price: 620, eta: '55-70 min' },
    ],
    included: ['Microfiber cloths', 'Foam shampoo', 'Vacuum for full detail plan', 'Before/after photo confirmation'],
    faqs: [
      { q: 'Do I need to arrange water?', a: 'A tap or bucket access at the parking spot is needed. Helpers bring shampoo, cloths, and vacuum where required.' },
      { q: 'Can the helper enter basement parking?', a: 'Yes, if society entry and parking instructions are added while posting the task.' },
      { q: 'Can I book weekly service?', a: 'Static weekly packages are not live yet, but you can rebook the same provider from booking history.' },
    ],
  },
  guard: {
    heroTitle: 'Temporary Guard for Homes and Sites',
    heroDesc:
      'ID-verified guards for short trips, renovation supervision, apartment night watch, and event entry management.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-1e0b4c7d51b5?auto=format&fit=crop&w=900&q=80',
    availability: 'Day and night shifts in Noida, Jaipur, Pune, and Hyderabad',
    completionTime: '6-24 hr shifts',
    providers: ['Baldev Singh', 'Harish Yadav', 'Iqbal Khan'],
    tiers: [
      { name: 'Half-day duty', desc: '6 hours for renovation or delivery supervision', price: 650, eta: '6 hr shift' },
      { name: 'Night duty', desc: '12 hours for home or apartment watch', price: 1250, eta: '12 hr shift' },
      { name: 'Full-day duty', desc: '24 hours with check-in updates', price: 2400, eta: '24 hr shift' },
    ],
    included: ['Government ID verified guard', 'Check-in updates', 'Emergency contact support', 'Shift handover notes'],
    faqs: [
      { q: 'Are guards verified?', a: 'Yes. Guard providers must complete ID verification before accepting security tasks.' },
      { q: 'How early should I book?', a: 'Book 8-12 hours in advance for night duty, especially in gated societies.' },
      { q: 'Can guards manage visitors?', a: 'Yes. Add visitor rules, society gate instructions, and contact person details in notes.' },
    ],
  },
  event: {
    heroTitle: 'Event Cooks and Cleaning Crew',
    heroDesc:
      'Reliable cooks, servers, and cleanup crew for poojas, birthdays, griha pravesh, sangeet functions, and office parties.',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80',
    availability: 'Weekend crews in Chennai, Kolkata, Bengaluru, and Jaipur',
    completionTime: '3-8 hr events',
    providers: ['Savitri Nair', 'Pooja Rathore', 'Debu Mondal'],
    tiers: [
      { name: 'Small gathering', desc: 'Up to 25 guests, one cook or cleaner', price: 1200, eta: '3-4 hr event' },
      { name: 'Family function', desc: '25-60 guests, two helpers', price: 3200, eta: '5-6 hr event' },
      { name: 'Large event', desc: '60+ guests, three or more helpers', price: 5800, eta: 'Full-day support' },
    ],
    included: ['Cook/server/cleanup matching', 'Pre-event coordination call', 'Arrival confirmation', 'Post-event cleanup checklist'],
    faqs: [
      { q: 'Can I book cooks and cleaners together?', a: 'Yes. Add both requirements in the task notes and the booking can include multiple providers.' },
      { q: 'Do cooks bring utensils?', a: 'They bring small tools. Large utensils, gas setup, and serving counters should be arranged at the venue.' },
      { q: 'How early should I book?', a: 'For weekends and wedding season, book 3-7 days in advance for the best provider availability.' },
    ],
  },
};

export const SERVICE_REVIEWS = {
  iron: [
    { name: 'Kavya Menon', city: 'Bengaluru', rating: 5, text: 'Ramesh handled silk sarees carefully and finished the full load before dinner.' },
    { name: 'Madhav Kulkarni', city: 'Pune', rating: 5, text: 'Clear pricing, neat folding, and the curtains came back looking new.' },
    { name: 'Neha Deshpande', city: 'Pune', rating: 4, text: 'Good steam press quality. Pickup was ten minutes late but communication was clear.' },
  ],
  vehicle: [
    { name: 'Rhea Kapoor', city: 'Mumbai', rating: 5, text: 'The interior vacuum was thorough and Farhan shared before-after photos.' },
    { name: 'Aarav Reddy', city: 'Hyderabad', rating: 5, text: 'Booked a morning slot before office. The wash was quick and professional.' },
    { name: 'Pranav Sinha', city: 'Noida', rating: 4, text: 'Good exterior foam wash. Tyre polish finish was better than my local garage.' },
  ],
  guard: [
    { name: 'Nikhil Bansal', city: 'Noida', rating: 5, text: 'Baldev reported every two hours during night duty. Very reassuring.' },
    { name: 'Anita Kapoor', city: 'Jaipur', rating: 5, text: 'Booked while travelling for a wedding. ID verification and punctuality were excellent.' },
    { name: 'Harsh Vardhan', city: 'Pune', rating: 4, text: 'Useful for renovation supervision. The guard kept delivery entries documented.' },
  ],
  event: [
    { name: 'Lakshmi Subramanian', city: 'Chennai', rating: 5, text: 'Savitri cooked for our griha pravesh lunch. Guests loved the sambar and poriyal.' },
    { name: 'Debanjan Roy', city: 'Kolkata', rating: 5, text: 'Cleanup crew arrived after the sangeet and left the venue spotless by 1 AM.' },
    { name: 'Pooja Rathore', city: 'Jaipur', rating: 4, text: 'The servers were polite and quick. Coordination call helped a lot.' },
  ],
};
