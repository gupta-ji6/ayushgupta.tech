import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {
  About,
  Blog,
  Contact,
  Education,
  Featured,
  Hero,
  Jobs,
  Layout,
  Projects,
} from '@components';
import { Main, mixins } from '@styles';

const MainContainer = styled(Main)`
  ${mixins.sidePadding};
  counter-reset: section;
`;

const IndexPage = ({ location }) => (
  <Layout location={location}>
    <MainContainer id="content">
      <Hero />
      <About />
      <Jobs />
      <Featured />
      <Projects />
      <Blog />
      <Education />
      <Contact />
    </MainContainer>
  </Layout>
);

IndexPage.propTypes = {
  location: PropTypes.object.isRequired,
};

export default IndexPage;
