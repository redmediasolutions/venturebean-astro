// Homepage content — copied verbatim from https://venturebean.com/ (Sept 2026).
// Do not edit copy here without sign-off: the live site is the source of truth.
// Image paths are the original WordPress upload URLs; <Img> serves a local,
// optimised copy when `npm run assets` has downloaded it into src/assets/wp/.

const WP = 'https://venturebean.com/wp-content/uploads';

/* 1 — Hero slider ------------------------------------------------------- */
export const hero = {
  autoplayMs: 6000,
  slides: [
    {
      title: 'Business Consulting',
      text: 'Driving SMB Business Growth & Transformation through Strategy, Process Improvements, CXO Advisory',
      cta: { label: 'Get Started', href: '/business-consulting/' },
      image: `${WP}/2025/06/Home-Page-1.webp`,
      alt: 'Business Growth and Sustainability Concept | venturebean',
      overlay: 'rgb(19 19 19 / 0.72)',
    },
    {
      title: 'Executive, Leadership Coaching',
      text: 'Enabling Growth for Professionals, Entrepreneurs & Teams Across SMBs, Family Businesses & Corporates',
      cta: { label: 'Start Your Journey', href: '/coaching/' },
      image: `${WP}/2025/06/Venturebean-coaching.webp`,
      alt: 'Sales Training and Coaching Workshop | VentureBean',
      overlay: 'rgb(20 20 21 / 0.5)',
    },
    {
      title: 'Smart Growth Solutions',
      text: 'Curated packages combining strategy, systems, and leadership development for measurable impact.',
      cta: { label: 'Get Started', href: '/venturebean-solutions-page/' },
      image: `${WP}/2025/08/Solutions-page.jpg`,
      alt: 'Smart growth solutions with strategy, systems, and leadership development |venturebean',
      overlay: 'rgb(6 2 54 / 0.5)',
    },
    {
      title: 'Differentiators',
      text: 'Data-Driven Consulting & Coaching Powered by 6-Sigma, SMART Goals, KPIs and ROI-Focused Growth.',
      cta: { label: 'See It In Action', href: '/about-us/#guiding' },
      image: `${WP}/2025/04/Slider-Image-3.webp`,
      alt: 'Data-driven consulting with growth analytics and performance metrics |venturebean',
      overlay: 'rgb(6 2 54 / 0.5)',
    },
  ],
};

/* 2 — About ------------------------------------------------------------- */
export const about = {
  title: 'Management Consultant in Bangalore',
  image: `${WP}/2026/08/WhatsApp-Image-2026-08-20-at-18.00.01.jpeg`,
  imageAlt: 'VentureBean',
  intro: [
    'VentureBean is a boutique consulting firm focusing on Business Consulting and Executive, Leadership Coaching & Organisational Development.',
    'As a consulting company in Bangalore, we work with SMBs, family businesses, founders, leadership teams and senior executives.',
  ],
  listLead: 'We help',
  list: [
    'Organisations improve business performance through strategy, operational improvement, business transformation and organisational development',
    'Professionals and leaders grow, succeed through executive, leadership coaching and organisational development.',
  ],
  outro:
    'Our integrated approach recognises that sustainable growth requires both organisational excellence and leadership capability. By addressing both, we help clients improve performance, strengthen execution and prepare for long-term success. Our tenured consultants and ICF credentialed coaches bring differentiated expertise.',
  cta: { label: 'Learn More', href: '/about-us/' },
};

/* 3 — Stats ------------------------------------------------------------- */
export const stats = {
  title: 'Trusted by Businesses, Founders and Leaders Across Industries',
  items: [
    { value: 300, suffix: '+', label: 'Clients' },
    { value: 14, suffix: '+', label: 'Years of Experience' },
    { value: 6, suffix: '+', label: 'Global Locations' },
    { value: 8, suffix: '+', label: 'Industry Sectors' },
  ],
};

