export const BESU_ENDPOINT = 'https://hackathon-multiverse.dev.infura.org';
// export const BESU_ENDPOINT = 'http://127.0.0.1:8545';
const EVENTS_HOST = 'http://127.0.0.1:3001';

export const createFork = async (chainId?: number) => {
  try {
    const besuResponse = await fetch(BESU_ENDPOINT, {
      mode: 'cors',
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
    // curl --location --request POST 'http://127.0.0.1:8545' --header 'Content-Type: text/plain' --data-raw '{"jsonrpc":"2.0","method":"eth_createFork","params":[], "id":1}'

    const responseJson = await (await besuResponse).json();
    return responseJson.result;
  } catch (e) {
    console.error(e);
    return 'testForkId';
  }
};

export const switchFork = async (forkId = '') => {
  try {
    const besuResponse = await fetch(BESU_ENDPOINT, {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_switchFork',
        params: [forkId],
        id: 1,
      }),
    });

    // curl --location --request POST 'http://127.0.0.1:8545' --header 'Content-Type: text/plain' --data-raw '{"jsonrpc":"2.0","method":"eth_switchFork","params":["0xafaa034faceb798ddd5566d456583d312696849cca3d1c5bdec9eaf8aa94d9ad"], "id":1}'
    // curl --location --request POST 'http://127.0.0.1:8545' --header 'Content-Type: text/plain' --data-raw '{"jsonrpc":"2.0","method":"eth_switchFork","params":[""], "id":1}'
    const responseJson = await besuResponse.json();
    return responseJson.result === 'Success';
  } catch {
    return true;
  }
};

export const getLogs = async () => {
  try {
    const eventsResponse = await fetch(`${EVENTS_HOST}/logs`, {
      method: 'GET',
    });
    const responseText = await eventsResponse.text();
    return [responseText];
  } catch {
    return [];
  }
};

export const signMerge = async (address: string) => {
  try {
    const eventsResponse = await fetch(`${EVENTS_HOST}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
      }),
    });
    const responseText = await eventsResponse.text();
    return [responseText];
  } catch {
    return [];
  }
};

export const resetEvents = async () => {
  try {
    const eventsResponse = await fetch(`${EVENTS_HOST}/reset`, {
      method: 'POST',
    });
    console.log(eventsResponse);
    const responseText = await eventsResponse.text();
    return responseText === 'Success';
  } catch (e) {
    console.error(e);
    return true;
  }
};

// curl -X POST --data '{"jsonrpc":"2.0","id":1,"method":"eth_subscribe","params":["newHeads"]}' https://YOUR_ETH_NODE_URL

// curl --location --request POST 'http://127.0.0.1:8545' --header 'Content-Type: text/plain' --data-raw '{"jsonrpc":"2.0","method":"eth_subscribe","params":["logs"], "id":1}'

// ./gradlew installDist --refresh-dependencies
// cd build/install/besu ; ./build/install/besu/bin/besu --config-file=./config.toml --data-path=./data --data-storage-format=BONSAI --network-id=1553
