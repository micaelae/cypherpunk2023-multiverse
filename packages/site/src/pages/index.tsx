import { useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  createFork,
  sendTx,
  requestMerge,
  getSnapState,
  getChainId,
  acceptMerge,
  unfork,
  fork,
  acceptInvite,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  Card,
  SubTitle,
  SmallText,
  ActionButton,
} from '../components';
import {
  CardContainer,
  Container,
  ErrorMessage,
  Row,
} from '../components/Styles';

const truncate = (str: any) =>
  typeof str === 'string' ? `${str.slice(0, 5)}...${str.slice(-5)}` : str;

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
            orderNumber: 1,
            title: 'Prepare network',
            description:
              'This step initializes a live fork connection where participating wallets can execute transactions.',
            info: 'You will have the option to specify a wallet address to trade with, which will need to confirm the merge request before transactions are reflected in the main network.',
            button: (
              <>
                <ActionButton
                  onClick={async () => {
                    await createFork();
                    setSnapState(await getSnapState());
                  }}
                >
                  Create a live fork
                </ActionButton>
                <ActionButton
                  onClick={async () => {
                    await acceptInvite();
                    setSnapState(await getSnapState());
                  }}
                >
                  Join a live fork
                </ActionButton>
              </>
            ),
          }}
          disabled={!state.installedSnap}
        />

        {forkId && (
          <Card
            fullWidth
            content={{
              title: 'Switch fork',
              orderNumber: 2,
              info: 'Change network fork to transact and view activity.',
              button: (
                <>
                  <ActionButton
                    onClick={async () => {
                      forked ? await unfork() : await fork();
                      setSnapState(await getSnapState());
                    }}
                  >
                    {forked ? 'Unfork' : 'Fork'}
                  </ActionButton>
                </>
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}

        {
          /* forkId && window.ethereum.chainId === FORK_CHAIN_ID && */ <Card
            fullWidth
            content={{
              orderNumber: 3,
              title: 'Send tx',
              description: tradingPartner
                ? `This opens the MetaMask extension to send 0.01 ETH to ${truncate(
                    tradingPartner,
                  )} on the current network.`
                : undefined,
              info: tradingPartner
                ? 'Alternatively, you can connect the MetaMask extension to any Dapp or build your own transaction using the extension.'
                : 'Use the MetaMask extension to execute any transaction on current network',
              button: (
                <ActionButton
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
                </ActionButton>
              ),
            }}
            disabled={!state.installedSnap}
          />
        }

        {
          /* forkId && window.ethereum.chainId === FORK_CHAIN_ID && */ <Card
            fullWidth
            content={{
              orderNumber: 4,
              title: 'Merge fork',
              description:
                'This broadcasts a transaction to trade participants that the fork should be merged back into the main chain.',
              info: 'Participants will need to confirm the request in order to finalize the merge.',
              button: (
                <>
                  <ActionButton
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
                  </ActionButton>
                </>
              ),
            }}
            disabled={!state.installedSnap}
          />
        }
      </CardContainer>
      {/*
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
          */}
    </Container>
  );
};

export default Index;
