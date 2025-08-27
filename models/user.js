const getDb = require("../util/database").getDb;
const { ObjectId } = require("mongodb");
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
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
