const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Traffic Fine Payment System API listening on port ${env.port}`);
});
