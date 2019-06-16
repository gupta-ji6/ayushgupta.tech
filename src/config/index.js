module.exports = {
  siteTitle: 'Hello, I am Ayush gupta',
  siteDescription:
    'Ayush Gupta is a Web & Mobile Application Developer, Photographer, Blogger, (occasionally) Designer and an IT Engineer graduate',
  siteKeywords:
    'Ayush Gupta, Ayush, Gupta, guptaji, software engineer, front-end engineer, web developer, javascript, gupta ji, ',
  siteUrl: 'http://ayushgupta.tech',
  siteLanguage: 'en_US',

  googleVerification: 'YSmK_1bLGe-6FRuzC7f3Qww3eSH2AHd2UC35Lrn8iEM',

  name: 'Ayush Gupta',
  location: 'Jaipur, IND',
  email: 'ayushgupta197@gmail.com',
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
      name: 'Medium',
      url: 'https://medium.com/@guptaji',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/_.guptaji._/',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/_guptaji_',
    },
  ],

  navLinks: [
    {
      name: 'About',
      url: '#about',
    },
    {
      name: 'Experience',
      url: '#jobs',
    },
    {
      name: 'Work',
      url: '#projects',
    },
    {
      name: 'Contact',
      url: '#contact',
    },
  ],

  twitterHandle: '@_guptaji_',
  googleAnalyticsID: 'UA-45666519-2',

  navHeight: 100,

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
};
