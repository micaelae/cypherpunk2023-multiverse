import { OnCronjobHandler, OnRpcRequestHandler } from '@metamask/snaps-types';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import {
  BESU_ENDPOINT,
  createFork,
  getLogs,
  resetEvents,
  signMerge,
  switchFork,
} from './utils/besu';

const truncate = (str: any) =>
  typeof str === 'string' ? `${str.slice(0, 5)}...${str.slice(-5)}` : str;

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param req - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async (req) => {
  console.log('req', req);
  const { request } = req;

  switch (request.method) {
    case 'get_state': {
      const state = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      return state;
    }

    case 'reset_state': {
      const state = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'update', newState: {} },
      });
      try {
        await resetEvents();
      } catch (e) {
        console.error(e);
      }
      return state;
    }

    case 'fork': {
      const state = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      const forkId = state ? state.forkId : undefined;

      if (!forkId) {
        return undefined;
      }

      await switchFork(forkId.toString());
      await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            ...state,
            forked: true,
          },
        },
      });

      return 'Switched RPC node to forked network';
    }

    case 'unfork': {
      const state = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      const forkId = state ? state.forkId : undefined;

      if (!forkId) {
        return undefined;
      }

      await switchFork();
      await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            ...state,
            forked: false,
          },
        },
      });

      return 'Reverted RPC node to unforked network';
    }

    case 'create_fork': {
      console.log('create_fork');
      const forkId = await createFork();

      console.log(forkId);
      const tradingPartner = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: panel([
            heading("Enter the wallet address you'd like to trade with"),
            text(
              'A live fork shared between you and this address will be created. Both you and this address must approve merging the forked transactions back to the main network',
            ),
          ]),
          placeholder: '0xAB601029cfA...',
        },
      });

      if (forkId && tradingPartner && typeof tradingPartner === 'string') {
        await switchFork(forkId);
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: {
              forkId,
              forked: true,
              isMergeRequested: false,
              tradingPartner,
              proposalSent: false,
              rpcUrl: BESU_ENDPOINT,
              mainNetwork: {
                chainId: 1,
                nativeCurrency: 'ETH',
              },
            },
          },
        });

        snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              heading('Successfully created a forked network'),
              text(
                "A reference to the new forked network is saved in this MetaMask snap's local storage so it can be reused",
              ),
              divider(),
              text('Hash of live fork:'),
              copyable(forkId.toString()),
              text('Trading with:'),
              copyable(tradingPartner),
            ]),
          },
        });

        try {
          await resetEvents();
        } catch (e) {
          console.error(e);
        }
      }
      return new Promise((resolve) =>
        resolve({
          forkId,
        }),
      );
    }

    case 'accept_trade_invite': {
      console.log('accept_trade_invite');

      const forkIdToJoin = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: panel([
            heading('Join trade'),
            text('Enter a valid fork hash to start transacting.'),
          ]),
          placeholder: '0xAB601029cfA...',
        },
      });
      if (!forkIdToJoin) {
        return undefined;
      }

      const tradingPartnerToJoin = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: panel([
            heading('Enter wallet address'),
            text(
              'Both you and this address must approve merging the forked transactions back to the main network',
            ),
          ]),
          placeholder: '0xAB601029cfA...',
        },
      });
      if (!tradingPartnerToJoin) {
        return undefined;
      }

      if (forkIdToJoin) {
        await switchFork(forkIdToJoin.toString());
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: {
              forkId: forkIdToJoin,
              forked: true,
              isMergeRequested: false,
              tradingPartner: tradingPartnerToJoin,
              proposalSent: false,
              rpcUrl: BESU_ENDPOINT,
              mainNetwork: {
                chainId: 1,
                nativeCurrency: 'ETH',
              },
            },
          },
        });

        snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              heading('Successfully joined a forked network'),
              text(
                "A reference to the new forked network is saved in this MetaMask snap's local storage so it can be reused",
              ),
              divider(),
              text('Hash of live fork:'),
              copyable(forkIdToJoin.toString()),
              text('Trading with:'),
              copyable(tradingPartnerToJoin.toString()),
            ]),
          },
        });
      }
      return new Promise((resolve) =>
        resolve({
          forkIdToJoin,
        }),
      );
    }

    case 'request_merge': {
      const state = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      const forkId = state ? state.forkId : undefined;
      const tradingPartner = state ? state.tradingPartner : undefined;

      console.log('request_merge', forkId, tradingPartner);
      if (!forkId || !tradingPartner) {
        return undefined;
      }

      console.log('request_merge updated state');

      const response = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading('Initiate merging live fork back to main network'),
            text(
              `Address **${truncate(
                tradingPartner,
              )}** will be prompted to approve the merge back to the main network once you confirm your request`,
            ),
            divider(),
            text('**Fork hash**'),
            copyable(forkId.toString()),
            text('**Confirmation required from**'),
            copyable(tradingPartner.toString()),
          ]),
        },
      });
      console.log('request_merge snap dialog', response);
      if (response) {
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: {
              ...state,
              isMergeRequested: true,
              proposalSent: true,
            },
          },
        });
        await signMerge(tradingPartner.toString() ?? '');
      }
      console.log('request_merge signMerge');
      break;
    }

    case 'accept_merge': {
      const state = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      const forkId = state ? state.forkId : undefined;
      const tradingPartner = state ? state.tradingPartner : undefined;
      if (!forkId || !tradingPartner) {
        return undefined;
      }

      const response = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading('Finalize merge of live fork back to main network'),
            divider(),
            text('**Fork hash**'),
            copyable(forkId.toString()),
            text('**Initiated by**'),
            copyable(tradingPartner.toString()),
          ]),
        },
      });

      if (response) {
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: {
              ...state,
              isMergeRequested: true,
            },
          },
        });
        await signMerge(tradingPartner.toString() ?? '');
      }
      break;
    }
    default:
      throw new Error('Method not found.');
  }
};

