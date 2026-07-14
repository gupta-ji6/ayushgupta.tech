export interface SocialLink {
  name: string;
  url: string;
}

export interface NavLink {
  name: string;
  url: string;
}

export interface SiteConfig {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  siteLanguage: string;
  googleVerification: string;
  yandexVerification: string;
  bingVerification: string;
  name: string;
  location: string;
  email: string;
  github: string;
  socialMedia: SocialLink[];
  navLinks: NavLink[];
  twitterHandle: string;
  googleAnalyticsID: string;
  navHeight: number;
  navScrollHeight: number;
  navDelay: number;
  loaderDelay: number;
  greenColor: string;
  navyColor: string;
  darkNavyColor: string;
}

export const siteConfig = {
  siteTitle: 'Ayush Gupta - Frontend Engineer (GuptaJi)',
  siteDescription:
    'Ayush Gupta is a Web & Mobile Frontend Engineer who is passionate about photography, writes blogs and occasionaly designs. Senior Software Engineer at Circle. Fondly known as GuptaJi.',
  siteKeywords:
    'Ayush Gupta, Ayush, Gupta, guptaji, software engineer, senior software engineer, web developer, react, reactjs, react native, react native developer, javascript, typescript, next.js, graphql, gupta ji, developer, photographer, kota, circle, leap wallet, razorpay, frontend engineer, frontend lead',
  siteUrl: 'https://ayushgupta.tech',
  siteLanguage: 'en_US',

  googleVerification: 'YSmK_1bLGe-6FRuzC7f3Qww3eSH2AHd2UC35Lrn8iEM',
  yandexVerification: 'cc2cfdc322abe716',
  bingVerification: '7E3E59B623CADFC4110A588C0E91DC65',

  name: 'Ayush Gupta',
  location: 'Bengaluru, India',
  email: 'hello@ayushgupta.tech',
  github: 'https://github.com/gupta-ji6',

  socialMedia: [
    { name: 'Github', url: 'https://github.com/gupta-ji6' },
    { name: 'Linkedin', url: 'https://www.linkedin.com/in/guptaji6/' },
    { name: 'Instagram', url: 'https://www.instagram.com/_.guptaji._/' },
    { name: 'Twitter', url: 'https://x.com/_guptaji_' },
    { name: 'Medium', url: 'https://medium.com/@guptaji' },
  ] satisfies SocialLink[],

  navLinks: [
    { name: 'Projects', url: '/#projects' },
    { name: 'Blog', url: '/#blog' },
    { name: 'Uses', url: '/uses' },
    { name: 'Music', url: '/music' },
  ] satisfies NavLink[],

  twitterHandle: '@_guptaji_',
  googleAnalyticsID: 'G-XYDGVM2S3D',

  navHeight: 100,
  navScrollHeight: 70,
  navDelay: 1000,
  loaderDelay: 2000,

  greenColor: '#64ffda',
  navyColor: '#0a192f',
  darkNavyColor: '#020c1b',
} satisfies SiteConfig;

export const resolveNavHref = ({ name, url }: NavLink) => {
  switch (name) {
    case 'Blog':
      return '/blog';
    case 'Uses':
      return '/uses';
    case 'Music':
      return '/music';
    default:
      return url;
  }
};
