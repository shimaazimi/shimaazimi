export type Lang = 'en' | 'fa';
export type Text = Record<Lang, string>;

export const identity = {
  name: { en: 'Shima Azimi', fa: 'شیما عظیمی' } as Text,
  role: { en: 'Frontend Engineer', fa: 'مهندس فرانت‌اند' } as Text,
  headline: {
    en: 'I build fast web and mobile products, from financial platforms to everyday apps.',
    fa: 'محصولات وب و موبایل سریع می‌سازم؛ از پلتفرم‌های مالی تا اپ‌های روزمره.',
  } as Text,
  tagline: { en: 'Performance, on and off the ice.', fa: 'اجرا، روی یخ و بیرون از آن.' } as Text,
  stack: 'React · React Native · Next.js · TypeScript',
};

export const ui = {
  nav: {
    about: { en: 'About', fa: 'درباره' },
    journey: { en: 'Journey', fa: 'مسیر' },
    work: { en: 'Work', fa: 'پروژه‌ها' },
    skills: { en: 'Skills', fa: 'مهارت‌ها' },
    services: { en: 'Services', fa: 'خدمات' },
    writing: { en: 'Writing', fa: 'مقالات' },
    contact: { en: 'Contact', fa: 'تماس' },
  },
  replay: { en: 'Replay', fa: 'اجرای دوباره' } as Text,
  otherLang: { en: 'فارسی', fa: 'English' } as Text,
  hint: { en: 'Move across the ice', fa: 'روی یخ حرکت کن' } as Text,
  scroll: { en: 'Scroll to skate', fa: 'برای حرکت اسکرول کن' } as Text,
  visit: { en: 'Visit', fa: 'مشاهده' } as Text,
  seeWork: { en: 'See my work', fa: 'نمونه‌کارها' } as Text,
  startProject: { en: 'Start a project', fa: 'شروع پروژه' } as Text,
  resume: { en: 'Download resume', fa: 'دانلود رزومه' } as Text,
};

export const about = {
  kicker: { en: 'About', fa: 'درباره‌ی من' } as Text,
  title: { en: 'Fast interfaces, built with care.', fa: 'رابط‌های سریع، ساخته‌شده با دقت.' } as Text,
  body: {
    en: 'I build performant, user-centered web and mobile applications, from financial platforms and admin dashboards to data-driven systems, working closely with backend and product teams.',
    fa: 'اپلیکیشن‌های وب و موبایل سریع و کاربرمحور می‌سازم؛ از پلتفرم‌های مالی و داشبوردهای مدیریتی تا سیستم‌های داده‌محور، در همکاری نزدیک با تیم‌های بک‌اند و محصول.',
  } as Text,
  skating: {
    en: 'Off screen: 2nd place, French National Figure Skating Competition.',
    fa: 'بیرون از کد: مقام دوم مسابقات ملی اسکیت نمایشی فرانسه.',
  } as Text,
  stats: [
    { value: 5, suffix: '', label: { en: 'years of experience', fa: 'سال تجربه' } as Text },
    { value: 25, suffix: '%', label: { en: 'faster dashboard load at Wallex', fa: 'بارگذاری سریع‌تر داشبورد در Wallex' } as Text },
    { value: 30, suffix: '%', label: { en: 'faster data load at Atlasdadeh Sefid', fa: 'بارگذاری سریع‌تر داده در Atlasdadeh Sefid' } as Text },
    { value: 40, suffix: '%', label: { en: 'faster issue resolution with Sentry', fa: 'رفع سریع‌تر خطا با Sentry' } as Text },
  ],
};

export const journeyIntro = {
  kicker: { en: 'Journey', fa: 'مسیر کاری' } as Text,
  title: { en: 'Five stops, one program.', fa: 'پنج ایستگاه، یک برنامه.' } as Text,
};