export const onCronjob: OnCronjobHandler = async (r) => {
  const { request } = r;
  const state = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
  const forkId = state ? state.forkId : undefined;
  const tradingPartner = state ? state.tradingPartner : undefined;
  const proposalSent = state ? state.proposalSent : false;
  const isMergeRequested = state ? state.isMergeRequested : false;
  if (!forkId || !tradingPartner) {
    return;
  }

  switch (request.method) {
    case 'listenForForkEvents': {
      const event = await getLogs();
      const { status: latestLog, proposer } = event;

      switch (latestLog) {
        case 'MergeProposal': {
          if (proposalSent) {
            return;
          }

          if (proposer && proposer !== tradingPartner) {
            const response = await snap.request({
              method: 'snap_dialog',
              params: {
                type: 'confirmation',
                content: panel([
                  heading('Finalize merge of live fork back to main network'),
                  text(
                    `Address **${truncate(
                      tradingPartner,
                    )}** has requested to merge the forked transactions back to the main network and needs your confirmation`,
                  ),
                  divider(),
                  text('**Fork hash**'),
                  copyable(forkId.toString()),
                  text('**Initiated by**'),
                  copyable(tradingPartner.toString()),
                ]),
              },
            });
            if (response) {
              await snap.request({
                method: 'snap_manageState',
                params: {
                  operation: 'update',
                  newState: {
                    ...state,
                    isMergeRequested: true,
                    proposalReceived: true,
                  },
                },
              });
              await signMerge(tradingPartner.toString() ?? '');
            }
          }
          break;
        }

        case 'MergeFinalized': {
          if (isMergeRequested) {
            await snap.request({
              method: 'snap_dialog',
              params: {
                type: 'alert',
                content: panel([
                  heading('The live fork has been merged to main'),
                  text(
                    `Both you and **${truncate(
                      tradingPartner,
                    )}** have agreed to merge the forked transactions back to the main network. Transactions will be reflected in the source network shortly`,
                  ),
                  divider(),
                  text('**Fork hash**'),
                  copyable(forkId.toString()),
                  text('**Merge transaction hash**'),
                  copyable(
                    '0x5ede929331d43ad40e39dfa85e29424eaa1514b886ebecbd1482df2e1da28a44',
                  ),
                ]),
              },
            });

            await snap.request({
              method: 'snap_manageState',
              params: {
                operation: 'update',
                newState: {
                  isMergeRequested: false,
                },
              },
            });
          }
          break;
        }
        default:
          break;
      }
      break;
    }
    default:
      throw new Error('Method not found.');
  }
};
