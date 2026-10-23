export type Lang = "ar" | "en";

export type ServiceSlug = "clothing" | "mugs" | "caps" | "stickers" | "cases";

export type CategorySlug = ServiceSlug;

export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  slug: ServiceSlug;
  title: string;
  kicker: string;
  description: string;
  image: string;
  alt: string;
  tone: "paper" | "ink" | "brand" | "sand";
}

export interface ProcessStep {
  icon: "tshirt" | "ruler" | "upload" | "eye" | "chat" | "search";
  title: string;
  body: string;
}

export interface PortfolioItem {
  id: string;
  category: CategorySlug;
  title: string;
  image: string;
  alt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SiteCopy {
  meta: {
    title: string;
    description: string;
  };
  brand: {
    name: string;
    tagline: string;
    latin: string;
  };
  nav: NavItem[];
  common: {
    requestCta: string;
    workCta: string;
    serviceCta: string;
    whatsappCta: string;
    demo: string;
    close: string;
    previous: string;
    next: string;
    loading: string;
    errorGeneric: string;
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    languageToggle: string;
    home: string;
  };
  hero: {
    eyebrow: string;
    titleLead: string;
    rotating: string[];
    subtitle: string;
    proofLabel: string;
    proofTagline: string;
    slides: {
      image: string;
      alt: string;
      label: string;
    }[];
  };
  services: {
    title: string;
    intro: string;
    items: ServiceItem[];
  };
  studio: {
    title: string;
    body: string;
    cta: string;
    frameLabel: string;
    placeholderNote: string;
  };
  process: {
    title: string;
    intro: string;
    note: string;
    loopLabels: string[];
    steps: ProcessStep[];
  };
  portfolio: {
    title: string;
    intro: string;
    all: string;
    requestLikeThis: string;
    categories: { slug: CategorySlug; label: string }[];
    items: PortfolioItem[];
  };
  about: {
    title: string;
    paragraphs: string[];
    principles: { title: string; body: string }[];
  };
  contact: {
    title: string;
    body: string;
    locationLabel: string;
    location: string;
    formTitle: string;
    formIntro: string;
    fields: {
      name: string;
      namePlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      message: string;
      messagePlaceholder: string;
    };
    submit: string;
    submitting: string;
    success: string;
    error: string;
    validation: {
      name: string;
      phone: string;
      message: string;
    };
    privacyNote: string;
  };
  faq: {
    title: string;
    items: FaqItem[];
  };
  footer: {
    blurb: string;
    contactTitle: string;
    linksTitle: string;
    followTitle: string;
    privacy: string;
    terms: string;
    competition: string;
    demoNote: string;
  };
  request: {
    title: string;
    intro: string;
    formTitle: string;
    fields: {
      name: string;
      namePlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      service: string;
      servicePlaceholder: string;
      quantity: string;
      quantityHint: string;
      details: string;
      detailsPlaceholder: string;
      artwork: string;
      artworkPlaceholder: string;
      artworkHint: string;
    };
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    codeLabel: string;
    trackCta: string;
    anotherCta: string;
    error: string;
    note: string;
    validation: {
      name: string;
      phone: string;
      service: string;
      quantity: string;
      details: string;
      artwork: string;
    };
  };
  track: {
    title: string;
    intro: string;
    codeLabel: string;
    codePlaceholder: string;
    submit: string;
    submitting: string;
    demoHint: string;
    notFound: string;
    error: string;
    created: string;
    service: string;
    quantity: string;
    statuses: Record<"received" | "review" | "confirmed" | "closed", { label: string; body: string }>;
  };
  studioPage: {
    title: string;
    intro: string;
    placeholderNote: string;
    cta: string;
    worksCta: string;
    note: string;
    demo: string;
  };
  studioUi: {
    productLabel: string;
    colorLabel: string;
    viewLabel: string;
    logoLabel: string;
    upload: string;
    replace: string;
    remove: string;
    uploadHint: string;
    uploadTypeError: string;
    uploadSizeError: string;
    uploadReadError: string;
    noLogo: string;
    dragHint: string;
    previewAlt: string;
    loading: string;
    loadError: string;
    retry: string;
    controls: string;
    scale: string;
    rotation: string;
    reset: string;
    treatment: string;
    removeWhite: string;
    removeWhiteHint: string;
    removalStrength: string;
    inkMode: string;
    inkOriginal: string;
    inkWhite: string;
    whiteHint: string;
    download: string;
    exporting: string;
    exportError: string;
    useDesign: string;
    designNote: string;
    attachedDesign: string;
    changeDesign: string;
    removeDesign: string;
    demoNote: string;
  };
  legal: {
    privacy: {
      title: string;
      updated: string;
      paragraphs: string[];
      note: string;
    };
    terms: {
      title: string;
      updated: string;
      paragraphs: string[];
      note: string;
    };
  };
  notFound: {
    title: string;
    body: string;
    cta: string;
  };
}

const sharedServices = {
  items: [
    {
      slug: "clothing",
      image: "/portfolio/clothing-tee-halftone.svg",
      tone: "paper",
    },
    {
      slug: "caps",
      image: "/portfolio/caps-dots.svg",
      tone: "ink",
    },
    {
      slug: "mugs",
      image: "/portfolio/mugs-wave.svg",
      tone: "brand",
    },
    {
      slug: "cases",
      image: "/portfolio/cases-grid.svg",
      tone: "sand",
    },
  ],
} as const;

const sharedPortfolio = [
  { id: "tee-halftone", category: "clothing", image: "/portfolio/clothing-tee-halftone.svg" },
  { id: "hoodie-arches", category: "clothing", image: "/portfolio/clothing-hoodie-arches.svg" },
  { id: "mug-wave", category: "mugs", image: "/portfolio/mugs-wave.svg" },
  { id: "mug-sun", category: "mugs", image: "/portfolio/mugs-sun.svg" },
  { id: "cap-dots", category: "caps", image: "/portfolio/caps-dots.svg" },
  { id: "cap-stripes", category: "caps", image: "/portfolio/caps-stripes.svg" },
  { id: "sticker-sheet", category: "stickers", image: "/portfolio/stickers-sheet.svg" },
  { id: "sticker-badge", category: "stickers", image: "/portfolio/stickers-badge.svg" },
  { id: "case-grid", category: "cases", image: "/portfolio/cases-grid.svg" },
  { id: "case-arc", category: "cases", image: "/portfolio/cases-arc.svg" },
] as const;

export const contact = {
  whatsappDisplay: "01116891025",
  whatsappHref: "https://wa.me/201116891025",
  instagramHandle: "@yuzersef___",
  instagramHref: "https://instagram.com/yuzersef___",
  tiktokHref: "",
  facebookHref: "https://www.facebook.com/USERSIEFASWAN",
} as const;

export const copy: Record<Lang, SiteCopy> = {
  ar: {
    meta: {
    title: "ÙŠÙˆØ²Ø±Ø³ÙŠÙ",
    description:
      "ÙŠÙˆØ²Ø±Ø³ÙŠÙ: Ø·Ø¨Ø§Ø¹Ø© ÙˆØªØ®ØµÙŠØµ Ù…Ù„Ø§Ø¨Ø³ØŒ ÙƒØ§Ø¨Ø§ØªØŒ Ù…Ø¬Ø§ØªØŒ Ø³ØªÙŠÙƒØ±Ø² ÙˆØ¬Ø±Ø§Ø¨Ø§Øª Ù…ÙˆØ¨Ø§ÙŠÙ„. Ø®Ù„ÙŠÙƒ Ù…Ø®ØªÙ„Ù .. Ø®Ù„ÙŠÙƒ ÙŠÙˆØ²Ø±Ø³ÙŠÙ.",
    },
    brand: {
      name: "ÙŠÙˆØ²Ø±Ø³ÙŠÙ",
      tagline: "Ø®Ù„ÙŠÙƒ Ù…Ø®ØªÙ„Ù .. Ø®Ù„ÙŠÙƒ ÙŠÙˆØ²Ø±Ø³ÙŠÙ",
      latin: "YUZERSEF",
    },
    nav: [
      { label: "Ø§Ù„Ø®Ø¯Ù…Ø§Øª", href: "/#services" },
      { label: "Ø§Ù„Ø£Ø¹Ù…Ø§Ù„", href: "/#work" },
      { label: "ÙƒÙŠÙ Ù†Ø´ØªØºÙ„", href: "/#process" },
      { label: "ØªÙˆØ§ØµÙ„", href: "/#contact" },
    ],
    common: {
      requestCta: "Ø§Ø¨Ø¯Ø£ Ø·Ù„Ø¨Ùƒ",
      workCta: "Ø´ÙˆÙ Ø£Ø¹Ù…Ø§Ù„Ù†Ø§",
      serviceCta: "Ø§Ø·Ù„Ø¨ Ù‡Ø°Ø§",
      whatsappCta: "ÙƒÙ„Ù…Ù†Ø§ Ø¹Ù„Ù‰ ÙˆØ§ØªØ³Ø§Ø¨",
      demo: "DEMO",
      close: "Ø¥ØºÙ„Ø§Ù‚",
      previous: "Ø§Ù„Ø³Ø§Ø¨Ù‚",
      next: "Ø§Ù„ØªØ§Ù„ÙŠ",
      loading: "Ù„Ø­Ø¸Ø©...",
      errorGeneric: "Ø­ØµÙ„Øª Ù…Ø´ÙƒÙ„Ø©. Ø¬Ø±Ø¨ ØªØ§Ù†ÙŠ.",
      skipToContent: "ØªØ®Ø·ÙŠ Ø¥Ù„Ù‰ Ø§Ù„Ù…Ø­ØªÙˆÙ‰",
      openMenu: "Ø§ÙØªØ­ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©",
      closeMenu: "Ø§Ù‚ÙÙ„ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©",
      languageToggle: "ØªØºÙŠÙŠØ± Ø§Ù„Ù„ØºØ©",
      home: "ÙŠÙˆØ²Ø±Ø³ÙŠÙØŒ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©",
    },
    hero: {
      eyebrow: "",
      titleLead: "Ø®Ù„ÙŠÙƒ Ù…Ø®ØªÙ„Ù Ø¹Ù„Ù‰",
      rotating: ["ØªÙŠØ´ÙŠØ±ØªÙƒ", "ÙƒÙˆØ¨Ùƒ", "ÙƒØ§Ø¨Ùƒ", "Ø§Ø³ØªÙŠÙƒØ±Ùƒ"],
      subtitle: "Ù…Ù† Ø§Ù„ÙÙƒØ±Ø© Ù„Ù„Ù…Ù†ØªØ¬ØŒ Ù†Ø·Ø¨Ø¹ ÙˆÙ†Ø®ØµÙ‘Øµ Ù‚Ø·Ø¹Ùƒ ÙÙŠ Ø£Ø³ÙˆØ§Ù†. Ø§Ø®ØªØ§Ø±ØŒ Ø§Ø¨Ø¹Øª ØªØµÙ…ÙŠÙ…ÙƒØŒ ÙˆØ§Ù„Ø¨Ø§Ù‚ÙŠ Ø¹Ù„ÙŠÙ†Ø§.",
      proofLabel: "PROOF 01",
      proofTagline: "Ø®Ù„ÙŠÙƒ Ù…Ø®ØªÙ„Ù",
      slides: [
        {
          image: "/portfolio/clothing-tee-halftone.svg",
          alt: "Ù†Ù…ÙˆØ°Ø¬ ØªØ¬Ø±ÙŠØ¨ÙŠ Ù„ØªÙŠØ´ÙŠØ±Øª Ù…Ø·Ø¨ÙˆØ¹",
          label: "ØªÙŠØ´ÙŠØ±Øª",
        },
        {
          image: "/portfolio/mugs-wave.svg",
          alt: "Ù†Ù…ÙˆØ°Ø¬ ØªØ¬Ø±ÙŠØ¨ÙŠ Ù„Ù…Ø¬ Ù…Ø·Ø¨ÙˆØ¹",
          label: "Ù…Ø¬",
        },
        {
          image: "/portfolio/caps-dots.svg",
          alt: "Ù†Ù…ÙˆØ°Ø¬ ØªØ¬Ø±ÙŠØ¨ÙŠ Ù„ÙƒØ§Ø¨ Ù…Ø·Ø¨ÙˆØ¹",
          label: "ÙƒØ§Ø¨",
        },
      ],
    },
    services: {
      title: "Ø¨Ù†Ø·Ø¨Ø¹ Ø§Ù„Ù„ÙŠ ÙŠØ®Ø·Ø± Ø¹Ù„Ù‰ Ø¨Ø§Ù„Ùƒ",
      intro: "Ø£Ø±Ø¨Ø¹ Ø¹Ø§Ø¦Ù„Ø§Øª Ù…Ù†ØªØ¬Ø§ØªØŒ ÙˆÙƒÙ„ ÙˆØ§Ø­Ø¯Ø© Ù„ÙŠÙ‡Ø§ Ù„Ù…Ø³Ø© ØªØ®ØµÙƒ.",
      items: [
        {
          slug: "clothing",
          title: "Ù…Ù„Ø§Ø¨Ø³ Ù…Ø·Ø¨ÙˆØ¹Ø©",
          kicker: "ØªÙŠØ´ÙŠØ±ØªØ§ØªØŒ Ù‡ÙˆØ¯ÙŠØ²ØŒ Ø³ÙˆÙŠØª Ø´ÙŠØ±ØªØ³",
          description: "Ø§Ø®ØªØ§Ø± Ø§Ù„Ù‚Ø·Ø¹Ø© ÙˆØ§Ù„Ù„ÙˆÙ† ÙˆØ§Ù„Ù…Ù‚Ø§Ø³ØŒ ÙˆØ§Ø­Ù†Ø§ Ù†Ø·Ø¨Ø¹ Ø§Ù„ØªØµÙ…ÙŠÙ….",
          image: sharedServices.items[0].image,
          alt: "Ù†Ù…ÙˆØ°Ø¬ ØªÙŠØ´ÙŠØ±Øª Ù…Ø·Ø¨ÙˆØ¹ Ø¨Ù†Ù‚Ø´Ø© Ù‡Ø§Ù ØªÙˆÙ†",
          tone: "paper",
        },
        {
          slug: "caps",
          title: "ÙƒØ§Ø¨Ø§Øª ÙˆØ³ØªÙŠÙƒØ±Ø²",
          kicker: "ÙƒØ§Ø¨Ø§ØªØŒ Ø³ØªÙŠÙƒØ±Ø²ØŒ Ù„ÙŠØ¨Ù„Ø§Øª",
          description: "ÙƒØ§Ø¨ Ø¨Ø´Ø¹Ø§Ø±ÙƒØŒ Ø³ØªÙŠÙƒØ±Ø²ØŒ ÙˆÙ„ÙŠØ¨Ù„Ø§Øª ØªØ®ØªÙ… Ø¨Ù‡Ø§ Ù…Ù†ØªØ¬Ùƒ.",
          image: sharedServices.items[1].image,
          alt: "Ù†Ù…ÙˆØ°Ø¬ ÙƒØ§Ø¨ Ù…Ø·Ø¨ÙˆØ¹ Ø¨Ù†Ù‚Ø´Ø© Ù†Ù‚Ø§Ø·",
          tone: "ink",
        },
        {
          slug: "mugs",
          title: "Ù…Ø¬Ø§Øª ÙˆÙ‡Ø¯Ø§ÙŠØ§",
          kicker: "Ù…Ø¬Ø§Øª ÙˆÙ‡Ø¯Ø§ÙŠØ§ Ø¯Ø¹Ø§Ø¦ÙŠØ©",
          description: "Ù…Ø¬Ø§Øª ÙˆÙ‡Ø¯Ø§ÙŠØ§ Ø¨Ø´Ø¹Ø§Ø±Ùƒ Ø£Ùˆ ØªØµÙ…ÙŠÙ…Ùƒ.",
          image: sharedServices.items[2].image,
          alt: "Ù†Ù…ÙˆØ°Ø¬ Ù…Ø¬ Ù…Ø·Ø¨ÙˆØ¹ Ø¨Ù…ÙˆØ¬Ø©",
          tone: "brand",
        },
        {
          slug: "cases",
          title: "Ø¬Ø±Ø§Ø¨Ø§Øª ÙˆØªØµØ§Ù…ÙŠÙ… Ø®Ø§ØµØ©",
          kicker: "Ø¬Ø±Ø§Ø¨Ø§Øª Ù…ÙˆØ¨Ø§ÙŠÙ„ ÙˆØªØµÙ…ÙŠÙ… Ù…Ø®ØµØµ",
          description: "Ø¬Ø±Ø§Ø¨ Ù…ÙˆØ¨Ø§ÙŠÙ„ Ø¨ØªØµÙ…ÙŠÙ…ÙƒØŒ Ø£Ùˆ ØªØµÙ…ÙŠÙ… Ù†Ø¹Ù…Ù„Ù‡ Ù…Ø¹Ø§Ùƒ.",
          image: sharedServices.items[3].image,
          alt: "Ù†Ù…ÙˆØ°Ø¬ Ø¬Ø±Ø§Ø¨ Ù…ÙˆØ¨Ø§ÙŠÙ„ Ù…Ø·Ø¨ÙˆØ¹ Ø¨Ø´Ø¨ÙƒØ©",
          tone: "sand",
        },
      ],
    },
    studio: {
      title: "Ø´ÙˆÙ ØªØµÙ…ÙŠÙ…Ùƒ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬ Ù‚Ø¨Ù„ Ù…Ø§ ØªØ·Ù„Ø¨",
      body: "Ø§Ø±ÙØ¹ Ù„ÙˆØ¬ÙˆØŒ Ø´ÙˆÙÙ‡ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬ØŒ ÙˆØ¹Ø¯Ù‘Ù„ Ø§Ù„Ø­Ø¬Ù… ÙˆØ§Ù„Ø¯ÙˆØ±Ø§Ù† Ù‚Ø¨Ù„ Ù…Ø§ ØªØ·Ù„Ø¨.",
      cta: "Ø§ÙØªØ­ Ø§Ù„Ø§Ø³ØªÙˆØ¯ÙŠÙˆ",
      frameLabel: "Ù…Ø¹Ø§ÙŠÙ†Ø© Ø§Ù„Ø§Ø³ØªÙˆØ¯ÙŠÙˆ",
      placeholderNote: "Ø¯ÙŠ Ù…Ø¹Ø§ÙŠÙ†Ø© Ø³Ø±ÙŠØ¹Ø©. Ø§ÙØªØ­ Ø§Ù„Ø§Ø³ØªÙˆØ¯ÙŠÙˆ ÙˆØ¬Ø±Ù‘Ø¨ ØªØµÙ…ÙŠÙ…Ùƒ.",
    },
    process: {
      title: "Ù…Ù† Ø§Ù„ÙÙƒØ±Ø© Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù…",
      intro: "Ø³Øª Ø®Ø·ÙˆØ§Øª ÙˆØ§Ø¶Ø­Ø©ØŒ ÙˆØ§Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ Ø¯Ø§ÙŠÙ…Ù‹Ø§ Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„.",
      note: "Ø§Ù„Ø£Ø³Ø¹Ø§Ø± ÙˆØ§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ© ØªØªØ£ÙƒØ¯ Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„.",
      loopLabels: ["ÙÙƒØ±Ø©", "ØªØµÙ…ÙŠÙ…", "Ø·Ø¨Ø§Ø¹Ø©", "Ø§Ø³ØªÙ„Ø§Ù…"],
      steps: [
        { icon: "tshirt", title: "Ø§Ø®ØªØ§Ø± Ø§Ù„Ù…Ù†ØªØ¬", body: "Ø­Ø¯Ø¯ Ù†ÙˆØ¹ Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„Ù„ÙŠ Ø¹Ø§ÙŠØ² ØªØ·Ø¨Ø¹ Ø¹Ù„ÙŠÙ‡Ø§." },
        { icon: "ruler", title: "Ø®ØµÙ‘Øµ Ø§Ù„ØªÙØ§ØµÙŠÙ„", body: "Ø§Ù„Ù…Ù‚Ø§Ø³ØŒ Ø§Ù„Ù„ÙˆÙ†ØŒ ÙˆØ§Ù„ÙƒÙ…ÙŠØ©." },
        { icon: "upload", title: "Ø§Ø¨Ø¹Øª Ø§Ù„ØªØµÙ…ÙŠÙ…", body: "Ù„ÙŠÙ†Ùƒ Ù„Ù…Ù„ÙÙƒ Ø£Ùˆ ØµÙˆØ±Ø© ÙˆØ§Ø¶Ø­Ø© Ù„Ù„ÙÙƒØ±Ø©." },
        { icon: "eye", title: "Ø±Ø§Ø¬Ø¹ Ø§Ù„Ø·Ù„Ø¨", body: "Ø§ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ù‚Ø¨Ù„ Ù…Ø§ Ù†Ø¨Ø¯Ø£." },
        { icon: "chat", title: "Ø®Ù„ÙŠ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ ÙŠØ£ÙƒØ¯", body: "Ù‡ÙŠØ±Ø¯ Ø¹Ù„ÙŠÙƒ Ø¨Ø§Ù„ØªÙØ§ØµÙŠÙ„ ÙˆØ§Ù„Ù…ÙˆØ¹Ø¯." },
        { icon: "search", title: "ØªØ§Ø¨Ø¹", body: "Ø§Ø³ØªØ®Ø¯Ù… ÙƒÙˆØ¯ Ø§Ù„Ø·Ù„Ø¨ Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø­Ø§Ù„Ø©." },
      ],
    },
    portfolio: {
      title: "Ø£Ø¹Ù…Ø§Ù„Ù†Ø§",
      intro: "Ù†Ù…Ø§Ø°Ø¬ ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ù„Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ø´ØºÙ„. Ø§Ù„ØµÙˆØ± Ø¯ÙŠ Ø¨ØªØªØ³ØªØ¨Ø¯Ù„ Ø¨Ø£Ø¹Ù…Ø§Ù„ Ø­Ù‚ÙŠÙ‚ÙŠØ©.",
      all: "Ø§Ù„ÙƒÙ„",
      requestLikeThis: "Ø§Ø¹Ù…Ù„ Ø·Ù„Ø¨ Ø²ÙŠ Ø¯Ù‡",
      categories: [
        { slug: "clothing", label: "Ù…Ù„Ø§Ø¨Ø³" },
        { slug: "mugs", label: "Ø£ÙƒÙˆØ§Ø¨ ÙˆÙ‡Ø¯Ø§ÙŠØ§" },
        { slug: "caps", label: "ÙƒØ§Ø¨Ø§Øª" },
        { slug: "stickers", label: "Ø§Ø³ØªÙŠÙƒØ±Ø²" },
        { slug: "cases", label: "Ø¬Ø±Ø§Ø¨Ø§Øª" },
      ],
      items: [
        { ...sharedPortfolio[0], title: "ØªÙŠØ´ÙŠØ±Øª Ù‡Ø§Ù ØªÙˆÙ†", alt: "Ù†Ù…ÙˆØ°Ø¬ ØªÙŠØ´ÙŠØ±Øª Ø¨Ù†Ù‚Ø´Ø© Ù†Ù‚Ø§Ø·" },
        { ...sharedPortfolio[1], title: "Ù‡ÙˆØ¯ÙŠ Ø¨Ø®Ø·ÙˆØ·", alt: "Ù†Ù…ÙˆØ°Ø¬ Ù‡ÙˆØ¯ÙŠ Ø¨Ù†Ù‚Ø´Ø© Ø£Ù‚ÙˆØ§Ø³" },
        { ...sharedPortfolio[2], title: "Ù…Ø¬ Ø¨Ù…ÙˆØ¬", alt: "Ù†Ù…ÙˆØ°Ø¬ Ù…Ø¬ Ø¨Ù†Ù‚Ø´Ø© Ù…ÙˆØ¬" },
        { ...sharedPortfolio[3], title: "Ù…Ø¬ Ø´Ù…Ø³", alt: "Ù†Ù…ÙˆØ°Ø¬ Ù…Ø¬ Ø¨Ù†Ù‚Ø´Ø© Ø´Ù…Ø³" },
        { ...sharedPortfolio[4], title: "ÙƒØ§Ø¨ Ù†Ù‚Ø§Ø·", alt: "Ù†Ù…ÙˆØ°Ø¬ ÙƒØ§Ø¨ Ø¨Ù†Ù‚Ø´Ø© Ù†Ù‚Ø§Ø·" },
        { ...sharedPortfolio[5], title: "ÙƒØ§Ø¨ Ø®Ø·ÙˆØ·", alt: "Ù†Ù…ÙˆØ°Ø¬ ÙƒØ§Ø¨ Ø¨Ø®Ø·ÙˆØ·" },
        { ...sharedPortfolio[6], title: "ÙˆØ±Ù‚Ø© Ø³ØªÙŠÙƒØ±Ø²", alt: "Ù†Ù…ÙˆØ°Ø¬ ÙˆØ±Ù‚Ø© Ø³ØªÙŠÙƒØ±Ø²" },
        { ...sharedPortfolio[7], title: "Ø³ØªÙŠÙƒØ± Ø¯Ø§ÙŠØ±Ø©", alt: "Ù†Ù…ÙˆØ°Ø¬ Ø³ØªÙŠÙƒØ± Ø¯Ø§ÙŠØ±ÙŠ" },
        { ...sharedPortfolio[8], title: "Ø¬Ø±Ø§Ø¨ Ø´Ø¨ÙƒØ©", alt: "Ù†Ù…ÙˆØ°Ø¬ Ø¬Ø±Ø§Ø¨ Ø¨Ø´Ø¨ÙƒØ©" },
        { ...sharedPortfolio[9], title: "Ø¬Ø±Ø§Ø¨ Ù‚ÙˆØ³", alt: "Ù†Ù…ÙˆØ°Ø¬ Ø¬Ø±Ø§Ø¨ Ø¨Ø£Ù‚ÙˆØ§Ø³" },
      ],
    },
    about: {
      title: "ÙˆØ±Ø´Ø© Ø£Ø³ÙˆØ§Ù† Ø§Ù„Ù„ÙŠ Ø¨ØªØ·Ø¨Ø¹ Ø§Ù„Ù…Ø®ØªÙ„Ù",
      paragraphs: [
        "ÙŠÙˆØ²Ø±Ø³ÙŠÙ ÙˆØ±Ø´Ø© Ø·Ø¨Ø§Ø¹Ø© ÙˆØªØ®ØµÙŠØµ ÙÙŠ Ø£Ø³ÙˆØ§Ù†. Ø¨Ù†Ø´ØªØºÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù„Ø§Ø¨Ø³ØŒ Ø§Ù„ÙƒØ§Ø¨Ø§ØªØŒ Ø§Ù„Ù…Ø¬Ø§ØªØŒ Ø§Ù„Ø³ØªÙŠÙƒØ±Ø²ØŒ ÙˆØ§Ù„Ø¬Ø±Ø§Ø¨Ø§ØªØŒ ÙˆÙ†Ø³Ø§Ø¹Ø¯Ùƒ ØªØ­ÙˆÙ‘Ù„ ÙÙƒØ±ØªÙƒ Ù„Ù…Ù†ØªØ¬ Ø¬Ø§Ù‡Ø².",
        "Ø§Ù„Ø´ØºÙ„ ÙƒÙ„Ù‡ Ø¨ÙŠØªÙ†Ø³Ù‚ Ù…Ø¨Ø§Ø´Ø±Ø© Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„: Ù…Ù† Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù‚Ø·Ø¹Ø©ØŒ Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„ØªØµÙ…ÙŠÙ…ØŒ Ù„Ø­Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù….",
      ],
      principles: [
        { title: "ØªØµÙ…ÙŠÙ…Ùƒ Ù…Ø´ Ù‚Ø§Ù„Ø¨", body: "Ø¨Ù†Ø¨Ø¯Ø£ Ù…Ù† ÙÙƒØ±ØªÙƒØŒ Ù…Ø´ Ù…Ù† ØªØµÙ…ÙŠÙ… Ø¬Ø§Ù‡Ø²." },
        { title: "Ù…Ø±Ø§Ø¬Ø¹Ø© Ù‚Ø¨Ù„ Ø§Ù„ØªÙ†ÙÙŠØ°", body: "Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø¨ØªØªØ£ÙƒØ¯ Ù‚Ø¨Ù„ Ø§Ù„Ø·Ø¨Ø§Ø¹Ø©." },
        { title: "Ù…Ù† Ø£Ø³ÙˆØ§Ù†", body: "ÙˆØ±Ø´Ø© Ù…Ø­Ù„ÙŠØ©ØŒ ÙˆØªÙˆØ§ØµÙ„ Ù…Ø¨Ø§Ø´Ø±." },
      ],
    },
    contact: {
      title: "Ø®Ù„Ù‘ÙŠ ÙÙƒØ±ØªÙƒ ØªÙˆØµÙ„Ù†Ø§",
      body: "Ø§Ø¨Ø¹Øª ØªÙØ§ØµÙŠÙ„ Ø·Ù„Ø¨Ùƒ Ø£Ùˆ ÙƒÙ„Ù…Ù†Ø§ Ø¹Ù„Ù‰ ÙˆØ§ØªØ³Ø§Ø¨. Ø§Ù„ØªØ£ÙƒÙŠØ¯Ø§Øª ÙƒÙ„Ù‡Ø§ Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„.",
      locationLabel: "Ø§Ù„Ù…ÙƒØ§Ù†",
      location: "Ø£Ø³ÙˆØ§Ù†ØŒ Ù…ØµØ±",
      formTitle: "Ø§Ø¨Ø¹Øª Ø±Ø³Ø§Ù„Ø©",
      formIntro: "Ø§ÙƒØªØ¨ Ø§Ø³Ù…Ùƒ ÙˆØ±Ù‚Ù…Ùƒ ÙˆØ§Ù„Ø±Ø³Ø§Ù„Ø©. Ù…Ø´ Ù‡ÙŠØªØ¨Ø¹Øª Ø£ÙŠ Ø¯ÙØ¹ Ù…Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹.",
      fields: {
        name: "Ø§Ù„Ø§Ø³Ù…",
        namePlaceholder: "Ù…Ø«Ø§Ù„: Ø£Ø­Ù…Ø¯",
        phone: "Ø±Ù‚Ù… Ø§Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„",
        phonePlaceholder: "01xxxxxxxxx",
        message: "Ø§Ù„Ø±Ø³Ø§Ù„Ø©",
        messagePlaceholder: "Ø¹Ø§ÙŠØ² Ø£Ø¹Ø±Ù ØªÙØ§ØµÙŠÙ„ ØªÙŠØ´ÙŠØ±Øª Ù…Ø·Ø¨ÙˆØ¹...",
      },
      submit: "Ø§Ø¨Ø¹Øª Ø§Ù„Ø±Ø³Ø§Ù„Ø©",
      submitting: "Ø¨Ù†Ø¨Ø¹Øª...",
      success: "ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø±Ø³Ø§Ù„ØªÙƒ.",
      error: "Ù…Ø´ Ù‚Ø§Ø¯Ø±ÙŠÙ† Ù†Ø¨Ø¹Øª Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ø¯Ù„ÙˆÙ‚ØªÙŠ. Ø¬Ø±Ø¨ ØªØ§Ù†ÙŠ Ø£Ùˆ ÙƒÙ„Ù…Ù†Ø§ Ø¹Ù„Ù‰ ÙˆØ§ØªØ³Ø§Ø¨.",
      validation: {
        name: "Ø§ÙƒØªØ¨ Ø§Ø³Ù… Ù…Ù† Ø­Ø±ÙÙŠÙ† Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.",
        phone: "Ø§ÙƒØªØ¨ Ø±Ù‚Ù… Ù…ÙˆØ¨Ø§ÙŠÙ„ Ù…ØµØ±ÙŠ ØµØ­ÙŠØ­.",
        message: "Ø§ÙƒØªØ¨ Ø±Ø³Ø§Ù„Ø© Ù…Ù† 5 Ø­Ø±ÙˆÙ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.",
      },
      privacyNote: "Ø¨Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø³Ø§Ù„Ø©ØŒ Ø£Ù†Øª Ù…ÙˆØ§ÙÙ‚ Ø¹Ù„Ù‰ Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©.",
    },
    faq: {
      title: "Ø£Ø³Ø¦Ù„Ø© Ù…ØªÙƒØ±Ø±Ø©",
      items: [
        {
          question: "Ø¥ÙŠÙ‡ Ø§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„Ù„ÙŠ Ø£Ù‚Ø¯Ø± Ø£Ø¨Ø¹ØªÙ‡Ø§ØŸ",
          answer:
            "ØµÙˆØ±Ø© ÙˆØ§Ø¶Ø­Ø© Ø£Ùˆ Ù…Ù„Ù ØªØµÙ…ÙŠÙ…. Ù„Ùˆ Ø§Ù„Ù…Ù„Ù Ù…Ø´ Ø¬Ø§Ù‡Ø² Ù„Ù„Ø·Ø¨Ø§Ø¹Ø©ØŒ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ Ù‡ÙŠØªÙˆØ§ØµÙ„ Ù…Ø¹Ø§Ùƒ ØªØ¸Ø¨Ø·Ù‡.",
        },
        {
          question: "Ø¥Ø²Ø§ÙŠ Ø£ØªØ§Ø¨Ø¹ Ø·Ù„Ø¨ÙŠØŸ",
          answer: "Ø¨Ø¹Ø¯ Ù…Ø§ ØªØ¨Ø¹Øª Ø§Ù„Ø·Ù„Ø¨ØŒ Ù‡ØªØ§Ø®Ø¯ ÙƒÙˆØ¯. Ø§ÙƒØªØ¨Ù‡ ÙÙŠ ØµÙØ­Ø© ØªØ§Ø¨Ø¹ Ø·Ù„Ø¨Ùƒ.",
        },
        {
          question: "Ø§Ù„ØªØ§Ø±ÙŠØ® Ø§Ù„Ù„ÙŠ Ø¨Ø®ØªØ§Ø±Ù‡ ÙˆØ¹Ø¯ Ù†Ù‡Ø§Ø¦ÙŠØŸ",
          answer: "Ù„Ø§ØŒ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ØªØ§Ø±ÙŠØ® Ø·Ù„Ø¨ Ù…Ø´ ÙˆØ¹Ø¯. ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ Ù‡Ùˆ Ø§Ù„Ù„ÙŠ ÙŠØ£ÙƒØ¯ Ø§Ù„Ù…ÙˆØ¹Ø¯.",
        },
        {
          question: "Ø§Ù„Ø³Ø¹Ø± Ø¨ÙŠØ¸Ù‡Ø± ÙÙŠ Ø§Ù„Ù…ÙˆÙ‚Ø¹ØŸ",
          answer: "Ù„Ø£. Ø§Ù„Ø£Ø³Ø¹Ø§Ø± ØªØªØ£ÙƒØ¯ Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ Ø­Ø³Ø¨ Ø§Ù„Ù…Ù†ØªØ¬ ÙˆØ§Ù„ÙƒÙ…ÙŠØ©.",
        },
        {
          question: "Ø¨ØªÙˆØµÙ„ÙˆØ§ Ø¨Ø±Ù‡ Ø£Ø³ÙˆØ§Ù†ØŸ",
          answer: "Ø§Ù„ØªÙˆØµÙŠÙ„ ÙˆØ§Ù„Ø§Ø³ØªÙ„Ø§Ù… ÙŠØªÙ†Ø³Ù‚ÙˆØ§ Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„.",
        },
        {
          question: "ÙŠÙ†ÙØ¹ Ø£Ø·Ù„Ø¨ ÙƒÙ…ÙŠØ© ÙƒØ¨ÙŠØ±Ø©ØŸ",
          answer: "Ø§ÙƒØªØ¨ Ø§Ù„ÙƒÙ…ÙŠØ© ÙÙŠ Ø§Ù„Ø·Ù„Ø¨. ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ ÙŠØ£ÙƒØ¯ Ø§Ù„ØªÙØ§ØµÙŠÙ„ ÙˆØ§Ù„ØªÙˆÙØ±.",
        },
      ],
    },
  footer: {
    blurb: "Ø®Ù„ÙŠÙƒ Ù…Ø®ØªÙ„Ù .. Ø®Ù„ÙŠÙƒ ÙŠÙˆØ²Ø±Ø³ÙŠÙ.",
      contactTitle: "ØªÙˆØ§ØµÙ„",
      linksTitle: "Ø§Ù„Ù…ÙˆÙ‚Ø¹",
      followTitle: "ØªØ§Ø¨Ø¹Ù†Ø§",
      privacy: "Ø§Ù„Ø®ØµÙˆØµÙŠØ©",
      terms: "Ø§Ù„Ø´Ø±ÙˆØ·",
      competition: "Ù†Ø³Ø®Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ø§ØªØ¹Ù…Ù„Øª Ù„Ù…Ø³Ø§Ø¨Ù‚Ø© Brand & Build.",
      demoNote: "Ø§Ù„ØµÙˆØ± ÙˆØ§Ù„Ø£Ø¹Ù…Ø§Ù„ Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø© Ù†Ù…Ø§Ø°Ø¬ ØªØ¬Ø±ÙŠØ¨ÙŠØ©.",
    },
    request: {
      title: "Ø§Ø¨Ø¯Ø£ Ø·Ù„Ø¨Ùƒ",
      intro: "Ù‚ÙˆÙ„Ù†Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬ ÙˆØ§Ù„ØªÙØ§ØµÙŠÙ„. Ù…ÙÙŠØ´ Ø¯ÙØ¹ Ù‡Ù†Ø§ØŒ ÙˆØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ Ù‡Ùˆ Ø§Ù„Ù„ÙŠ ÙŠØ£ÙƒØ¯ Ø§Ù„Ø³Ø¹Ø± ÙˆØ§Ù„Ù…ÙˆØ¹Ø¯.",
      formTitle: "ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨",
      fields: {
        name: "Ø§Ù„Ø§Ø³Ù…",
        namePlaceholder: "Ù…Ø«Ø§Ù„: Ø£Ø­Ù…Ø¯",
        phone: "Ø±Ù‚Ù… Ø§Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„ (ÙˆØ§ØªØ³Ø§Ø¨)",
        phonePlaceholder: "01xxxxxxxxx",
        service: "Ø§Ù„Ø®Ø¯Ù…Ø©",
        servicePlaceholder: "Ø§Ø®ØªØ§Ø± Ø§Ù„Ø®Ø¯Ù…Ø©",
        quantity: "Ø§Ù„ÙƒÙ…ÙŠØ©",
        quantityHint: "Ù…Ù† 1 Ù„Ù€ 500 ÙÙŠ Ø§Ù„Ø·Ù„Ø¨.",
        details: "ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬ ÙˆØ§Ù„ØªØµÙ…ÙŠÙ…",
        detailsPlaceholder: "Ø§Ù„Ù…Ù‚Ø§Ø³ØŒ Ø§Ù„Ù„ÙˆÙ†ØŒ Ù…ÙƒØ§Ù† Ø§Ù„Ø·Ø¨Ø§Ø¹Ø©ØŒ ÙˆØ£ÙŠ ØªÙØ§ØµÙŠÙ„ ØªØ§Ù†ÙŠØ©.",
        artwork: "Ù„ÙŠÙ†Ùƒ Ø§Ù„ØªØµÙ…ÙŠÙ… (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)",
        artworkPlaceholder: "https://...",
        artworkHint: "Ù„ÙŠÙ†Ùƒ Google Drive Ø£Ùˆ Ø£ÙŠ Ø±Ø§Ø¨Ø· Ù…Ø¨Ø§Ø´Ø± Ù„Ù„Ù…Ù„Ù.",
      },
      submit: "Ø§Ø¨Ø¹Øª Ø§Ù„Ø·Ù„Ø¨",
      submitting: "Ø¨Ù†Ø¨Ø¹Øª Ø§Ù„Ø·Ù„Ø¨...",
      successTitle: "ÙˆØµÙ„ Ø·Ù„Ø¨Ùƒ",
      successBody: "ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ Ù‡ÙŠØ±Ø§Ø¬Ø¹ Ø§Ù„ØªÙØ§ØµÙŠÙ„ ÙˆÙŠØªÙˆØ§ØµÙ„ Ù…Ø¹Ø§Ùƒ.",
      codeLabel: "ÙƒÙˆØ¯ Ø§Ù„Ø·Ù„Ø¨",
      trackCta: "ØªØ§Ø¨Ø¹ Ø§Ù„Ø·Ù„Ø¨",
      anotherCta: "Ø§Ø¨Ø¹Øª Ø·Ù„Ø¨ ØªØ§Ù†ÙŠ",
      error: "Ù…Ø´ Ù‚Ø§Ø¯Ø±ÙŠÙ† Ù†Ø¨Ø¹Øª Ø§Ù„Ø·Ù„Ø¨ Ø¯Ù„ÙˆÙ‚ØªÙŠ. Ø¬Ø±Ø¨ ØªØ§Ù†ÙŠ Ø£Ùˆ ÙƒÙ„Ù…Ù†Ø§ Ø¹Ù„Ù‰ ÙˆØ§ØªØ³Ø§Ø¨.",
      note: "Ø§Ù„Ø£Ø³Ø¹Ø§Ø± ÙˆØ§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ© ØªØªØ£ÙƒØ¯ Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„. Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨ Ù…Ø´ Ø­Ø¬Ø² Ù†Ù‡Ø§Ø¦ÙŠ.",
      validation: {
        name: "Ø§ÙƒØªØ¨ Ø§Ø³Ù… Ù…Ù† Ø­Ø±ÙÙŠÙ† Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.",
        phone: "Ø§ÙƒØªØ¨ Ø±Ù‚Ù… Ù…ÙˆØ¨Ø§ÙŠÙ„ Ù…ØµØ±ÙŠ ØµØ­ÙŠØ­.",
        service: "Ø§Ø®ØªØ§Ø± Ø§Ù„Ø®Ø¯Ù…Ø©.",
        quantity: "Ø§Ù„ÙƒÙ…ÙŠØ© Ù…Ù† 1 Ù„Ù€ 500.",
        details: "Ø§ÙƒØªØ¨ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬.",
        artwork: "Ù„Ùˆ Ø­Ø·ÙŠØª Ù„ÙŠÙ†ÙƒØŒ Ù„Ø§Ø²Ù… ÙŠØ¨Ø¯Ø£ Ø¨Ù€ http Ø£Ùˆ https.",
      },
    },
    track: {
      title: "ØªØ§Ø¨Ø¹ Ø·Ù„Ø¨Ùƒ",
      intro: "Ø§ÙƒØªØ¨ ÙƒÙˆØ¯ Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„Ù„ÙŠ ÙˆØµÙ„Ùƒ Ø¨Ø¹Ø¯ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„.",
      codeLabel: "ÙƒÙˆØ¯ Ø§Ù„Ø·Ù„Ø¨",
      codePlaceholder: "YZ-0000-XXXX",
      submit: "ØªØ§Ø¨Ø¹",
      submitting: "Ø¨Ù†Ø¯ÙˆØ±...",
      demoHint: "Ù„Ù„ØªØ¬Ø±Ø¨Ø©ØŒ Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„ÙƒÙˆØ¯ YZ-DEMO-0001.",
      notFound: "Ù…ÙÙŠØ´ Ø·Ù„Ø¨ Ø¨Ø§Ù„ÙƒÙˆØ¯ Ø¯Ù‡. Ø§ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„ÙƒÙˆØ¯ ÙˆØ¬Ø±Ø¨ ØªØ§Ù†ÙŠ.",
      error: "Ù…Ø´ Ù‚Ø§Ø¯Ø±ÙŠÙ† Ù†Ø¬ÙŠØ¨ Ø­Ø§Ù„Ø© Ø§Ù„Ø·Ù„Ø¨ Ø¯Ù„ÙˆÙ‚ØªÙŠ.",
      created: "ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥Ø±Ø³Ø§Ù„",
      service: "Ø§Ù„Ø®Ø¯Ù…Ø©",
      quantity: "Ø§Ù„ÙƒÙ…ÙŠØ©",
      statuses: {
        received: { label: "ÙˆØµÙ„ Ø§Ù„Ø·Ù„Ø¨", body: "ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ Ù‡ÙŠØ±Ø§Ø¬Ø¹Ù‡." },
        review: { label: "ØªØ­Øª Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©", body: "Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø¨ØªØªØ±Ø§Ø¬Ø¹ Ù‚Ø¨Ù„ Ø§Ù„ØªØ£ÙƒÙŠØ¯." },
        confirmed: { label: "ØªÙ… Ø§Ù„ØªØ£ÙƒÙŠØ¯", body: "ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ Ø£ÙƒØ¯ Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ù…Ø¹Ø§Ùƒ." },
        closed: { label: "Ù…ØºÙ„Ù‚", body: "Ø§Ù„Ø·Ù„Ø¨ Ø§ØªÙ‚ÙÙ„." },
      },
    },
    studioPage: {
      title: "Ø§Ø³ØªÙˆØ¯ÙŠÙˆ Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø©",
      intro: "Ø§Ø±ÙØ¹ Ù„ÙˆØ¬ÙˆØŒ Ø¬Ø±Ù‘Ø¨Ù‡ Ø¹Ù„Ù‰ ØªÙŠØ´ÙŠØ±Øª Ø£Ùˆ Ù…Ø¬ Ø£Ùˆ ÙƒØ§Ø¨ØŒ ÙˆØ¨Ø¹Ø¯Ù‡Ø§ ÙƒÙ…Ù‘Ù„ Ø·Ù„Ø¨Ùƒ.",
      placeholderNote: "Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ©. Ø§Ù„Ø£Ù„ÙˆØ§Ù† ÙˆØ§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠØªØ£ÙƒØ¯ÙˆØ§ Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„.",
      cta: "Ø§Ø¨Ø¯Ø£ Ø·Ù„Ø¨Ùƒ",
      worksCta: "Ø´ÙˆÙ Ø£Ø¹Ù…Ø§Ù„Ù†Ø§",
      note: "Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ©. Ø§Ù„Ø³Ø¹Ø± ÙˆØ§Ù„Ù…ÙˆØ¹Ø¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠØªØ£ÙƒØ¯ÙˆØ§ Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„.",
      demo: "Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø© ÙˆØ§Ù„ØªØµÙ…ÙŠÙ… Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶ÙŠÙ† Ù†Ù…Ø§Ø°Ø¬ ØªØ¬Ø±ÙŠØ¨ÙŠØ©.",
    },
    studioUi: {
      productLabel: "Ø§Ù„Ù…Ù†ØªØ¬",
      colorLabel: "Ø§Ù„Ù„ÙˆÙ†",
      viewLabel: "Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø©",
      logoLabel: "Ø§Ù„Ù„ÙˆØ¬Ùˆ",
      upload: "Ø§Ø±ÙØ¹ Ù„ÙˆØ¬Ùˆ",
      replace: "ØºÙŠÙ‘Ø± Ø§Ù„Ù„ÙˆØ¬Ùˆ",
      remove: "Ø´ÙŠÙ„ Ø§Ù„Ù„ÙˆØ¬Ùˆ",
      uploadHint: "PNG Ø£Ùˆ JPG Ø£Ùˆ SVGØŒ Ø£Ù‚ØµÙ‰ Ø­Ø¬Ù… 5 Ù…ÙŠØ¬Ø§.",
      uploadTypeError: "Ø§Ù„Ù…Ù„Ù Ù„Ø§Ø²Ù… ÙŠÙƒÙˆÙ† ØµÙˆØ±Ø© PNG Ø£Ùˆ JPG Ø£Ùˆ SVG.",
      uploadSizeError: "Ø£Ù‚ØµÙ‰ Ø­Ø¬Ù… Ù„Ù„Ù…Ù„Ù 5 Ù…ÙŠØ¬Ø§.",
      uploadReadError: "Ù…Ø´ Ù‚Ø§Ø¯Ø±ÙŠÙ† Ù†Ù‚Ø±Ø£ Ø§Ù„ØµÙˆØ±Ø© Ø¯ÙŠ. Ø¬Ø±Ø¨ Ù…Ù„Ù ØªØ§Ù†ÙŠ.",
      noLogo: "Ø§Ø±ÙØ¹ Ù„ÙˆØ¬Ùˆ ÙˆÙ‡ØªØ´ÙˆÙÙ‡ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬",
      dragHint: "Ø§Ø³Ø­Ø¨ Ø§Ù„Ù„ÙˆØ¬Ùˆ Ù„Ù„ØªØ­Ø±ÙŠÙƒ. Ø¹Ø¬Ù„Ø© Ø§Ù„Ù…Ø§ÙˆØ³ Ø£Ùˆ Ø¥ØµØ¨Ø¹ÙŠÙ† Ù„Ù„ØªÙƒØ¨ÙŠØ±. Ø§Ù„Ø£Ø³Ù‡Ù… Ù„Ù„ØªØ­Ø±ÙŠÙƒØŒ Ùˆ+/- Ù„Ù„Ø­Ø¬Ù….",
      previewAlt: "Ù…Ø¹Ø§ÙŠÙ†Ø© Ø§Ù„ØªØµÙ…ÙŠÙ… Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬",
      loading: "Ø¨Ù†Ø¬Ù‡Ø² Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø©...",
      loadError: "Ù…Ø´ Ù‚Ø§Ø¯Ø±ÙŠÙ† Ù†Ø­Ù…Ù‘Ù„ Ø§Ù„Ù…Ù†ØªØ¬ Ø¯Ù„ÙˆÙ‚ØªÙŠ.",
      retry: "Ø¬Ø±Ø¨ ØªØ§Ù†ÙŠ",
      controls: "Ø§Ù„ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„ØªØµÙ…ÙŠÙ…",
      scale: "Ø­Ø¬Ù… Ø§Ù„Ù„ÙˆØ¬Ùˆ",
      rotation: "Ø§Ù„Ø¯ÙˆØ±Ø§Ù†",
      reset: "Ø±Ø¬Ù‘Ø¹ Ø§Ù„ØªØµÙ…ÙŠÙ…",
      treatment: "Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ù„ÙˆØ¬Ùˆ",
      removeWhite: "Ø´ÙŠÙ„ Ø§Ù„Ø®Ù„ÙÙŠØ© Ø§Ù„Ø¨ÙŠØ¶Ø§",
      removeWhiteHint: "Ø¨ÙŠØ´ÙŠÙ„ Ø§Ù„Ø£Ø¨ÙŠØ¶ Ø§Ù„Ù„ÙŠ Ø­ÙˆØ§Ù„ÙŠÙ† Ø§Ù„Ù„ÙˆØ¬Ùˆ.",
      removalStrength: "Ù‚ÙˆØ© Ø§Ù„Ø¥Ø²Ø§Ù„Ø©",
      inkMode: "Ù„ÙˆÙ† Ø§Ù„Ø·Ø¨Ø§Ø¹Ø©",
      inkOriginal: "Ø§Ù„Ø£ØµÙ„ÙŠ",
      inkWhite: "Ø£Ø¨ÙŠØ¶",
      whiteHint: "Ø£Ø¨ÙŠØ¶ Ø¨ÙŠØ¨Ø§Ù† Ø£ÙƒØªØ± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„ØºØ§Ù…Ù‚Ø©.",
      download: "Ù†Ø²Ù‘Ù„ Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø©",
      exporting: "Ø¨Ù†ØµØ¯Ù‘Ø±...",
      exportError: "Ù…Ø´ Ù‚Ø§Ø¯Ø±ÙŠÙ† Ù†ØµØ¯Ù‘Ø± Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø©. Ø¬Ø±Ø¨ ØªØ§Ù†ÙŠ.",
      useDesign: "Ø§Ø¨Ø¯Ø£ Ø·Ù„Ø¨ Ø¨Ø§Ù„ØªØµÙ…ÙŠÙ… Ø¯Ù‡",
      designNote: "Ø§Ù„ØªØµÙ…ÙŠÙ… Ù‡ÙŠÙØ¶Ù„ Ù…Ø¹Ø§Ùƒ ÙÙŠ ØµÙØ­Ø© Ø§Ù„Ø·Ù„Ø¨. Ø§Ù„Ø³Ø¹Ø± ÙˆØ§Ù„Ù…ÙˆØ¹Ø¯ ÙŠØªØ£ÙƒØ¯ÙˆØ§ Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„.",
      attachedDesign: "Ø§Ù„ØªØµÙ…ÙŠÙ… Ø§Ù„Ù…Ø±ÙÙ‚",
      changeDesign: "Ø¬Ø±Ù‘Ø¨ ØªØµÙ…ÙŠÙ… ØªØ§Ù†ÙŠ",
      removeDesign: "Ø´ÙŠÙ„ Ø§Ù„ØªØµÙ…ÙŠÙ…",
      demoNote: "Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ©ØŒ ÙˆØ§Ù„Ø£Ù„ÙˆØ§Ù† Ù…Ù…ÙƒÙ† ØªØ®ØªÙ„Ù Ø¨Ø³ÙŠØ· Ø¹Ù† Ø§Ù„Ø·Ø¨Ø§Ø¹Ø©.",
    },
    legal: {
      privacy: {
        title: "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©",
        updated: "Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«: Ø£ÙƒØªÙˆØ¨Ø± 2026",
        paragraphs: [
          "Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø¨ÙŠØ¬Ù…Ø¹ Ø§Ù„Ø§Ø³Ù… ÙˆØ±Ù‚Ù… Ø§Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„ ÙˆØ§Ù„ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù„ÙŠ Ø¨ØªÙƒØªØ¨Ù‡Ø§ ÙÙŠ Ø§Ù„Ø·Ù„Ø¨ Ø£Ùˆ Ø§Ù„Ø±Ø³Ø§Ù„Ø©.",
          "Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¨ØªØªØ³ØªØ®Ø¯Ù… Ù„Ù„ØªÙˆØ§ØµÙ„ Ø¨Ø®ØµÙˆØµ Ø§Ù„Ø·Ù„Ø¨ ÙÙ‚Ø·ØŒ ÙˆÙ…Ø´ Ø¨ØªØªØ¨Ø§Ø¹ Ù„Ø£ÙŠ Ø­Ø¯.",
          "Ù„Ùˆ Ø¹Ø§ÙŠØ² ØªØ­Ø°Ù Ø¨ÙŠØ§Ù†Ø§ØªÙƒØŒ ÙƒÙ„Ù… ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ Ø¹Ù„Ù‰ ÙˆØ§ØªØ³Ø§Ø¨.",
        ],
        note: "Ø§Ù„ØµÙØ­Ø© Ø¯ÙŠ Ù†Ø³Ø®Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ© ÙˆØªØ­ØªØ§Ø¬ Ù…Ø±Ø§Ø¬Ø¹Ø© Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø·Ù„Ø§Ù‚.",
      },
      terms: {
        title: "Ø§Ù„Ø´Ø±ÙˆØ·",
        updated: "Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«: Ø£ÙƒØªÙˆØ¨Ø± 2026",
        paragraphs: [
          "Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨ Ù…Ø´ Ø­Ø¬Ø² Ù†Ù‡Ø§Ø¦ÙŠ. ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„ Ù‡Ùˆ Ø§Ù„Ù„ÙŠ ÙŠØ£ÙƒØ¯ Ø§Ù„Ø³Ø¹Ø± ÙˆØ§Ù„Ù…ÙˆØ¹Ø¯ ÙˆØªÙØ§ØµÙŠÙ„ Ø§Ù„ØªÙ†ÙÙŠØ°.",
          "Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ù…Ø´ Ù…Ù†Ø´ÙˆØ±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙˆÙ‚Ø¹ØŒ ÙˆØ¨ØªØªØ£ÙƒØ¯ Ø­Ø³Ø¨ Ø§Ù„Ù…Ù†ØªØ¬ ÙˆØ§Ù„ÙƒÙ…ÙŠØ©.",
          "Ø§Ù„ØªÙˆØµÙŠÙ„ ÙˆØ§Ù„Ø§Ø³ØªÙ„Ø§Ù… ÙŠØªÙ†Ø³Ù‚ÙˆØ§ Ù…Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø­Ù„.",
        ],
        note: "Ø§Ù„ØµÙØ­Ø© Ø¯ÙŠ Ù†Ø³Ø®Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ© ÙˆØªØ­ØªØ§Ø¬ Ù…Ø±Ø§Ø¬Ø¹Ø© Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø·Ù„Ø§Ù‚.",
      },
    },
    notFound: {
      title: "Ø§Ù„ØµÙØ­Ø© Ù…Ø´ Ù…ÙˆØ¬ÙˆØ¯Ø©",
      body: "Ø§Ù„Ø±Ø§Ø¨Ø· Ø¯Ù‡ Ù…Ø´ Ø±Ø§ÙŠØ­ Ù„Ø­Ø§Ø¬Ø©. Ø§Ø±Ø¬Ø¹ Ù„Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© ÙˆØ¬Ø±Ø¨ Ù…Ù† Ù‡Ù†Ø§Ùƒ.",
      cta: "Ø§Ø±Ø¬Ø¹ Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©",
    },
  },
  en: {
    meta: {
      title: "Yuzersef | Print & personalisation in Aswan",
      description:
        "Yuzersef prints and personalises clothing, caps, mugs, stickers and phone cases in Aswan. Be different. Be Yuzersef.",
    },
    brand: {
      name: "Yuzersef",
      tagline: "Be different. Be Yuzersef.",
      latin: "YUZERSEF",
    },
    nav: [
      { label: "Services", href: "/#services" },
      { label: "Work", href: "/#work" },
      { label: "How it works", href: "/#process" },
      { label: "Contact", href: "/#contact" },
    ],
    common: {
      requestCta: "Start a request",
      workCta: "See our work",
      serviceCta: "Request this",
      whatsappCta: "Chat on WhatsApp",
      demo: "DEMO",
      close: "Close",
      previous: "Previous",
      next: "Next",
      loading: "One moment...",
      errorGeneric: "Something went wrong. Try again.",
      skipToContent: "Skip to content",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      languageToggle: "Switch language",
      home: "Yuzersef, home",
    },
    hero: {
      eyebrow: "Print & personalisation in Aswan",
      titleLead: "Be different on",
      rotating: ["your tee", "your mug", "your cap", "your sticker"],
      subtitle: "From idea to product, we print and personalise your pieces in Aswan. Pick, send your design, we take it from there.",
      proofLabel: "PROOF 01",
      proofTagline: "BE DIFFERENT",
      slides: [
        {
          image: "/portfolio/clothing-tee-halftone.svg",
          alt: "Demo mockup of a printed t-shirt",
          label: "Tee",
        },
        {
          image: "/portfolio/mugs-wave.svg",
          alt: "Demo mockup of a printed mug",
          label: "Mug",
        },
        {
          image: "/portfolio/caps-dots.svg",
          alt: "Demo mockup of a printed cap",
          label: "Cap",
        },
      ],
    },
    services: {
      title: "We print what you have in mind",
      intro: "Four product families, each with room for your own touch.",
      items: [
        {
          slug: "clothing",
          title: "Printed clothing",
          kicker: "T-shirts, hoodies, sweatshirts",
          description: "Choose the piece, colour and size, and we print your design.",
          image: sharedServices.items[0].image,
          alt: "Demo printed t-shirt with a halftone print",
          tone: "paper",
        },
        {
          slug: "caps",
          title: "Caps & stickers",
          kicker: "Caps, stickers, labels",
          description: "A cap with your mark, stickers, and labels for your product.",
          image: sharedServices.items[1].image,
          alt: "Demo printed cap with a dot pattern",
          tone: "ink",
        },
        {
          slug: "mugs",
          title: "Mugs & gifts",
          kicker: "Mugs and promotional gifts",
          description: "Mugs and gifts with your logo or design.",
          image: sharedServices.items[2].image,
          alt: "Demo printed mug with a wave print",
          tone: "brand",
        },
        {
          slug: "cases",
          title: "Cases & custom work",
          kicker: "Phone cases and one-off designs",
          description: "A phone case with your design, or one we make with you.",
          image: sharedServices.items[3].image,
          alt: "Demo phone case with a grid print",
          tone: "sand",
        },
      ],
    },
    studio: {
      title: "See your design on the product before you order",
      body: "Upload a logo, see it on the product, and adjust the size and rotation before you order.",
      cta: "Open the studio",
      frameLabel: "Studio preview",
      placeholderNote: "A quick preview. Open the studio to try your design.",
    },
    process: {
      title: "From idea to pickup",
      intro: "Six clear steps, with final confirmation always from the shop owner.",
      note: "Prices and final dates are confirmed with the shop owner.",
      loopLabels: ["Idea", "Design", "Print", "Pickup"],
      steps: [
        { icon: "tshirt", title: "Pick a product", body: "Choose the piece you want to print on." },
        { icon: "ruler", title: "Set the details", body: "Size, colour and quantity." },
        { icon: "upload", title: "Send your design", body: "A file link or a clear image of the idea." },
        { icon: "eye", title: "Review the request", body: "Check the details before we start." },
        { icon: "chat", title: "The owner confirms", body: "They reply with the details and date." },
        { icon: "search", title: "Track it", body: "Use your request code to follow the status." },
      ],
    },
    portfolio: {
      title: "Our work",
      intro: "Demo samples of the kind of work we do. These images will be replaced with real projects.",
      all: "All",
      requestLikeThis: "Request something like this",
      categories: [
        { slug: "clothing", label: "Clothing" },
        { slug: "mugs", label: "Mugs & gifts" },
        { slug: "caps", label: "Caps" },
        { slug: "stickers", label: "Stickers" },
        { slug: "cases", label: "Cases" },
      ],
      items: [
        { ...sharedPortfolio[0], title: "Halftone tee", alt: "Demo t-shirt with a halftone print" },
        { ...sharedPortfolio[1], title: "Arched hoodie", alt: "Demo hoodie with an arch print" },
        { ...sharedPortfolio[2], title: "Wave mug", alt: "Demo mug with a wave print" },
        { ...sharedPortfolio[3], title: "Sun mug", alt: "Demo mug with a sun print" },
        { ...sharedPortfolio[4], title: "Dot cap", alt: "Demo cap with a dot print" },
        { ...sharedPortfolio[5], title: "Striped cap", alt: "Demo cap with stripes" },
        { ...sharedPortfolio[6], title: "Sticker sheet", alt: "Demo sticker sheet" },
        { ...sharedPortfolio[7], title: "Round sticker", alt: "Demo round sticker" },
        { ...sharedPortfolio[8], title: "Grid case", alt: "Demo phone case with a grid print" },
        { ...sharedPortfolio[9], title: "Arc case", alt: "Demo phone case with arc lines" },
      ],
    },
    about: {
      title: "The Aswan workshop that prints it differently",
      paragraphs: [
        "Yuzersef is a print and personalisation workshop in Aswan. We work on clothing, caps, mugs, stickers and phone cases, and help turn your idea into a finished product.",
        "Everything is arranged directly with the shop owner, from choosing the piece and reviewing the design to pickup.",
      ],
      principles: [
        { title: "Your design, not a template", body: "We start from your idea, not a ready-made layout." },
        { title: "Review before production", body: "Details are confirmed before printing." },
        { title: "From Aswan", body: "A local workshop with direct contact." },
      ],
    },
    contact: {
      title: "Get your idea to us",
      body: "Send your request details or message us on WhatsApp. All confirmations come from the shop owner.",
      locationLabel: "Location",
      location: "Aswan, Egypt",
      formTitle: "Send a message",
      formIntro: "Add your name, number and message. No payment is taken on this site.",
      fields: {
        name: "Name",
        namePlaceholder: "e.g. Ahmed",
        phone: "Mobile number",
        phonePlaceholder: "01xxxxxxxxx",
        message: "Message",
        messagePlaceholder: "I would like to know more about printed tees...",
      },
      submit: "Send message",
      submitting: "Sending...",
      success: "Your message has been received.",
      error: "We could not send your message. Try again or reach us on WhatsApp.",
      validation: {
        name: "Enter a name with at least two characters.",
        phone: "Enter a valid Egyptian mobile number.",
        message: "Enter a message with at least five characters.",
      },
      privacyNote: "By sending this message you agree to the privacy policy.",
    },
    faq: {
      title: "Common questions",
      items: [
        {
          question: "What files can I send?",
          answer:
            "A clear image or a design file. If it is not print-ready, the shop owner will contact you to sort it out.",
        },
        {
          question: "How do I track my request?",
          answer: "After sending your request you get a code. Enter it on the track request page.",
        },
        {
          question: "Is the date I pick a promise?",
          answer: "No, the date is a request, not a promise. The shop owner confirms the final date.",
        },
        {
          question: "Are prices shown on the site?",
          answer: "No. Prices are confirmed with the shop owner based on the product and quantity.",
        },
        {
          question: "Do you deliver outside Aswan?",
          answer: "Delivery and pickup are arranged with the shop owner.",
        },
        {
          question: "Can I order a large quantity?",
          answer: "Add the quantity to your request. The shop owner confirms the details and availability.",
        },
      ],
    },
    footer: {
      blurb: "Print and personalisation in Aswan. Be different. Be Yuzersef.",
      contactTitle: "Contact",
      linksTitle: "Site",
      followTitle: "Follow",
      privacy: "Privacy",
      terms: "Terms",
      competition: "Demo build for the Brand & Build competition.",
      demoNote: "All images and work shown are demo placeholders.",
    },
    request: {
      title: "Start a request",
      intro: "Tell us about the product and details. No payment here. The shop owner confirms the price and date.",
      formTitle: "Request details",
      fields: {
        name: "Name",
        namePlaceholder: "e.g. Ahmed",
        phone: "Mobile number (WhatsApp)",
        phonePlaceholder: "01xxxxxxxxx",
        service: "Service",
        servicePlaceholder: "Choose a service",
        quantity: "Quantity",
        quantityHint: "From 1 to 500 per request.",
        details: "Product and design details",
        detailsPlaceholder: "Size, colour, print placement, and anything else we should know.",
        artwork: "Design link (optional)",
        artworkPlaceholder: "https://...",
        artworkHint: "A Google Drive link or any direct file link.",
      },
      submit: "Send request",
      submitting: "Sending request...",
      successTitle: "Request received",
      successBody: "The shop owner will review the details and contact you.",
      codeLabel: "Request code",
      trackCta: "Track request",
      anotherCta: "Send another request",
      error: "We could not send your request. Try again or reach us on WhatsApp.",
      note: "Prices and final dates are confirmed with the shop owner. Sending a request is not a confirmed booking.",
      validation: {
        name: "Enter a name with at least two characters.",
        phone: "Enter a valid Egyptian mobile number.",
        service: "Choose a service.",
        quantity: "Quantity must be from 1 to 500.",
        details: "Add the product details.",
        artwork: "If provided, the link must start with http or https.",
      },
    },
    track: {
      title: "Track your request",
      intro: "Enter the request code you received after sending.",
      codeLabel: "Request code",
      codePlaceholder: "YZ-0000-XXXX",
      submit: "Track",
      submitting: "Looking...",
      demoHint: "For a demo, use the code YZ-DEMO-0001.",
      notFound: "No request matches that code. Check it and try again.",
      error: "We could not load the request status right now.",
      created: "Sent on",
      service: "Service",
      quantity: "Quantity",
      statuses: {
        received: { label: "Request received", body: "The shop owner will review it." },
        review: { label: "Under review", body: "Details are being checked before confirmation." },
        confirmed: { label: "Confirmed", body: "The shop owner confirmed the details with you." },
        closed: { label: "Closed", body: "This request is closed." },
      },
    },
    studioPage: {
      title: "Preview studio",
      intro: "Upload a logo, try it on a tee, mug or cap, then carry it into your request.",
      placeholderNote: "This is a demo preview. Colours and final production are confirmed with the shop owner.",
      cta: "Start a request",
      worksCta: "See our work",
      note: "This is a demo preview. Price and final date are confirmed with the shop owner.",
      demo: "The preview and design shown are demo samples.",
    },
    studioUi: {
      productLabel: "Product",
      colorLabel: "Colour",
      viewLabel: "View",
      logoLabel: "Logo",
      upload: "Upload logo",
      replace: "Replace logo",
      remove: "Remove logo",
      uploadHint: "PNG, JPG or SVG, up to 5MB.",
      uploadTypeError: "The file must be a PNG, JPG or SVG image.",
      uploadSizeError: "The file must be 5MB or smaller.",
      uploadReadError: "We could not read that image. Try another file.",
      noLogo: "Upload a logo to see it on the product",
      dragHint: "Drag the logo to move it. Use the wheel or two fingers to scale. Arrow keys move, +/- resizes.",
      previewAlt: "Design preview on the product",
      loading: "Preparing the preview...",
      loadError: "We could not load the product right now.",
      retry: "Try again",
      controls: "Design controls",
      scale: "Logo size",
      rotation: "Rotation",
      reset: "Reset design",
      treatment: "Logo treatment",
      removeWhite: "Remove white background",
      removeWhiteHint: "Removes the white around the logo.",
      removalStrength: "Removal strength",
      inkMode: "Ink colour",
      inkOriginal: "Original",
      inkWhite: "White",
      whiteHint: "White shows up best on dark products.",
      download: "Download mockup",
      exporting: "Exporting...",
      exportError: "We could not export the mockup. Try again.",
      useDesign: "Start a request with this design",
      designNote: "Your design stays with you on the request page. Price and date are confirmed with the shop owner.",
      attachedDesign: "Attached design",
      changeDesign: "Try another design",
      removeDesign: "Remove design",
      demoNote: "This is a demo preview. Colours may vary slightly in print.",
    },
    legal: {
      privacy: {
        title: "Privacy policy",
        updated: "Last updated: October 2026",
        paragraphs: [
          "The site collects your name, mobile number, and the details you write in a request or message.",
          "The data is used only to communicate about your request and is not sold to anyone.",
          "To delete your data, contact the shop owner on WhatsApp.",
        ],
        note: "This page is a demo draft and needs legal review before launch.",
      },
      terms: {
        title: "Terms",
        updated: "Last updated: October 2026",
        paragraphs: [
          "Sending a request is not a confirmed booking. The shop owner confirms the price, date and production details.",
          "Prices are not published on the site and are confirmed by product and quantity.",
          "Delivery and pickup are arranged with the shop owner.",
        ],
        note: "This page is a demo draft and needs legal review before launch.",
      },
    },
    notFound: {
      title: "Page not found",
      body: "That link does not lead anywhere. Head back to the home page and take it from there.",
      cta: "Back to home",
    },
  },
};

export const serviceLabels: Record<ServiceSlug, { ar: string; en: string }> = {
  clothing: { ar: "Ù…Ù„Ø§Ø¨Ø³ Ù…Ø·Ø¨ÙˆØ¹Ø©", en: "Printed clothing" },
  mugs: { ar: "Ù…Ø¬Ø§Øª ÙˆÙ‡Ø¯Ø§ÙŠØ§", en: "Mugs & gifts" },
  caps: { ar: "ÙƒØ§Ø¨Ø§Øª", en: "Caps" },
  stickers: { ar: "Ø³ØªÙŠÙƒØ±Ø² ÙˆÙ„ÙŠØ¨Ù„Ø§Øª", en: "Stickers & labels" },
  cases: { ar: "Ø¬Ø±Ø§Ø¨Ø§Øª Ù…ÙˆØ¨Ø§ÙŠÙ„", en: "Phone cases" },
};
