import React from 'react';
import { graphql, Link } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Author, Layout, SocialShare, Comments } from '@components';
import { siteUrl } from '@config';
import { theme, media, mixins } from '@styles';

const { colors, fontSizes } = theme;

// ======================= STYLED COMPONENTS ========================

const StyledPostContainer = styled.main`
  padding: 200px 200px;
  ${media.desktop`padding: 200px 100px;`};
  ${media.tablet`padding: 150px 40px;`};
  ${media.phone`padding: 125px 20px;`};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* align-items: center; */
  max-width: 1200px;
`;
const StyledDraftWarning = styled.blockquote`
  margin: 25px 0;
  text-align: left;
  font-style: italic;
  font-weight: 500;
  padding: 0.5em;
  background-color: ${colors.lightNavy};
  border: 0.1rem solid ${colors.green};
  border-radius: ${theme.borderRadius};
`;

const StyledPostHeader = styled.header`
  margin-bottom: 25px;
  .tag {
    margin-right: 10px;
  }

  .cover_image {
    margin-bottom: 1.2rem;
  }
`;

const StledArticleDescription = styled.h2`
  color: ${colors.slate};
  font-weight: 500;
  margin: 1.2rem auto;
`;

const StyledDate = styled.time`
  color: ${colors.slate};
`;

const StyledArticleTags = styled.p`
  color: ${colors.slate};
  a {
    ${mixins.inlineLink};
    color: ${colors.slate};
  }
`;

const StyledPostContent = styled.div`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 2em 0 1em;
  }
  p {
    margin: 1em 0;
    line-height: 1.5;
    color: ${colors.lightSlate};
  }
  a {
    ${mixins.inlineLink};
  }
  strong,
  em {
    color: ${colors.green};
    font-weight: 'medium';
  }
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    font-size: ${fontSizes.xlarge};
    li {
      position: relative;
      padding-left: 30px;
      margin-bottom: 10px;
      &:before {
        content: '▹';
        position: absolute;
        left: 0;
        color: ${colors.green};
        line-height: ${fontSizes.xlarge};
      }
    }
  }
  ol {
    padding: 0;
    padding-left: 30px;
    margin: 0;
    list-style-type: decimal;
    list-style-position: outside;
    font-size: ${fontSizes.xlarge};
    li {
      position: relative;
      padding-left: 6px;
      margin-bottom: 10px;
      &:before {
        content: '';
        position: absolute;
        left: 0;
        color: ${colors.green};
        line-height: ${fontSizes.xlarge};
      }
    }
  }
  blockquote {
    text-align: left;
    font-style: italic;
    margin: 0;
    padding: 0.5em;
    background-color: ${colors.lightNavy};
    border-left: 0.2rem solid ${colors.green};
    border-top-right-radius: ${theme.borderRadius};
    border-bottom-right-radius: ${theme.borderRadius};
  }
  hr {
    ${mixins.hr};
  }
`;

// ======================= COMPONENT ========================

const PostTemplate = ({ data, location }) => {
  const { frontmatter, html } = data.markdownRemark;
  const { title, date, tags, description, draft, slug, cover } = frontmatter;
  const image = getImage(cover);
  const ogImageSrc = image.images.fallback.src;
  console.log(image);

  return (
    <Layout location={location}>
      <Helmet>
        <title>{title} - Ayush Gupta</title>
        <link rel="canonical" href={location.href} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${siteUrl}${ogImageSrc}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={location.href} />
        <meta property="og:site_name" content={title} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${siteUrl}${ogImageSrc}`} />
        <meta name="twitter:image:alt" content={title} />
      </Helmet>

      <StyledPostContainer>
        <span className="breadcrumb">
          <span className="arrow">&larr;</span>
          <Link to="/blog">All articles</Link>
        </span>

        {draft && (
          <StyledDraftWarning>
            Note: This is a draft preview of the article yet to be published. Kindly do not share it
            on social media. Use this link for review purpose only.
          </StyledDraftWarning>
        )}

        <StyledPostHeader>
          <h1 className="medium-heading">{title}</h1>
          <StledArticleDescription>{description}</StledArticleDescription>

          <GatsbyImage image={image} className="cover_image" alt="Blog cover image" />
          <p className="subtitle">
            <StyledDate>
              {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </StyledDate>
          </p>
          <StyledArticleTags className="subtitle">
            {tags &&
              tags.length > 0 &&
              tags.map((tag, i) => (
                <Link key={i} to={`/blog/tags/${kebabCase(tag)}/`} className="tag">
                  #{tag}
                </Link>
              ))}
          </StyledArticleTags>
          <SocialShare title={title} tags={tags} url={location.href} />
        </StyledPostHeader>

        <StyledPostContent dangerouslySetInnerHTML={{ __html: html }} />

        <SocialShare showText title={title} tags={tags} url={location.href} />

        <Author showBg />

        <Comments slug={slug} />
      </StyledPostContainer>
    </Layout>
  );
};

export default PostTemplate;

PostTemplate.propTypes = {
  data: PropTypes.object,
  location: PropTypes.object,
};

export const pageQuery = graphql`
  query ($path: String!) {
    markdownRemark(frontmatter: { slug: { eq: $path } }) {
      html
      frontmatter {
        title
        description
        date
        slug
        cover {
          childImageSharp {
            gatsbyImageData(quality: 80, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
          }
        }
        tags
        draft
      }
    }
  }
`;
