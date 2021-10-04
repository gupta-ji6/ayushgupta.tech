import React from 'react';
import { Main, media } from '@styles';
import { Layout } from '@components';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const MainContainer = styled(Main)`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  height: 100vh !important;
`;
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.green};
  font-family: ${({ theme }) => theme.fonts.SFMono};
  font-size: 12vw;
  line-height: 1;
  ${media.bigDesktop`font-size: 200px;`}
  ${media.phablet`font-size: 120px;`};
`;
const Subtitle = styled.h2`
  font-size: 3vw;
  font-weight: 400;
  ${media.bigDesktop`font-size: 50px;`};
  ${media.phablet`font-size: 30px;`};
`;
const HomeButton = styled(Link)`
  ${({ theme }) => theme.mixins.bigButton};
  margin-top: 40px;
`;

const NotFoundPage = ({ location }) => (
  <Layout location={location}>
    <MainContainer>
      <Title>404</Title>
      <Subtitle>Page Not Found</Subtitle>
      <HomeButton to="/">Go Home</HomeButton>
    </MainContainer>
  </Layout>
);

NotFoundPage.propTypes = {
  location: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

export default NotFoundPage;
