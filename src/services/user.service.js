const AppError = require("../middlewares/AppError");
const UserModel = require("../models/user.model");


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
}

exports.getAllUsersService = async () => {
  const users = await UserModel.find();
  return users;
};

exports.updateMeService = async (body, req) => {
  // CREATE ERROR IF POST PASSWORD'S DATA
  const { password, passwordConfirm } = body;

  if (password || passwordConfirm) {
    throw new AppError(
      "This route is not for passowrd update. please use /updateMyPassword.",
      400,
      "ASK_SAMIRAN"
    );
  }

  // FILTER USER INPUT
  const filterBody = filterObj(body,['name', 'email', 'digestFrequency']);

  // UPDATE USER DOC
  const updatedUser = await UserModel.findByIdAndUpdate(req.user.id, filterBody, {
    new: true
  });

  return updatedUser;
};
