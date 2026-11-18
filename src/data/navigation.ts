
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  mobileOnly?: boolean;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: "fas fa-home",
    mobileOnly: true,
  },
  {
    label: "About Us",
    href: "/about-us/",
    icon: "fas fa-info-circle",
    children: [
      { label: "Clients", href: "/clients/" },
      { label: "Testimonials", href: "/testimonials/" },
      { label: "Case Studies", href: "/case-studies/" },
    ],
  },
  {
    label: "Services",
    href: "/services/",
    icon: "fas fa-briefcase",
    children: [
      { label: "Consulting", href: "/business-consulting/" },
      { label: "Coaching", href: "/coaching/" },
      {
        label: "Organisational Development",
        href: "/organisational-development/",
      },
      { label: "Assessments", href: "/assessments/" },
    ],
  },
  {
    label: "Knowledge Hub",
    href: "/knowledge-hub/",
    icon: "fas fa-book-open",
    children: [
      {
        label: "Media Spotlight",
        href: "/knowledge-hub/media-spotlight/",
      },
      {
        label: "Industry Perspectives",
        href: "/knowledge-hub/industry-perspectives/",
      },
      { label: "Toolkit", href: "/knowledge-hub/toolkit/" },
      { label: "Insights", href: "/knowledge-hub/insights/" },
    ],
  },
  {
  label: "Solutions",
  href: "/solutions/",
  icon: "fas fa-lightbulb",
  children: [
    { label: "Launch Right", href: "/solutions/launch-right/" },
    { label: "ScaleWise", href: "/solutions/scale-wise/" },
    { label: "LegacyNext", href: "/solutions/legacy-next/" },
    { label: "LeadershipEdge", href: "/solutions/leadership-edge/" },
    { label: "Impact360", href: "/solutions/impact360/" },
    { label: "GCCEdge360", href: "/solutions/gcc/" },
  ],
},
  {
    label: "Reach Us",
    href: "/contact-us/",
    icon: "fas fa-paper-plane",
  },
];
