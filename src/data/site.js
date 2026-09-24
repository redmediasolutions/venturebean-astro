// Global site data — navigation, contact details, SEO defaults.
// All values copied from https://venturebean.com/ (header, footer, <head>).

export const site = {
  name: 'VentureBean',
  legalName: 'VentureBean Consulting Pvt. Ltd.',
  url: 'https://venturebean.com',
  logo: '/images/logo.svg',
  seo: {
    title: 'Business Consultant & Executive Coach in Bangalore',
    description:
      'VentureBean helps SMBs, family businesses & CXOs in Bangalore grow through strategy consulting and ICF-credentialed executive coaching.',
    ogTitle: 'Vb Home Page for Consulting and Coaching Solutions',
    ogDescription:
      'Discover the Vb home page for data-driven consulting and coaching that empowers businesses to achieve measurable growth.',
    ogImage: 'https://venturebean.com/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-20-at-18.00.01.jpeg',
    ogImageWidth: 1024,
    ogImageHeight: 1536,
    siteName: 'Venturebean',
    locale: 'en_US',
  },
};

// Primary navigation (desktop + mobile). Mirrors the WordPress header menu.
export const mainNav = [
  {
    label: 'About Us',
    href: '/about-us/',
    children: [
      { label: 'Clients', href: '/clients/' },
      { label: 'Testimonials', href: '/testimonials/' },
      { label: 'Case Studies', href: '/case-studies/' },
    ],
  },
  { label: 'Consulting', href: '/business-consulting/' },
  // WordPress menu links /coaching-page/, which 301-redirects to /coaching/
  { label: 'Coaching', href: '/coaching/' },
  { label: 'Solutions', href: '/venturebean-solutions-page/' },
];

export const headerCtas = {
  secondary: { label: 'Knowledge Hub', href: '/knowledge-hub/' },
  primary: { label: 'Reach us', href: '/contact-us/' },
};

export const footer = {
  tagline: 'We partner with businesses and leaders to drive sustainable growth through consulting and coaching',
  quickLinksTitle: 'Quick Links',
  quickLinks: [
    { label: 'ABOUT US', href: '/about-us/' },
    { label: 'CONSULTING', href: '/business-consulting/' },
    { label: 'COACHING', href: '/coaching/' },
    { label: 'KNOWLEDGE HUB', href: '/knowledge-hub/' },
    { label: 'TESTIMONIALS', href: '/testimonials/' },
    { label: 'REACH US', href: '/contact-us/' },
  ],
  locationTitle: 'Our Location',
  address: [
    'VentureBean Consulting Pvt. Ltd.',
    'We Work Salarpuria Symbiosis,',
    'Arekere Village',
    'Begur Hobli,',
    'Bannerghatta Road,',
    'Bengaluru – 560076, India',
  ],
  contactTitle: 'Contact Information',
  phone: { label: '+91 98109 61665', href: 'tel:+919810961665' },
  email: { label: 'beanie@venturebean.com', href: 'mailto:beanie@venturebean.com' },
  cin: 'CIN: U93000KA2012PTC065441',
  social: [
    { label: 'Linkedin', href: 'https://www.linkedin.com/company/venturebean/', icon: 'linkedin' },
    { label: 'Youtube', href: 'https://www.youtube.com/@VentureBeanConsulting', icon: 'youtube' },
  ],
  copyright: '© August 2026 VentureBean. All Rights Reserved. Designed & Developed by',
  credit: { label: 'Red Media Solutions', href: 'https://redmediasolutions.in/' },
};
