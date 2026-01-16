const catchAsync = require('../middlewares/catchAsync');
const userService = require('../services/user.service');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await userService.getAllUsersService();
    res.status(200).json({
        success: true,
        code: "USER_FETCHED",
        data: {
            users
        }
    });
});


exports.updateMe = catchAsync(async (req, res, next) => {
    const updatedUser = await userService.updateMeService(req.body, req);

    res.status(200).json({
        success: true,
        code: "USER_UPDATED",
        data: {
            user: updatedUser
        }
    });
});