/* 4 — Why VentureBean --------------------------------------------------- */
export const why = {
  // Rendered as: Why Venture<span>Bean</span>?
  titleParts: ['Why Venture', 'Bean', '?'],
  subtitle: 'Our Guiding Principles, Differentiators',
  portrait: `${WP}/2026/08/Mathew-Isac.webp`,
  items: [
    {
      title: 'Business-Led Perspective',
      text: 'Led by experienced practitioners who have built, scaled and transformed businesses in strategic roles.',
      image: `${WP}/2025/06/Strategy.webp`,
      alt: 'Chess pieces symbolizing sharp strategy and business growth coaching |venturebean',
    },
    {
      title: 'Integrated Growth Approach',
      text: 'Aligning strategy, leadership, people and execution to accelerate business and leadership growth.',
      image: `${WP}/2025/06/Data-Driven-Venturebean.webp`,
      alt: 'Hand pointing at analytics dashboard for consulting insights|venturebean',
    },
    {
      title: 'Capability Over Dependency',
      text: 'Developing leaders, teams and systems that sustain performance beyond the engagement.',
      image: `${WP}/2025/06/Global-Experience-Venturebean.webp`,
      alt: 'Happy professionals representing VentureBean’s client partnership approach |venturebean',
    },
    {
      title: 'Execution-Focused Partnership',
      text: 'Turning insights into action through hands-on implementation, accountability, and support.',
      image: `${WP}/2026/05/jakub-zerdzicki-ykgLX_CwtDw-unsplash-scaled.jpg`,
      alt: 'execution-focused approach | VentureBean',
    },
    {
      title: 'Measurable Outcomes',
      text: 'Delivering growth, profitability, performance, leadership strength, organisational effectiveness, and long-term success.',
      image: `${WP}/2025/10/business.png`,
      alt: 'Tall building image | VentureBean',
    },
  ],
  cta: { label: 'Get The Details', href: '/about-us/#guiding' },
};

/* 5 — Videos ------------------------------------------------------------ */
export const videos = [
  { vimeoId: '962019603', title: 'Introduction to VentureBean' },
  { vimeoId: '962019714', title: 'Vision & Purpose of VentureBean' },
];

/* 6 — How we help ------------------------------------------------------- */
export const expertise = {
  title: 'How we help',
  subtitle: 'Our Areas of Expertise',
  paragraphs: [
    'We partner with growth focused businesses and leaders through our two core practices: Consulting and Coaching & Organisational Development. Our consulting practice helps organisations improve performance, strengthen capabilities and drive growth.',
    'Our Coaching and Organisational Development practice helps founders, professionals and leaders build the skills, confidence and effectiveness required to succeed in increasingly complex environments. Every engagement is designed to deliver practical outcomes, measurable impact and long-term value.',
  ],
};

/* 7 — Business Consulting ----------------------------------------------- */
export const consulting = {
  id: 'business-consulting',
  title: 'Business Consulting',
  subtitle: 'Scaling SMBs with Strategy and Systems',
  text: 'Supporting SMBs, family businesses, founders, and leadership teams in achieving growth, improving performance, and building scalable organisations.',
  cta: { label: 'Explore Business Consulting', href: '/business-consulting/' },
  slides: [
    { image: `${WP}/2025/06/Growth-Venturebean.webp`, alt: 'Business growth and investment nurturing for sustainable success |venturebean' },
    { image: `${WP}/2025/06/Future-driven-venturebean.webp`, alt: 'Highway of innovation symbolizing future-ready consulting |venturebean' },
  ],
  features: [
    { icon: 'signal', title: 'Growth', text: 'Helping businesses identify opportunities, accelerate growth and improve performance.' },
    { icon: 'target', title: 'Experience', text: 'Drawing on decades of leadership, consulting and operational expertise.' },
    { icon: 'windows', title: 'Execution', text: 'Turning strategy into action through practical implementation support.' },
    { icon: 'layers', title: 'Results', text: 'Focused on measurable business outcomes and sustainable growth.' },
  ],
};