export const journey = [
  {
    company: 'Reyton',
    role: { en: 'Frontend Developer', fa: 'توسعه‌دهنده‌ی فرانت‌اند' } as Text,
    dates: { en: 'Jul 2021 – Jun 2022', fa: 'ژوئیه ۲۰۲۱ – ژوئن ۲۰۲۲' } as Text,
    summary: {
      en: 'Built responsive, mobile-first websites with JavaScript, HTML, CSS and Bootstrap.',
      fa: 'ساخت وب‌سایت‌های واکنش‌گرا و موبایل‌محور با JavaScript، HTML، CSS و Bootstrap.',
    } as Text,
  },
  {
    company: 'Hidica',
    role: { en: 'Frontend Developer', fa: 'توسعه‌دهنده‌ی فرانت‌اند' } as Text,
    dates: { en: 'Sep 2022 – Jan 2023', fa: 'سپتامبر ۲۰۲۲ – ژانویه ۲۰۲۳' } as Text,
    summary: {
      en: 'Led projects with Next.js, TypeScript, Vue.js and React, cut average page load by 25%, and standardized UI with reusable Storybook components.',
      fa: 'هدایت پروژه‌ها با Next.js، TypeScript، Vue.js و React، کاهش ۲۵٪ زمان بارگذاری صفحات و یکدست کردن رابط با کامپوننت‌های Storybook.',
    } as Text,
  },
  {
    company: 'Atlasdadeh Sefid',
    role: { en: 'Frontend Engineer', fa: 'مهندس فرانت‌اند' } as Text,
    dates: { en: 'Apr 2023 – Apr 2024', fa: 'آوریل ۲۰۲۳ – آوریل ۲۰۲۴' } as Text,
    summary: {
      en: 'Built the user and admin panel of a B2B SMS platform, with 30% faster data loads and Sentry monitoring that cut issue-resolution time by 40%.',
      fa: 'ساخت پنل کاربری و مدیریت یک پلتفرم پیامک B2B، با بارگذاری ۳۰٪ سریع‌تر داده و پایش Sentry که زمان رفع خطا را ۴۰٪ کم کرد.',
    } as Text,
  },
  {
    company: 'Wallex',
    role: { en: 'Frontend Engineer', fa: 'مهندس فرانت‌اند' } as Text,
    dates: { en: 'May 2024 – Mar 2026', fa: 'مه ۲۰۲۴ – مارس ۲۰۲۶' } as Text,
    summary: {
      en: 'Built financial and admin platforms including Zeema.fund and Wallpay.info, with role-based access control, automated tests in CI/CD, and a 25% faster dashboard load.',
      fa: 'ساخت پلتفرم‌های مالی و مدیریتی از جمله Zeema.fund و Wallpay.info، با کنترل دسترسی نقش‌محور، تست خودکار در CI/CD و بارگذاری ۲۵٪ سریع‌تر داشبورد.',
    } as Text,
  },
  {
    company: 'Dotone Holding',
    role: { en: 'Frontend Engineer · Postex', fa: 'مهندس فرانت‌اند · Postex' } as Text,
    dates: { en: 'Apr 2026 – Present', fa: 'آوریل ۲۰۲۶ – اکنون' } as Text,
    summary: {
      en: 'Build and maintain React Native and Next.js applications for postex.ir, and ship products on Cafe Bazaar.',
      fa: 'ساخت و نگهداری اپلیکیشن‌های React Native و Next.js برای postex.ir و انتشار محصولات در کافه‌بازار.',
    } as Text,
  },
];

export const projectsIntro = {
  kicker: { en: 'Selected work', fa: 'پروژه‌های منتخب' } as Text,
  title: { en: 'Cut into the ice.', fa: 'حک‌شده روی یخ.' } as Text,
};

export type Project = {
  name: string;
  summary: Text;
  tools: string[];
  url?: string;
};

