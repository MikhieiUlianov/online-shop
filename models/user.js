const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(
    (cp) => cp.productId.toString() === product._id.toString()
  );
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.s];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product.id,
      quantity: newQuantity,
    });
  }

  const updatedCart = [...updatedCartItems];
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.dremoveFromCart = function (prodId) {
  const updatedCart = this.cart.items.filter(
    (p) => p.id.toString() !== prodId.toString()
  );

  this.cart.items = updatedCart;

  this.save();
};

module.exprots = model("User", userSchema);

/* const getDb = require("../util/database").getDb;
const { ObjectId } = require("mongodb");
class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this.id = id;
  }
  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const db = getDb();
    const cartProductIndex = this.cart.item.findIndex(
      (cp) => cp.productId.toString() === product._id.toString()
    );
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: ObjectId.createFromHexString(product.id),
        quantity: newQuantity,
      });
    }

    const updatedCart = [...updatedCartItems];

    db.collection("users").findOne(
      { _id: Object.createFromHexString(this._id) },
      { $set: { cart: updatedCart } }
    );
  }

  deleteItemFromCart(prodId) {
    const db = getDb();
    const updatedCart = this.cart.items.filter(
      (p) => p.id.toString() !== prodId.toString()
    );

    db.collection("users").findOne(
      { _id: Object.createFromHexString(this._id) },
      { $set: { cart: { items: updatedCart } } }
    );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((i) => i.productId);
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.find(
              (i) => i.productId.toString() === p._id.toString()
            ).quantity,
          };
        });
      });
  }

  addOrder() {
    const db = getDb();

    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: ObjectId.createFromHexString(this._id),
            name: this.name,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then((res) => {
        this.cart = [];

        return db
          .collection("users")
          .findOne(
            { _id: Object.createFromHexString(this._id) },
            { $set: { cart: { items: [] } } }
          );
      })
      .catch((err) => console.log(err));
  }

  getOrder() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": Object.createFromHexString(this._id) })
      .toArray();
  }

  static findById(id) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: ObjectId.createFromHexString(id) })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
 */
