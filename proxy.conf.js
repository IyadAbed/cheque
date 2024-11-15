const PROXY_CONFIG = {
  "/api": {
    target: process.env.API_ENDPOINT,
    secure: false,
    pathRewrite: { "^/api": "" },
    changeOrigin: true,
  },
};

module.exports = PROXY_CONFIG;