// To add a project, append it here. The ice blades in the 3D scene follow this list.
export const projects: Project[] = [
  {
    name: 'Zeema.fund',
    summary: {
      en: 'An investment platform with fast, reliable API data synchronization.',
      fa: 'پلتفرم سرمایه‌گذاری با همگام‌سازی سریع و قابل‌اعتماد داده‌های API.',
    },
    tools: ['Next.js', 'TypeScript', 'React Query'],
    url: 'https://zeema.fund',
  },
  {
    name: 'Wallpay.info',
    summary: {
      en: 'A financial platform built and maintained at Wallex.',
      fa: 'پلتفرم مالی که در Wallex ساخته و نگهداری شد.',
    },
    tools: [],
    url: 'https://wallpay.info',
  },
  {
    name: 'Postex apps',
    summary: {
      en: 'Postex, Shipito, Rahgiri and SuperApp, with mobile products released on Cafe Bazaar.',
      fa: 'Postex، Shipito، Rahgiri و SuperApp، با محصولات موبایلی منتشرشده در کافه‌بازار.',
    },
    tools: ['React Native', 'Next.js'],
    url: 'https://postex.ir',
  },
  {
    name: 'mcpanel',
    summary: {
      en: 'The user and admin panel of a B2B SMS platform.',
      fa: 'پنل کاربری و مدیریت یک پلتفرم پیامک B2B.',
    },
    tools: ['React', 'TypeScript', 'TailwindCSS', 'Sentry'],
    url: 'https://mcpanel.adsefid.com',
  },
  {
    name: 'Friends Cafe',
    summary: {
      en: 'A coffee shop and online store, with a Coffee Finder guide that recommends coffee by how you brew.',
      fa: 'کافه و فروشگاه آنلاین قهوه، با راهنمای انتخاب قهوه بر اساس روش دم‌آوری.',
    },
    tools: [],
    url: 'https://friendscafe.ir',
  },
  {
    name: 'Noramora',
    summary: {
      en: 'An online store for skin care, hair care and beauty, with product guides and a free skin consultant.',
      fa: 'فروشگاه آنلاین مراقبت پوست، مو و زیبایی، با راهنمای انتخاب محصول و مشاور پوست رایگان.',
    },
    tools: [],
    url: 'https://noramora.ir',
  },
];

export const articlesIntro = {
  kicker: { en: 'Research & writing', fa: 'پژوهش و مقالات' } as Text,
  title: { en: 'Beyond the interface.', fa: 'فراتر از رابط کاربری.' } as Text,
  read: { en: 'Read', fa: 'خواندن' } as Text,
  certificate: { en: 'View certificate', fa: 'مشاهده‌ی گواهی' } as Text,
};

export type Article = {
  title: string;
  source: string; // Where it is published, e.g. Virgool or Medium
  lang: 'en' | 'fa'; // The language the article is written in
  date?: string;
  authors?: string;
  summary?: Text;
  status?: Text;
  url?: string;
  certificate?: string; // Image in /public/certificates
};

// Add your articles here. The Writing section appears on the site as soon as this list has one.
export const articles: Article[] = [
  {
    title: 'A Critical Review of Machine Learning and Deep Learning Applications in Disease Diagnosis: From Laboratory Accuracy to Clinical Readiness',
    source: '31st National Conference on Computer Science and Engineering and Information Technology (NCCIT)',
    lang: 'en',
    date: '2026',
    authors: 'Sina Asghari, Shima Azimi',
    status: {
      en: 'Accepted for oral presentation and publication in the conference proceedings. Paper code NCCIT-154031.',
      fa: 'پذیرفته‌شده برای ارائه‌ی سخنرانی و چاپ در مجموعه‌مقالات کنفرانس. کد مقاله ⁦NCCIT‑154031⁩.',
    },
    certificate: '/certificates/nccit-2026.webp',
  },
];

export const skillsIntro = {
  kicker: { en: 'Skills', fa: 'مهارت‌ها' } as Text,
  title: { en: 'Six crystals, one craft.', fa: 'شش بلور، یک حرفه.' } as Text,
};

