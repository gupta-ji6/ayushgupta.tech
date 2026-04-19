export interface SocialLink {
  name: string;
  url: string;
}

export interface NavLink {
  name: string;
  url: string;
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
  navDelay: 1000,
} as const;
