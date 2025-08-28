const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  products: {
    product: {
      type: Object,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  user: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { String, required: true, ref: User },
  },
});

/* orderSchema.methods.AddOrder = function () {
  return this.cart.items
    .populate("user.items.productId")
    .then((products) => {
      const order = {
        items: products,
        user: {},
      };
      return db.collection("orders").insertOne(order);
    })
    .then((res) => {
      this.cart = [];

      return this.save();
    })
    .catch((err) => console.log(err));
};
 */
module.exports = model("Order", orderSchema);
