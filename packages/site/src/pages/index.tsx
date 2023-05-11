import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  createFork,
  simulateTx,
  shouldDisplayReconnectButton,
  getExistingFork,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  Card,
} from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const [forkConfig, setForkConfig] = useState('');
  const [txData, setTxData] = useState(
    '{"to": "0x2121", "data": "0x12313213"}',
  );
  const [forkId, setForkId] = useState();

  const handleForkConfigChange = async (e: any) => {
    try {
      setForkConfig(e.target.value);
      await createFork(e.target.value);
    } catch (error: any) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const handleTxDataChange = (e: any) => {
    setTxData(e.target.value);
  };

  useEffect(() => {
    getExistingFork().then((f) => {
      if (f) {
        setForkId(f);
      }
    });
  }, []);

  return (
    <Container>
      <Heading>
        <Span>Multiverse</Span>
      </Heading>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}

        <Card
          fullWidth
          content={{
            title: 'Enter fork config (optional)',
            description: 'This calls a MetaMask snap to create a fork.',
            inputField: (
              <textarea
                id="forkConfig"
                value={forkConfig}
                onChange={handleForkConfigChange}
              />
            ),
            button: (
              <button
                onClick={async () => {
                  const forkResponse = await createFork([forkConfig]);
                  if (forkResponse?.forkId) {
                    setForkId(forkResponse.forkId);
                  }
                }}
              >
                Create a fork
              </button>
            ),
          }}
          disabled={!state.installedSnap}
        />

        {forkId && (
          <Card
            fullWidth
            content={{
              title: 'Simulate tx using a fork',
              description: 'Enter txData to simulate on the live fork.',
              inputField: (
                <textarea
                  id="txData"
                  value={txData}
                  onChange={handleTxDataChange}
                />
              ),
              button: (
                <button
                  onClick={async () => {
                    try {
                      await simulateTx(JSON.parse(txData));
                    } catch (e) {
                      console.error(e);
                      dispatch({
                        type: MetamaskActions.SetError,
                        payload: e,
                      });
                    }
                  }}
                >
                  Simulate and send
                </button>
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}

        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
      </CardContainer>
    </Container>
  );
};

export default Index;
