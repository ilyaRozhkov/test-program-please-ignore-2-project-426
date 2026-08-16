import Rollbar from 'rollbar';
export const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN_BACKEND,
  environment: process.env.NODE_ENV || 'development',
  captureUncaught: true,
  captureUnhandledRejections: true,
});