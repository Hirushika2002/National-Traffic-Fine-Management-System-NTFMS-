const { loginSchema, refreshSchema } = require('../validators/authValidators');
const AuthService = require('../services/AuthService');

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await AuthService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await AuthService.refresh(refreshToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refresh };
