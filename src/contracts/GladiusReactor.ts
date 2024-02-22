/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export type SignedOrderStruct = {
  order: PromiseOrValue<BytesLike>;
  sig: PromiseOrValue<BytesLike>;
};

export type SignedOrderStructOutput = [string, string] & {
  order: string;
  sig: string;
};

export interface GladiusReactorInterface extends utils.Interface {
  functions: {
    "execute((bytes,bytes),uint256)": FunctionFragment;
    "executeBatch((bytes,bytes)[],uint256[])": FunctionFragment;
    "executeBatchWithCallback((bytes,bytes)[],uint256[],bytes)": FunctionFragment;
    "executeWithCallback((bytes,bytes),uint256,bytes)": FunctionFragment;
    "feeController()": FunctionFragment;
    "initialize(address,address)": FunctionFragment;
    "initialized()": FunctionFragment;
    "owner()": FunctionFragment;
    "permit2()": FunctionFragment;
    "setOwner(address)": FunctionFragment;
    "setProtocolFeeController(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "execute"
      | "executeBatch"
      | "executeBatchWithCallback"
      | "executeWithCallback"
      | "feeController"
      | "initialize"
      | "initialized"
      | "owner"
      | "permit2"
      | "setOwner"
      | "setProtocolFeeController"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "execute",
    values: [SignedOrderStruct, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "executeBatch",
    values: [SignedOrderStruct[], PromiseOrValue<BigNumberish>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "executeBatchWithCallback",
    values: [
      SignedOrderStruct[],
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "executeWithCallback",
    values: [
      SignedOrderStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "feeController",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "initialized",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "permit2", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setOwner",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setProtocolFeeController",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "execute", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "executeBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeBatchWithCallback",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeWithCallback",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "feeController",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "initialized",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "permit2", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setProtocolFeeController",
    data: BytesLike
  ): Result;

  events: {
    "Fill(bytes32,address,address,uint256)": EventFragment;
    "LogSetOwner(address)": EventFragment;
    "ProtocolFeeControllerSet(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Fill"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LogSetOwner"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProtocolFeeControllerSet"): EventFragment;
}

export interface FillEventObject {
  orderHash: string;
  filler: string;
  swapper: string;
  nonce: BigNumber;
}
export type FillEvent = TypedEvent<
  [string, string, string, BigNumber],
  FillEventObject
>;

export type FillEventFilter = TypedEventFilter<FillEvent>;

export interface LogSetOwnerEventObject {
  owner: string;
}
export type LogSetOwnerEvent = TypedEvent<[string], LogSetOwnerEventObject>;

export type LogSetOwnerEventFilter = TypedEventFilter<LogSetOwnerEvent>;

export interface ProtocolFeeControllerSetEventObject {
  oldFeeController: string;
  newFeeController: string;
}
export type ProtocolFeeControllerSetEvent = TypedEvent<
  [string, string],
  ProtocolFeeControllerSetEventObject
>;

export type ProtocolFeeControllerSetEventFilter =
  TypedEventFilter<ProtocolFeeControllerSetEvent>;

export interface GladiusReactor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: GladiusReactorInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    execute(
      order: SignedOrderStruct,
      quantity: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    executeBatch(
      orders: SignedOrderStruct[],
      quantities: PromiseOrValue<BigNumberish>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    executeBatchWithCallback(
      orders: SignedOrderStruct[],
      quantities: PromiseOrValue<BigNumberish>[],
      callbackData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    executeWithCallback(
      order: SignedOrderStruct,
      quantity: PromiseOrValue<BigNumberish>,
      callbackData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    feeController(overrides?: CallOverrides): Promise<[string]>;

    initialize(
      _permit2: PromiseOrValue<string>,
      _owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    initialized(overrides?: CallOverrides): Promise<[boolean]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    permit2(overrides?: CallOverrides): Promise<[string]>;

    setOwner(
      owner_: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setProtocolFeeController(
      _newFeeController: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  execute(
    order: SignedOrderStruct,
    quantity: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  executeBatch(
    orders: SignedOrderStruct[],
    quantities: PromiseOrValue<BigNumberish>[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  executeBatchWithCallback(
    orders: SignedOrderStruct[],
    quantities: PromiseOrValue<BigNumberish>[],
    callbackData: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  executeWithCallback(
    order: SignedOrderStruct,
    quantity: PromiseOrValue<BigNumberish>,
    callbackData: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  feeController(overrides?: CallOverrides): Promise<string>;

  initialize(
    _permit2: PromiseOrValue<string>,
    _owner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  initialized(overrides?: CallOverrides): Promise<boolean>;

  owner(overrides?: CallOverrides): Promise<string>;

  permit2(overrides?: CallOverrides): Promise<string>;

  setOwner(
    owner_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setProtocolFeeController(
    _newFeeController: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    execute(
      order: SignedOrderStruct,
      quantity: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    executeBatch(
      orders: SignedOrderStruct[],
      quantities: PromiseOrValue<BigNumberish>[],
      overrides?: CallOverrides
    ): Promise<void>;

    executeBatchWithCallback(
      orders: SignedOrderStruct[],
      quantities: PromiseOrValue<BigNumberish>[],
      callbackData: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    executeWithCallback(
      order: SignedOrderStruct,
      quantity: PromiseOrValue<BigNumberish>,
      callbackData: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    feeController(overrides?: CallOverrides): Promise<string>;

    initialize(
      _permit2: PromiseOrValue<string>,
      _owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    initialized(overrides?: CallOverrides): Promise<boolean>;

    owner(overrides?: CallOverrides): Promise<string>;

    permit2(overrides?: CallOverrides): Promise<string>;

    setOwner(
      owner_: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setProtocolFeeController(
      _newFeeController: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Fill(bytes32,address,address,uint256)"(
      orderHash?: PromiseOrValue<BytesLike> | null,
      filler?: PromiseOrValue<string> | null,
      swapper?: PromiseOrValue<string> | null,
      nonce?: null
    ): FillEventFilter;
    Fill(
      orderHash?: PromiseOrValue<BytesLike> | null,
      filler?: PromiseOrValue<string> | null,
      swapper?: PromiseOrValue<string> | null,
      nonce?: null
    ): FillEventFilter;

    "LogSetOwner(address)"(
      owner?: PromiseOrValue<string> | null
    ): LogSetOwnerEventFilter;
    LogSetOwner(owner?: PromiseOrValue<string> | null): LogSetOwnerEventFilter;

    "ProtocolFeeControllerSet(address,address)"(
      oldFeeController?: null,
      newFeeController?: null
    ): ProtocolFeeControllerSetEventFilter;
    ProtocolFeeControllerSet(
      oldFeeController?: null,
      newFeeController?: null
    ): ProtocolFeeControllerSetEventFilter;
  };

  estimateGas: {
    execute(
      order: SignedOrderStruct,
      quantity: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    executeBatch(
      orders: SignedOrderStruct[],
      quantities: PromiseOrValue<BigNumberish>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    executeBatchWithCallback(
      orders: SignedOrderStruct[],
      quantities: PromiseOrValue<BigNumberish>[],
      callbackData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    executeWithCallback(
      order: SignedOrderStruct,
      quantity: PromiseOrValue<BigNumberish>,
      callbackData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    feeController(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      _permit2: PromiseOrValue<string>,
      _owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    initialized(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    permit2(overrides?: CallOverrides): Promise<BigNumber>;

    setOwner(
      owner_: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setProtocolFeeController(
      _newFeeController: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    execute(
      order: SignedOrderStruct,
      quantity: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    executeBatch(
      orders: SignedOrderStruct[],
      quantities: PromiseOrValue<BigNumberish>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    executeBatchWithCallback(
      orders: SignedOrderStruct[],
      quantities: PromiseOrValue<BigNumberish>[],
      callbackData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    executeWithCallback(
      order: SignedOrderStruct,
      quantity: PromiseOrValue<BigNumberish>,
      callbackData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    feeController(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    initialize(
      _permit2: PromiseOrValue<string>,
      _owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    initialized(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    permit2(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setOwner(
      owner_: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setProtocolFeeController(
      _newFeeController: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}