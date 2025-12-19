const User = require('../models/User');

class UserService {
  static createUser(name, email) {
    if (!name || !email) throw new Error("Name and Email required");
    return User.create(name, email);
  }

  static getAllUsers() {
    return User.findAll();
  }
}

module.exports = UserService;