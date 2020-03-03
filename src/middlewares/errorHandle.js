module.exports = (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        error: err.originalError ? err.originalError.message : err.message,
        msg: '身份已过期，请重新登录',
      };
    } else {
      throw err;
    }
  });
}