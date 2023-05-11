import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param req - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async (req) => {
  const { request } = req;

  switch (request.method) {
    case 'get_fork': {
      const state = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      const forkId = state ? state.forkId : undefined;
      return forkId;
    }

    case 'create_fork': {
      // TODO this should create a fork
      const forkId = 'testForkId';
      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'update', newState: { forkId } },
      });

      snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: panel([
            heading('Created a fork'),
            text(
              "A reference to the new fork is saved in this MetaMask snap's local storage so it can be reused",
            ),
            text('Click below to copy the forkId to your clipboard'),
            copyable(forkId),
          ]),
        },
      });
      return new Promise((resolve) =>
        resolve({
          forkId,
        }),
      );
    }

    case 'simulate_tx': {
      const state = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      const forkId = state ? state.forkId : undefined;

      // TODO this should simulate request.params in fork forkId
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: panel([
            heading('Simulate Transaction'),
            text(
              `Your transaction will be simulated in a forked node:${forkId}`,
            ),
            divider(),
            text(`Transaction details: ${JSON.stringify(req.request.params)}`),
          ]),
        },
      });
    }
    default:
      throw new Error('Method not found.');
  }
};

// onTransaction https://docs.metamask.io/snaps/reference/exports#ontransaction
// Execute data in forks

/*
export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}) => {
  const insights = [];
  return {
    content: panel([
      heading('My Transaction Insights'),
      text('Here are the insights:'),
      ...(insights.map((insight) => text(insight.value)))
    ])
  };
};
*/
