import { css } from 'styled-components';
import media from './media';

const mixins = {
  flexCenter: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `,

  flexBetween: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,

  outline: css`
    outline: 1px solid red;
  `,

  link: css`
    display: inline-block;
    text-decoration: none;
    text-decoration-skip-ink: auto;
    color: inherit;
    position: relative;
    transition: ${({ theme }) => theme.transition};
    cursor: pointer;
    &:hover,
    &:active,
    &:focus {
      color: ${({ theme }) => theme.colors.green};
      outline: 0;
    }
  `,

  inlineLink: css`
    display: inline-block;
    text-decoration: none;
    text-decoration-skip-ink: auto;
    position: relative;
    transition: ${({ theme }) => theme.transition};
    cursor: pointer;
    color: ${({ theme }) => theme.colors.green};
    &:hover,
    &:focus,
    &:active {
      color: ${({ theme }) => theme.colors.green};
      outline: 0;
      &:after {
        width: 100%;
      }
    }
    &:after {
      content: '';
      display: block;
      width: 0;
      height: 1px;
      position: relative;
      bottom: 0.37em;
      background-color: ${({ theme }) => theme.colors.green};
      transition: ${({ theme }) => theme.transition};
      opacity: 0.5;
    }
  `,

  button: css`
    color: ${({ theme }) => theme.colors.green};
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.colors.green};
    border-radius: ${({ theme }) => theme.borderRadius};
    font-size: ${({ theme }) => theme.fontSizes.small};
    font-family: ${({ theme }) => theme.fonts.SFMono};
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    transition: ${({ theme }) => theme.transition};
    padding: 1.25rem 1.75rem;
    &:hover,
    &:focus,
    &:active {
      background-color: ${({ theme }) => theme.colors.transGreen};
      outline: none;
    }
    &:after {
      display: none !important;
    }
  `,

  smallButton: css`
    color: ${({ theme }) => theme.colors.green};
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.colors.green};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: 0.75rem 1rem;
    font-size: ${({ theme }) => theme.fontSizes.smallish};
    font-family: ${({ theme }) => theme.fonts.SFMono};
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    transition: ${({ theme }) => theme.transition};
    &:hover,
    &:focus,
    &:active {
      background-color: ${({ theme }) => theme.colors.transGreen};
    }
    &:after {
      display: none !important;
    }
  `,

  bigButton: css`
    color: ${({ theme }) => theme.colors.green};
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.colors.green};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: 1.25rem 1.75rem;
    font-size: ${({ theme }) => theme.fontSizes.small};
    font-family: ${({ theme }) => theme.fonts.SFMono};
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    transition: ${({ theme }) => theme.transition};
    &:hover,
    &:focus,
    &:active {
      background-color: ${({ theme }) => theme.colors.transGreen};
    }
    &:after {
      display: none !important;
    }
  `,

  sidePadding: css`
    padding: 0 150px;
    ${media.desktop`padding: 0 100px;`};
    ${media.tablet`padding: 0 50px;`};
    ${media.phablet`padding: 0 25px;`};
  `,

  boxShadow: css`
    box-shadow: 0 10px 30px -15px ${({ theme }) => theme.colors.shadowNavy};
    transition: ${({ theme }) => theme.transition};

    &:hover,
    &:focus {
      box-shadow: 0 20px 30px -15px ${({ theme }) => theme.colors.shadowNavy};
    }
  `,

  hr: css`
    margin: 30px 0;
    border: 0;
    border-bottom: 2px dashed ${({ theme }) => theme.colors.slate};
  `,

  resetList: css`
    list-style: none;
    padding: 0;
    margin: 0;
  `,
};

export default mixins;
