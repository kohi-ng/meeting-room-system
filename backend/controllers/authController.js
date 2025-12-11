const jwt = require('jsonwebtoken');
const { User } = require('../models');
const googleService = require('../services/googleService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được đăng ký'
      });
    }

    const user = await User.create({
      email,
      name,
      password
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập'
    });
  }
};

exports.googleAuthUrl = (req, res) => {
  try {
    const url = googleService.getAuthUrl();
    res.json({
      success: true,
      url
    });
  } catch (error) {
    console.error('Google auth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo URL đăng nhập Google'
    });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const tokens = await googleService.getTokens(code);
    const userInfo = await googleService.getUserInfo(tokens.access_token);

    let user = await User.findOne({ where: { email: userInfo.email } });

    if (user) {
      user.googleId = userInfo.id;
      user.googleAccessToken = tokens.access_token;
      user.googleRefreshToken = tokens.refresh_token || user.googleRefreshToken;
      user.avatar = userInfo.picture;
      await user.save();
    } else {
      user = await User.create({
        email: userInfo.email,
        name: userInfo.name,
        googleId: userInfo.id,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        avatar: userInfo.picture
      });
    }

    const token = generateToken(user.id);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'role', 'avatar', 'createdAt']
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng'
    });
  }
};