import { graphql, Link } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Author, Layout, SocialShare } from '@components';
import { theme, media, mixins } from '@styles';

const { colors, fontSizes } = theme;

// ======================= STYLED COMPONENTS ========================

const StyledPostContainer = styled.main`
  padding: 200px 200px;
  ${media.desktop`padding: 200px 100px;`};
  ${media.tablet`padding: 150px 50px;`};
  ${media.phone`padding: 125px 25px;`};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* align-items: center; */
  max-width: 1200px;
`;
const StyledPostHeader = styled.header`
  margin-bottom: 50px;
  .tag {
    margin-right: 10px;
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
    margin: 30px 0;
    border: 0;
    border-bottom: 2px dashed ${colors.slate};
  }
`;

// ======================= COMPONENT ========================

const PostTemplate = ({ data, location }) => {
  const { frontmatter, html } = data.markdownRemark;
  const { title, date, tags, description } = frontmatter;

  return (
    <Layout location={location}>
      <Helmet title={title} />

      <StyledPostContainer>
        <span className="breadcrumb">
          <span className="arrow">&larr;</span>
          <Link to="/blog">All articles</Link>
        </span>

        <StyledPostHeader>
          <h1 className="medium-heading">{title}</h1>
          <StledArticleDescription>{description}</StledArticleDescription>
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
          <SocialShare />
        </StyledPostHeader>

        <StyledPostContent dangerouslySetInnerHTML={{ __html: html }} />

        <SocialShare showText />

        <Author showBg />
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
  query($path: String!) {
    markdownRemark(frontmatter: { slug: { eq: $path } }) {
      html
      frontmatter {
        title
        description
        date
        slug
        image
        tags
      }
    }
  }
`;
