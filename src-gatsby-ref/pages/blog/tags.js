import React from 'react';
import { Link, graphql } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Layout } from '@components';
import { theme, media, mixins } from '@styles';

const { colors, fontSizes, fonts } = theme;

const StyledTagsContainer = styled.main`
  padding: 200px 200px;
  ${media.desktop`padding: 200px 100px;`};
  ${media.tablet`padding: 150px 50px;`};
  ${media.phone`padding: 125px 25px;`};
  max-width: 1200px;
  width: 100%;
  margin: 0px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  h1 {
    margin-bottom: 50px;
  }
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    font-size: ${fontSizes.xlarge};
    color: ${colors.lightSlate};
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
      font-size: ${fontSizes.xxlarge};
      a {
        ${mixins.inlineLink};
        color: ${colors.lightSlate};
        .count {
          color: ${colors.slate};
          font-family: ${fonts.SFMono};
          font-size: ${fontSizes.medium};
        }
      }
    }
  }
`;

const TagsPage = ({
  data: {
    allMarkdownRemark: { group },
  },
  location,
}) => (
  <Layout location={location}>
    <Helmet title="Tags" />

    <StyledTagsContainer id="content">
      <span className="breadcrumb">
        <span className="arrow">&larr;</span>
        <Link to="/blog">All Articles</Link>
      </span>

      <h1>Tags</h1>
      <ul className="fancy-list">
        {group.map(tag => (
          <li key={tag.fieldValue}>
            <Link to={`/blog/tags/${kebabCase(tag.fieldValue)}/`} className="inline-link">
              {tag.fieldValue} <span className="count">({tag.totalCount})</span>
            </Link>
          </li>
        ))}
      </ul>
    </StyledTagsContainer>
  </Layout>
);

TagsPage.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      group: PropTypes.arrayOf(
        PropTypes.shape({
          fieldValue: PropTypes.string.isRequired,
          totalCount: PropTypes.number.isRequired,
        }).isRequired,
      ),
    }),
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }),
    }),
  }),
  location: PropTypes.object,
};

export default TagsPage;

export const pageQuery = graphql`
  query {
    allMarkdownRemark(limit: 2000, filter: { frontmatter: { draft: { ne: true } } }) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`;
