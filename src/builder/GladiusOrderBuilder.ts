import { BigNumber, ethers } from "ethers";
import invariant from "tiny-invariant";
import { OrderType, REACTOR_ADDRESS_MAPPING } from "../constants";
import { MissingConfiguration } from "../errors";
import { DutchInput, DutchOutput } from "../order";
import { ValidationInfo } from "../order/validation";
import { OrderBuilder } from "./OrderBuilder";
import { GladiusOrder, GladiusOrderInfo } from "../order/GladiusOrder";

/**
 * Helper builder for generating dutch limit orders
 */
export class GladiusOrderBuilder extends OrderBuilder {
  private info: Partial<GladiusOrderInfo>;

  static fromOrder(order: GladiusOrder): GladiusOrderBuilder {
    // note chainId not used if passing in true reactor address
    const builder = new GladiusOrderBuilder(order.chainId, order.info.reactor)
      .deadline(order.info.deadline)
      .decayEndTime(order.info.decayEndTime)
      .decayStartTime(order.info.decayStartTime)
      .swapper(order.info.swapper)
      .nonce(order.info.nonce)
      .input(order.info.input)
      .exclusiveFiller(
        order.info.exclusiveFiller,
        order.info.exclusivityOverrideBps
      )
      .validation({
        additionalValidationContract: order.info.additionalValidationContract,
        additionalValidationData: order.info.additionalValidationData,
      });

    for (const output of order.info.outputs) {
      builder.output(output);
    }
    return builder;
  }

  constructor(
    private chainId: number,
    reactorAddress?: string,
    private permit2Address?: string
  ) {
    super();

    if (reactorAddress) {
      this.reactor(reactorAddress);
    } else if (
      REACTOR_ADDRESS_MAPPING[chainId] &&
      REACTOR_ADDRESS_MAPPING[chainId][OrderType.Dutch]
    ) {
      const reactorAddress = REACTOR_ADDRESS_MAPPING[chainId][OrderType.Dutch];
      this.reactor(reactorAddress);
    } else {
      throw new MissingConfiguration("reactor", chainId.toString());
    }

    this.info = {
      outputs: [],
      exclusiveFiller: ethers.constants.AddressZero,
      exclusivityOverrideBps: BigNumber.from(0),
    };
  }

  decayStartTime(decayStartTime: number): GladiusOrderBuilder {
    this.info.decayStartTime = decayStartTime;
    return this;
  }

  decayEndTime(decayEndTime: number): GladiusOrderBuilder {
    if (this.orderInfo.deadline === undefined) {
      super.deadline(decayEndTime);
    }

    this.info.decayEndTime = decayEndTime;
    return this;
  }

  input(input: DutchInput): GladiusOrderBuilder {
    this.info.input = input;
    return this;
  }

  output(output: DutchOutput): GladiusOrderBuilder {
    if (!this.info.outputs) {
      this.info.outputs = [];
    }
    invariant(
      output.startAmount.gte(output.endAmount),
      `startAmount must be greater than endAmount: ${output.startAmount.toString()}`
    );
    this.info.outputs.push(output);
    return this;
  }

  deadline(deadline: number): GladiusOrderBuilder {
    super.deadline(deadline);

    if (this.info.decayEndTime === undefined) {
      this.decayEndTime(deadline);
    }

    return this;
  }

  swapper(swapper: string): GladiusOrderBuilder {
    super.swapper(swapper);
    return this;
  }

  nonce(nonce: BigNumber): GladiusOrderBuilder {
    super.nonce(nonce);
    return this;
  }

  validation(info: ValidationInfo): GladiusOrderBuilder {
    super.validation(info);
    return this;
  }

  // ensures that we only change non fee outputs
  nonFeeRecipient(recipient: string): GladiusOrderBuilder {
    if (!this.info.outputs) {
      return this;
    }
    this.info.outputs = this.info.outputs.map((output) => ({
      ...output,
      recipient,
    }));
    return this;
  }

  exclusiveFiller(
    exclusiveFiller: string,
    exclusivityOverrideBps: BigNumber
  ): GladiusOrderBuilder {
    this.info.exclusiveFiller = exclusiveFiller;
    this.info.exclusivityOverrideBps = exclusivityOverrideBps;
    return this;
  }

  fillThreshold(minimum: BigNumber): GladiusOrderBuilder {
    this.info.fillThreshold = minimum;
    return this;
  }

  build(): GladiusOrder {
    invariant(this.info.decayStartTime !== undefined, "decayStartTime not set");
    invariant(this.info.input !== undefined, "input not set");
    invariant(this.info.decayEndTime !== undefined, "decayEndTime not set");
    invariant(
      this.info.exclusiveFiller !== undefined,
      "exclusiveFiller not set"
    );
    invariant(
      this.info.exclusivityOverrideBps !== undefined,
      "exclusivityOverrideBps not set"
    );
    invariant(
      this.info.outputs !== undefined && this.info.outputs.length !== 0,
      "outputs not set"
    );
    invariant(
      this.info.decayEndTime !== undefined ||
        this.getOrderInfo().deadline !== undefined,
      "Must set either deadline or decayEndTime"
    );
    invariant(
      !this.orderInfo.deadline ||
        this.info.decayStartTime <= this.orderInfo.deadline,
      `decayStartTime must be before or same as deadline: ${this.info.decayStartTime}`
    );
    invariant(
      !this.orderInfo.deadline ||
        this.info.decayEndTime <= this.orderInfo.deadline,
      `decayEndTime must be before or same as deadline: ${this.info.decayEndTime}`
    );
    invariant(
        this.info.fillThreshold !== undefined && this.info.input && this.info.fillThreshold.lte(this.info.input.endAmount),
      `fillThreshold must be set and less than or equal to output amount`
    );

    return new GladiusOrder(
      Object.assign(this.getOrderInfo(), {
        decayStartTime: this.info.decayStartTime,
        decayEndTime: this.info.decayEndTime,
        exclusiveFiller: this.info.exclusiveFiller,
        exclusivityOverrideBps: this.info.exclusivityOverrideBps,
        input: this.info.input,
        outputs: this.info.outputs,
        fillThreshold: this.info.fillThreshold
      }),
      this.chainId,
      this.permit2Address
    );
  }
}
