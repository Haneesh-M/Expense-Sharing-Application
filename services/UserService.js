const User = require('../models/User');

class UserService {
  static create(name, email) { 
    if(!name || !email) throw new Error("Missing fields");
    return User.create(name, email); 
  }
  static getAll() { return User.findAll(); }
  static delete(id) { 
    try { User.delete(id); return { success: true }; }
    catch(e) { throw new Error("Cannot delete user with active history."); }
  }
}
module.exports = UserService;