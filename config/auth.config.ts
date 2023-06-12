export default () => ({
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpirationTime: process.env.JWT_EXPIRATION_TIME,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpirationTime: process.env.JWT_REFRESH_EXPIRATION_TIME,
  },
});
