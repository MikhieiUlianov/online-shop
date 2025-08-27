const getDb = require("../util/database").getDb;
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
      { _id: Object.createFromHexString() },
      { $set: { cart: updatedCart } }
    );
  }

  deleteItemFromCart(prodId) {
    const db = getDb();
    const updatedCart = this.cart.items.filter(
      (p) => p.id.toString() !== prodId.toString()
    );

    db.collection("users").findOne(
      { _id: Object.createFromHexString() },
      { $set: { cart: { items: updatedCart } } }
    );
  }

  getCart() {
    const db = getDb();
    /*   return this.cart.map(product => {
      return db.collection("products").findOne({_id: product.productId})
     }) */
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

  static findById(id) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: ObjectId.createFromHexString(id) })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
