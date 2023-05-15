import { useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  createFork,
  sendTx,
  switchToForkedNetwork,
  requestMerge,
  getSnapState,
  getChainId,
  switchToMainNetwork,
  acceptMerge,
  unfork,
  fork,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  Card,
  SubTitle,
  SmallText,
} from '../components';
import {
  CardContainer,
  Container,
  ErrorMessage,
  Row,
} from '../components/Styles';
import { FORK_CHAIN_ID } from '../utils/constants';

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

  const [snapState, setSnapState] = useState();
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>();

  useEffect(() => {
    window.ethereum.on(
      'chainChanged',
      (chainId) =>
        chainId && setSelectedChainId(ethers.toNumber(chainId.toString())),
    );
  }, []);

  useEffect(() => {
    const ab = async () => {
      setSnapState(await getSnapState());
      const chainId = await getChainId();
      chainId && setSelectedChainId(ethers.toNumber(chainId.toString()));
    };
    ab();
  }, [dispatch]);

  // {"forkId":"0xafaa034faceb798ddd5566d456583d312696849cca3d1c5bdec9eaf8aa94d9ad","isMergeRequested":false,"tradingPartner":"0xAB86EB1D48D1Ad42063c23F8427ebD3601029cfA","mainNetwork":{"chainId":1,"nativeCurrency":"ETH"}}
  const {
    forkId,
    tradingPartner,
    rpcUrl,
    proposalReceived,
    forked,
    proposalSent,
  } = snapState ?? ({} as any);

  return (
    <Container>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {
          <>
            {rpcUrl && (
              <Row>
                <SubTitle>RPC URL</SubTitle>
                <SmallText> {rpcUrl}</SmallText>
              </Row>
            )}
            {forkId && (
              <Row>
                <SubTitle>Live fork hash</SubTitle>
                <SmallText>{forkId}</SmallText>
              </Row>
            )}
            {forkId && (
              <Row>
                <SubTitle>Fork status</SubTitle>
                <SmallText>{forked ? 'Active' : 'Inactive'}</SmallText>
              </Row>
            )}
            {selectedChainId && (
              <Row>
                <SubTitle>Connected chainId</SubTitle>
                <SmallText>{selectedChainId}</SmallText>
              </Row>
            )}
            {tradingPartner && (
              <Row>
                <SubTitle>Trade participant</SubTitle>
                <SmallText>{tradingPartner}</SmallText>
              </Row>
            )}
            {forkId && (
              <Row>
                <SubTitle>Merge status</SubTitle>
                <SmallText>
                  {proposalSent ? 'Awaiting confirmation' : 'Unmerged'}
                </SmallText>
              </Row>
            )}
          </>
        }

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
            fullWidth
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
            title: '1. Prepare network',
            description:
              'This step creates a fork where participating wallets can execute transactions.',
            info: 'You will have the option to specify a wallet address to trade with, which will need to confirm the merge request before transactions are reflected in the main network.',
            button: (
              <button
                onClick={async () => {
                  await createFork();
                  setSnapState(await getSnapState());
                }}
              >
                Create a live fork
              </button>
            ),
          }}
          disabled={!state.installedSnap}
        />
        {/* TODO connect to live fork for user2 */}
        {
          /* forkId && window.ethereum.chainId === FORK_CHAIN_ID && */ <Card
            fullWidth
            content={{
              title: '2. Send tx',
              description: tradingPartner
                ? `This opens the MetaMask extension to send 0.01 ETH to ${tradingPartner} on the current network.`
                : undefined,
              info: tradingPartner
                ? 'Alternatively, you can connect the MetaMask extension to any Dapp.'
                : 'Use the MetaMask extension to execute any transaction on current network',
              button: (
                <button
                  onClick={async () => {
                    try {
                      await sendTx({
                        to:
                          tradingPartner ??
                          '0xAB86EB148D1Ad42063c23F8427ebD3601029cfA',
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
                  Transact
                </button>
              ),
            }}
            disabled={!state.installedSnap}
          />
        }

        {
          /* forkId && window.ethereum.chainId === FORK_CHAIN_ID && */ <Card
            fullWidth
            content={{
              title: '3. Merge live fork',
              description:
                'This broadcasts a transaction to trade participants that the fork should be merged back into the main chain.',
              info: 'Participants will need to confirm the request in order to finalize the merge.',
              button: (
                <>
                  <button
                    onClick={async () => {
                      try {
                        if (proposalReceived) {
                          await acceptMerge();
                        } else {
                          await requestMerge();
                        }
                        setSnapState(await getSnapState());
                      } catch (e) {
                        dispatch({
                          type: MetamaskActions.SetError,
                          payload: e,
                        });
                      }
                    }}
                  >
                    {proposalReceived ? 'Confirm merge' : 'Propose merge'}
                  </button>
                </>
              ),
            }}
            disabled={!state.installedSnap}
          />
        }

        {forkId && (
          <Card
            fullWidth
            content={{
              description: 'Change network fork to transact and view activity',
              button: (
                <>
                  <button
                    onClick={async () => {
                      forked ? await unfork() : await fork();
                      setSnapState(await getSnapState());
                    }}
                  >
                    {forked ? 'Unfork' : 'Fork'}
                  </button>
                </>
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
