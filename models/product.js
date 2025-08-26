const { ObjectId } = require("mongodb");
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? ObjectId.createFromHexString(id) : null;
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

  static removeById(id) {
    const idObj = ObjectId.createFromHexString(id);
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ id: idObj })
      .then((res) => res)
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
