export const PERMIT2_MAPPING: { readonly [key: number]: string } = {
  1: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  5: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  10: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  137: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  420: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  42161: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  421613: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  12341234: "0x000000000022d473030f116ddee9f6b43ac78ba3",
};

export const ORDER_QUOTER_MAPPING: { readonly [key: number]: string } = {
  1: "0x54539967a06Fc0E3C3ED0ee320Eb67362D13C5fF",
  5: "0x54539967a06Fc0E3C3ED0ee320Eb67362D13C5fF",
  10: "0xa09C8b16E3D630e2dA102AfA2433E2f9C5c37B53",
  137: "0x54539967a06Fc0E3C3ED0ee320Eb67362D13C5fF",
  420: "0xB9e40a5380cEd5217DD035A4F2D71739bbea0c6E",
  42161: "0x953f4b11F43A66F26D6585c4C7817C4de9332d40",
  421613: "0x0E07C6809B80e0F84Df3f360e3DB1fb15744c5E3",
  12341234: "0xbea0901A41177811b099F787D753436b2c47690E",
};

export const EXCLUSIVE_FILLER_VALIDATION_MAPPING: {
  readonly [key: number]: string;
} = {
  1: "0x8A66A74e15544db9688B68B06E116f5d19e5dF90",
  5: "0x0000000000000000000000000000000000000000",
  12341234: "0x8A66A74e15544db9688B68B06E116f5d19e5dF90",
};

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
    [OrderType.Dutch]: "0x6000da47483062A0D734Ba3dc7576Ce6A0B645C4",
  },
  5: {
    [OrderType.Dutch]: "0x6000da47483062A0D734Ba3dc7576Ce6A0B645C4",
  },
  10: {
    [OrderType.Dutch]: "0xcB23e6c82c900E68d6F761bd5a193a5151A1D6d2",
  },
  137: {
    [OrderType.Dutch]: "0x6000da47483062A0D734Ba3dc7576Ce6A0B645C4",
  },
  420: {
    [OrderType.Dutch]: "0xC79A3da4107DE6c22bEd13E3f09a1379D49f2189",
  },
  42161: {
    [OrderType.Dutch]: "0xAeb3e81b8e1A425985816B5f436BDF1E0b542418",
  },
  421613: {
    [OrderType.Dutch]: "0x8D228f8A5C78F82E8300244497114BC482F6c213",
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
