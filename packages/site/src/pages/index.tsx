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
  acceptInvite,
  switchToForkedNetwork,
  resetSnap,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  Card,
  ActionButton,
  AddNetworkButton,
  Summary,
} from '../components';
import { CardContainer, Container, ErrorMessage } from '../components/Styles';
import { FORK_CHAIN_ID } from '../utils/constants';

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

    return () => {
      window.ethereum.removeAllListeners('chainChanged');
    };
  }, []);

  useEffect(() => {
    const ab = async () => {
      setSnapState(await getSnapState());
      const chainId = await getChainId();
      chainId && setSelectedChainId(ethers.toNumber(chainId.toString()));
    };

    ab();
  }, [dispatch]);

  const { forkId, tradingPartner, proposalReceived } = snapState ?? ({} as any);

  return (
    <Container>
      <Summary
        forkId={forkId}
        onResetHandler={async () => {
          await resetSnap();
          setSnapState(await getSnapState());
        }}
      />
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}

        {!state.isFlask && (
          <Card
            content={{
              orderNumber: '',
              title: 'Install',
              info: 'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: (
                <>
                  <InstallFlaskButton />
                </>
              ),
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            fullWidth
            content={{
              orderNumber: '',
              title: 'Connect',
              info: 'Get started by connecting to and installing the example snap.',
              button: (
                <>
                  <ConnectButton
                    onClick={handleConnectClick}
                    disabled={!state.isFlask}
                  />
                </>
              ),
            }}
            disabled={!state.isFlask}
          />
        )}

        {selectedChainId !== ethers.toNumber(FORK_CHAIN_ID) && (
          <Card
            fullWidth
            content={{
              orderNumber: '',
              title: 'Add custom RPC network',
              info: 'Get started by connecting to and installing the example snap.',
              button: (
                <>
                  <AddNetworkButton
                    onClick={async () => {
                      await switchToForkedNetwork();
                      setSelectedChainId(ethers.toNumber(FORK_CHAIN_ID));
                    }}
                    disabled={!state.isFlask}
                  />
                </>
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
                  disabled={
                    !state.installedSnap ||
                    selectedChainId !== ethers.toNumber(FORK_CHAIN_ID)
                  }
                  onClick={async () => {
                    await createFork();
                    setSnapState(await getSnapState());
                  }}
                >
                  Create a live fork
                </ActionButton>
                <ActionButton
                  disabled={
                    !state.installedSnap ||
                    selectedChainId !== ethers.toNumber(FORK_CHAIN_ID)
                  }
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
          disabled={
            !state.installedSnap ||
            selectedChainId !== ethers.toNumber(FORK_CHAIN_ID)
          }
        />

        {/* forkId && (
          <Card
            fullWidth
            content={{
              title: 'Switch fork',
              orderNumber: 2,
              info: 'Change network fork to transact and view activity.',
              button: (
                <>
                  <ActionButton
                    disabled={
                      !forkId ||
                      selectedChainId !== ethers.toNumber(FORK_CHAIN_ID)
                    }
                    onClick={async () => {
                      await fork();
                      setSnapState(await getSnapState());
                    }}
                  >
                    Activate fork
                  </ActionButton>
                  <ActionButton
                    disabled={
                      !forkId ||
                      selectedChainId !== ethers.toNumber(FORK_CHAIN_ID)
                    }
                    onClick={async () => {
                      await unfork();
                      setSnapState(await getSnapState());
                    }}
                  >
                    Deactivate fork
                  </ActionButton>
                </>
              ),
            }}
            disabled={
              !state.installedSnap ||
              selectedChainId !== ethers.toNumber(FORK_CHAIN_ID)
            }
          />
          )*/}

        {
          /* forkId && window.ethereum.chainId === FORK_CHAIN_ID && */ <Card
            fullWidth
            content={{
              orderNumber: 2,
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
                  disabled={!tradingPartner}
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
            disabled={
              !state.installedSnap ||
              selectedChainId !== ethers.toNumber(FORK_CHAIN_ID)
            }
          />
        }

        {
          /* forkId && window.ethereum.chainId === FORK_CHAIN_ID && */ <Card
            fullWidth
            content={{
              orderNumber: 3,
              title: 'Merge fork',
              description:
                'This broadcasts a transaction to trade participants that the fork should be merged back into the main chain.',
              info: 'Participants will need to confirm the request in order to finalize the merge.',
              button: (
                <>
                  <ActionButton
                    disabled={
                      !forkId ||
                      selectedChainId !== ethers.toNumber(FORK_CHAIN_ID)
                    }
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
            disabled={
              !state.installedSnap ||
              selectedChainId !== ethers.toNumber(FORK_CHAIN_ID)
            }
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
