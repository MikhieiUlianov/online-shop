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
    const updatedCart = {
      items: [
        { productId: Object.createFromHexString(product._id), quantity: 1 },
      ],
    };

    db.collection("users").findOne(
      { _id: Object.createFromHexString() },
      { $set: { cart: updatedCart } }
    );
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
