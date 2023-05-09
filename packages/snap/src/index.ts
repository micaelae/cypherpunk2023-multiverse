import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'io':
      return new Promise((resolve) =>
        resolve({
          result: {
            origin,
            fork: 'abc123',
            request,
          },
        }),
      );
    case 'send':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading('Simulate Transaction'),
            text('Your transaction is being simulated in a forked node.'),
          ]),
        },
      });
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
