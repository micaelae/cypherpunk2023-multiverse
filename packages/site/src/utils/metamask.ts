import * as ethers from 'ethers';
import { BESU_ENDPOINT } from './constants';
/**
 * Detect if the wallet injecting the ethereum object is Flask.
 *
 * @returns True if the MetaMask version is Flask, false otherwise.
 */
export const isFlask = async () => {
  const provider = window.ethereum;

  try {
    const clientVersion = await provider?.request({
      method: 'web3_clientVersion',
    });

    const isFlaskDetected = (clientVersion as string[])?.includes('flask');

    return Boolean(provider && isFlaskDetected);
  } catch {
    return false;
  }
};

export const switchToForkedNetwork = async () => {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: ethers.toQuantity(1553),
        chainName: 'Linea Multiverse',
        rpcUrls: [BESU_ENDPOINT],
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    ],
  });
};

export const switchToMainNetwork = async (networkDetails: any) => {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [networkDetails],
  });
};

export const sendTx = async (data: any) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  console.log('provider', await provider.getNetwork());
  const signer = await provider.getSigner();

  console.log('signer', signer);
  console.log('data', data);
  const txSubmitRes = await signer.sendTransaction(data);
  return txSubmitRes;
};

export const getChainId = async () => {
  return await window.ethereum.request({
    method: 'eth_chainId',
  });
};
