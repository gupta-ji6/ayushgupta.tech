import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { graphql, useStaticQuery } from 'gatsby';
import styled from 'styled-components';

import { KEY_CODES } from '@utils';
import sr from '@utils/sr';
import { srConfig } from '@config';
import { theme, mixins, media, Section, Heading } from '@styles';
import { usePrefersReducedMotion } from '@hooks';
import ExternalLink from '../externalLink';

// ================================== CONSTANTS =====================================

const { colors, fontSizes, fonts } = theme;

// ================================== STYLED COMPONENTS =====================================

const JobsContainer = styled(Section)`
  position: relative;
  max-width: 700px;
`;

const TabsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  position: relative;
  ${media.thone`
    display: block;
  `};
`;

const Tabs = styled.ul`
  display: block;
  position: relative;
  width: max-content;
  z-index: 3;
  ${media.thone`
    display: flex;
    overflow-x: scroll;
    margin-bottom: 30px;
    width: calc(100% + 100px);
    margin-left: -50px;
  `};
  ${media.phablet`
    width: calc(100% + 50px);
    margin-left: -25px;
  `};

  li {
    &:first-of-type {
      ${media.thone`
        margin-left: 50px;
      `};
      ${media.phablet`
        margin-left: 25px;
      `};
    }
    &:last-of-type {
      ${media.thone`
        padding-right: 50px;
      `};
      ${media.phablet`
        padding-right: 25px;
      `};
    }
  }
`;

const Tab = styled.button`
  ${mixins.link};
  display: flex;
  align-items: center;
  width: 100%;
  background-color: transparent;
  height: ${theme.tabHeight}px;
  padding: 0 20px 2px;
  transition: ${theme.transition};
  border-left: 2px solid ${colors.darkGrey};
  text-align: left;
  white-space: nowrap;
  font-family: ${fonts.SFMono};
  font-size: ${fontSizes.smallish};
  color: ${props => (props.isActive ? colors.green : colors.lightGrey)};
  ${media.tablet`padding: 0 15px 2px;`};
  ${media.thone`
    ${mixins.flexCenter};
    padding: 0 15px;
    text-align: center;
    border-left: 0;
    border-bottom: 2px solid ${colors.darkGrey};
    min-width: 120px;
  `};
  &:hover,
  &:focus {
    background-color: ${colors.lightNavy};
  }
`;

const Highlighter = styled.span`
  display: block;
  background: ${colors.green};
  width: 2px;
  height: ${theme.tabHeight}px;
  border-radius: ${theme.borderRadius};
  position: absolute;
  top: 0;
  left: 0;
  transition: transform 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition-delay: 0.1s;
  z-index: 10;
  transform: translateY(
    ${props => (props.activeTabId > 0 ? props.activeTabId * theme.tabHeight : 0)}px
  );
  ${media.thone`
    width: 100%;
    max-width: ${theme.tabWidth}px;
    height: 2px;
    top: auto;
    bottom: 0;
    transform: translateX(
      ${props => (props.activeTabId > 0 ? props.activeTabId * theme.tabWidth : 0)}px
    );
    margin-left: 50px;
  `};
  ${media.phablet`
    margin-left: 25px;
  `};
`;

const ContentContainer = styled.div`
  position: relative;
  padding-top: 12px;
  padding-left: 30px;
  flex-grow: 1;
  ${media.tablet`padding-left: 20px;`};
  ${media.thone`padding-left: 0;`};
`;

const TabContent = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  opacity: ${props => (props.isActive ? 1 : 0)};
  z-index: ${props => (props.isActive ? 2 : -1)};
  position: ${props => (props.isActive ? 'relative' : 'absolute')};
  visibility: ${props => (props.isActive ? 'visible' : 'hidden')};
  transition: ${theme.transition};
  transition-duration: ${props => (props.isActive ? '0.5s' : '0s')};
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    font-size: ${fontSizes.large};
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
  a {
    ${mixins.inlineLink};
  }
`;

const JobTitle = styled.h4`
  color: ${colors.lightestSlate};
  font-size: ${fontSizes.xxlarge};
  font-weight: 500;
  margin-bottom: 5px;
`;

const Company = styled.span`
  color: ${colors.green};
`;

