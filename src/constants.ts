export const PERMIT2_MAPPING: { readonly [key: number]: string } = {
  1: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  5: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  10: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  137: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  420: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  42161: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  421613: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  421614: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  12341234: "0x000000000022d473030f116ddee9f6b43ac78ba3",
};

export const ORDER_QUOTER_MAPPING: { readonly [key: number]: string } = {
  1: "0x56e43695d183dcFa9D8fE95E796227A491627Fd9",
  5: "0x54539967a06Fc0E3C3ED0ee320Eb67362D13C5fF",
  10: "0x9244aeAE36f34d63244EDCF9fdb58C03cE4Ce12d",
  137: "0x54539967a06Fc0E3C3ED0ee320Eb67362D13C5fF",
  420: "0xB9e40a5380cEd5217DD035A4F2D71739bbea0c6E",
  42161: "0x9244aeAE36f34d63244EDCF9fdb58C03cE4Ce12d",
  421613: "0xf91dA8728Ff16e044C8cea5281613F33aE4D24f8",
  421614: "0xc08fbEEd30a00098059EAd072D4b6bAA0CcB4cbE",
  12341234: "0xbea0901A41177811b099F787D753436b2c47690E",
};

export const EXCLUSIVE_FILLER_VALIDATION_MAPPING: {
  readonly [key: number]: string;
} = {
  1: "0x8A66A74e15544db9688B68B06E116f5d19e5dF90",
  5: "0x0000000000000000000000000000000000000000",
  12341234: "0x8A66A74e15544db9688B68B06E116f5d19e5dF90",
};

export const CONTRACT_START_BLOCK: {
  readonly [key: number]: number;
} = {
  10: 111049629,
  42161: 132837528,
  421613: 41110604
}

export enum KNOWN_EVENT_SIGNATURES {
  ERC20_TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
}

export enum OrderType {
  Dutch = "Dutch",
}

type Reactors = {
  [key in OrderType]: string;
};

type ReactorMapping = { readonly [key: number]: Reactors };
type ReverseReactorMapping = {
  [key: string]: { chainId: number; orderType: OrderType };
};

export const REACTOR_ADDRESS_MAPPING: ReactorMapping = {
  1: {
    [OrderType.Dutch]: "0x3C53c04d633bec3fB0De3492607C239BF92d07f9",
  },
  5: {
    [OrderType.Dutch]: "0x6000da47483062A0D734Ba3dc7576Ce6A0B645C4",
  },
  10: {
    [OrderType.Dutch]: "0x98169248bDf25E0e297EA478Ab46ac24058Fac78",
  },
  137: {
    [OrderType.Dutch]: "0x6000da47483062A0D734Ba3dc7576Ce6A0B645C4",
  },
  420: {
    [OrderType.Dutch]: "0xC79A3da4107DE6c22bEd13E3f09a1379D49f2189",
  },
  42161: {
    [OrderType.Dutch]: "0x6D81571B4c75CCf08bD16032D0aE54dbaff548b0",
  },
  421613: {
    [OrderType.Dutch]: "0xa7C007078CbEB6E0DF56A117752b4f44f4F93187",
  },
  421614: {
    [OrderType.Dutch]: "0x1456a1897509Bb9A42610d8fF5FE869D2612C181",
  },
  12341234: {
    [OrderType.Dutch]: "0xbD7F9D0239f81C94b728d827a87b9864972661eC",
  },
};

// https://github.com/mds1/multicall
export const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

export const REVERSE_REACTOR_MAPPING: ReverseReactorMapping = Object.entries(
  REACTOR_ADDRESS_MAPPING
).reduce((acc: ReverseReactorMapping, [chainId, orderTypes]) => {
  for (const [orderType, reactorAddress] of Object.entries(orderTypes)) {
    // lowercase for consistency when parsing orders
    acc[reactorAddress.toLowerCase()] = {
      chainId: parseInt(chainId),
      orderType: OrderType[orderType as keyof typeof OrderType],
    };
  }

  return acc;
}, {});

export const BPS = 10000;

export enum ChainId {
  ARBITRUM_ONE = 42161,
  OPTIMISM = 10,
  ARBITRUM_SEPOLIA = 421614,
  ETHEREUM_MAINNET = 1
}

export const SUPPORTED_CHAINS = [
  ChainId.ARBITRUM_ONE,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM_SEPOLIA,
  ChainId.ETHEREUM_MAINNET
]

export const ORDER_MINIMUM: { readonly [x: number]: { [token: string]: string }  } = {
  [ChainId.ETHEREUM_MAINNET]: {
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': '2200000000000000', // WETH
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '5000000', // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f': '5000000000000000000', // DAI
    '0xdac17f958d2ee523a2206206994597c13d831ec7': '5000000', // USDT
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': '15000', // WBTC
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    '0x175a6d830579cacf1086ecc718fab2a86b12e0d3': '2200000000000000', // WETH
    '0xe39Ab88f8A4777030A534146A9Ca3B52bd5D43A3': '2200000000000000', // Another WETH
    '0x34cB584d2E4f3Cd37e93A46A4C754044085439b4': '5000000000000000000', // USDC
    '0xb37b4399880AfEF7025755d65C193363966b8b89': '5000000000000000000', // DAI
    '0x6ABc1231d85D422c9Fe25b5974B4C0D4AB85d9b5': '5000000000000000000', // USDT
    '0x710c1A969cbC8ab5644571697824c655ffBDE926': '150000000000000', // WBTC
    '0x8B5106a83d6324878375199c695381Bea09E01c4': '4000000000000000000' // ARB
  },
  [ChainId.ARBITRUM_ONE]: {
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': '2200000000000000', // WETH
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': '5000000', // USDC
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8': '5000000', // USDC.e
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': '5000000000000000000', // DAI
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': '5000000', // USDT
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f': '15000', // WBTC
    '0x912CE59144191C1204E64559FE8253a0e49E6548': '4000000000000000000', // ARB
  },
  [ChainId.OPTIMISM]: {
    '0x4200000000000000000000000000000000000006': '2200000000000000',
    '0x4200000000000000000000000000000000000042': '3000000000000000000',
    '0x68f180fcCe6836688e9084f035309E29Bf0A2095': '15000',
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607': '5000000',
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': '5000000000000000000',
    '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58': '5000000',
  },
};
