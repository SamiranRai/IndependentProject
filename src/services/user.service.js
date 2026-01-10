const UserModel = require('../models/user.model');

exports.getAllUsersService = async () => {
    const users = await UserModel.find();
    return users;
};