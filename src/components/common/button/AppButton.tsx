import { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { Colors } from '@/constants';
import { Spinner } from '../Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: ReactNode;
  variant?: ButtonVariant;
  width?: number | string;
  loading?: boolean;
  icon?: ReactNode;
}

interface IStyledProps {
  $variant: ButtonVariant;
  $width?: number | string;
}

export const AppButton: FC<IProps> = ({
  text,
  children,
  variant = 'primary',
  width,
  loading,
  disabled,
  icon,
  ...rest
}) => (
  <StyledButton
    $variant={variant}
    $width={width}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? <Spinner size={14} /> : icon}
    {text ?? children}
  </StyledButton>
);

const variantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'secondary':
      return css`
        background: ${Colors.white_10};
        color: ${Colors.pink_60};
        border: 1px solid ${Colors.pink_50};
        &:hover:not(:disabled) {
          background: ${Colors.pink_10};
        }
      `;
    case 'ghost':
      return css`
        background: transparent;
        color: ${Colors.gray_70};
        border: 1px solid transparent;
        &:hover:not(:disabled) {
          background: ${Colors.pink_10};
        }
      `;
    case 'danger':
      return css`
        background: ${Colors.red_10};
        color: ${Colors.white_10};
        border: 1px solid ${Colors.red_10};
        &:hover:not(:disabled) {
          background: ${Colors.red_20};
        }
      `;
    case 'primary':
    default:
      return css`
        background: ${Colors.pink_60};
        color: ${Colors.white_10};
        border: 1px solid ${Colors.pink_60};
        box-shadow: 0 2px 6px rgba(236, 64, 122, 0.25);
        &:hover:not(:disabled) {
          background: ${Colors.pink_70};
          border-color: ${Colors.pink_70};
        }
      `;
  }
};

const StyledButton = styled.button<IStyledProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${({ $width }) =>
    $width ? (typeof $width === 'number' ? `${$width}px` : $width) : '100%'};
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  ${({ $variant }) => variantStyles($variant)}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