/* 8 — Coaching & Organisational Development ----------------------------- */
export const coaching = {
  id: 'coaching-od',
  title: 'Coaching & Organisational Development',
  subtitle: 'Transforming Leaders & Teams for Sustained Success',
  text: 'Helping leaders strengthen capability, improve effectiveness, and lead with greater impact.',
  cta: { label: 'Explore Coaching & Leadership Development', href: '/coaching/' },
  slides: [
    { image: `${WP}/2025/06/Transform-Leaders.webp`, alt: 'Businessman planning for corporate growth and success |venturebean' },
    { image: `${WP}/2025/06/Networking-Venturebean.webp`, alt: 'Business consulting solutions connecting opportunities and growth. |venturebean' },
    { image: `${WP}/2025/06/purpose.webp`, alt: 'Arrow on bullseye representing precision and measurable results |venturebean' },
  ],
  features: [
    { icon: 'badge', title: 'Credibility', text: 'ICF-credentialed coaching backed by extensive business and leadership experience.' },
    { icon: 'command', title: 'Perspective', text: 'Combining coaching expertise with real-world business and leadership insights.' },
    { icon: 'chart', title: 'Capability', text: 'Strengthening leadership effectiveness, team performance and future leadership pipelines.' },
    { icon: 'spark', title: 'Impact', text: 'Translating personal growth into measurable business outcomes through enhanced leadership, accountability, and execution.' },
  ],
};

/* 9 — Industries -------------------------------------------------------- */
export const industries = {
  title: 'Industries We Serve',
  subtitle: 'Comprehensive Solutions Tailored for Every Industry',
  text: 'Our experience spans multiple industries, enabling us to bring cross-sector insights while addressing industry-specific challenges.',
  items: [
    { title: 'Technology', text: 'IT, SaaS, ITES, Analytics, Digital Platforms', icon: 'gradienter', image: `${WP}/2025/07/Technology.jpg` },
    { title: 'BFSI', text: 'Banking, Financial Services, Insurance, FinTech', icon: 'command', image: `${WP}/2025/07/FMCG.jpg` },
    { title: 'Consumer', text: 'FMCG, Retail, Travel, Leisure & Entertainment', icon: 'stack', image: `${WP}/2025/07/Hosoi.jpg` },
    { title: 'Healthcare', text: 'MedTech, Pharma, Healthcare Providers', icon: 'heartbeat', image: `${WP}/2025/07/Healthcare.jpg` },
    { title: 'Education', text: 'EdTech, Universities, Institutions', icon: 'teacher', image: `${WP}/2025/07/Education.jpg` },
    { title: 'Professional Services', text: 'Consulting, Shared Services, BPO/KPO, Hospitality', icon: 'teacher', image: `${WP}/2025/04/Slider-Image-2.webp` },
    { title: 'Infrastructure & Manufacturing', text: 'Realty, Telecom, Industrial, Automotive, Chemicals', icon: 'building', image: `${WP}/2025/07/Manufacturing.jpg` },
    { title: 'Energy & Utilities', text: 'Power, Renewables, Utilities, Oil & Gas', icon: 'building', image: `${WP}/2025/07/4.jpg` },
  ],
};

