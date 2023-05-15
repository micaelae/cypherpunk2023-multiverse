import { ReactNode, ReactElement } from 'react';
import styled from 'styled-components';
import { CardWrapper, Title, Description, Row, Column } from './Styles';

type CardProps = {
  content: {
    title?: string;
    description?: ReactNode;
    button?: ReactElement;
    inputField?: ReactNode;
    info?: ReactNode;
    orderNumber?: number | string;
  };
  disabled?: boolean;
  fullWidth?: boolean;
};

export const TitleNumber = styled.p`
  padding-right: '20px';
  font-size: ${({ theme }) => theme.fontSizes.text};
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
  background-color: ${({ theme }) => theme.colors.background.alternative};
  padding: 10px;
  margin-left: -16px;
  border-radius: 100%;
  width: 16px;
  height: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.alternative};
`;

export const Card = ({ content, disabled = false, fullWidth }: CardProps) => {
  const { title, orderNumber, description, button, inputField, info } = content;
  return (
    <>
      <Row>
        {orderNumber !== undefined && <TitleNumber>{orderNumber}</TitleNumber>}
        {title && <Title>{title}</Title>}
      </Row>
      <CardWrapper fullWidth={fullWidth} disabled={disabled}>
        <Column style={{ width: '100%' }}>
          <span style={{ width: '100%', height: '100%', marginLeft: '1rem' }}>
            <Column>
              {description && <Description>{description}</Description>}
              {info}
              {inputField}
            </Column>
          </span>
          {button && (
            <span
              style={{
                width: '50%',
                height: '100%',
                marginTop: '24px',
                marginLeft: '1rem',
              }}
            >
              <Row>{button}</Row>
            </span>
          )}
        </Column>
      </CardWrapper>
    </>
  );
};
