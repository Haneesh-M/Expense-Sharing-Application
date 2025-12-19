const Group = require('../models/Group');

class GroupService {
  static createGroup(name) {
    return Group.create(name);
  }

  static getAllGroups() {
    return Group.findAll();
  }

  static addUserToGroup(groupId, userId) {
    try {
      Group.addMember(groupId, userId);
      return { message: "User added" };
    } catch (e) {
      throw new Error("User already in group or invalid ID");
    }
  }

  static getGroupMembers(groupId) {
    return Group.getMembers(groupId);
  }
}

module.exports = GroupService;