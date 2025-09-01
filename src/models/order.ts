import { Types, model, Schema } from "mongoose";
import { ProductType } from "./product.js";

export type OrderType = {
  products: {
    product: ProductType;
    quantity: number;
  }[];
  user: {
    email: string;
    userId: Types.ObjectId;
  };
};

const orderSchema = new Schema<OrderType>({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
});

export default model("Order", orderSchema);
