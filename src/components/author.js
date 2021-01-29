import Img from 'gatsby-image';
import styled from 'styled-components';
import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import { theme, media, mixins } from '@styles';

const { colors } = theme;

// ======================= STYLED COMPONENTS ========================

const StyledAuthorContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  /* flex-wrap: wrap; */
  ${media.desktop`flex-direction: row;`}
  ${media.tablet`flex-direction: column;`}
  ${media.phone`flex-direction: column;`}
  ${props =>
    props.showBg &&
    `background-color: ${colors.lightNavy};
    box-shadow: ${mixins.boxShadow};
    border-radius: ${theme.borderRadius};
    margin-top: 2rem;
    padding: 1.5rem;
    align-items: center;`}

`;

const StyledAuthorImg = styled(Img)`
  border-radius: ${theme.borderRadius};
  ${props => props.showBg && `border-radius: 50%;`}
  background-color: ${colors.lightNavy};
  padding: 4px;
  object-fit: cover;
  border: 1px solid ${colors.green};
  margin-right: 1rem;
  margin-bottom: 1rem;
  /* ${media.tablet`margin-bottom: 1rem;`}
  ${media.phone`margin-bottom: 1rem;`} */
`;

const StyledAuthorDescription = styled.div`
  color: ${colors.slate};
  flex: 0.9;
  /* ${props => !props.showBg && 'text-align: center;'}; */
`;

// ======================= COMPONENT ========================

const Author = ({ showBg = false }) => {
  const data = useStaticQuery(graphql`
    {
      author: allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/about/" } }) {
        edges {
          node {
            frontmatter {
              avatar {
                childImageSharp {
                  fluid(maxWidth: 300, quality: 90, traceSVG: { color: "#64ffda" }) {
                    ...GatsbyImageSharpFluid_withWebp_tracedSVG
                    ...GatsbyImageSharpFluidLimitPresentationSize
                  }
                }
              }
            }
          }
        }
      }
    }
  `);
  // console.log(data);
  const {
    node: {
      frontmatter: {
        avatar: {
          childImageSharp: { fluid },
        },
      },
    },
  } = data?.author?.edges[0];
  // console.log(childImageSharp);

  return (
    <StyledAuthorContainer showBg={showBg}>
      <div style={{ width: '20vh' }}>
        <StyledAuthorImg fluid={fluid} alt="Ayush Gupta" />
      </div>
      <StyledAuthorDescription>
        <strong>{`Ayush Gupta `}</strong>
        <span>
          is a Web & Mobile Application Developer who is passionate about photography, writes blogs
          and occasionaly designs. Currently working as a React & React Native Developer at
          FirstCry. Fondly known as GuptaJi.
        </span>
      </StyledAuthorDescription>
    </StyledAuthorContainer>
  );
};

export default Author;

Author.propTypes = {
  showBg: PropTypes.bool,
  data: PropTypes.object,
};
