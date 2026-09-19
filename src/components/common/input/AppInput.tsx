import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';
import { Colors } from '@/constants';

interface IProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'prefix'
> {
  label?: ReactNode;
  errors?: string;
  suffix?: ReactNode;
  prefix?: ReactNode;
}

interface IStyledProps {
  $hasError?: boolean;
}

export const AppInput = forwardRef<HTMLInputElement, IProps>(
  ({ label, errors, suffix, prefix, ...rest }, ref) => (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <InputBox $hasError={!!errors}>
        {prefix}
        <StyledInput ref={ref} {...rest} />
        {suffix}
      </InputBox>
      {errors && <ErrorText>{errors}</ErrorText>}
    </Wrapper>
  )
);

AppInput.displayName = 'AppInput';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${Colors.gray_70};
`;

const InputBox = styled.div<IStyledProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid
    ${({ $hasError }) => ($hasError ? Colors.red_10 : Colors.pink_30)};
  border-radius: 10px;
  background: ${Colors.white_10};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:focus-within {
    border-color: ${({ $hasError }) =>
      $hasError ? Colors.red_10 : Colors.pink_60};
    box-shadow: 0 0 0 3px
      ${({ $hasError }) =>
        $hasError ? 'rgba(255, 122, 138, 0.18)' : 'rgba(236, 64, 122, 0.15)'};
  }
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: ${Colors.black_20};

  &::placeholder {
    color: ${Colors.gray_40};
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${Colors.red_10};
`;
