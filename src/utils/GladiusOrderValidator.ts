import { GladiusOrderQuoter, SignedGladiusOrder } from "./GladiusOrderQuoter";
import { OrderValidation } from "./OrderQuoter";

/**
 * Order validator
 */
export class GladiusOrderValidator extends GladiusOrderQuoter {
  async validate(order: SignedGladiusOrder): Promise<OrderValidation> {
    return (await super.quote(order)).validation;
  }

  async validateBatch(orders: SignedGladiusOrder[]): Promise<OrderValidation[]> {
    return (await super.quoteBatch(orders)).map((order) => order.validation);
  }
}
