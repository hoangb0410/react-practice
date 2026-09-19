import { FC } from 'react';
import styled from 'styled-components';
import { Colors } from '@/constants';
import { Spinner } from './Spinner';

interface IProps {
  fullscreen?: boolean;
}

export const AppLoader: FC<IProps> = ({ fullscreen = true }) => (
  <Wrapper $fullscreen={fullscreen}>
    <Spinner size={32} color={Colors.pink_60} thickness={3} />
  </Wrapper>
);

const Wrapper = styled.div<{ $fullscreen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ $fullscreen }) =>
    $fullscreen ? 'min-height: 100vh;' : 'padding: 24px;'}
  background: ${({ $fullscreen }) =>
    $fullscreen ? Colors.white_20 : 'transparent'};
`;
