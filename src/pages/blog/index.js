import React from 'react';
import { graphql, Link } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Author, Layout } from '@components';
// import { IconArticle } from '@components/icons';
import { mixins, theme, media } from '@styles';

const { colors, fontSizes, fonts } = theme;

const StyledMainContainer = styled.main`
  padding: 200px 200px;
  ${media.desktop`padding: 200px 100px;`};
  ${media.tablet`padding: 150px 50px;`};
  ${media.phone`padding: 125px 25px;`};
  max-width: 1200px;
  margin: 0 auto;
  & > header {
    margin-bottom: 100px;
    text-align: center;
  }
  footer {
    ${mixins.flexBetween};
    width: 100%;
    margin-top: 20px;
  }
`;

const StyledLatestArticles = styled.h2`
  font-size: ${fontSizes.h3};
  text-align: center;
  ${media.phone`text-align: left;`}
  ${media.phablet`text-align: left;`}
  margin-top: 50px;
`;

const StyledGrid = styled.div`
  margin-top: 50px;
  .posts {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 15px;
    position: relative;
    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    } */
  }
`;

const StyledPostInner = styled.div`
  ${mixins.boxShadow};
  ${mixins.flexBetween};
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  height: 100%;
  padding: 2rem 1.75rem;
  border-radius: ${theme.borderRadius};
  transition: ${theme.transition};
  background-color: ${colors.lightNavy};
  header,
  a {
    width: 100%;
  }
`;
const StyledPostName = styled.h5`
  margin: 0 0 10px;
  color: ${colors.lightestSlate};
  font-size: ${fontSizes.h3};
`;
const StyledPost = styled.div`
  width: 65vw;
  ${media.desktop`width: 75vw;`};
  ${media.tablet`width: 100%`};
  ${media.phone`width: 90vw;`};
  max-width: 1200px;
  margin-bottom: 25px;
  transition: ${theme.transition};
  cursor: default;
  &:hover,
  &:focus {
    outline: 0;
    ${StyledPostInner} {
      transform: translateY(-5px);
    }
    ${StyledPostName} {
      color: ${colors.green};
      text-decoration: wavy;
    }
  }
`;

// const StyledPostHeader = styled.div`
//   ${mixins.flexBetween};
//   margin-bottom: 30px;
// `;

// const StyledFolder = styled.div`
//   color: ${colors.green};
//   svg {
//     width: 40px;
//     height: 40px;
//   }
// `;
const StyledPostDescription = styled.div`
  color: ${colors.lightSlate};
  font-size: ${fontSizes.xlarge};
`;
const StyledFooter = styled.footer`
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;
const StyledDate = styled.span`
  align-self: flex-start;
  color: ${colors.lightSlate};
  font-family: ${fonts.SFMono};
  font-size: ${fontSizes.small};
  text-transform: uppercase;
  padding: 10px 0;
`;
const StyledTags = styled.ul`
  display: flex;
  align-self: flex-start;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
  list-style: none;
  li {
    color: ${colors.green};
    font-family: ${fonts.SFMono};
    font-size: ${fontSizes.small};
    line-height: 1.75;
    &:not(:last-of-type) {
      margin-right: 15px;
    }
  }
`;

const BlogPage = ({ location, data }) => {
  const posts = data.allMarkdownRemark.edges;

  return (
    <Layout location={location}>
      <Helmet title="Blog - Ayush Gupta" />

      <StyledMainContainer>
        <header>
          <h1 className="big-heading">thoughts</h1>
          <p className="subtitle">documenting my learning journey, failures & wins</p>
        </header>

        <Author />

        <StyledLatestArticles>Latest Articles</StyledLatestArticles>

        <StyledGrid>
          <div className="posts">
            {posts.length > 0 &&
              posts.map(({ node }, i) => {
                const { frontmatter } = node;
                const { title, description, slug, date, tags } = frontmatter;
                const d = new Date(date);

                return (
                  <StyledPost key={i} tabIndex="0">
                    <StyledPostInner>
                      <header>
                        <Link to={slug}>
                          {/* <StyledPostHeader>
                            <StyledFolder>
                              <IconArticle />
                            </StyledFolder>
                          </StyledPostHeader> */}
                          <StyledPostName>{title}</StyledPostName>
                          <StyledPostDescription>{description}</StyledPostDescription>
                        </Link>
                      </header>
                      <StyledFooter>
                        <StyledDate>{`${d.toLocaleDateString()}`}</StyledDate>
                        <StyledTags>
                          {tags.map((tag, i) => (
                            <li key={i}>
                              <Link to={`/blog/tags/${kebabCase(tag)}/`} className="inline-link">
                                #{tag}
                              </Link>
                            </li>
                          ))}
                        </StyledTags>
                      </StyledFooter>
                    </StyledPostInner>
                  </StyledPost>
                );
              })}
          </div>
        </StyledGrid>
      </StyledMainContainer>
    </Layout>
  );
};

BlogPage.propTypes = {
  location: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

export default BlogPage;

export const pageQuery = graphql`
  {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/blog/" }, frontmatter: { draft: { ne: true } } }
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
`;
