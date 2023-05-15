import { ComponentProps, useState } from 'react';
import styled from 'styled-components';
import { MetamaskState } from '../hooks';
import { ReactComponent as FlaskFox } from '../assets/flask_fox.svg';
import { shouldDisplayReconnectButton } from '../utils';
import { Column, Row } from './Styles';

const Link = styled.a`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  border: 1px solid ${(props) => props.theme.colors.background.inverse};
  background-color: ${(props) => props.theme.colors.background.inverse};
  color: ${(props) => props.theme.colors.text.inverse};
  text-decoration: none;
  font-weight: bold;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.background.alternative};
    color: ${(props) => props.theme.colors.text.default};
  }

  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    box-sizing: border-box;
  }
`;

export const ActionButton = styled.button`
  background: ${(props) => props.theme.colors.background.action};
  color: ${(props) => props.theme.colors.text.action};
  border: 1px solid transparent;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.background.inverse};
  color: ${(props) => props.theme.colors.text.inverse};
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
  border: 1px solid transparent;
`;

const ButtonText = styled.span`
  margin-left: 1rem;
`;

const ConnectedContainer = styled.div`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  border: 1px solid ${(props) => props.theme.colors.background.inverse};
  background-color: ${(props) => props.theme.colors.background.inverse};
  color: ${(props) => props.theme.colors.text.inverse};
  font-weight: bold;
  padding: 1.2rem;
`;

const ConnectedIndicator = styled.div`
  content: ' ';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: green;
`;

export const InstallFlaskButton = () => (
  <Link href="https://metamask.io/flask/" target="_blank">
    <FlaskFox />
    <ButtonText>Install MetaMask Flask</ButtonText>
  </Link>
);

export const ConnectButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <FlaskFox />
      <ButtonText>Connect</ButtonText>
    </Button>
  );
};

export const AddNetworkButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <FlaskFox />
      <ButtonText>Change network</ButtonText>
    </Button>
  );
};

export const ReconnectButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <FlaskFox />
      <ButtonText>Reconnect</ButtonText>
    </Button>
  );
};

export const HeaderButtons = ({
  state,
  onConnectClick,
}: {
  state: MetamaskState;
  onConnectClick(): unknown;
}) => {
  if (!state.isFlask && !state.installedSnap) {
    return <InstallFlaskButton />;
  }

  if (!state.installedSnap) {
    return <ConnectButton onClick={onConnectClick} />;
  }

  if (shouldDisplayReconnectButton(state.installedSnap)) {
    return <ReconnectButton onClick={onConnectClick} />;
  }

  return (
    <ConnectedContainer>
      <ConnectedIndicator />
      <ButtonText>Connected</ButtonText>
    </ConnectedContainer>
  );
};

const MutedButton = styled.button`
  background-color: ${(props) => props.theme.colors.background.default};
  color: ${(props) => props.theme.colors.text.default};
  width: 100%;
  height: 100%;
  display: flex;
  align-self: center;
  align-items: center;
  justify-content: center;
  margin-left: 2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
  border: 1px solid;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 10px;
  padding-right: 10px;
  font-weight: 400;
  font-family: 'Open Sans';
  font-style: normal;
  font-size: 14px;
  border-radius: ${(props) => props.theme.radii.button};
  &:hover {
    background-color: ${(props) => props.theme.colors.background.inverse};
    border: 1px solid ${(props) => props.theme.colors.background.inverse};
    color: ${(props) => props.theme.colors.text.alternative};
  }
`;

const ScrollableText = styled.div`
  width: 45rem;
  overflow: auto;
  border-radius: 0;
  border: 0px dashed ${(props) => props.theme.colors.background.alternative};
  padding: 0;
  align-contents: center;
  &::-webkit-scrollbar {
  }
  &::-webkit-scrollbar-thumb {
    background-color: transparent; /* Hide the scrollbar thumb */
  }
  color: ${(props) => props.theme.colors.text.default};
  font-size: 14px;
`;

const CopyLabel = styled.span`
  color: ${(props) => props.theme.colors.text.default};
  font-weight: 600;
  margin-right: 20px;
  margin-bottom: 4px;
`;

const SummaryStyle = styled.div`
  width: 58rem;
  height: 5rem;
  bottom: 0px;
  right: 2.4rem;
  z-index: 1;
  background: none;rgba(255, 255, 255, 0.2);
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

export const ClickToCopyButton = ({
  label,
  data,
  onResetHandler,
}: {
  label: string;
  data: any;
  onResetHandler: () => Promise<void>;
}) => {
  const dataString = data ? data.toString() : '';
  const [buttonText, setButtonText] = useState('Copy');
  return (
    <Row style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>
      <Column>
        <CopyLabel>{label}</CopyLabel>
        <ScrollableText>{dataString}</ScrollableText>
      </Column>
      <MutedButton
        onClick={() => {
          navigator.clipboard.writeText(dataString);
          setButtonText('Copied');
          setTimeout(() => setButtonText('Copy'), 1000);
        }}
      >
        {buttonText}
      </MutedButton>
      <MutedButton onClick={onResetHandler}>Reset</MutedButton>
    </Row>
  );
};

const truncate = (str: any) =>
  typeof str === 'string' ? `${str.slice(0, 26)}...${str.slice(-26)}` : str;

export const Summary = ({
  forkId,
  onResetHandler,
}: {
  forkId?: string;
  onResetHandler: () => Promise<void>;
}) => {
  return (
    <SummaryStyle>
      {forkId && (
        <ClickToCopyButton
          label="Active fork hash"
          data={truncate(forkId)}
          onResetHandler={onResetHandler}
        />
      )}
    </SummaryStyle>
  );
};