export const skills: { name: Text; items: string[] }[] = [
  {
    name: { en: 'Frontend & Mobile', fa: 'فرانت‌اند و موبایل' },
    items: ['React', 'React Native', 'Expo', 'Next.js', 'React Admin', 'TypeScript', 'JavaScript', 'React Query', 'Redux', 'Zustand', 'PWA', 'WebSockets', 'Service Workers', 'Web Storage'],
  },
  {
    name: { en: 'Styling', fa: 'استایل' },
    items: ['TailwindCSS', 'SASS', 'Styled-Components', 'Emotion', 'CSS Modules', 'Material UI', 'Ant Design', 'Bootstrap'],
  },
  {
    name: { en: 'Data & APIs', fa: 'داده و API' },
    items: ['RESTful APIs', 'GraphQL', 'Apollo Client', 'React Hook Form'],
  },
  {
    name: { en: 'Build & Tooling', fa: 'ابزار ساخت' },
    items: ['Vite', 'Webpack', 'ESLint', 'Prettier', 'Turborepo', 'Nx', 'Git', 'Storybook', 'CI/CD'],
  },
  {
    name: { en: 'Performance & Quality', fa: 'سرعت و کیفیت' },
    items: ['Web Vitals', 'Lighthouse', 'Web Accessibility (WCAG)', 'Sentry'],
  },
  {
    name: { en: 'Testing', fa: 'تست' },
    items: ['Jest', 'React Testing Library', 'Cypress', 'Playwright'],
  },
];

export const services = {
  kicker: { en: 'For businesses', fa: 'برای کسب‌وکارها' } as Text,
  title: { en: 'From idea to launch.', fa: 'از ایده تا انتشار.' } as Text,
  intro: {
    en: 'Have an idea for your business? I take it from a first conversation to a live product, with one person responsible for the whole path.',
    fa: 'برای کسب‌وکارت ایده‌ای داری؟ از اولین گفتگو تا محصول آماده‌ی استفاده کنارت هستم و یک نفر مسئول کل مسیر است.',
  } as Text,
  offers: [
    { en: 'Websites and online stores', fa: 'وب‌سایت و فروشگاه آنلاین' },
    { en: 'Web apps and admin dashboards', fa: 'وب‌اپ و داشبورد مدیریتی' },
    { en: 'Mobile apps with React Native', fa: 'اپلیکیشن موبایل با React Native' },
  ] as Text[],
  steps: [
    {
      name: { en: 'Idea', fa: 'ایده' },
      detail: { en: 'We define the goal, the audience and what the first version must do.', fa: 'هدف، مخاطب و کارهایی را که نسخه‌ی اول باید انجام دهد مشخص می‌کنیم.' },
    },
    {
      name: { en: 'Design', fa: 'طراحی' },
      detail: { en: 'You see how the product looks and works before it is built.', fa: 'قبل از ساخت، ظاهر و روند کار محصول را می‌بینی.' },
    },
    {
      name: { en: 'Build', fa: 'ساخت' },
      detail: { en: 'Fast, tested code that works well on every screen.', fa: 'کد سریع و تست‌شده که روی هر صفحه‌نمایشی خوب کار می‌کند.' },
    },
    {
      name: { en: 'Launch', fa: 'انتشار' },
      detail: { en: 'The product goes live and we check that it works for real users.', fa: 'محصول منتشر می‌شود و کارکردش را برای کاربران واقعی بررسی می‌کنیم.' },
    },
  ] as { name: Text; detail: Text }[],
  cta: { en: 'Tell me about your idea', fa: 'ایده‌ات را برایم بنویس' } as Text,
};

export const contact = {
  kicker: { en: 'Contact', fa: 'تماس' } as Text,
  note: {
    en: 'Hiring a frontend engineer, or building something for your business? Either way, I would like to hear from you.',
    fa: 'دنبال مهندس فرانت‌اند هستی یا می‌خواهی چیزی برای کسب‌وکارت بسازی؟ در هر دو حالت خوشحال می‌شوم بشنوم.',
  } as Text,
  title: { en: "Let's build something that performs.", fa: 'بیا چیزی بسازیم که بدرخشد.' } as Text,
  email: 'shimaazimi75@gmail.com',
  phone: '+98 937 297 3295',
  phoneHref: 'tel:+989372973295',
  linkedin: 'https://linkedin.com/in/shima-azimi',
  linkedinLabel: 'linkedin.com/in/shima-azimi',
  github: 'https://github.com/shimaazimi',
  githubLabel: 'github.com/shimaazimi',
  resume: '/Shima-Azimi-Resume.pdf',
};
