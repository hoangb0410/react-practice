import { FC } from 'react';
import styled, { keyframes } from 'styled-components';

interface IProps {
  size?: number;
  color?: string;
  thickness?: number;
}

export const Spinner: FC<IProps> = ({
  size = 16,
  color = 'currentColor',
  thickness = 2,
}) => <Ring $size={size} $color={color} $thickness={thickness} />;

const rotate = keyframes`
  to { transform: rotate(360deg); }
`;

const Ring = styled.span<{ $size: number; $color: string; $thickness: number }>`
  display: inline-block;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  border: ${({ $thickness }) => $thickness}px solid
    ${({ $color }) => `${$color}33`};
  border-top-color: ${({ $color }) => $color};
  animation: ${rotate} 0.7s linear infinite;
`;
