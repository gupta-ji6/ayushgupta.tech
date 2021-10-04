import styled from 'styled-components';

const Main = styled.main`
  ${({ theme }) => theme.mixins.sidePadding};
  margin: 0 auto;
  width: 100%;
`;

export default Main;
