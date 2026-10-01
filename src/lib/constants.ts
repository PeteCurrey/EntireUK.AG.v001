export const SITE_CONFIG = {
  name: "Entire UK",
  legalName: "Entire UK Development Limited",
  domain: "https://entire-uk.com",
  tagline: "Property Acquisition, Land Intelligence & Value Creation",
  description:
    "Entire UK identifies and sources land and property opportunities with development potential, unlocking long-term commercial value through planning, acquisition, funding and delivery.",
  email: "opportunities@entire-uk.com",
  phone: "+44 (0) 20 4617 0228",
  location: "United Kingdom",
  parentBrand: "Entire",
  sisterCompany: "EntireFM",
  sisterCompanyUrl: "https://www.entirefm.com",
  statutoryNotice:
    "Entire UK Development Limited is a principal property acquisition, development and land promotion company registered in England and Wales. We are not an estate agency, broker, fund, or SaaS vendor.",
};

export const NAV_LINKS = [
  { label: "Opportunities", href: "/opportunities" },
  { label: "Criteria", href: "/criteria" },
  { label: "Our Approach", href: "/approach" },
  { label: "Land Radar", href: "/land-radar" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const PRIMARY_CTA = {
  label: "Submit an Opportunity",
  href: "/submit",
};

export const SUBMISSION_TYPES = {
  LAND: {
    id: "land",
    title: "I own land",
    subtitle: "Agricultural, greenfield, brownfield or strategic parcels with potential",
    cta: "Submit Your Land",
    path: "/submit/land",
    eyebrow: "Landowners",
  },
  PROPERTY: {
    id: "property",
    title: "I own a property",
    subtitle: "Commercial, industrial or residential buildings with conversion or redevelopment potential",
    cta: "Submit a Property",
    path: "/submit/property",
    eyebrow: "Property Owners",
  },
  OPPORTUNITY: {
    id: "opportunity",
    title: "I've identified an opportunity",
    subtitle: "For agents, surveyors, introducers and professionals with off-market site intelligence",
    cta: "Submit an Opportunity",
    path: "/submit/opportunity",
    eyebrow: "Opportunity Sources",
  },
  PARTNER: {
    id: "partner",
    title: "I'm a professional / potential partner",
    subtitle: "For planning consultants, architects, institutional capital, lenders and development partners",
    cta: "Partner With Us",
    path: "/submit/partner",
    eyebrow: "Partnerships & Capital",
  },
};

export const FOOTER_LINKS = {
  company: [
    { label: "About Entire UK", href: "/about" },
    { label: "Our Approach", href: "/approach" },
    { label: "Acquisition Criteria", href: "/criteria" },
    { label: "Land Radar Methodology", href: "/land-radar" },
    { label: "Opportunity Typologies", href: "/opportunities" },
    { label: "EntireFM Built Environment", href: "https://www.entirefm.com", external: true },
  ],
  acquisition: [
    { label: "Acquisition Parameters", href: "/criteria" },
    { label: "Site Anatomy (8 Dimensions)", href: "/opportunities#site-anatomy" },
    { label: "Commercial Structuring", href: "/approach#deal-structures" },
    { label: "Rejection Standards", href: "/criteria#fatal-constraints" },
    { label: "Regional Focus", href: "/criteria#geographic-focus" },
  ],
  submissions: [
    { label: "Submit Your Land", href: "/submit/land" },
    { label: "Submit a Property", href: "/submit/property" },
    { label: "Submit an Opportunity", href: "/submit/opportunity" },
    { label: "Partner With Us", href: "/submit/partner" },
    { label: "Intake Gateway", href: "/submit" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Website Use", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Contact Us", href: "/contact" },
    { label: "Authorised Portal", href: "/sign-in" },
  ],
};

