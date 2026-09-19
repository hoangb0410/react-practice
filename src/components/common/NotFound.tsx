import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Colors, ROUTES } from '@/constants';

export const NotFound = () => (
  <Wrapper>
    <Code>404</Code>
    <Message>Page not found</Message>
    <HomeLink to={ROUTES.ROOT}>Go home</HomeLink>
  </Wrapper>
);

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: ${Colors.white_20};
`;

const Code = styled.div`
  font-size: 72px;
  font-weight: 700;
  color: ${Colors.pink_60};
`;

const Message = styled.div`
  font-size: 16px;
  color: ${Colors.gray_60};
`;

const HomeLink = styled(Link)`
  margin-top: 8px;
  color: ${Colors.pink_60};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    color: ${Colors.pink_70};
  }
`;
