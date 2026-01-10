const catchAsync = require('../middlewares/catchAsync');
const userService = require('../services/user.service');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await userService.getAllUsersService();
    res.status(200).json({
        status: "success",
        data: {
            users
        }
    });
});