import { FC } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { LanguageSwitcher } from '@/components';
import { Colors, ROUTES } from '@/constants';
import { useReduxUser } from '@/redux';

/** Layout for public auth pages. Signed-in users are sent back to the app. */
export const AuthLayout: FC = () => {
  const { user } = useReduxUser();

  if (user) {
    return <Navigate to={ROUTES.ROOT} replace />;
  }

  return (
    <Wrapper>
      <TopRight>
        <LanguageSwitcher />
      </TopRight>
      <Card>
        <Outlet />
      </Card>
    </Wrapper>
  );
};

const TopRight = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${Colors.white_20};
  padding: 24px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 440px;
  padding: 36px;
  background: ${Colors.white_10};
  border-radius: 16px;
  border: 1px solid ${Colors.pink_20};
`;