const JobDetails = styled.h5`
  font-family: ${fonts.SFMono};
  font-size: ${fontSizes.smallish};
  font-weight: normal;
  letter-spacing: 0.5px;
  color: ${colors.lightSlate};
  margin-bottom: 10px;
  svg {
    width: 15px;
  }
`;

const JobLocation = styled.h5`
  font-family: ${fonts.SFMono};
  font-size: ${fontSizes.smallish};
  font-weight: normal;
  letter-spacing: 0.5px;
  color: ${colors.lightSlate};
  margin-bottom: 30px;
  svg {
    width: 15px;
  }
`;

// ================================== COMPONENT =====================================

const Jobs = () => {
  const [activeTabId, setActiveTabId] = useState(0);
  const [tabFocus, setTabFocus] = useState(null);
  const tabs = useRef([]);

  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const focusTab = () => {
    if (tabs.current[tabFocus]) {
      tabs.current[tabFocus].focus();
      return;
    }
    // If we're at the end, go to the start
    if (tabFocus >= tabs.current.length) {
      setTabFocus(0);
    }
    // If we're at the start, move to the end
    if (tabFocus < 0) {
      setTabFocus(tabs.current.length - 1);
    }
  };

  // Only re-run the effect if tabFocus changes
  useEffect(() => focusTab(), [tabFocus]);

  // Focus on tabs when using up & down arrow keys
  const onKeyDown = e => {
    if (e.key === KEY_CODES.ARROW_UP || e.key === KEY_CODES.ARROW_DOWN) {
      e.preventDefault();
      // Move up
      if (e.key === KEY_CODES.ARROW_UP) {
        setTabFocus(tabFocus - 1);
      }
      // Move down
      if (e.key === KEY_CODES.ARROW_DOWN) {
        setTabFocus(tabFocus + 1);
      }
    }
  };

  const data = useStaticQuery(graphql`
    {
      jobs: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/jobs/" }, frontmatter: { show: { eq: "true" } } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              company
              location
              range
              url
            }
            html
          }
        }
      }
    }
  `);

  const jobsData = data.jobs.edges;

  return (
    <JobsContainer id="jobs" ref={revealContainer}>
      <Heading>Work Experience</Heading>
      <TabsContainer>
        <Tabs aria-label="Job tabs" onKeyDown={onKeyDown} role="tablist">
          {jobsData &&
            jobsData.map(({ node }, i) => {
              const { company } = node.frontmatter;
              return (
                <li key={i}>
                  <Tab
                    isActive={activeTabId === i}
                    onClick={() => setActiveTabId(i)}
                    ref={el => (tabs.current[i] = el)}
                    id={`tab-${i}`}
                    role="tab"
                    aria-selected={activeTabId === i ? true : false}
                    aria-controls={`panel-${i}`}
                    tabIndex={activeTabId === i ? '0' : '-1'}>
                    <span>{company}</span>
                  </Tab>
                </li>
              );
            })}
          <Highlighter activeTabId={activeTabId} />
        </Tabs>
        <ContentContainer>
          {jobsData &&
            jobsData.map(({ node }, i) => {
              const { frontmatter, html } = node;
              const { title, url, company, range, location } = frontmatter;
              return (
                <CSSTransition key={i} in={activeTabId === i} timeout={250} classNames="fade">
                  <TabContent
                    id={`panel-${i}`}
                    isActive={activeTabId === i}
                    key={i}
                    role="tabpanel"
                    tabIndex={activeTabId === i ? '0' : '-1'}
                    aria-labelledby={`tab-${i}`}
                    aria-hidden={activeTabId !== i}>
                    <JobTitle>
                      <span>{title}</span>
                      <Company>
                        <span>&nbsp;@&nbsp;</span>
                        <ExternalLink url={url}>{company}</ExternalLink>
                      </Company>
                    </JobTitle>
                    <JobDetails>
                      <span>{range}</span>
                    </JobDetails>
                    <JobLocation>
                      <span>{location}</span>
                    </JobLocation>
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                  </TabContent>
                </CSSTransition>
              );
            })}
        </ContentContainer>
      </TabsContainer>
    </JobsContainer>
  );
};

export default Jobs;
