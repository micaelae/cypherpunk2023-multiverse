import { useContext, useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  createFork,
  shouldDisplayReconnectButton,
  sendTx,
  switchToForkedNetwork,
  requestMerge,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  Card,
  ProposeMergeButton,
} from '../components';
import { FORK_CHAIN_ID } from '../utils/constants';

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
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const [txData, setTxData] = useState(
    JSON.stringify({
      data: '0x5f57552900000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000136f70656e4f6365616e46656544796e616d696300000000000000000000000000000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000023375dc1560800000000000000000000000000000000000000000000000000f2d01633d368ee84000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000004f94ae6af800000000000000000000000000f326e4de8f66a0bdc0970b79e0924e33c79f1915000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e46b58f2f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023375dc1560800000000000000000000000000000000000000000000000000f2d01633d368ee8400000000000000000000000000000000000000000000000000000000000000a000000000000000000000000074de5d4fcbf63e00296fd95d33236b979401663100000000000000000000000000000000000000000000000000000000000000018000c800000000003b6d0340682831244b0e97946abc52cb1893cce398de3a350000000000000000000000000000000000000000000000000000000001d7',
      from: '0x141d32a89a1e0a5ef360034a2f60a4b917c18838',
      to: '0x881D40237659C251811CEC9c364ef91dC08D300C',
      value: '10000000000000000',
    }),
  );
  const [forkId, setForkId] = useState();

  const handleTxDataChange = (e: any) => {
    setTxData(e.target.value);
  };

  return (
    <Container>
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

        {forkId && <p>Live Fork: {forkId}</p>}

        <Card
          fullWidth
          content={{
            title: 'Initiate a trade',
            description:
              'This creates a fork in which transactions will be executed between the specified wallets.',
            button: (
              <button
                onClick={async () => {
                  const forkResponse = await createFork();
                  if (forkResponse?.forkId) {
                    setForkId(forkResponse.forkId);
                  }
                }}
              >
                Create a live fork to start trading
              </button>
            ),
          }}
          disabled={!state.installedSnap}
        />

        {forkId && (
          <Card
            fullWidth
            content={{
              title: 'Switch network',
              description: 'This switches the network to the forked node.',
              button: (
                <button
                  onClick={async () => {
                    await switchToForkedNetwork();
                  }}
                >
                  Switch to forked network
                </button>
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}

        {
          /* forkId && window.ethereum.chainId === FORK_CHAIN_ID && */ <Card
            fullWidth
            content={{
              title: 'Send tx',
              description: `Use the MetaMask extension to send 0.01 ETH to 0xAB86EB1D48D1Ad42063c23F8427ebD3601029cfA on current network.`,
              button: (
                <button
                  onClick={async () => {
                    try {
                      await sendTx({
                        to: '0xAB86EB1D48D1Ad42063c23F8427ebD3601029cfA',
                        value: ethers.toQuantity('10000000000000000'),
                      });
                    } catch (e) {
                      dispatch({
                        type: MetamaskActions.SetError,
                        payload: e,
                      });
                    }
                  }}
                >
                  Send funds to 0xAB86EB1D48D1Ad42063c23F8427ebD3601029cfA
                </button>
              ),
            }}
            disabled={!state.installedSnap}
          />
        }

        {forkId && (
          <Card
            fullWidth
            content={{
              title: 'Propose live fork merge',
              description:
                'This broadcasts a transaction to trade participants that the fork should be merged back into the main chain.',
              button: (
                <ProposeMergeButton
                  fullWidth
                  onClick={async () => {
                    try {
                      await requestMerge();
                    } catch (e) {
                      dispatch({
                        type: MetamaskActions.SetError,
                        payload: e,
                      });
                    }
                  }}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}

        {/* TODO: Only show this if chainId is still on fork and not on main chain*/}
        {forkId && (
          <Card
            fullWidth
            content={{
              title: 'Switch network to main',
              description:
                'This switches the network back to the main network.',
              button: (
                <button
                  onClick={async () => {
                    await switchToForkedNetwork();
                  }}
                >
                  Switch to main network
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
