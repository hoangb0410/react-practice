import styled from 'styled-components';
import { Colors } from '@/constants';
import { AppLanguage, useLanguage } from '@/hooks';

const LANGS: { value: AppLanguage; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'vi', label: 'VI' },
];

export const LanguageSwitcher = () => {
  const { current, changeLanguage } = useLanguage();

  return (
    <Wrapper>
      {LANGS.map(({ value, label }) => (
        <Item
          key={value}
          $active={current === value}
          onClick={() => changeLanguage(value)}
        >
          {label}
        </Item>
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: ${Colors.pink_10};
  border-radius: 10px;
  border: 1px solid ${Colors.pink_20};
`;

const Item = styled.button<{ $active: boolean }>`
  border: none;
  cursor: pointer;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 7px;
  transition: all 0.15s ease;
  background: ${({ $active }) => ($active ? Colors.pink_60 : 'transparent')};
  color: ${({ $active }) => ($active ? Colors.white_10 : Colors.gray_60)};

  &:hover {
    background: ${({ $active }) => ($active ? Colors.pink_70 : Colors.pink_20)};
  }
`;
