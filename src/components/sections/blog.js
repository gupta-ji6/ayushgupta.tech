import React, { useEffect, useRef } from 'react';
import { graphql, Link, useStaticQuery } from 'gatsby';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';

import sr from '@utils/sr';
import { srConfig } from '@config';
import { usePrefersReducedMotion } from '@hooks';
import { IconArticle } from '@components/icons';
import { media, Section, Heading } from '@styles';

// ================================== STYLED COMPONENTS =====================================

const BlogContainer = styled(Section)`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  align-items: stretch;
`;

// const BlogTitle = styled.h4`
//   margin: 0 auto 50px;
//   font-size: ${({ theme }) => theme.fontSizes.h3};
//   ${media.tablet`font-size: 24px;`};
//   a {
//     display: block;
//   }
// `;

const BlogGrid = styled.div`
  .blogs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    grid-gap: 15px;
    position: relative;
    ${media.tablet`grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));`};
  }
`;

const BlogInner = styled.div`
  ${({ theme }) => theme.mixins.boxShadow};
  ${({ theme }) => theme.mixins.flexBetween};
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  padding: 2rem 1.75rem;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: ${({ theme }) => theme.transition};
  background-color: ${({ theme }) => theme.colors.lightNavy};
`;

const Article = styled.div`
  transition: ${({ theme }) => theme.transition};
  cursor: default;
  &:hover,
  &:focus {
    outline: 0;
    ${BlogInner} {
      transform: translateY(-5px);
    }
  }
`;

const BlogHeader = styled.div`
  ${({ theme }) => theme.mixins.flexBetween};
  margin-bottom: 30px;
`;

const Folder = styled.div`
  color: ${({ theme }) => theme.colors.green};
  svg {
    width: 40px;
    height: 40px;
  }
`;

// const Links = styled.div`
//   margin-right: -10px;
//   color: ${({ theme }) => theme.colors.lightSlate};
// `;

// const IconLink = styled.a`
//   position: relative;
//   top: -10px;
//   padding: 10px;

//   svg {
//     width: 24px;
//     height: 24px;
//   }
// `;

const BlogName = styled.h4`
  margin: 0 0 10px;
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  color: ${({ theme }) => theme.colors.lightestSlate};
`;

const BlogDescription = styled.div`
  font-size: 17px;
  color: ${({ theme }) => theme.colors.lightSlate};
  a {
    ${({ theme }) => theme.mixins.inlineLink};
  }
`;

const TagList = styled.ul`
  flex-grow: 1;
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-top: 20px;
  li {
    font-family: ${({ theme }) => theme.fonts.SFMono};
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    color: ${({ theme }) => theme.colors.lightSlate};
    line-height: 1.75;
    margin-right: 15px;
    &:last-of-type {
      margin-right: 0;
    }
  }
`;

const ReadMore = styled(Link)`
  ${({ theme }) => theme.mixins.bigButton};
  margin: auto;
  margin-top: 50px;
  width: 20vw;
  text-align: center;
  ${media.thone`width: 50vw;`};
  ${media.tablet`width: 40vw;`};
`;

// ================================== COMPONENT =====================================

const Blog = () => {
  const data = useStaticQuery(graphql`
    {
      popularArticles: allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/blog/" }
          frontmatter: { draft: { ne: true }, popular: { eq: true } }
        }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              description
              slug
              date
              tags
              draft
              popular
            }
            html
          }
        }
      }
    }
  `);

  // const [showMore, setShowMore] = useState(false);
  const revealContainer = useRef(null);
  const revealArticles = useRef([]);

  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
    revealArticles.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const GRID_LIMIT = 2;
  const popularArticles = data.popularArticles.edges.filter(
    ({ node }) => node.frontmatter.popular && !node.frontmatter.draft,
  );
  // const firstSix = blog.slice(0, GRID_LIMIT);
  // const blogsToShow = showMore ? blog : firstSix;
  // console.log(data);
  // console.log(blog);

  return (
    <BlogContainer id="blog" ref={revealContainer}>
      <Heading>Popular Articles</Heading>
      <BlogGrid>
        <TransitionGroup className="blogs">
          {popularArticles &&
            popularArticles.map(({ node }, i) => {
              const { frontmatter } = node;
              const { title, tags, slug, description } = frontmatter;
              return (
                <CSSTransition
                  key={i}
                  classNames="fadeup"
                  timeout={i >= GRID_LIMIT ? (i - GRID_LIMIT) * 300 : 300}
                  exit={false}>
                  <Article
                    key={i}
                    ref={el => (revealArticles.current[i] = el)}
                    tabIndex="0"
                    style={{
                      transitionDelay: `${i >= GRID_LIMIT ? (i - GRID_LIMIT) * 100 : 0}ms`,
                    }}>
                    <BlogInner>
                      <Link to={slug} aria-label={title}>
                        <header>
                          <BlogHeader>
                            <Folder>
                              <IconArticle />
                            </Folder>
                          </BlogHeader>
                          <BlogName>{title}</BlogName>
                          <BlogDescription>{description}</BlogDescription>
                        </header>
                        <footer>
                          <TagList>
                            {tags.map((tag, i) => (
                              <li key={i}>{tag}</li>
                            ))}
                          </TagList>
                        </footer>
                      </Link>
                    </BlogInner>
                  </Article>
                </CSSTransition>
              );
            })}
        </TransitionGroup>
      </BlogGrid>
      {/* <ShowMoreButton onClick={() => setShowMore(!showMore)}>
        {showMore ? 'Fewer' : 'More'} Projects
      </ShowMoreButton> */}
      <ReadMore to="/blog">Read More Articles</ReadMore>
    </BlogContainer>
  );
};

export default Blog;
