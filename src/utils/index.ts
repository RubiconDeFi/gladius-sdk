export * from "./OrderValidator";
export * from "./GladiusOrderValidator";
export * from "./NonceManager";
export * from "./OrderQuoter";
export * from "./GladiusOrderQuoter";
export * from "./EventWatcher";
export * from "./multicall";
export * from "./dutchDecay";

export function stripHexPrefix(a: string): string {
  if (a.startsWith("0x")) {
    return a.slice(2);
  } else {
    return a;
  }
}
