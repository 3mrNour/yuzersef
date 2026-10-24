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
    imageAlt: string;
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
      piecesTitle: string;
      pieceLabel: string;
      addPiece: string;
      removePiece: string;
      product: string;
      size: string;
      sizePlaceholder: string;
      color: string;
      style: string;
      stylePlaceholder: string;
      specialRequest: string;
      specialRequestPlaceholder: string;
      studioProductNote: string;
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
      pieces: string;
      size: string;
      specialRequest: string;
    };
  };
  track: {
    title: string;
    intro: string;
    codeLabel: string;
    codePlaceholder: string;
    submit: string;
    submitting: string;
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
    turnLabel: string;
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
      image: "/mock/tshirt.jpg",
      tone: "paper",
    },
    {
      slug: "caps",
      image: "/mock/ccap.jpg",
      tone: "ink",
    },
    {
      slug: "mugs",
      image: "/mock/mug.jpg",
      tone: "brand",
    },
    {
      slug: "cases",
      image: "/mock/tote-bag.jpg",
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
    title: "يوزرسيف",
    description:
      "يوزرسيف: طباعة وتخصيص ملابس، كابات، مجات، ستيكرز وجرابات موبايل. خليك مختلف .. خليك يوزرسيف.",
    },
    brand: {
      name: "يوزرسيف",
      tagline: "خليك مختلف .. خليك يوزرسيف",
      latin: "YUZERSEF",
    },
    nav: [
      { label: "الخدمات", href: "/#services" },
      { label: "الأعمال", href: "/#work" },
      { label: "كيف نشتغل", href: "/#process" },
      { label: "تواصل", href: "/#contact" },
    ],
    common: {
      requestCta: "ابدأ طلبك",
      workCta: "شوف أعمالنا",
      serviceCta: "اطلب هذا",
      whatsappCta: "كلمنا على واتساب",
      demo: "DEMO",
      close: "إغلاق",
      previous: "السابق",
      next: "التالي",
      loading: "لحظة...",
      errorGeneric: "حصلت مشكلة. جرب تاني.",
      skipToContent: "تخطي إلى المحتوى",
      openMenu: "افتح القائمة",
      closeMenu: "اقفل القائمة",
      languageToggle: "تغيير اللغة",
      home: "يوزرسيف، الرئيسية",
    },
    hero: {
      eyebrow: "",
      titleLead: "خليك مختلف على",
      rotating: ["تيشيرتك", "كوبك", "كابك", "استيكرك"],
      subtitle: "من الفكرة للمنتج، نطبع ونخصّص قطعك في أسوان. اختار، ابعت تصميمك، والباقي علينا.",
      proofLabel: "PROOF 01",
      proofTagline: "خليك مختلف",
      imageAlt: "منتجات يوزرسيف المطبوعة على حامل عرض: هوديز، تيشيرتات، كاب، مج، جراب، وستيكرز",
      slides: [
        {
          image: "/portfolio/clothing-tee-halftone.svg",
          alt: "نموذج تجريبي لتيشيرت مطبوع",
          label: "تيشيرت",
        },
        {
          image: "/portfolio/mugs-wave.svg",
          alt: "نموذج تجريبي لمج مطبوع",
          label: "مج",
        },
        {
          image: "/portfolio/caps-dots.svg",
          alt: "نموذج تجريبي لكاب مطبوع",
          label: "كاب",
        },
      ],
    },
    services: {
      title: "بنطبع اللي يخطر على بالك",
      intro: "أربع عائلات منتجات، وكل واحدة ليها لمسة تخصك.",
      items: [
        {
          slug: "clothing",
          title: "تيشيرت",
          kicker: "تيشيرتات، هوديز، سويت شيرتس",
          description: "اختار القطعة واللون والمقاس، واحنا نطبع التصميم.",
          image: sharedServices.items[0].image,
          alt: "تيشيرت أسود مطبوع بشعار يوزرسيف بخط متصل على خلفية تركوازية",
          tone: "paper",
        },
        {
          slug: "caps",
          title: "كاب",
          kicker: "كابات، ستيكرز، ليبلات",
          description: "كاب بشعارك، ستيكرز، وليبلات تختم بها منتجك.",
          image: sharedServices.items[1].image,
          alt: "كاب تركوازي مشتك عليه شعار يوزرسيف على خلفية مطابقة",
          tone: "ink",
        },
        {
          slug: "mugs",
          title: "مج",
          kicker: "مجات وهدايا دعائية",
          description: "مجات وهدايا بشعارك أو تصميمك.",
          image: sharedServices.items[2].image,
          alt: "مج أخضر لامع مطبوع به شعار يوزرسيف على خلفية فاتحة",
          tone: "brand",
        },
        {
          slug: "cases",
          title: "توت باج",
          kicker: "توت باجات، جرابات، تصميم مخصص",
          description: "توت باج أو جراب موبايل بتصميمك، أو تصميم نعمله معاك.",
          image: sharedServices.items[3].image,
          alt: "توت باج أخضر مطبوع به شعار يوزرسيف على خلفية رمادية فاتحة",
          tone: "sand",
        },
      ],
    },
    studio: {
      title: "شوف تصميمك على المنتج قبل ما تطلب",
      body: "ارفع لوجو، شوفه على المنتج، وعدّل الحجم والدوران قبل ما تطلب.",
      cta: "افتح الاستوديو",
      frameLabel: "معاينة الاستوديو",
      placeholderNote: "دي معاينة سريعة. افتح الاستوديو وجرّب تصميمك.",
    },
    process: {
      title: "من الفكرة للاستلام",
      intro: "ست خطوات واضحة، والتأكيد النهائي دايمًا مع صاحب المحل.",
      note: "الأسعار والمواعيد النهائية تتأكد مع صاحب المحل.",
      loopLabels: ["فكرة", "تصميم", "طباعة", "استلام"],
      steps: [
        { icon: "tshirt", title: "اختار المنتج", body: "حدد نوع القطعة اللي عايز تطبع عليها." },
        { icon: "ruler", title: "خصّص التفاصيل", body: "المقاس، اللون، والكمية." },
        { icon: "upload", title: "ابعت التصميم", body: "لينك لملفك أو صورة واضحة للفكرة." },
        { icon: "eye", title: "راجع الطلب", body: "اتأكد من التفاصيل قبل ما نبدأ." },
        { icon: "chat", title: "خلي صاحب المحل يأكد", body: "هيرد عليك بالتفاصيل والموعد." },
        { icon: "search", title: "تابع", body: "استخدم كود الطلب لمتابعة الحالة." },
      ],
    },
    portfolio: {
      title: "أعمالنا",
      intro: "نماذج تجريبية لأنواع الشغل. الصور دي بتتستبدل بأعمال حقيقية.",
      all: "الكل",
      requestLikeThis: "اعمل طلب زي ده",
      categories: [
        { slug: "clothing", label: "ملابس" },
        { slug: "mugs", label: "أكواب وهدايا" },
        { slug: "caps", label: "كابات" },
        { slug: "stickers", label: "استيكرز" },
        { slug: "cases", label: "جرابات" },
      ],
      items: [
        { ...sharedPortfolio[0], title: "تيشيرت هاف تون", alt: "نموذج تيشيرت بنقشة نقاط" },
        { ...sharedPortfolio[1], title: "هودي بخطوط", alt: "نموذج هودي بنقشة أقواس" },
        { ...sharedPortfolio[2], title: "مج بموج", alt: "نموذج مج بنقشة موج" },
        { ...sharedPortfolio[3], title: "مج شمس", alt: "نموذج مج بنقشة شمس" },
        { ...sharedPortfolio[4], title: "كاب نقاط", alt: "نموذج كاب بنقشة نقاط" },
        { ...sharedPortfolio[5], title: "كاب خطوط", alt: "نموذج كاب بخطوط" },
        { ...sharedPortfolio[6], title: "ورقة ستيكرز", alt: "نموذج ورقة ستيكرز" },
        { ...sharedPortfolio[7], title: "ستيكر دايرة", alt: "نموذج ستيكر دايري" },
        { ...sharedPortfolio[8], title: "جراب شبكة", alt: "نموذج جراب بشبكة" },
        { ...sharedPortfolio[9], title: "جراب قوس", alt: "نموذج جراب بأقواس" },
      ],
    },
    about: {
      title: "ورشة أسوان اللي بتطبع المختلف",
      paragraphs: [
        "يوزرسيف ورشة طباعة وتخصيص في أسوان. بنشتغل على الملابس، الكابات، المجات، الستيكرز، والجرابات، ونساعدك تحوّل فكرتك لمنتج جاهز.",
        "الشغل كله بيتنسق مباشرة مع صاحب المحل: من اختيار القطعة، لمراجعة التصميم، لحد الاستلام.",
      ],
      principles: [
        { title: "تصميمك مش قالب", body: "بنبدأ من فكرتك، مش من تصميم جاهز." },
        { title: "مراجعة قبل التنفيذ", body: "التفاصيل بتتأكد قبل الطباعة." },
        { title: "من أسوان", body: "ورشة محلية، وتواصل مباشر." },
      ],
    },
    contact: {
      title: "خلّي فكرتك توصلنا",
      body: "ابعت تفاصيل طلبك أو كلمنا على واتساب. التأكيدات كلها مع صاحب المحل.",
      locationLabel: "المكان",
      location: "أسوان، مصر",
      formTitle: "ابعت رسالة",
      formIntro: "اكتب اسمك ورقمك والرسالة. مش هيتبعت أي دفع من الموقع.",
      fields: {
        name: "الاسم",
        namePlaceholder: "مثال: أحمد",
        phone: "رقم الموبايل",
        phonePlaceholder: "01xxxxxxxxx",
        message: "الرسالة",
        messagePlaceholder: "عايز أعرف تفاصيل تيشيرت مطبوع...",
      },
      submit: "ابعت الرسالة",
      submitting: "بنبعت...",
      success: "تم استلام رسالتك.",
      error: "مش قادرين نبعت الرسالة دلوقتي. جرب تاني أو كلمنا على واتساب.",
      validation: {
        name: "اكتب اسم من حرفين على الأقل.",
        phone: "اكتب رقم موبايل مصري صحيح.",
        message: "اكتب رسالة من 5 حروف على الأقل.",
      },
      privacyNote: "بإرسال الرسالة، أنت موافق على سياسة الخصوصية.",
    },
    faq: {
      title: "أسئلة متكررة",
      items: [
        {
          question: "إيه الملفات اللي أقدر أبعتها؟",
          answer:
            "صورة واضحة أو ملف تصميم. لو الملف مش جاهز للطباعة، صاحب المحل هيتواصل معاك تظبطه.",
        },
        {
          question: "إزاي أتابع طلبي؟",
          answer: "بعد ما تبعت الطلب، هتاخد كود. اكتبه في صفحة تابع طلبك.",
        },
        {
          question: "التاريخ اللي بختاره وعد نهائي؟",
          answer: "لا، اختيار التاريخ طلب مش وعد. صاحب المحل هو اللي يأكد الموعد.",
        },
        {
          question: "السعر بيظهر في الموقع؟",
          answer: "لأ. الأسعار تتأكد مع صاحب المحل حسب المنتج والكمية.",
        },
        {
          question: "بتوصلوا بره أسوان؟",
          answer: "التوصيل والاستلام يتنسقوا مع صاحب المحل.",
        },
        {
          question: "ينفع أطلب كمية كبيرة؟",
          answer: "اكتب الكمية في الطلب. صاحب المحل يأكد التفاصيل والتوفر.",
        },
      ],
    },
  footer: {
    blurb: "خليك مختلف .. خليك يوزرسيف.",
      contactTitle: "تواصل",
      linksTitle: "الموقع",
      followTitle: "تابعنا",
      privacy: "الخصوصية",
      terms: "الشروط",
      competition: "نسخة تجريبية اتعملت لمسابقة Brand & Build.",
      demoNote: "الصور والأعمال المعروضة نماذج تجريبية.",
    },
    request: {
      title: "ابدأ طلبك",
      intro: "قولنا على المنتج والتفاصيل. مفيش دفع هنا، وصاحب المحل هو اللي يأكد السعر والموعد.",
      formTitle: "تفاصيل الطلب",
      fields: {
        name: "الاسم",
        namePlaceholder: "مثال: أحمد",
        phone: "رقم الموبايل (واتساب)",
        phonePlaceholder: "01xxxxxxxxx",
        service: "الخدمة",
        servicePlaceholder: "اختار الخدمة",
        quantity: "الكمية",
        quantityHint: "من 1 لـ 500 في الطلب.",
        details: "تفاصيل المنتج والتصميم",
        detailsPlaceholder: "المقاس، اللون، مكان الطباعة، وأي تفاصيل تانية.",
        artwork: "لينك التصميم (اختياري)",
        artworkPlaceholder: "https://...",
        artworkHint: "لينك Google Drive أو أي رابط مباشر للملف.",
        piecesTitle: "قطع الطلب",
        pieceLabel: "قطعة",
        addPiece: "إضافة قطعة",
        removePiece: "حذف القطعة",
        product: "المنتج",
        size: "المقاس",
        sizePlaceholder: "اختار المقاس",
        color: "اللون",
        style: "الستايل أو الخامة",
        stylePlaceholder: "مثال: Classic / Oversized",
        specialRequest: "طلب خاص للقطعة",
        specialRequestPlaceholder: "مكان الطباعة أو أي ملاحظة خاصة...",
        studioProductNote: "المنتج والتصميم اتحددوا من الـ Studio.",
      },
      submit: "ابعت الطلب",
      submitting: "بنبعت الطلب...",
      successTitle: "وصل طلبك",
      successBody: "صاحب المحل هيراجع التفاصيل ويتواصل معاك.",
      codeLabel: "كود الطلب",
      trackCta: "تابع الطلب",
      anotherCta: "ابعت طلب تاني",
      error: "مش قادرين نبعت الطلب دلوقتي. جرب تاني أو كلمنا على واتساب.",
      note: "الأسعار والمواعيد النهائية تتأكد مع صاحب المحل. إرسال الطلب مش حجز نهائي.",
      validation: {
        name: "اكتب اسم من حرفين على الأقل.",
        phone: "اكتب رقم موبايل مصري صحيح.",
        service: "اختار الخدمة.",
        quantity: "الكمية من 1 لـ 500.",
        details: "اكتب تفاصيل المنتج.",
        pieces: "أكمل تفاصيل كل قطعة.",
        size: "اختار مقاس كل قطعة.",
        specialRequest: "راجع الطلب الخاص بهذه القطعة.",
        artwork: "لو حطيت لينك، لازم يبدأ بـ http أو https.",
      },
    },
    track: {
      title: "تابع طلبك",
      intro: "اكتب كود الطلب اللي وصلك بعد الإرسال.",
      codeLabel: "كود الطلب",
      codePlaceholder: "YZ-0000-XXXX",
      submit: "تابع",
      submitting: "بندور...",
      notFound: "مفيش طلب بالكود ده. اتأكد من الكود وجرب تاني.",
      error: "مش قادرين نجيب حالة الطلب دلوقتي.",
      created: "تاريخ الإرسال",
      service: "الخدمة",
      quantity: "الكمية",
      statuses: {
        received: { label: "وصل الطلب", body: "صاحب المحل هيراجعه." },
        review: { label: "تحت المراجعة", body: "التفاصيل بتتراجع قبل التأكيد." },
        confirmed: { label: "تم التأكيد", body: "صاحب المحل أكد التفاصيل معاك." },
        closed: { label: "مغلق", body: "الطلب اتقفل." },
      },
    },
    studioPage: {
      title: "استوديو المعاينة",
      intro: "ارفع لوجو، جرّبه على تيشيرت أو مج أو كاب، وبعدها كمّل طلبك.",
      placeholderNote: "المعاينة تجريبية. الألوان والتنفيذ النهائي يتأكدوا مع صاحب المحل.",
      cta: "ابدأ طلبك",
      worksCta: "شوف أعمالنا",
      note: "المعاينة تجريبية. السعر والموعد النهائي يتأكدوا مع صاحب المحل.",
      demo: "المعاينة والتصميم المعروضين نماذج تجريبية.",
    },
    studioUi: {
      productLabel: "المنتج",
      colorLabel: "اللون",
      viewLabel: "المعاينة",
      turnLabel: "لف المنتج 180°",
      logoLabel: "اللوجو",
      upload: "ارفع لوجو",
      replace: "غيّر اللوجو",
      remove: "شيل اللوجو",
      uploadHint: "PNG أو JPG أو SVG، أقصى حجم 5 ميجا.",
      uploadTypeError: "الملف لازم يكون صورة PNG أو JPG أو SVG.",
      uploadSizeError: "أقصى حجم للملف 5 ميجا.",
      uploadReadError: "مش قادرين نقرأ الصورة دي. جرب ملف تاني.",
      noLogo: "ارفع لوجو وهتشوفه على المنتج",
      dragHint: "اسحب اللوجو للتحريك. عجلة الماوس أو إصبعين للتكبير. الأسهم للتحريك، و+/- للحجم.",
      previewAlt: "معاينة التصميم على المنتج",
      loading: "بنجهز المعاينة...",
      loadError: "مش قادرين نحمّل المنتج دلوقتي.",
      retry: "جرب تاني",
      controls: "التحكم في التصميم",
      scale: "حجم اللوجو",
      rotation: "الدوران",
      reset: "رجّع التصميم",
      treatment: "معالجة اللوجو",
      removeWhite: "شيل الخلفية البيضا",
      removeWhiteHint: "بيشيل الأبيض اللي حوالين اللوجو.",
      removalStrength: "قوة الإزالة",
      inkMode: "لون الطباعة",
      inkOriginal: "الأصلي",
      inkWhite: "أبيض",
      whiteHint: "أبيض بيبان أكتر على المنتجات الغامقة.",
      download: "نزّل المعاينة",
      exporting: "بنصدّر...",
      exportError: "مش قادرين نصدّر المعاينة. جرب تاني.",
      useDesign: "ابدأ طلب بالتصميم ده",
      designNote: "التصميم هيفضل معاك في صفحة الطلب. السعر والموعد يتأكدوا مع صاحب المحل.",
      attachedDesign: "التصميم المرفق",
      changeDesign: "جرّب تصميم تاني",
      removeDesign: "شيل التصميم",
      demoNote: "المعاينة تجريبية، والألوان ممكن تختلف بسيط عن الطباعة.",
    },
    legal: {
      privacy: {
        title: "سياسة الخصوصية",
        updated: "آخر تحديث: أكتوبر 2026",
        paragraphs: [
          "الموقع بيجمع الاسم ورقم الموبايل والتفاصيل اللي بتكتبها في الطلب أو الرسالة.",
          "البيانات بتتستخدم للتواصل بخصوص الطلب فقط، ومش بتتباع لأي حد.",
          "لو عايز تحذف بياناتك، كلم صاحب المحل على واتساب.",
        ],
        note: "الصفحة دي نسخة تجريبية وتحتاج مراجعة قانونية قبل الإطلاق.",
      },
      terms: {
        title: "الشروط",
        updated: "آخر تحديث: أكتوبر 2026",
        paragraphs: [
          "إرسال الطلب مش حجز نهائي. صاحب المحل هو اللي يأكد السعر والموعد وتفاصيل التنفيذ.",
          "الأسعار مش منشورة على الموقع، وبتتأكد حسب المنتج والكمية.",
          "التوصيل والاستلام يتنسقوا مع صاحب المحل.",
        ],
        note: "الصفحة دي نسخة تجريبية وتحتاج مراجعة قانونية قبل الإطلاق.",
      },
    },
    notFound: {
      title: "الصفحة مش موجودة",
      body: "الرابط ده مش رايح لحاجة. ارجع للصفحة الرئيسية وجرب من هناك.",
      cta: "ارجع للرئيسية",
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
      imageAlt: "Yuzersef printed products on a display stand: hoodies, t-shirts, a cap, a mug, a phone case, and stickers",
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
          title: "T-shirt",
          kicker: "T-shirts, hoodies, sweatshirts",
          description: "Choose the piece, colour and size, and we print your design.",
          image: sharedServices.items[0].image,
          alt: "Black t-shirt with the Yuzersef calligraphy logo on a teal background",
          tone: "paper",
        },
        {
          slug: "caps",
          title: "Cap",
          kicker: "Caps, stickers, labels",
          description: "A cap with your mark, stickers, and labels for your product.",
          image: sharedServices.items[1].image,
          alt: "Teal cap with the Yuzersef mark on a matching teal background",
          tone: "ink",
        },
        {
          slug: "mugs",
          title: "Mug",
          kicker: "Mugs and promotional gifts",
          description: "Mugs and gifts with your logo or design.",
          image: sharedServices.items[2].image,
          alt: "Glossy green mug with the Yuzersef mark on a light beige background",
          tone: "brand",
        },
        {
          slug: "cases",
          title: "Tote bag",
          kicker: "Tote bags, phone cases, one-off designs",
          description: "A tote or phone case with your design, or one we make with you.",
          image: sharedServices.items[3].image,
          alt: "Green tote bag with the Yuzersef logo on a light grey background",
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
        piecesTitle: "Request pieces",
        pieceLabel: "Piece",
        addPiece: "Add another piece",
        removePiece: "Remove piece",
        product: "Product",
        size: "Size",
        sizePlaceholder: "Choose a size",
        color: "Colour",
        style: "Style or fabric",
        stylePlaceholder: "e.g. Classic / Oversized",
        specialRequest: "Special request for this piece",
        specialRequestPlaceholder: "Print placement or any special note...",
        studioProductNote: "The product and design were selected in the Studio.",
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
        pieces: "Complete the details for every piece.",
        size: "Choose a size for every piece.",
        specialRequest: "Review the special request for this piece.",
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
      turnLabel: "3D turn 180°",
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
  clothing: { ar: "ملابس مطبوعة", en: "Printed clothing" },
  mugs: { ar: "مجات وهدايا", en: "Mugs & gifts" },
  caps: { ar: "كابات", en: "Caps" },
  stickers: { ar: "ستيكرز وليبلات", en: "Stickers & labels" },
  cases: { ar: "جرابات موبايل", en: "Phone cases" },
};
