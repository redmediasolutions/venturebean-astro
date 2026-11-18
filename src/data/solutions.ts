
export interface Solution {
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  idealFor?: string[];
  idealIntro?: string;
  bestSuited?: string[];
  challenges?: string[];
  included?: string[];
  outcome?: string;
  outcomePoints?: string[];
  framework?: {
    title: string;
    description?: string;
    items: {
      number: string;
      title: string;
      points: string[];
    }[];
  };
  optionalEnhancements?: string[];
}

export const solutions: Record<string, Solution> = {
  "solutions-launch-right": {
    slug: "solutions-launch-right",
    name: "Launch Right",
    eyebrow: "Launch Right",
    title: "Build the Business Right from Day One",
    idealFor: [
      "Early-stage startups",
      "First-generation entrepreneurs",
      "New business ventures",
      "MSMEs building for growth",
    ],
    bestSuited: [
      "The business has an idea, early traction, or a growing opportunity but lacks clarity, structure, direction, or operational discipline.",
    ],
    challenges: [
      "Lack of business clarity and focus",
      "Undefined business model and growth direction",
      "Founder role confusion",
      "Weak execution structure",
      "Difficulty building accountability in early teams",
    ],
    included: [
      "Vision, mission, and business model clarity",
      "GTM and growth planning",
      "Founder and team role alignment",
      "Early-stage organisation structuring",
      "KPI and execution tracking setup",
      "Founder coaching and decision support",
      "Review systems and operating rhythm",
    ],
    outcome:
      "Build your business on a strong foundation designed for sustainable growth.",
    outcomePoints: [
      "Clear business direction with defined priorities and founder alignment",
      "Structured systems, processes, and accountability from the outset",
      "A scalable operating foundation that supports long-term growth",
    ],
  },

  "solutions-page-scalewise": {
    slug: "solutions-page-scalewise",
    name: "ScaleWise",
    eyebrow: "ScaleWise",
    title: "Structure Growth Without Losing Speed",
    ctaText: "Explore Consulting Solutions",
    idealFor: [
      "Growing SMEs and SMBs",
      "Founder-led businesses",
      "Scaling organisations",
      "Businesses seeking operational excellence",
    ],
    bestSuited: [
      "The business is growing rapidly but facing operational chaos, founder dependency, inconsistent delivery or team misalignment.",
      "The business growth is stagnant and / or issues are being faced with scaling, accountability, response time, quality.",
    ],
    challenges: [
      "Founder overload and bottlenecks",
      "Lack of systems and SOPs",
      "Weak accountability across functions",
      "Inconsistent execution and delivery",
      "Teams scaling faster than structure",
    ],
    included: [
      "Gap-identification in current 'as-is' state",
      "Organisation and role structuring",
      "KPI/KRA framework development",
      "SOP and workflow design",
      "Strategic growth roadmap",
      "Profitability and operational review",
      "Governance and review cadence",
      "Leadership coaching for key managers and founders",
    ],
    outcome:
      "Transform growth into a structured, scalable, and well-managed business.",
    outcomePoints: [
      "Stronger operational systems that improve execution and consistency",
      "Clear accountability across teams, functions, and leadership",
      "Sustainable growth driven by disciplined processes and governance",
    ],
  },

  legacynext: {
    slug: "legacynext",
    name: "LegacyNext",
    eyebrow: "LegacyNext Programme",
    title: "Professionalise and Future-Proof Family Businesses",
    description:
      "Navigate the complexities of generational transition with a framework designed to preserve family harmony while institutionalising excellence.",
    idealIntro:
      "We partner with enterprises that value heritage but recognize the need for evolution.",
    idealFor: [
      "Family-Owned",
      "Second-Gen & Beyond",
    ],
    bestSuited: [
      "Planning a leadership handover",
      "Introducing external board members",
      "Clarifying equity vs management roles",
      "Preparing for global scaling",
    ],
    challenges: [
      "Generational Conflict — Bridging the gap between traditional wisdom and modern innovation. We facilitate dialogues that turn friction into collaborative energy.",
      "Succession Uncertainty — Providing a clear, documented roadmap for who leads next, how they are chosen, and when the baton is passed.",
      "Role Overlap — Defining where family ends and business begins, ensuring professional accountability for every stakeholder.",
    ],
    outcome:
      "Builds continuity, governance, and leadership readiness while preserving values.",
    framework: {
      title: "The Legacy Framework",
      description: "A holistic approach to business longevity.",
      items: [
        {
          number: "01",
          title: "Family Governance",
          points: [
            "Family Constitution Drafting",
            "Board of Directors Structuring",
            "Advisory Council Setup",
          ],
        },
        {
          number: "02",
          title: "Transition Planning",
          points: [
            "Next-Gen Readiness Audit",
            "Leadership Handover Timeline",
            "Wealth Transfer Strategy",
          ],
        },
        {
          number: "03",
          title: "Legacy Workshops",
          points: [
            "Values Discovery Sessions",
            "Conflict Resolution Training",
            "Collaborative Vision Mapping",
          ],
        },
      ],
    },
  },

  "solutions-leadershipedge": {
    slug: "solutions-leadershipedge",
    name: "LeadershipEdge",
    eyebrow: "LeadershipEdge",
    title: "Build Leaders Who Drive Growth and Culture",
    ctaText: "Book a Free Leadership Diagnostic",
    idealFor: [
      "Business leaders and CXOs",
      "Functional managers",
      "High-potential professionals",
      "Leadership teams and organisations",
    ],
    bestSuited: [
      "The organisation needs stronger leadership capability, better team alignment, and a scalable leadership pipeline.",
    ],
    challenges: [
      "Weak leadership bench strength",
      "Low engagement and retention",
      "Poor collaboration and accountability",
      "Leadership capability gaps",
      "Leadership readiness challenges",
    ],
    included: [
      "Leadership development workshops",
      "360° leadership assessments including global tool-based benchmarking assessments like Motivation-Code (used by NASA) and Motivation Factor – for individuals and Teams",
      "Executive and leadership coaching – 1:1, small groups / Teams",
      "Leadership competency frameworks",
      "Stakeholder management support",
      "Team effectiveness interventions",
      "Coaching culture enablement",
      "Stakeholder review and progress tracking",
    ],
    outcome:
      "Develop leaders who inspire performance, alignment, and lasting business impact.",
    outcomePoints: [
      "Confident leaders equipped to drive growth and manage change",
      "Stronger collaboration, accountability, and team effectiveness",
      "A sustainable leadership pipeline that supports future business success",
    ],
  },

  "solutions-impact360": {
    slug: "solutions-impact360",
    name: "Impact360",
    eyebrow: "Impact360",
    title: "Business & People Transformation",
    subtitle:
      "Business Consulting + Coaching + Leadership Development",
    ctaText: "Book a Discovery Call",
    idealFor: [
      "Growth-focused SMBs",
      "Mid-sized and large organisations",
      "Business transformation initiatives",
      "Leadership teams driving change",
    ],
    bestSuited: [
      "The organisation requires a complete alignment of strategy, leadership, people, operations, and execution to move to the next level.",
    ],
    challenges: [
      "Strategy disconnected from execution",
      "Functional silos and leadership gaps",
      "Culture and performance misalignment",
      "Fragmented transformation efforts",
      "Lack of execution ownership and governance",
    ],
    included: [
      "Business and people diagnostics including Tech, Tools and Governance - Baselining",
      "Strategy-to-execution planning - Benchmarking",
      "Organisation and functional alignment – Action Planning",
      "CXO and leadership coaching",
      "Cross-functional collaboration interventions – Execution, Implementation",
      "Transformation PMO support",
      "Governance dashboards and quarterly reviews - Sustenance",
    ],
    outcome:
      "Align strategy, leadership, people, and execution to accelerate business transformation.",
    outcomePoints: [
      "Unified execution across strategy, people, operations, and leadership",
      "Improved governance, collaboration, and organisational performance",
      "Sustainable business transformation with measurable long-term impact",
    ],
  },

  gcc: {
    slug: "gcc",
    name: "GCCEdge360",
    eyebrow: "GCCEdge360",
    title: "Global Capability Centres",
    description:
      "GCCEdge360 is designed for organisations building or expanding Global Capability Centres and requiring structured support across setup, operations, people, governance, compliance, technology enablement, and execution. The solution helps businesses establish scalable GCC structures, improve operational efficiency, strengthen leadership alignment, and build high-performing capability centres that support long-term business growth and operational excellence.",
    idealFor: [
      "Organisations establishing GCCs",
      "Businesses expanding GCC operations",
      "Companies building offshore capability centres",
      "Global organisations setting up operations in India",
    ],
    bestSuited: [
      "The organisation is planning GCC setup, expansion, or operational scaling",
      "Leadership teams require structured GCC execution and operational support",
      "The business needs support with GCC governance, compliance, and operating models",
      "Teams are facing challenges in hiring, operational alignment, or process standardisation",
      "Expansion plans require scalable systems, operational visibility, and execution discipline",
    ],
    challenges: [
      "Navigating GCC setup, legal, and compliance requirements",
      "Delays in operational readiness and execution planning",
      "Challenges in hiring and retaining skilled GCC talent",
      "Lack of structured operational systems and governance frameworks",
      "Weak reporting structures and limited performance visibility",
      "Leadership bandwidth constraints during GCC expansion",
      "Misalignment between GCC operations and headquarters expectations",
      "Difficulties in building scalable and sustainable GCC operations",
    ],
    framework: {
      title: "What's Included",
      items: [
        {
          number: "01",
          title: "People",
          points: [
            "GCC talent acquisition and onboarding support",
            "KPI, KRA, and OKR-based performance management frameworks",
            "Leadership and team capability development pathways",
            "Employee engagement and retention initiatives",
            "Fractional CXO and operational leadership support",
            "Team structure and workforce planning advisory",
          ],
        },
        {
          number: "02",
          title: "Process",
          points: [
            "GCC business planning and execution readiness support",
            "SOPs, workflows, operational playbooks, and policy frameworks",
            "Operational review systems and governance structures",
            "MIS dashboards and reporting mechanisms",
            "Role clarity and accountability frameworks",
            "Process optimisation and operational efficiency support",
          ],
        },
        {
          number: "03",
          title: "Technology",
          points: [
            "CRM, ERP, and HRMS advisory for GCC operations",
            "Technology stack evaluation and implementation guidance",
            "Process automation recommendations",
            "Reporting and operational dashboard support",
            "Workflow and collaboration tool advisory",
          ],
        },
        {
          number: "04",
          title: "Governance",
          points: [
            "GCC company incorporation and market entry advisory",
            "Legal, regulatory and compliance support",
            "Governance and review frameworks",
            "Risk management and internal control systems",
            "Performance review and operational governance cadence",
            "Operational oversight and leadership review mechanisms",
          ],
        },
      ],
    },
    optionalEnhancements: [
      "First 90-day GCC operational transition support",
      "Local vendor, partner and EOR ecosystem setup",
      "Founding team and leadership coaching",
      "GCC culture integration and alignment support",
      "Quarterly GCC operational health assessments",
      "Strategic advisory retainers for long-term expansion support",
    ],
    outcome:
      "Build scalable, high-performing GCC operations with confidence and control.",
    outcomePoints: [
      "Operationally stable GCCs with strong governance and compliance",
      "Scalable systems, capable leadership, and execution excellence",
      "Greater visibility, reduced risk, and long-term operational sustainability",
    ],
  },
};
