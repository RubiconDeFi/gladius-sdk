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
  ARBITRUM_GOERLI = 421613,
  OPTIMISM = 10,
  ARBITRUM_SEPOLIA = 421614
}

export const SUPPORTED_CHAINS = [
  ChainId.ARBITRUM_ONE,
  ChainId.ARBITRUM_GOERLI,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM_SEPOLIA
]