/* 10 — Clients ---------------------------------------------------------- */
export const clients = {
  title: 'Clients',
  subtitle: 'Trusted by Leading Brands Worldwide',
  cta: { label: 'View All Clients', href: '/clients/' },
  // Original logos carry no alt text; alt below is generic on purpose.
  logos: [
    `${WP}/2025/07/2.png`,
    `${WP}/2025/07/1.png`,
    `${WP}/2025/08/floating-walls.jpg`,
    `${WP}/2025/08/Gunasheela-Logo_001-scaled-1.jpg`,
    `${WP}/2025/07/25-e1755064494928.png`,
    `${WP}/2025/07/35.png`,
    `${WP}/2025/08/sunder-manganese-and-iron-ore-ltd.png`,
    `${WP}/2025/08/desmet.jpeg`,
    `${WP}/2025/07/22-e1755064584334.png`,
    `${WP}/2025/07/4.png`,
    `${WP}/2025/08/dreamfolks.png`,
    `${WP}/2025/07/23.png`,
    `${WP}/2025/08/qubix-logo.jpg`,
    `${WP}/2025/08/moolya.png`,
    `${WP}/2025/07/8.png`,
    `${WP}/2025/07/27.png`,
    `${WP}/2025/08/acent.png`,
  ],
};

/* 11 — Knowledge Hub ---------------------------------------------------- */
export const knowledgeHub = {
  title: 'Knowledge Hub',
  subtitle: 'Thinking that helps you decide better',
  tabs: [
    {
      id: 'media',
      label: 'Media Spotlight',
      layout: 'media',
      items: [
        {
          title: 'How I Failed My Way Forward | Mathew Isac | TEDxSJIM',
          href: 'https://www.youtube.com/watch?v=OvfZXfjzijM',
          date: 'August 12, 2026',
          datetime: '2026-08-12',
          image: `${WP}/2026/08/MI-Tedx.jpg`,
        },
        {
          title: 'Leadership Spotlight: The Man who builds what lasts',
          href: `${WP}/2026/06/Mathew-Isac-Leadership-Spotlight-Post_20May26.pdf`,
          date: 'June 18, 2026',
          datetime: '2026-06-18',
          image: `${WP}/2026/06/Leadership-1-1.webp`,
        },
        {
          title: 'Leadership Growth for Founders & CEOs | Your Next Level Requires a Different You',
          href: 'https://youtu.be/iAFY92qJwrY',
          date: 'March 20, 2026',
          datetime: '2026-03-20',
          image: `${WP}/2026/04/iAFY92qJwrY-HD.jpg`,
        },
      ],
    },
    {
      id: 'industry',
      label: 'Industry Perspective',
      layout: 'post',
      items: [
        {
          category: 'Industry Perspectives',
          title: 'India GCC Workplace Reset',
          excerpt: 'India’s GCC story has stopped being a scale story. With 2,117 centres running 3,728 units and USD 98.4 billion in revenue, the question of whether …',
          href: '/industry-perspectives/india-gcc-workplace-reset/',
          date: 'September 1, 2026',
          datetime: '2026-09-01',
          image: `${WP}/2026/09/Untitled-22-September-2026-at-15.19.23-400x225.jpeg`,
        },
        {
          category: 'Industry Perspectives',
          title: 'India Skills Report 2025',
          excerpt: 'Only 54.81% of Indian graduates are globally employable. Women’s employability has fallen to 47.5%, men’s has risen to 53.5%, …',
          href: '/industry-perspectives/india-skills-report-2025/',
          date: 'May 7, 2026',
          datetime: '2026-05-07',
          image: `${WP}/2026/05/jakub-zerdzicki-ykgLX_CwtDw-unsplash-400x267.jpg`,
          alt: 'execution-focused approach | VentureBean',
        },
        {
          category: 'Industry Perspectives',
          title: 'India GCC Landscape Report: The 5 YearJourney (2025)',
          excerpt: 'India hosts over 1,800 Global Capability Centres, half the world’s total, generating $64.6 billion and employing 1.9 million professionals…',
          href: '/industry-perspectives/india-gcc-landscape-report-the-5-yearjourney-2025/',
          date: 'April 30, 2026',
          datetime: '2026-04-30',
          image: `${WP}/2026/04/WhatsApp-Image-2026-04-30-at-17.14.15-400x225.jpeg`,
        },
        {
          category: 'Industry Perspectives',
          title: 'Annual Survey of MSMEs in India 2025: The Role of Digitalisation',
          excerpt: '71% of India’s MSMEs joined e-commerce platforms post-2020. 90% of them grew. But ICRIER’s landmark survey of 2,365 firms…',
          href: '/industry-perspectives/annual-survey-of-msmes-in-india-2025-the-role-of-digitalisation/',
          date: 'April 23, 2026',
          datetime: '2026-04-23',
          image: `${WP}/2026/04/image-400x267.webp`,
        },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      layout: 'post',
      items: [
        {
          category: 'Coaching',
          title: 'How Executive Coaching Prepares High-Potential Leaders for Senior Roles',
          excerpt: 'The promotion letter can arrive before the leader is ready for everything that comes with it. A high-potential manager may',
          href: '/coaching/how-executive-coaching-prepares-high-potential-leaders-for-senior-roles/',
          date: 'September 24, 2026',
          datetime: '2026-09-24',
          image: `${WP}/2025/08/The-Power-of-Frontline-Ownership-in-Driving-Sustainable-Transformation.jpg`,
        },
        {
          category: 'Consulting',
          title: '5 Challenges CEOs Must Address Before AI Can Deliver Business Value',
          excerpt: 'There may be plenty of experimentation and several successful pilots, yet the impact on revenue, cost, productivity or customer experience',
          href: '/consulting/5-challenges-ceos-must-address-before-ai-can-deliver-business-value/',
          date: 'September 17, 2026',
          datetime: '2026-09-17',
          image: `${WP}/2026/03/cherrydeck-05gac-Qn0k4-unsplash-scaled-e1773126029963.jpg`,
        },
        {
          category: 'Coaching',
          title: 'Why CEOs Need Executive Coaching: The Leadership Challenges No One Talks About',
          excerpt: 'A CEO can have years of experience, a strong track record, a capable leadership team and a clear understanding of',
          href: '/coaching/why-ceos-need-executive-coaching-the-leadership-challenges-no-one-talks-about/',
          date: 'September 10, 2026',
          datetime: '2026-09-10',
          image: `${WP}/2026/07/founder.avif`,
        },
        {
          category: 'Consulting',
          title: 'How to Know When Your Business Needs a Growth Strategy',
          excerpt: 'Growth is the goal for most businesses. But as a company grows, new challenges often emerge unpredictable revenue, operational complexity,',
          href: '/consulting/how-to-know-when-your-business-needs-a-growth-strategy/',
          date: 'September 3, 2026',
          datetime: '2026-09-03',
          image: `${WP}/2025/12/amy-hirschi-JaoVGh5aJ3E-unsplash-scaled.jpg`,
        },
      ],
    },
  ],
  readMore: 'Read More »',
};

/* 12 — Testimonials ----------------------------------------------------- */
// NOTE: several job titles on the live site end with a duplicated
// "CEO, Xmplar ERP Solutions" (looks like a WordPress copy-paste slip).
// Kept verbatim per the content rule — confirm with the client before fixing.
export const testimonials = {
  title: 'Testimonials',
  subtitle: 'What Our Clients Say About Us',
  cta: { label: 'More Testimonials', href: '/testimonials/' },
  groups: [
    {
      label: 'COACHING',
      items: [
        {
          name: 'Vinod Shenoy M',
          role: 'Chief Financial Officer',
          image: `${WP}/2025/07/Vinod-Shenoy-M-CFO-coaching.jpg`,
          quote: [
            'Mathew is a unique Executive / Leadership coach with a blend of business expertise and effective coaching. He engages deeply with coachees to co-create practical approaches, gently nudging them beyond their comfort zones with SMART goals. His holistic approach ensures a balanced perspective.',
            'I strongly recommend Mathew to any leader or aspiring leader looking to find their “Alpha” version and achieve greater professional success.',
          ],
        },
        {
          name: 'Ashish Duggal',
          role: 'Co-Founder & CEO at Poiesis CEO, Xmplar ERP Solutions',
          image: `${WP}/2025/07/Ashish-Duggal-poiesis-coaching.jpg`,
          quote: [
            "Mathew's credentials speak volumes, but his true value lies in his coaching attitude and knowledge-sharing approach. His unique method helps CXOs and leaders recognize their current standing and drive collective growth. By using frameworks and thought-provoking questions, he prompts self-discovery and realization of potential.",
            'I am grateful for his coaching and highly recommend him to any organization seeking to develop their senior leadership',
          ],
        },
        {
          name: 'Jayasri Prasad',
          role: 'Founder and CEO, Sine Qua Non Sustainability CEO, Xmplar ERP Solutions',
          image: `${WP}/2025/07/Jayasri-Prasad-Sine-Qua-coaching.jpg`,
          quote: [
            'After leaving my corporate job, I turned to Mathew to help launch my new venture. He guided me in developing an entrepreneurial mindset before diving into technical details. Mathew’s patience and role as a Business Coach were invaluable as I clarified and crystallised my ideas. He then helped refine my Business Plan, strategy, and implementation. His motivation, encouragement, and generosity with time and advice are exceptional.',
            'I highly recommend Mathew and VentureBean.',
          ],
        },
        {
          name: 'Thomas P. Thomas',
          role: 'CEO, Zyxware Technologies CEO, Xmplar ERP Solutions',
          image: `${WP}/2025/07/Thomas-P.-Thomas-Zyxware-Technologies-consulting.jpg`,
          quote: [
            'Mathew is working with me and my leadership team as an Executive Coach, helping us identify areas of improvement in leadership roles as we work on building the second line of leadership in our business scaling plans.',
            'I recommend his customised proprietary Coaching approach for its simplicity yet effectiveness in leadership, people growth.',
          ],
        },
      ],
    },
    {
      label: 'CONSULTING',
      items: [
        {
          name: 'Pradeep Soundararajan',
          role: 'Founder & Managing Director – Moolya',
          image: `${WP}/2025/07/Pradeep-Soundararajan-Moolya-_-consulting.jpg`,
          quote: [
            'VentureBean Consulting provided advisory inputs to the management at Moolya and helped structure things better in the company. We recommend VentureBean for all SMBs who need to feel confident about themselves.',
          ],
        },
        {
          name: 'Rajumohan R',
          role: 'CEO, Xmplar ERP Solutions CEO, Xmplar ERP Solutions',
          image: `${WP}/2025/07/Rajumohan-R-Xmplar-ERP-Solutions-consulting.jpg`,
          quote: [
            'Team VentureBean – Thank you for the detailed final report. This was definitely a fruitful and fulfilling engagement, which helped me in understanding the areas where I have to focus/concentrate on. Thanks for your open and transparent feedback, which should help us move forward.',
          ],
        },
        {
          name: 'Akash J Ovian',
          role: 'Head of Marketing, Naivo Café',
          image: `${WP}/2025/07/Akash.png`,
          quote: [
            'We are an SMB in the specialty coffee market in India. VentureBean brought valuable experience, helping us take our product online and increase visibility. They guided us in establishing the ideal marketing mix, audience segmentation, and a strong go-to-market strategy, focusing on B2B2C channels. We highly recommend VentureBean for SMBs needing guidance in marketing, business process improvement, and finance.',
          ],
        },
        {
          name: 'Bharat Arya',
          role: 'CEO – Nordic Seed Design Pte Limited CEO, Xmplar ERP Solutions',
          image: `${WP}/2025/07/Bharat-Arya-nordic-seed-consulting.jpg`,
          quote: [
            "We appreciate the support and wonderful experience we've had with the VentureBean team. Their promptness, professionalism, knowledge, and flexibility have been exceptional. Their friendliness and openness to our ideas have built our trust in their judgment. We look forward to a long, mutually beneficial partnership as we continue to grow together.",
          ],
        },
      ],
    },
  ],
};
