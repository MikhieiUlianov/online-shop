const { ObjectId } = require("mongodb");
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? ObjectId.createFromHexString(id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      const idObj = this._id;
      dbOp = db
        .collection("products")
        .updateOne({ _id: idObj }, { $set: this });
    } else {
      dbOp = db.collection("products").insertOne(this);
    }
    return dbOp
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => products)
      .catch((err) => console.log(err));
  }

  static findById(id) {
    const idObj = ObjectId.createFromHexString(id);
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: idObj })
      .next()
      .then((product) => product)
      .catch((err) => console.log(err));
  }

  static deleteById(prodId, userId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new ObjectId(prodId) })
      .then((result) => {
        return db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $pull: {
              "cart.items": { productId: new ObjectId(prodId) },
            },
          }
        );
      })
      .then((result) => {
        console.log("Cart Item Deleted");
      })
      .then(() => {
        console.log("Product Deleted");
      });
  }
}

module.exports = Product;
