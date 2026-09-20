import { Colors } from '@/constants';
import styled from 'styled-components';

export const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: ${Colors.pink_70};
  text-align: center;
`;

export const Subtitle = styled.p`
  margin: 0 0 24px;
  font-size: 14px;
  color: ${Colors.gray_50};
  text-align: center;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FooterText = styled.p`
  margin-top: 16px;
  font-size: 13px;
  color: ${Colors.gray_60};
  text-align: center;
  a {
    color: ${Colors.pink_60};
    font-weight: 600;
    text-decoration: none;
    &:hover {
      color: ${Colors.pink_70};
    }
  }
`;

export const ForgotLink = styled.a`
  align-self: flex-end;
  font-size: 13px;
  color: ${Colors.pink_60};
  text-decoration: none;
  font-weight: 500;
  &:hover {
    color: ${Colors.pink_70};
    text-decoration: underline;
  }
`;

export const Row = styled.div`
  display: flex;
  gap: 12px;
  & > * {
    flex: 1;
    min-width: 0;
  }
`;

export const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;
export const FieldLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${Colors.gray_70};
`;
export const RequiredMark = styled.span`
  margin-left: 2px;
  color: ${Colors.red_10};
`;
export const ErrorText = styled.span`
  font-size: 12px;
  color: ${Colors.red_10};
`;
export const RoleGroup = styled.div`
  display: flex;
  gap: 12px;
`;
export const RoleCard = styled.label<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid
    ${({ $active }) => ($active ? Colors.pink_60 : Colors.pink_30)};
  background: ${({ $active }) => ($active ? Colors.pink_10 : Colors.white_10)};
  color: ${({ $active }) => ($active ? Colors.pink_70 : Colors.gray_70)};
  input {
    display: none;
  } /* ẩn radio gốc, RoleCard chính là "radio" nhìn thấy */
`;
