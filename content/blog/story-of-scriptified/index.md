---
title: How An App Crash Made Us Build Another App - Story of Scriptified
description: The behind the scenes of launching & building Scriptified with NextJS and TailwindCSS
date: '2021-06-03'
draft: false
slug: '/blog/story-of-scriptified'
popular: true
cover: './images/scriptified-launch-cover.png'
tags:
  - NextJS
  - Tailwind CSS
  - TypeScript
  - JavaScript
---

A project we started in June'20 which was planned to launch for Hacktoberfest but didn't, was finally launched in Mar'21. Yay! Introducing to you - [Scriptified](https://scriptified.dev).

[Scriptified](https://scriptified.dev) is your go-to curated newsletter which sends insightful weekly newsletters in your inbox covering numerous topics around JavaScript & React ecosystem.
Continue reading to know behind the scenes of building Scriptified & the interesting story of building a product from ideation to implementation.

## 🏁 How It Started

It all started with the scariest nightmare of any developer in the world - the 💥 crash of their production app. The first-ever collaborative open source project we launched together - [Smart Apart](https://ayushgupta.tech/smartapart), stopped working one day which led to us building [Scriptified](https://scriptified.dev).

Let me set up the context for you.

[Prateek](https://prateeksurana.me) and I were college batchmates who share a mutual love for JavaScript. Our journey started when we attended an AngularJS & Ionic Framework boot camp in our sophomore year. In the boot camp, we learned the basics of web development (HTML5, CSS3, JavaScript), version control with Git & SourceTree, Firebase for database, JavaScript ES6, and AngularJS (v1). Implementing what we had learned, we built every developer's favorite project to build - a [ToDo list web app](https://todo.ayushgupta.tech/).

After learning AngularJS, we were introduced to the concept of making hybrid apps with Ionic Framework. For our final boot camp project, Prateek & I decided to collaborate and build [Smart Apart](https://ayushgupta.tech/smartapart) - an app to make you smart by curated feeds in varying categories like Videos, Trending, Facts, Quote & On This Day. We completed the project in a month & a half and launched it on Play Store. It was our first project & we crossed 500+ organic installs of which we both are proud. The first one is _always_ special! ✨

Hopping to June 2020, I [texted](https://user-images.githubusercontent.com/21218732/107153918-0bdd5e80-6996-11eb-8f87-8cec0dff68b6.jpg) Prateek asking whether he is aware of the fact that our app is now stuck in a loading state when launched. It's been almost four years since we launched it and any of the public APIs we were using might have been updated or deprecated. The requests were failing and of course, the noob developers didn't handle request failures. _Classic_!

I suggested either fix the app or build it in React Native from scratch. We both agreed that it was not worth the effort.

## 💡 The Idea

> If you understand Hinglish, read our leaked WhatsApp [here](https://user-images.githubusercontent.com/21218732/107153918-0bdd5e80-6996-11eb-8f87-8cec0dff68b6.jpg).

Prateek asked me - "should we start a newsletter? React & JavaScript related?". My eyes lighted up 👀. I have been procrastinating writing for a year or two and I thought this would get me back at it again. A React & JavaScript newsletter would be a perfect place to share our knowledge and engage with the developer community.

I was skeptical about starting the newsletter which sends weekly issues only on mail as gaining initial subscribers takes a lot of time & effort. Considering our network size & popularity, it didn't seem feasible. I suggested we should also publish our issues on the web as many people like to read on the web. Also, if they found value in our issues, they would definitely consider subscribing to our newsletter to never miss them. A win-win situation!

## ✍🏻 Naming The Idea

Naming is probably the hardest part of a developer's life - be it variables, function names or side projects. Just like we create a WhatsApp group before planning any trip, we did the following to bootstrap our idea:

- used fancy Notion templates to collect ideas, track progress & assign work.
- created a GitHub organization with a placeholder name LavaScript.
- created a Slack workspace with #choose-name, #resources, etc. with #notion, #vercel & #github integration.
- started sharing name ideas in #choose-name channel.

After some long discussions, we settled on four options & shared a poll open for a week on Twitter for a public opinion.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Hello Developers 👋🏻,<a href="https://twitter.com/psuranas?ref_src=twsrc%5Etfw">@psuranas</a> &amp; I are starting a JavaScript/React newsletter and we need your help in choosing the name.<br><br>Vote for your favorite ✨</p>&mdash; Ayush Gupta 👨🏻‍💻 (@_guptaji_) <a href="https://twitter.com/_guptaji_/status/1268088638539251712?ref_src=twsrc%5Etfw">June 3, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

ScriptBee won on Twitter but we decided to go with **Scriptified**. After deciding the name we headed over to buy [scriptified.dev](https://scriptied.dev) domain even before starting the project, because that's what _passionate_ developers do!

## ✔ Choosing Tech Stack

Here comes the thrilling part - choosing the tech stack. A wise man would choose a stack he is comfortable & skilled in to build a project fast. But God didn't distribute wisdom equally and hence we chose the stack we both have never worked with. _Not so classic_!

Since most of the content was going to be static, we shook hands on using [NextJS](https://nextjs.org/) - a React framework for building web apps with SSG (Static Site Generation)/SSR (Server Side Rendering). They said it was fast & we believed them.

When building this, there was a lot of hype on Twitter about [Tailwind CSS](https://tailwindcss.com/) - a utility-based CSS Framework. And guess what - we opted for it.

To make it more challenging, we also used [TypeScript](https://www.typescriptlang.org/) as it was a good learning opportunity and NextJS supports it out of the box.

For a back-end service to store & serve our issues API, we settled on using [Strapi CMS](https://strapi.io/). Its integration is a work in progress.

The final stack we choose to build Scriptified was -

1. 🏗 [NextJS](https://nextjs.org/) - for frontend framework
2. ⚛ [React](https://reactjs.org/) - for building UI
3. 🏷 [TypeScript](https://www.typescriptlang.org/) - for types
4. 💄 [Tailwind CSS](https://tailwindcss.com/) - for styling
5. 🗃 [Strapi CMS](https://strapi.io/) - for issues API
6. 📧 [Buttondown](https://buttondown.email/) - for publishing newsletter (switched from [Mailchimp](https://mailchimp.com/) as it felt a bit complex)
7. 🚀 [Vercel](https://vercel.com/) - for hosting & deploying

## 🤝🏻 Sharing Work

As of now, Scriptified's repository is **44+ Pull Requests strong** 💪🏻. We both have worked on various features individually and collaboratively to build Scriptified from scratch. Since we know each other well & have worked on projects together, we both are aware of each other's strong skills. This helped us in dividing work a lot and more than that it gave us an opportunity to **learn from each other's work**. I think that's what Open Source is all about.

We are working on making Scriptified an Open Source project. It will be open for any sort of contributions & PR's soon! :)
Follow [Scriptified on Twitter](https://scriptified.dev/twitter) to get notified about such updates & our issues.

## Making Logo

'Designer Who Codes' is a term but what about 'Developer Who Designs'?

_[I’m a Developer who Designs](https://blog.prototypr.io/im-a-designer-who-codes-i-m-a-developer-who-designs-daffc9451e82)_.

Well, I won't call myself a designer but I have a deep interest & pure love for design. I spend too much of my time handcrafting [my Instagram](https://ayushgupta.tech/ig) travel & daily stories. I have used [Figma](https://www.figma.com/) before as a developer to inspect UI prototypes for some client projects. Now it was time to learn & use Figma for what's it made for - designing. I was so excited!

After discussion & transaction of ideas, we both wanted our logo to be inspired from angle brackets - `</>`. We heavily use them in JSX & HTML and it would perfectly define Scriptified.

Here's what I made in Figma.

![Logo Reveal - Article.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1613458590221/lB3mgt9fa.png)

<!-- ![Logo Reveal - Article - 3.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1613542538682/Bn4k2jAUp.png)

![Logo Reveal - Article - 4.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1613542548396/RAjlQzpAF.png) -->

### What does the logo signify?

1. It is made of angle brackets `<>` which shows it's something related to code.
2. I used double brackets as two people built Scriptified.
3. The brackets represent the "S" of Scriptified.

It's simple, nothing fancy; but works for us!

## 🚀 The Launch

We are stoked to start the journey of sharing curating & sharing insightful things related to JavaScript & React.

We have published five issues till now but paused publishing for a month because of the Covid situation in India. We used this break to integrate CMS & to make Scriptified open source. We are back at it now & will resume publishing weekly issues with full power! You can read our past issues [here](https://scriptified.dev/issues).

If you liked it, definitely consider [subscribing to our newsletter](https://scriptified.dev) to never miss out on new Scriptified issues. They will keep getting better, we promise!

Brownie points to the ones who share the word about Scriptified in their network & community.

I would love to read your stories on building & deploying a side project. Share them in the comments below or comment if our story inspired you to create!

Never Stop Building 🚀
