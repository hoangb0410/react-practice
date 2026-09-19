import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { LanguageSwitcher } from '@/components';
import { Colors } from '@/constants';

export const AppLayout: FC = () => {
  return (
    <Wrapper>
      <Sidebar>Sidebar</Sidebar>
      <Main>
        <TopBar>
          <TopBarSpacer />
          <LanguageSwitcher />
        </TopBar>
        <Content>
          <Outlet />
        </Content>
      </Main>
    </Wrapper>
  );
};

const TopBarSpacer = styled.div`
  flex: 1;
`;

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${Colors.white_20};
`;

const Sidebar = styled.aside`
  width: 240px;
  background: ${Colors.white_10};
  border-right: 1px solid ${Colors.pink_20};
  padding: 24px 16px;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.header`
  height: 64px;
  background: ${Colors.white_10};
  border-bottom: 1px solid ${Colors.pink_20};
  display: flex;
  align-items: center;
  padding: 0 24px;
`;

const Content = styled.div`
  flex: 1;
  padding: 24px;
`;
