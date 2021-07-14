module.exports = {
  siteTitle: 'Ayush Gupta - Developer, Photographer, Blogger & Designer | GuptaJi',
  siteDescription:
    'Ayush Gupta is a Web & Mobile Application Developer who is passionate about photography, writes blogs and occasionaly designs. React Native Developer at FirstCry. Fondly known as GuptaJi.',
  siteKeywords:
    'Ayush Gupta, Ayush, Gupta, guptaji, software engineer, front end engineer, web developer, react, reactjs, react native, react native developer, javascript, gupta ji, developer, mobile photographer, kota ',
  siteUrl: 'https://ayushgupta.tech',
  siteLanguage: 'en_US',

  googleVerification: 'YSmK_1bLGe-6FRuzC7f3Qww3eSH2AHd2UC35Lrn8iEM',

  name: 'Ayush Gupta',
  location: 'Pune, IND',
  email: 'hello@ayushgupta.tech',
  github: 'https://github.com/gupta-ji6',
  socialMedia: [
    {
      name: 'Github',
      url: 'https://github.com/gupta-ji6',
    },
    {
      name: 'Linkedin',
      url: 'https://www.linkedin.com/in/guptaji6/',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/_.guptaji._/',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/_guptaji_',
    },
    {
      name: 'Medium',
      url: 'https://medium.com/@guptaji',
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/guptaji.6',
    },
  ],

  navLinks: [
    // {
    //   name: 'About',
    //   url: '/#about',
    // },
    // {
    //   name: 'Experience',
    //   url: '/#jobs',
    // },
    {
      name: 'Projects',
      url: '/#projects',
    },
    {
      name: 'Blog',
      url: '/#blog',
    },
    // {
    //   name: 'Education',
    //   url: '/#education',
    // },
    {
      name: 'Uses',
      url: '/uses',
    },
    {
      name: 'Music',
      url: '/music',
    },
    // {
    //   name: 'Contact',
    //   url: '/#contact',
    // },
  ],

  twitterHandle: '@_guptaji_',
  googleAnalyticsID: 'G-XYDGVM2S3D',

  navHeight: 100,
  navDelay: 1000,
  loaderDelay: 2000,

  greenColor: '#64ffda',
  navyColor: '#0a192f',
  darkNavyColor: '#020c1b',

  srConfig: (delay = 200) => ({
    origin: 'bottom',
    distance: '20px',
    duration: 500,
    delay,
    rotate: { x: 0, y: 0, z: 0 },
    opacity: 0,
    scale: 1,
    easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    mobile: true,
    reset: false,
    useDelay: 'always',
    viewFactor: 0.25,
    viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },
  }),

  hasuraURL: 'https://ayushgupta-tech-blog.herokuapp.com/v1/graphql',
};
