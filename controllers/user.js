const User = require('../models/user');
const Chat = require('../models/chat')
const asyncHandler = require('express-async-handler');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail')
const crypto = require('crypto')

const generateConfirmationCode = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const register = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname, mobile } = req.body;
  if (!email || !password || !firstname || !lastname || !mobile)
    return res.status(400).json({
      success: false,
      mes: 'Missing inputs'
    });

  const confirmationCode = generateConfirmationCode();
  const confirmationEmailData = {
    email,
    html: `Your confirmation code is: <strong>${confirmationCode}</strong>. Please use this code to verify your account.`
  };
  await sendMail(confirmationEmailData);

  const newUser = await User.create({ email, password, firstname, lastname, mobile, confirmationCode, isBlocked: true });

  if (!newUser) {
    return res.status(500).json({
      success: false,
      mes: 'Something went wrong'
    });
  }

  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    return res.status(500).json({
      success: false,
      mes: 'Admin user not found'
    });
  }

  await Chat.create({
    senderId: adminUser._id,
    recepientId: newUser._id,
    messageType: 'text',
    message: 'Xin chào! Bạn cần gì thì nhắn tin vào đây.'
  });

  return res.status(200).json({
    success: true,
    mes: 'Confirmation code sent to your email. Please verify your account.'
  });
});


const verifyCode = asyncHandler(async (req, res) => {
  const { email, confirmationCode } = req.body;

  if (!email || !confirmationCode) {
    return res.status(400).json({
      success: false,
      mes: 'Missing inputs'
    });
  }

  const user = await User.findOne({ email, confirmationCode });

  if (!user) {
    return res.status(400).json({
      success: false,
      mes: 'Invalid confirmation code'
    });
  }

  user.isBlocked = false;
  await user.save();

  return res.status(200).json({
    success: true,
    mes: 'Confirmation successful. Your account is now verified.'
  });
});


//Refresh Token => cấp mới access token
//Access Token => Xác thực người dùng, phần quyền người dùng
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      success: false,
      mes: 'Missing inputs'
    })

  const response = await User.findOne({ email })
  if (response && response.isBlocked) {
    return res.status(401).json({
      success: false,
      mes: 'Your account is blocked. Please contact support for further assistance.'
    });
  }
  if (response && await response.isCorrectPassword(password)) {
    //Tách password và role ra khỏi response
    const { password, role, refreshToken, ...userData } = response.toObject()
    //Tạo access token
    const accessToken = generateAccessToken(response._id, role)
    //Tạo refresh token
    const newRefreshToken = generateRefreshToken(response._id)
    // Lưu refresh Token vào database
    await User.findByIdAndUpdate(response._id, { refreshToken: newRefreshToken }, { new: true })
    //Lưu refresh token vào cookie
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
    return res.status(200).json({
      success: true,
      accessToken,
      userData
    })
  } else {
    throw new Error('Invalid credentials!')
  }
})

const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user // ID của người dùng đăng nhập
  const user = await User.findById({ _id }).select('-refreshToken -password')
  return res.status(200).json({
    success: user ? true : false,
    rs: user ? user : 'User not found'
  })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  // lấy token từ cookies
  const cookie = req.cookies
  //check xem có token hay không
  if (!cookie && !cookie.refreshToken) throw new Error('No refresh token in cookie')
  //check token có hợp hay không
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
  const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken })
  return res.status(200).json({
    success: response ? true : false,
    newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh token not matched'
  })
})

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies
  if (!cookie || !cookie.refreshToken) throw new Error('No refresh token in cookies')
  // Xóa refresh token ở db
  await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true })
  //Xóa refresh token ở cookie trình duyệt
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true
  })
  return res.status(200).json({
    success: true,
    mes: 'Logout is done'
  })
})

//client gửi email
//Server check email có hợp lệ hay không => gửi email + kèm theo link (password change token)
//client check email => click link
//client gửi api kèm theo token
//check token có giống token mà server gửi email hay không
//Change password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Missing email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const newPassword = generateRandomPassword();

    user.password = newPassword;
    await user.save();
    const html = `Your new password is: <strong>${newPassword}</strong>. Please login with this password and consider changing it immediately.`;

    const data = {
      email,
      html,
    };
    await sendMail(data);

    return res.status(200).json({ success: true, message: 'New password sent successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

function generateRandomPassword() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:"<>?-=[];.,/';

  let password = '';
  const passwordLength = 10;

  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    if (!password || !token) {
      return res.status(400).json({ success: false, message: 'Missing inputs' });
    }

    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing password inputs' });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const isMatch = await user.isCorrectPassword(oldPassword);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid old password' });
  }

  // Update password and save user
  user.password = newPassword;
  user.passwordChangedAt = Date.now(); // You might want to track password change time
  await user.save();

  return res.status(200).json({ success: true, message: 'Password changed successfully' });
});

const getUsers = asyncHandler(async (req, res) => {
  const response = await User.find().select('-refreshToken -password');
  return res.status(200).json({
    success: response ? true : false,
    users: response
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.query
  if (!_id) throw new Error('Missing inputs')
  const response = await User.findByIdAndDelete(_id)
  return res.status(200).json({
    success: response ? true : false,
    deletedUser: response ? `User with email ${response.email} deleted` : 'No user delete'
  })
})

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user
  if (!_id || Object.keys(req.body).length === 0) throw new Error('Missing inputs')
  const response = await User.findByIdAndUpdate(_id, req.body, { new: true }).select('-password -role -refreshToken')
  return res.status(200).json({
    success: response ? true : false,
    updatedUser: response ? response : 'something went wrong'
  })
})

const likeRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { _id } = req.user;

  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Kiểm tra xem roomId có tồn tại trong danh sách like hay không
  const isRoomLiked = user.like.includes(roomId);

  if (isRoomLiked) {
    user.like.pull(roomId);
  } else {
    user.like.push(roomId);
  }

  await user.save();

  return res.status(200).json({ success: true, message: 'Like room successfully' });
});



module.exports = {
  register,
  verifyCode,
  login,
  getCurrent,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getUsers,
  deleteUser,
  updateUser,
  likeRoom,
}