import { ReactNode, ReactElement } from 'react';
import { CardWrapper, Title, Description, Row, Column } from './Styles';

type CardProps = {
  content: {
    title?: string;
    description: ReactNode;
    button?: ReactElement;
    inputField?: ReactNode;
    info?: ReactNode;
  };
  disabled?: boolean;
  fullWidth?: boolean;
};

export const Card = ({ content, disabled = false, fullWidth }: CardProps) => {
  const { title, description, button, inputField, info } = content;
  return (
    <CardWrapper fullWidth={fullWidth} disabled={disabled}>
      <Row>
        <span style={{ width: '60%', height: '100%' }}>
          <Column>
            {title && <Title>{title}</Title>}
            <Description>{description}</Description>
            {info}
            {inputField}
          </Column>
        </span>
        {button && (
          <span style={{ width: '30%', height: '100%' }}>
            <Column>{button}</Column>
          </span>
        )}
      </Row>
    </CardWrapper>
  );
};
