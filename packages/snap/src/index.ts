import { OnCronjobHandler, OnRpcRequestHandler } from '@metamask/snaps-types';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { createFork, getLogs, resetEvents, signMerge } from './utils/besu';

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
              'A live fork shared between you and this address will be created. Both you and this address must approve merging the forked transactions back to the main network.',
            ),
          ]),
          placeholder: '0x123...',
        },
      });

      if (forkId && tradingPartner && typeof tradingPartner === 'string') {
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: {
              forkId,
              isMergeRequested: false,
              tradingPartner,
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
              `Address ${tradingPartner} will be prompted to approve the merge back to the main network once your request has been confirmed.`,
            ),
            divider(),
            text('Fork hash:'),
            copyable(forkId.toString()),
            text('Forked network:'),
            copyable(((state as any).mainNetwork as any).chainId.toString()),
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
            },
          },
        });
        await signMerge(`TODO${tradingPartner ?? ''}`);
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
      if (!forkId) {
        return undefined;
      }

      const response = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading('Finalize merge of live fork back to main network'),
            divider(),
            text('Fork hash:'),
            copyable(forkId.toString()),
            text('Main network:'),
            copyable(((state as any).mainNetwork as any).chainId.toString()),
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
        await signMerge(`TODO${tradingPartner ?? ''}`);
      }
      break;
    }
    default:
      throw new Error('Method not found.');
  }
};

export const onCronjob: OnCronjobHandler = async (r) => {
  const { request } = r;
  console.log(r, request, origin);
  const state = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
  const forkId = state ? state.forkId : undefined;
  const tradingPartner = state ? state.tradingPartner : undefined;
  if (!forkId || !tradingPartner) {
    return;
  }

  switch (request.method) {
    case 'listenForForkEvents': {
      const event = await getLogs();
      const latestLog = event?.[0];

      switch (latestLog) {
        case 'MergeProposal': {
          const response = await snap.request({
            method: 'snap_dialog',
            params: {
              type: 'confirmation',
              content: panel([
                heading('Finalize merge of live fork back to main network'),
                text(
                  `Address ${tradingPartner} has requested to merge the forked transactions back to the main network and needs your confirmation.`,
                ),
                divider(),
                text('Fork hash:'),
                copyable(forkId.toString()),
                text('Main network:'),
                copyable(
                  ((state as any).mainNetwork as any).chainId.toString(),
                ),
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
            await signMerge(`TODO${tradingPartner ?? ''}`);
          }
          break;
        }

        case 'MergeFinalized': {
          await snap.request({
            method: 'snap_dialog',
            params: {
              type: 'alert',
              content: panel([
                heading('The live fork has been merged to main'),
                text(
                  `Both you and ${tradingPartner} have agreed to merge the forked transactions back to the main network. Transactions will be reflected in the source network`,
                ),
                divider(),
                text('Fork hash:'),
                copyable(forkId.toString()),
                text('Main network:'),
                copyable(
                  ((state as any).mainNetwork as any).chainId.toString(),
                ),
              ]),
            },
          });

          await snap.request({
            method: 'snap_manageState',
            params: {
              operation: 'update',
              newState: {},
            },
          });
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
