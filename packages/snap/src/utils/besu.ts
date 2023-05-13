const BESU_ENDPOINT = 'http://127.0.0.1:8545';

export const createFork = async (chainId?: number) => {
  try {
    const besuResponse = await fetch(BESU_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_createFork',
        params: [],
        id: chainId ?? 1,
      }),
    });

    const responseJson = await besuResponse.json();
    return responseJson.result;
  } catch {
    return 'testForkId';
  }
};

export const switchFork = async (forkId: string, chainId?: number) => {
  try {
    const besuResponse = await fetch(BESU_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_switchFork',
        params: [forkId],
        id: chainId ?? '',
      }),
    });

    const responseJson = await besuResponse.json();
    return responseJson.result === 'Success';
  } catch {
    return true;
  }
};
